import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import "../templates/fashion-atelier-v1/src/styles/atelier.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i } },
  },
};

export default preview;
