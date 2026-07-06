import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  env: {
    apiUrl: "http://localhost:8000/api", // your Express backend
  },
});
