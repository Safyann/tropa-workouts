import type { Meta, StoryObj } from '@storybook/react-vite';
import { HistoryPage } from './index';

const meta = { title: 'Страницы/История', component: HistoryPage } satisfies Meta<typeof HistoryPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { name: 'Пустая история', args: { sessions: [] } };

export const Populated: Story = {
  name: 'Силовая и эллипс',
  args: { sessions: [
    { date: Date.now(), stop: 0, round: 0, short: true, sets: [{ exercise: 'squat', weight: 5.5, reps: 8 }], elapsed: null },
    { date: Date.now(), stop: 1, round: 0, short: false, sets: [], elapsed: 590 }
  ] }
};
