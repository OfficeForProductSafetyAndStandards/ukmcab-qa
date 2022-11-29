import { basicAuthCreds } from '../support/helpers/common-helpers'
import { header } from './helpers/common-helpers'
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
Cypress.Commands.add('ensureOn', (urlPath) => {
  if (cy.location('pathname') === urlPath) {
  } else {
    cy.visit(urlPath, basicAuthCreds())
  }
})

Cypress.Commands.add('login', (username, password) => {
  cy.ensureOn('/Identity/Account/Login')
  cy.get('#Input_Email').invoke('val', username)
  cy.get('#Input_Password').invoke('val', password)
  cy.contains('Log in').click()
})

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('ADMIN_USER'), Cypress.env('ADMIN_PASS'))
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