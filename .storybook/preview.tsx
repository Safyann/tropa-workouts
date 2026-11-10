import type { Preview } from '@storybook/react-vite';
import '../src/app/styles.css';

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="page"><Story/></main>]
};

export default preview;
