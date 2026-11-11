import labels from '../src/entities/program/equipment.json' with { type: 'json' };

const sourceEquipment = {
  'Ab Wheel': 'abWheel',
  'Adjustable bench': 'adjustableBench',
  Bands: 'bands',
  Barbell: 'barbell',
  'Battle Ropes': 'battleRopes',
  'Bench press station': 'benchPressStation',
  Cable: 'cableMachine',
  'Climbing Rope': 'climbingRope',
  'Dip station': 'dipBars',
  Dumbbell: 'dumbbells',
  'E-z Curl Bar': 'ezBar',
  'Exercise Ball': 'exerciseBall',
  'Flat bench': 'bench',
  'Foam Roll': 'foamRoller',
  'Gymnastic Rings': 'rings',
  'Jump rope': 'jumpRope',
  Kettlebells: 'kettlebells',
  Landmine: 'landmine',
  'Medicine Ball': 'medicineBall',
  'Plyo box': 'plyoBox',
  'Preacher curl bench': 'preacherBench',
  'Pull-Up Bar': 'pullUpBar',
  Sandbag: 'sandbag',
  Sled: 'sled',
  Sliders: 'sliders',
  'Squat rack': 'squatRack',
  'Suspension Trainer': 'suspensionTrainer',
  Tire: 'tire',
  'Trap Bar': 'trapBar',
  'Weight Plate': 'weightPlate',
};

// The upstream "Machine" and "Other" entries cover incompatible kinds of equipment.
const equipmentByExercise = {
  'ab-crunch-machine': 'abCrunchMachine',
  'atlas-stone-trainer': 'atlasStoneTrainer',
  'atlas-stones': 'atlasStone',
  'axle-deadlift': 'axleBar',
  'balance-board': 'balanceBoard',
  bicycling: 'bike',
  'bicycling-stationary': 'stationaryBike',
  butterfly: 'pecDeck',
  'bodyweight-mid-row': 'pullUpBar',
  'calf-machine-shoulder-shrug': 'standingCalfMachine',
  'calf-press': 'legPressMachine',
  'calf-press-on-the-leg-press-machine': 'legPressMachine',
  'car-deadlift': 'carDeadliftFrame',
  'chain-handle-extension': 'chains',
  'chain-press': 'chains',
  'chair-squat': 'smithMachine',
  'circus-bell': 'circusDumbbell',
  'conan-s-wheel': 'conanWheel',
  crucifix: 'dumbbells',
  'decline-smith-press': 'smithMachine',
  'dip-machine': 'dipMachine',
  'donkey-calf-raises': 'donkeyCalfMachine',
  'elliptical-trainer': 'elliptical',
  'glute-ham-raise': 'gluteHamMachine',
  'hack-squat': 'hackSquatMachine',
  'heavy-bag-thrust': 'heavyBag',
  'hyperextensions-back-extensions': 'hyperextensionBench',
  'keg-load': 'kegAndPlatform',
  'leg-extensions': 'legExtensionMachine',
  'leg-press': 'legPressMachine',
  'leverage-chest-press': 'chestPressMachine',
  'leverage-deadlift': 'deadliftMachine',
  'leverage-decline-chest-press': 'declineChestPressMachine',
  'leverage-high-row': 'rowMachine',
  'leverage-incline-chest-press': 'inclineChestPressMachine',
  'leverage-iso-row': 'rowMachine',
  'leverage-shoulder-press': 'shoulderPressMachine',
  'leverage-shrug': 'shrugMachine',
  'lying-leg-curls': 'lyingLegCurlMachine',
  'lying-machine-squat': 'lyingSquatMachine',
  'lying-t-bar-row': 'tBarRowMachine',
  'lunge-sprint': 'smithMachine',
  'log-lift': 'strongmanLog',
  'machine-bench-press': 'chestPressMachine',
  'machine-bicep-curl': 'bicepsMachine',
  'machine-pec-fly': 'pecDeck',
  'machine-preacher-curls': 'preacherCurlMachine',
  'machine-row': 'rowMachine',
  'machine-shoulder-military-press': 'shoulderPressMachine',
  'machine-triceps-extension': 'tricepsMachine',
  'narrow-stance-hack-squats': 'hackSquatMachine',
  'narrow-stance-leg-press': 'legPressMachine',
  'press-triceps-machine': 'tricepsMachine',
  'recumbent-bike': 'recumbentBike',
  'reverse-hyperextension': 'reverseHyperMachine',
  'reverse-machine-flyes': 'pecDeck',
  'rickshaw-carry': 'rickshawFrame',
  'rickshaw-deadlift': 'rickshawFrame',
  'rowing-stationary': 'rowingMachine',
  'seated-calf-raise': 'seatedCalfMachine',
  'seated-head-harness-neck-resistance': 'neckHarness',
  'seated-leg-curl': 'seatedLegCurlMachine',
  'single-leg-leg-extension': 'legExtensionMachine',
  skating: 'skates',
  stairmaster: 'stairClimber',
  'standing-calf-raises': 'standingCalfMachine',
  'standing-leg-curl': 'standingLegCurlMachine',
  'step-mill': 'stairClimber',
  'thigh-abductor': 'hipAbductorMachine',
  'thigh-adductor': 'hipAdductorMachine',
  'wrist-roller': 'wristRoller',
  'yoke-walk': 'yoke',
};

