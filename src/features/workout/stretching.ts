import {
  exercises,
  optionalBlockMinutes,
  type MuscleGroup,
  type WorkoutBlockType,
} from '../../entities/program';
import type { Workout } from './model';

interface Stretch {
  demo: string;
  title: string;
  cue: string;
}

const stretches: Record<MuscleGroup, Record<WorkoutBlockType, Stretch>> = {
  'Ноги и ягодицы': {
    warmup: {
      title: 'Неглубокие приседы',
      demo: 'shallowSquat',
      cue: 'Отводи таз назад, держи стопы на полу. Плавно вставай. Сделай 6–10 повторов.',
    },
    cooldown: {
      title: 'Растяжка передней поверхности бедра',
      demo: 'quadStretch',
      cue: 'Держась за стену, согни колено и мягко приблизь пятку к ягодице. Держи колени рядом. По 20 секунд на ногу.',
    },
  },
  'Грудь и трицепсы': {
    warmup: {
      title: 'Лёгкие отжимания от стены',
      demo: 'wallPress',
      cue: 'Поставь ладони чуть шире плеч. Плавно согни руки, приблизь грудь к стене и оттолкнись. Сделай 6–10 повторов.',
    },
    cooldown: {
      title: 'Растяжка груди и трицепсов',
      demo: 'chestTricepsStretch',
      cue: 'У стены положи предплечье на опору и слегка повернись от неё. Затем подними локоть вверх и опусти ладонь за голову. Держи каждое положение по 10 секунд на сторону.',
    },
  },
  Спина: {
    warmup: {
      title: 'Тяга без веса',
      demo: 'bodyRow',
      cue: 'Слегка наклонись от таза с ровной спиной. Веди локти к поясу и плавно опускай руки. Сделай 8–10 повторов.',
    },
    cooldown: {
      title: 'Растяжка спины у стены',
      demo: 'wallBackStretch',
      cue: 'Поставь ладони на стену и отойди на шаг. Отведи таз назад, опуская грудь между руками. Подержи 20 секунд, выпрямись и повтори.',
    },
  },
  'Задняя поверхность бедра и ягодицы': {
    warmup: {
      title: 'Наклоны от таза',
      demo: 'hipHinge',
      cue: 'Слегка согни колени и отводи таз назад, сохраняя спину ровной. Плавно выпрямляйся. Сделай 6–10 повторов.',
    },
    cooldown: {
      title: 'Растяжка задней поверхности бедра и ягодиц',
      demo: 'hamstringGluteStretch',
      cue: 'Лёжа на спине, возьмись за бедро и мягко выпрями колено. Затем положи лодыжку на другое бедро и подтяни его к себе. Держи каждое положение по 10 секунд на сторону.',
    },
  },
  Плечи: {
    warmup: {
      title: 'Круги руками',
      demo: 'armCircles',
      cue: 'Плавно рисуй руками небольшие круги, постепенно увеличивая амплитуду. Сделай по 8 кругов в каждую сторону.',
    },
    cooldown: {
      title: 'Рука поперёк груди',
      demo: 'crossBodyStretch',
      cue: 'Мягко подтяни руку поперёк груди, поддерживая её выше локтя. Опусти плечи. По 20 секунд на руку.',
    },
  },
  Бицепс: {
    warmup: {
      title: 'Сгибания рук без веса',
      demo: 'armCurl',
      cue: 'Поверни ладони вперёд и держи локти у корпуса. Плавно сгибай и разгибай руки. Сделай 8–12 повторов.',
    },
    cooldown: {
      title: 'Растяжка бицепса у стены',
      demo: 'wallBicepsStretch',
      cue: 'Положи ладонь на стену сбоку чуть ниже плеча. С почти прямой рукой мягко поверни корпус от стены. По 20 секунд на руку.',
    },
  },
  Предплечья: {
    warmup: {
      title: 'Движения кистями',
      demo: 'wristMotion',
      cue: 'Плавно согни и разогни кисти 8–10 раз. Затем несколько раз раскрой ладони и собери пальцы в свободный кулак.',
    },
    cooldown: {
      title: 'Растяжка предплечий',
      demo: 'forearmStretch',
      cue: 'Вытяни руку. Другой рукой мягко направь пальцы сначала вверх, затем вниз. Держи каждое положение по 10 секунд на руку.',
    },
  },
  Икры: {
    warmup: {
      title: 'Подъёмы на носки',
      demo: 'calfRaise',
      cue: 'Держась за стену, плавно поднимай пятки и опускай их на пол. Сделай 8–12 повторов.',
    },
    cooldown: {
      title: 'Растяжка икр у стены',
      demo: 'wallCalfStretch',
      cue: 'Упрись ладонями в стену и отставь одну ногу назад. Держи её почти прямой и прижимай пятку к полу. По 20 секунд на ногу.',
    },
  },
  'Мышцы корпуса': {
    warmup: {
      title: 'Мягкие повороты корпуса',
      demo: 'torsoTwist',
      cue: 'Слегка согни колени, руки держи у груди. Плавно поворачивай грудную клетку влево и вправо в удобной амплитуде. По 6 раз на сторону.',
    },
    cooldown: {
      title: 'Боковой наклон стоя',
      demo: 'sideBend',
      cue: 'Подними одну руку и слегка наклонись в противоположную сторону. Держи таз ровно и дыши спокойно. По 20 секунд на сторону.',
    },
  },
};

const cardioGroups: readonly MuscleGroup[] = [
  'Ноги и ягодицы',
  'Икры',
  'Задняя поверхность бедра и ягодицы',
];
const maxStretchMinutes = 3;

export function stretchingPlan(workout: Workout, type: WorkoutBlockType) {
  let groups: readonly MuscleGroup[] = cardioGroups;
  if (workout.kind === 'strength') {
    const exercisesForBlock =
      type === 'warmup' ? workout.plan.filter((item) => !item.skipped) : workout.sets;
    groups = exercisesForBlock.map(({ exercise }) => exercises[exercise].group);
  }

  const steps = [...new Set(groups)].slice(0, maxStretchMinutes).map((group) => ({
    group,
    ...stretches[group][type],
  }));
  return { steps, walkingMinutes: optionalBlockMinutes - steps.length };
}
