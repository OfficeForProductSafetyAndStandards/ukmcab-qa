import { header, basicAuthCreds, shouldBeLoggedOut } from '../support/helpers/common-helpers'

describe('Login/Logout', () => {

  beforeEach(() => {
    cy.ensureOn('/')
  })

  it('redirects user to GOV UK One login upon clicking Sign in', () => {
    header().contains('a', 'Sign in').invoke('attr', 'href').then(href => {
      cy.request({
        method: 'GET',
        url: href,
        failOnStatusCode: false,
        ...basicAuthCreds()
      }).then(response => {
        expect(response.redirects.pop()).to.eq('302: https://signin.integration.account.gov.uk/')
      })
    })
  })

  it('logs user out successfully', function() {
    cy.loginAsOpssUser()
    cy.reload()
    cy.logout()
    shouldBeLoggedOut()
  })

  it('redirects user to account request page if user is not recognised within UKMCAB', function() {
    cy.login({id: "99999999999"})
    cy.contains('h1', 'Request user account')
  })

})