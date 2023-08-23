import { basicAuthCreds } from '../support/helpers/common-helpers'
import { header } from './helpers/common-helpers'

Cypress.Commands.add('ensureOn', (urlPath, options={}) => {
  cy.location().then(loc => {
    if(loc.toString().replace(loc.origin, '') !== urlPath) {
      cy.visit(urlPath, {...basicAuthCreds(), ...options})
    }
  })
})

// // Uses Cypress session. For each test run the first time login is performed via UI and then that logged in
// // state is cached. Next time this command is called anytime in the suite it uses the state to simulate login
// Cypress.Commands.add('login', (username, password) => {
//   cy.session([username, password], () => {
//     cy.visit('https://signin.integration.account.gov.uk',
//     {
//       auth: {
//         username: Cypress.env('ONE_LOGIN_BASIC_AUTH_USER'),
//         password: Cypress.env('ONE_LOGIN_BASIC_AUTH_PASS')
//       },
//       failOnStatusCode: false
//     })
//     cy.ensureOn('https://ukmcab-dev.beis.gov.uk')
//     cy.setCookie('accept_analytics_cookies', 'accept')
//     cy.contains('Sign in').click()
//     cy.contains('button', 'Sign in').click()
//     cy.get('#email').type(username)
//     cy.continue()
//     cy.get('#password').type(password)
//     cy.continue()
//   },
//   {cacheAcrossSpecs: true} // by default caching is used within a single spec file. This setting enables it across all specs.
//   )
// })

// login using QA endpoint visually
Cypress.Commands.add('login', (user) => {
  cy.ensureOn('/account/qalogin')
  cy.get('input[name=userid]').type(user.id)
  cy.get('form').submit()
})

// login using QA endpoint request
Cypress.Commands.add('loginAs', (user) => {
  cy.request({
    method: 'POST',
    url: '/account/qalogin',
    body: {
      userId: user.id
    },
    form: true,
    ...basicAuthCreds()
  })
})

Cypress.Commands.add('loginAsOpssUser', () => {
  cy.fixture('users').then(users => {
    cy.loginAs(users.OpssAdminUser)
  })
})

// TODO: OTHER USERS YET TO COME

Cypress.Commands.add('logout', () => {
  header().find('a').contains('Sign out').click()
})

Cypress.Commands.add('continue', () => {
  cy.contains('button,a', 'Continue').click()
})

Cypress.Commands.add('clickSubmit', () => {
  cy.contains('button,a', 'Submit').click()
})

Cypress.Commands.add('cancel', () => {
  cy.contains('button,a', 'Cancel').click()
})

Cypress.Commands.add('getSearchResults', (keywords, options={}) => {
  keywords = keywords === '' ? '*' : `Name:(${keywords})^3 TownCity:(${keywords}) Postcode:("${keywords}") HiddenText:("${keywords}") CABNumber:("${keywords}")^4 LegislativeAreas:(${keywords})^6`
  cy.request({
    method: 'POST',
    headers: {
      'api-key' : Cypress.env('AZURE_SEARCH_API_KEY')
    },
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