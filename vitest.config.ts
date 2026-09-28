import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/commerce/tests/setup.ts"],
    include: ["src/commerce/tests/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shopenlinea/commerce-runtime-contract": path.resolve(
        __dirname,
        "./packages/commerce-runtime-contract/src/index.ts",
      ),
      "fashion-atelier-v1/client": path.resolve(
        __dirname,
        "./templates/fashion-atelier-v1/src/client.ts",
      ),
      "fashion-atelier-v1": path.resolve(
        __dirname,
        "./templates/fashion-atelier-v1/src/client.ts",
      ),
      "jewelry-orion-v1/client": path.resolve(
        __dirname,
        "./templates/jewelry-orion-v1/src/client.ts",
      ),
      "jewelry-orion-v1": path.resolve(
        __dirname,
        "./templates/jewelry-orion-v1/src/client.ts",
      ),
      "academy-voxa-v1/client": path.resolve(
        __dirname,
        "./templates/academy-voxa-v1/src/client.ts",
      ),
      "academy-voxa-v1": path.resolve(
        __dirname,
        "./templates/academy-voxa-v1/src/client.ts",
      ),
      "fashion-celestine-v1/client": path.resolve(
        __dirname,
        "./templates/fashion-celestine-v1/src/client.ts",
      ),
      "fashion-celestine-v1": path.resolve(
        __dirname,
        "./templates/fashion-celestine-v1/src/client.ts",
      ),
      "fashion-lumen-v1/client": path.resolve(
        __dirname,
        "./templates/fashion-lumen-v1/src/client.ts",
      ),
      "fashion-lumen-v1": path.resolve(
        __dirname,
        "./templates/fashion-lumen-v1/src/client.ts",
      ),
      "fashion-velvet-v1/client": path.resolve(
        __dirname,
        "./templates/fashion-velvet-v1/src/client.ts",
      ),
      "fashion-velvet-v1": path.resolve(
        __dirname,
        "./templates/fashion-velvet-v1/src/client.ts",
      ),
      "fashion-nova-v1/client": path.resolve(
        __dirname,
        "./templates/fashion-nova-v1/src/client.ts",
      ),
      "fashion-nova-v1": path.resolve(
        __dirname,
        "./templates/fashion-nova-v1/src/client.ts",
      ),
      "food-trattoria-v1/client": path.resolve(
        __dirname,
        "./templates/food-trattoria-v1/src/client.ts",
      ),
      "food-trattoria-v1": path.resolve(
        __dirname,
        "./templates/food-trattoria-v1/src/client.ts",
      ),
      "food-cantina-v1/client": path.resolve(
        __dirname,
        "./templates/food-cantina-v1/src/client.ts",
      ),
      "food-cantina-v1": path.resolve(
        __dirname,
        "./templates/food-cantina-v1/src/client.ts",
      ),
      "food-patisserie-v1/client": path.resolve(
        __dirname,
        "./templates/food-patisserie-v1/src/client.ts",
      ),
      "food-patisserie-v1": path.resolve(
        __dirname,
        "./templates/food-patisserie-v1/src/client.ts",
      ),
      "next/image": path.resolve(__dirname, "./src/commerce/tests/mocks/next-image.tsx"),
      "next/link": path.resolve(__dirname, "./src/commerce/tests/mocks/next-link.tsx"),
      "next/navigation": path.resolve(
        __dirname,
        "./src/commerce/tests/mocks/next-navigation.ts",
      ),
    },
  },
});
