**Introduction -** This repository contains e2e tests for the UKMCAB service.

**Tooling -** NodeJS, Cypress

Tests by default are configured to run against the DEV environment but can be configured to run on any other environment. To run tests steps are as follows

1. Make sure you have latest version of NodeJS installed
2. Copy the contents of `cypress.env.json.example` and add to a new file named `cypress.env.json`
3. Populate `cypress.env.json` with required configuration values. The file is already gitignored.
4. Run `npm install` to install dependencies
5. Run `cypress open dev` or `npm run cypress:open:dev` for dev, or `npm run cypress:open:stage` for stage  to run tests. Check out other scripts in `package.json` for other run options.
