const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://app-opss-ukmcab-dev.azurewebsites.net/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
