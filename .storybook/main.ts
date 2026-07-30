import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";

const atelierClient = path.resolve(
  __dirname,
  "../templates/fashion-atelier-v1/src/client.ts",
);

const config: StorybookConfig = {
  stories: ["../src/commerce/stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "../src"),
      "@shopenlinea/commerce-runtime-contract": path.resolve(
        __dirname,
        "../packages/commerce-runtime-contract/src/index.ts",
      ),
      "fashion-atelier-v1/client": atelierClient,
      "fashion-atelier-v1": atelierClient,
    };
    return config;
  },
};

export default config;
