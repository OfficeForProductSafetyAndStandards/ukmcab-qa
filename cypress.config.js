const { defineConfig } = require("cypress");
const { CosmosClient } = require("@azure/cosmos");
const { SearchClient, AzureKeyCredential } = require("@azure/search-documents")

// GOV UK Notify
const NotifyClient = require('notifications-node-client').NotifyClient

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://ukmcab-dev.beis.gov.uk',
    chromeWebSecurity: false,
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      const endpoint = config.env.DB_URL;
      const key = config.env.DB_KEY;
      const client = new CosmosClient({ endpoint, key });
      const azureSearchClient = new SearchClient(
        "https://acs-ukmcab-dev.search.windows.net",
        "ukmcab-search-index",
        new AzureKeyCredential(config.env.AZURE_SEARCH_API_KEY)
      );
      const notifyClient = new NotifyClient(config.env.NOTIFY_API_KEY)
      on('task', {
        async getItems() {
          return await (await client.database('main').container('cab-documents').items.readAll().fetchAll()).resources
        },
        async executeQuery({db, container, querySpec}) {
          const d = await client.database(db)
          const c = await d.container(container)
          const result = await c.items.query(querySpec).fetchAll()
          return result
        },
        async upsertUser(user) {
          const d = await client.database('UKMCABIdentity')
          const c = await d.container('AppIdentity')
          const updatedUser = await c.items.upsert(user)
          return updatedUser.resource
        },
        async getEmails(email) {
          const recentEmails = (await notifyClient.getNotifications()).data.notifications
          return recentEmails
        },
        async azureSearch({keyword, options}) {
          const searchResults = []
          const x = await azureSearchClient.search(keyword, options)
          for await (const result of x.results) {
            searchResults.push(result)
          }
          return searchResults
        }
      })
    },
  },
});
