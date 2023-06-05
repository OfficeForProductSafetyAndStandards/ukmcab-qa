import * as LoginHelpers from '../support/helpers/login-helpers'
import OpssAdminUser from '../support/domain/opss-admin-user'
import { cabManagementPath } from '../support/helpers/cab-helpers'

describe('Login/Logout', () => {

  beforeEach(() => {
    cy.ensureOn(LoginHelpers.loginPath())
  })

  it('displays Login page as per design', function() {
    cy.get('h1').contains('UK Market Conformity Assessment Bodies Sign In')
    cy.get('#Email').siblings('label').contains('Email address')
    cy.get('#Password').siblings('label').contains('Password').siblings('a.show-password-button').contains('Show')
    cy.contains('By signing in you accept our terms and conditions.').find('a').contains('terms and conditions').should('have.attr', 'href', '/terms-and-conditions')
    cy.get('button').contains('Sign in')
    cy.contains('If you are inactive for 20 minutes, your session will timeout.')
  })

  it('displays error when using unknown credentials', () => {
    LoginHelpers.login(`Unknown${Date.now()}@ukmcab.gov.uk`, 'Som3P255W0rd!')
    cy.hasError('Email address', 'The information provided is not right, try again')
  })

  it('displays email/password validation errors', () => {
    LoginHelpers.login('', 'adminP@ssw0rd!')
    cy.hasError('Email address', 'Enter email address')

    LoginHelpers.login('admin@ukmcab.gov.uk', '')
    cy.hasError('Password', 'Enter password')

    LoginHelpers.login('', '')
    cy.hasError('Email address', 'Enter email address')
    cy.hasError('Password', 'Enter password')
  })

  it('locks account after 5 unsuccessful attempts', () => {
    const user = new OpssAdminUser()
    cy.registerViaApi(user.email, user.password)
    for(var i = 0; i < 5; i++){
      LoginHelpers.login(user.email, 'IncorrectPassword')
    }
    cy.contains('The service is now locked for 2 hours due to multiple failed login attempts.')
  })

  it('logs admin user in with valid credentials and displays Cab Management', () => {
    LoginHelpers.loginAsOpssUser()
    cy.location('pathname').should('equal', cabManagementPath())
  })

  it('logs user out successfully', function() {
    const user = new OpssAdminUser()
    cy.registerViaApi(user.email, user.password)
    LoginHelpers.login(user.email, user.password)
    cy.logout()
    cy.contains('You have successfully signed out.')
  })

})