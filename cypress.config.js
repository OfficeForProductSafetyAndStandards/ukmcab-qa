const { defineConfig } = require("cypress");
const { CosmosClient } = require("@azure/cosmos");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://ukmcab-dev.beis.gov.uk/',
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      const endpoint = config.env.DB_URL;
      const key = config.env.DB_KEY;
      const client = new CosmosClient({ endpoint, key });
      on('task', {
        async getItems() {
          // get all dbs
          // const x = await client.databases.readAll().fetchAll()

          // get all containers
          // const x = await client.database('main').containers.readAll().fetchAll()
          return await (await client.database('main').container('cabs').items.readAll().fetchAll()).resources
        },
      })
    },
  },
});
