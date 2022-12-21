import { basicAuthCreds } from '../support/helpers/common-helpers'
import { header } from './helpers/common-helpers'
import * as Login from './helpers/login-helpers'
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('ensureOn', (urlPath, options={}) => {
  cy.location().then(loc => {
    if(loc.toString().replace(loc.origin, '') !== urlPath) {
      cy.visit(urlPath, {...basicAuthCreds(), ...options})
    }
  })
})

Cypress.Commands.add('login', (username, password) => {
  cy.ensureOn(Login.path())
  Login.login(username, password)
})

Cypress.Commands.add('loginAsAdmin', () => {
  Login.loginAsAdmin()
})

Cypress.Commands.add('loginAsOgdUser', () => {
  Login.loginAsOgdUser()
})

Cypress.Commands.add('loginAsUkasUser', () => {
  Login.loginAsUkasUser()
})

Cypress.Commands.add('logout', () => {
  header().contains('Logout').click()
})

Cypress.Commands.add('hasKeyValueDetail', (key, value) => {
  cy.get('.govuk-summary-list__row').contains(key).next().contains(value)
})

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })