import { forgotPasswordPath } from '../support/helpers/password-helpers'
import { loginPath } from '../support/helpers/login-helpers'
import OpssAdminUser from '../support/domain/opss-admin-user'

describe('Login/Logout', () => {

  beforeEach(() => {
    cy.ensureOn(loginPath())
  })

  it('displays Login page as per design', function() {
    cy.get('h1').contains('UK Market Conformity Assessment Bodies Sign In')
    cy.get('#Email').siblings('label').contains('Email address')
    cy.get('#Password').siblings('label').contains('Password').siblings('a.show-password-button').contains('Show')
    cy.contains('By signing in you accept our terms and conditions.').find('a').contains('terms and conditions').should('have.attr', 'href', '/Home/Footer/TermsAndConditions')
    cy.get('button').contains('Sign in')
    cy.contains('If you are inactive for 20 minutes, your session will timeout.')
  })

  it('displays error when using unknown credentials', () => {
    cy.login(`Unknown${Date.now()}@ukmcab.gov.uk`, 'Som3P255W0rd!')
    cy.hasError('Email address', 'The information provided is not right, try again')
  })

  it('displays email/password validation errors', () => {
    cy.login('', 'adminP@ssw0rd!')
    cy.hasError('Email address', 'Enter email address')

    cy.login('admin@ukmcab.gov.uk', '')
    cy.hasError('Password', 'Enter password')

    cy.login('', '')
    cy.hasError('Email address', 'Enter email address')
    cy.hasError('Password', 'Enter password')
  })

  it('locks account after 5 unsuccessful attempts', () => {
    const user = new OpssAdminUser()
    cy.registerViaApi(user.email, user.password)
    for(var i = 0; i < 5; i++){
      cy.login(user.email, 'IncorrectPassword')
    }
    cy.contains('Account locked This account has been locked out, please try again later.')
    cy.contains('If you cannot remember your password please use the forgotten password form.')
      .find('a', 'forgotten password').should('have.attr', 'href', forgotPasswordPath())
  })

  it('logs user out successfully', function() {
    const user = new OpssAdminUser()
    cy.registerViaApi(user.email, user.password)
    cy.login(user.email, user.password)
    cy.logout()
    cy.contains('You have successfully signed out.')
  })

})