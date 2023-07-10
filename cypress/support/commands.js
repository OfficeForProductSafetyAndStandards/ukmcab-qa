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

Cypress.Commands.add('login', (username=Cypress.env('OPSS_USER'), password=Cypress.env('OPSS_PASS')) => {
  cy.request({
    method: 'POST',
    url: '/account/login',
    form: true,
    body: {
      Email: username,
      Password: password,
    },
    ...basicAuthCreds()
  })
})

Cypress.Commands.add('loginAsOpssUser', () => {
  cy.login()
})

Cypress.Commands.add('loginAsOgdUser', () => {
  cy.login(Cypress.env('OGD_USER'), Cypress.env('OGD_PASS'))
})

Cypress.Commands.add('loginAsUkasUser', () => {
  cy.login(Cypress.env('UKAS_USER'), Cypress.env('UKAS_PASS'))
})

Cypress.Commands.add('logout', () => {
  header().find('button').contains('Sign out').click()
})

Cypress.Commands.add('continue', () => {
  cy.contains('button,a', 'Continue').click()
})

Cypress.Commands.add('cancel', () => {
  cy.contains('button,a', 'Cancel').click()
})

Cypress.Commands.add('registerViaApi', (email, password) => {
  // coikies must be passed in when creating user via API.
  // Cypress automatically submites these in subsequent requests once set.
  // Login once before making egistration request and then clear cookies to logout
  cy.login()
  cy.request({
    method: 'POST',
    url: '/api/user',
    body: {
      FirstName: 'Test',
      LastName: 'User',
      Email: email,
      Password: password,
      ApiPassword: Cypress.env('BASIC_AUTH_PASS')
    },
    ...basicAuthCreds()
  })
  cy.clearCookies()
})

Cypress.Commands.add('getSearchResults', (keywords, options={}) => {
  keywords = keywords === '' ? '*' : `Name:(${keywords})^3 TownCity:(${keywords}) Postcode:("${keywords}") HiddenText:("${keywords}") CABNumber:("${keywords}")^4 LegislativeAreas:(${keywords})^6`
  cy.request({
    method: 'POST',
    headers: {
      'api-key' : Cypress.env('AZURE_SEARCH_API_KEY')
    },
    // url: 'https://acs-ukmcab-dev.search.windows.net/indexes/ukmcab-search-index-v1-1/docs/search?api-version=2020-06-30',
    url: Cypress.env('AZURE_SEARCH_URL') + '/indexes/ukmcab-search-index-v1-1/docs/search?api-version=2020-06-30',
    body: {
      search: keywords,
      queryType: 'full',
      searchMode: 'any',
      top: 1000,
      ...options
    }
  }).then(resp => {
    return resp.body.value
  })
})

Cypress.Commands.add('hasKeyValueDetail', (key, value) => {
  cy.get('.govuk-summary-list__row').contains(key).next().contains(value)
})

// checks error is present both at field level and form level
Cypress.Commands.add('hasError', (fieldLabel, error) => {
  cy.contains('.govuk-form-group', fieldLabel).contains(error)
  cy.get('.govuk-error-summary__list').contains(error)
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