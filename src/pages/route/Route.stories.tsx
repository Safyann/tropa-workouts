import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Session } from '../../entities/progress';
import { RoutePage } from './index';

const meta = {
  title: 'Страницы/Карта',
  component: RoutePage,
  args: {
    progress: { version: 1, round: 0, sessions: [] },
    offlineReady: false,
    start: () => {},
    restart: () => {},
    changePreferences: () => {},
  },
} satisfies Meta<typeof RoutePage>;

export default meta;
type Story = StoryObj<typeof meta>;

const session = (stop: number): Session => ({
  date: Date.now(),
  stop,
  round: 0,
  short: true,
  sets: [],
  elapsed: null,
});

export const Start: Story = { name: 'Первый костёр' };

export const InProgress: Story = {
  name: 'Первый костёр зажжён',
  args: { progress: { version: 1, round: 0, sessions: [session(0)] }, offlineReady: true },
};

export const Completed: Story = {
  name: 'Маршрут завершён',
  args: { progress: { version: 1, round: 0, sessions: [0, 1, 2, 3].map(session) } },
};

export const Hour: Story = {
  name: 'Час с разминкой и заминкой',
  args: {
    progress: {
      version: 1,
      round: 0,
      sessions: [],
      preferences: {
        minutes: 60,
        level: 'experienced',
        warmup: true,
        cooldown: true,
      },
    },
  },
};