function specificEquipment(slug) {
  if (slug.startsWith('smith-')) return 'smithMachine';
  if (slug.endsWith('-treadmill')) return 'treadmill';
  return equipmentByExercise[slug];
}

const additionalEquipment = [
  ['dumbbells', /\bdumbbells?\b/i],
  ['pullUpBar', /\b(?:pull[- ]up|chin[- ]up) bar\b/i],
  ['dipBars', /\b(?:dip station|parallel bars)\b/i],
  ['plyoBox', /\b(?:plyo(?:metric)? box|sturdy wooden board)\b/i],
  ['exerciseBall', /\b(?:exercise|stability|swiss) ball\b/i],
  ['bands', /\b(?:resistance bands?|elastic bands?)\b/i],
  ['chains', /\bchains\b/i],
];

export function equipmentNeeded(item, instructions) {
  if (!item.equipment.length) return null;
  const text = instructions.join(' ');
  if (/\b(?:partner|someone holding|spotter (?:holds|holding))\b/i.test(text)) return null;
  if (item.slug === 'inverted-row') return ['barbell', 'squatRack'];

  const needed = new Set();
  for (const equipment of item.equipment) {
    if (equipment.family === 'bodyweight') continue;
    const generic = equipment.name === 'Machine' || equipment.name === 'Other';
    const key = generic ? specificEquipment(item.slug) : sourceEquipment[equipment.name];
    if (!key) return null;
    needed.add(key);
  }
  for (const [key, pattern] of additionalEquipment) {
    if (pattern.test(text) && !(key === 'dumbbells' && needed.has('circusDumbbell')))
      needed.add(key);
  }
  if (/\bsmith machine\b/i.test(text)) needed.add('smithMachine');
  if (/\b(?:squat|power) rack\b/i.test(text)) needed.add('squatRack');
  if (
    /\bbarbell\b/i.test(text) &&
    !needed.has('smithMachine') &&
    !needed.has('trapBar') &&
    !needed.has('ezBar')
  ) {
    needed.add('barbell');
  }

  if (/\bdecline bench\b/i.test(text)) {
    needed.delete('adjustableBench');
    needed.add('declineBench');
  } else if (/\b(?:incline|adjustable) bench\b/i.test(text) && !needed.has('preacherBench')) {
    needed.add('adjustableBench');
  } else if (/\bpreacher bench\b/i.test(text) && !needed.has('preacherCurlMachine')) {
    needed.add('preacherBench');
  } else if (/\bbench\b/i.test(text) && ![...needed].some((key) => /Bench|bench/.test(key))) {
    needed.add('bench');
  }

  for (const key of needed) {
    if (!Object.hasOwn(labels, key)) throw new Error(`Unknown equipment key: ${key}`);
  }
  return [...needed];
}
