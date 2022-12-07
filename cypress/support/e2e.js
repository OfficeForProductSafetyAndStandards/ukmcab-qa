// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

var chaiDatetime = require('chai-datetime');
chai.use(chaiDatetime);

// Cypress tests start on the same page as previous tests unless cy.visit is used at the start of each test
// This is not a requirement in each test hence can lead to stale page at the start of test
// Below hook ensures that each test starts at a blank page.
beforeEach(() => {
  cy.window().then((win) => {
    win.location.href = 'about:blank'
  })
})