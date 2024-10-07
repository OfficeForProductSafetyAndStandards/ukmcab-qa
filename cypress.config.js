const {defineConfig} = require("cypress");
const {CosmosClient} = require("@azure/cosmos");
const NotifyClient = require("notifications-node-client").NotifyClient; // GOV UK Notify
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
    projectId: "mdthva",
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
        charts: true,
        reportPageTitle: "UKMCAB TEST REPORT",
        embeddedScreenshots: true,
        inlineAssets: true,
        saveAllAttempts: false,
        reportDir: "cypress/reports",
        overwrite: false,
        html: true,
        json: true
    },
    e2e: {
        baseUrl: "https://ukmcab-dev.beis.gov.uk",
        defaultCommandTimeout: 30000,
        pageLoadTimeout: 60000,
        chromeWebSecurity: false,
        experimentalRunAllSpecs: true,
        experimentalMemoryManagement: true,
        //numTestsKeptInMemory: 1,
        setupNodeEvents(on, config) {
            require("cypress-mochawesome-reporter/plugin")(on);
            const endpoint = config.env.DB_URL;
            const key = config.env.DB_KEY;
            const client = new CosmosClient({endpoint, key});
            const notifyClient = new NotifyClient(config.env.NOTIFY_API_KEY);

            const getUniqueFileName = (baseName) => {
                let counter = 1;
                let fileName = `${baseName}.csv`;
                while (fs.existsSync(fileName)) {
                    fileName = `${baseName}-${counter}.csv`;
                    counter++;
                }
                return fileName;
            };

            const writeCsv = ({filePath, content}) => {
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, {recursive: true});
                }
                fs.writeFileSync(filePath, content);
                return null;
            };

            on("task", {
                async getItems() {
                    return await (
                        await client
                            .database("main")
                            .container("cab-documents")
                            .items.readAll()
                            .fetchAll()
                    ).resources;
                },
                async executeQuery({db, container, querySpec}) {
                    const d = await client.database(db);
                    const c = await d.container(container);
                    const result = await c.items.query(querySpec).fetchAll();
                    return result;
                },
                async upsertItem({db, container, item}) {
                    const d = await client.database(db);
                    const c = await d.container(container);
                    const upsertedItem = await c.items.upsert(item);
                    return upsertedItem.resource;
                },
                async deleteItem({db, container, id, partitionKey}) {
                    const d = await client.database(db);
                    const c = await d.container(container);
                    const deletedItem = await c.item(id, partitionKey).delete();
                    return deletedItem.resource;
                },
                async getEmails(email) {
                    return (await notifyClient.getNotifications()).data.notifications;
                },
                log(message) {
                    console.log(message);
                    return null;
                },
                table(message) {
                    console.table(message);
                    return null;
                },
                getUniqueFileName,
                writeCsv
            });
        },
    },
});
