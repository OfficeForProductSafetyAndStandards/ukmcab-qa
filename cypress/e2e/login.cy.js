import { hasFieldError } from '../support/helpers/validation-helpers'
import { forgotPasswordPath } from '../support/helpers/password-helpers'
import { path as registerPath } from '../support/helpers/registration-helpers'
import { path as loginPath } from '../support/helpers/login-helpers'
import OGDUser from '../support/domain/ogd-user'
import * as Registration from '../support/helpers/registration-helpers'
import * as DbHelpers from '../support/helpers/db-helpers'

describe('Logging in', () => {

  beforeEach(() => {
    cy.ensureOn(loginPath())
  })

  it('displays error when using unknown credentials', () => {
    cy.login(`Unknown${Date.now()}@ukmcab.gov.uk`, 'Som3P255W0rd!')
    hasFieldError('Email', 'Invalid login attempt.')
  })

  it('displays email/password validation errors', () => {
    cy.login('', 'adminP@ssw0rd!')
    hasFieldError('Email', 'The Email field is required.')

    cy.login('admin@ukmcab.gov.uk', '')
    hasFieldError('Password', 'The Password field is required.')

    cy.login('', '')
    hasFieldError('Email', 'The Email field is required.')
    hasFieldError('Password', 'The Password field is required.')
  })

  it('displays link to reset password', () => {
    cy.contains('a', 'Forgot your password?').should('have.attr', 'href', forgotPasswordPath())
  })

  it('displays link to register as a new user', () => {
    cy.contains('a', 'Register as a new user').should('have.attr', 'href', registerPath())
  })

  it('locks account after 5 unsuccessful attempts', () => {
    const user = new OGDUser()
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    DbHelpers.setUserRequestAsApproved(user)
    for(var i = 0; i < 5; i++){
      cy.login(user.email, 'IncorrectPassword')
    }
    cy.contains('Account locked This account has been locked out, please try again later.')
  })

  context('as an Admin user', () => {

    it('displays CAB list upon successful login', () => {
      cy.loginAsOpssUser()
      cy.contains('CAB list')
      cy.location('pathname').should('eq', '/admin')
    })

  })

})