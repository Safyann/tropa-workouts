import type { Preview } from '@storybook/react-vite';
import '../src/app/styles/global.css';
import ui from '../src/shared/ui/Common.module.css';

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <main className={ui.page}>
        <Story />
      </main>
    ),
  ],
};

export default preview;
