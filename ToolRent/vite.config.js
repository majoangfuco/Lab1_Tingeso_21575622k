import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wp2'],
  server: {
    port: 5173
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "node_modules/",
        "src/setupTests.js",
        "**/*.test.js",
        "**/*.test.jsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.js",
        "**/*.spec.jsx",
        "src/components/test/",
        "src/pages/test/",
        "src/assets/**",
        "**/*.css"
      ]
    }
  }
});