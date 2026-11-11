import { expect, it } from 'vitest';
import sourceCatalog from '@kinetic-place/exercises-json/en/exercises.json';
import {
  kineticCatalog,
  kineticStrengthExercises,
  loadKineticCues,
  selectableEquipment,
} from './kinetic';
import { searchKineticExercises } from './kineticSearch';

it('finds Kinetic exercises with Russian movement and equipment terms', () => {
  const presses = searchKineticExercises('жим гантелей лёжа', 'Грудь и трицепсы');
  expect(presses.map(({ title }) => title)).toContain('Жим гантелей лёжа');
  expect(presses.map(({ slug }) => slug)).not.toContain('barbell-bench-press');
  expect(searchKineticExercises('мёртвый жук').map(({ title }) => title)).toContain('Мёртвый жук');
  const pushups = searchKineticExercises('отжимания без инвентаря').map(({ slug }) => slug);
  expect(pushups).toContain('pushups');
  expect(pushups).not.toContain('incline-push-up');
  expect(searchKineticExercises('Dumbbell Bench Press').map(({ slug }) => slug)).toContain(
    'dumbbell-bench-press',
  );
});

it('checks equipment and partner requirements mentioned in the instructions', () => {
  expect(kineticCatalog.find(({ slug }) => slug === 'incline-push-up')?.needs).toEqual(['bench']);
  expect(kineticCatalog.find(({ slug }) => slug === 'inverted-row')?.needs).toEqual([
    'barbell',
    'squatRack',
  ]);
  const assisted = kineticCatalog.find(({ slug }) => slug === 'prone-manual-hamstring');
  expect(assisted?.needs).toBeNull();
  expect(kineticStrengthExercises.map(({ id }) => id)).not.toContain(assisted?.id);
});

it('matches selected inventory including cardio and stretching without confusing machines', () => {
  expect(selectableEquipment).toEqual(
    expect.arrayContaining(['jumpRope', 'foamRoller', 'legPressMachine', 'smithMachine']),
  );
  const own = searchKineticExercises('', '', ['jumpRope', 'foamRoller', 'legPressMachine']);
  const slugs = own.map(({ slug }) => slug);
  expect(slugs).toEqual(expect.arrayContaining(['rope-jumping', 'quadriceps-smr', 'leg-press']));
  expect(slugs).not.toContain('smith-machine-leg-press');
  expect(slugs).not.toContain('inverted-row');
  expect(slugs).not.toContain('prone-manual-hamstring');
});

it('ships a Russian name and every instruction for each Kinetic exercise', async () => {
  const byId = new Map(kineticCatalog.map((item) => [item.id, item]));
  expect(byId.size).toBe(sourceCatalog.length);
  for (const { id, slug, instructions } of sourceCatalog) {
    const exercise = byId.get(`kinetic:${id}`);
    expect(exercise?.title, slug).toMatch(/[а-яё]/i);
    const cues = await loadKineticCues(`kinetic:${id}`);
    expect(cues, slug).toHaveLength(instructions?.filter((cue) => cue.trim()).length ?? 0);
    expect(
      cues.every((cue) => /[а-яё]/i.test(cue)),
      slug,
    ).toBe(true);
  }
});
