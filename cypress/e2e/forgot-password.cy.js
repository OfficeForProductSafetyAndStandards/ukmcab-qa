import * as Registration from '../support/helpers/registration-helpers'
import * as PasswordHelpers from '../support/helpers/password-helpers'
import * as DbHelpers from '../support/helpers/db-helpers'
import { path as loginPath } from '../support/helpers/login-helpers'
import OGDUser from '../support/domain/ogd-user'
import { hasFieldError, hasFormError } from '../support/helpers/validation-helpers'
import { shouldBeLoggedIn } from '../support/helpers/common-helpers'

describe('Forgot password', () => {

  beforeEach(() => {
    cy.ensureOn(PasswordHelpers.forgotPasswordPath())
  })

  it('user must enter email address to proceed', () => {
    cy.contains('button', 'Password reset').click()
    hasFieldError('Email', 'The Email field is required.')
  })
  
  it('user must enter whitelisted email address to proceed', () => {
    const error = 'Only ukas.com or .gov.uk email addresses are valid'
    PasswordHelpers.requestPasswordReset('xx@dept.gov.sco')
    hasFieldError('Email', error)
    PasswordHelpers.requestPasswordReset('xx@ukas.co')
    hasFieldError('Email', error)
  })

  it('password reset confirmation is displayed and reset email is sent upon entering valid email', () => {
    const user = new OGDUser()
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    PasswordHelpers.requestPasswordReset(user.email)
    PasswordHelpers.hasPasswordResetRequestedConfirmation()
    PasswordHelpers.getPasswordResetEmail(user.email).then(email => {
      expect(new Date(email.sent_at)).to.be.closeToTime(new Date(), 3)
    })
  })

  it('password reset emails are not sent for unregistered emails', () => {
    const email = 'SomeMadeUpEmail@ukmcab.gov.uk'
    PasswordHelpers.requestPasswordReset(email)
    PasswordHelpers.hasPasswordResetRequestedConfirmation()
    PasswordHelpers.getPasswordResetEmail(email).then(email => {
      expect(email).to.be.null
    })
  })

  it('password reset emails are not sent for acounts that are not already registered', () => {
    const email = 'SomeNoExistentEmail@ukmcab.gov.uk'
    PasswordHelpers.requestPasswordReset(email)
    PasswordHelpers.hasPasswordResetRequestedConfirmation()
    PasswordHelpers.getPasswordResetEmail(email).then(email => {
      expect(email).to.be.null
    })
  })

  it('password reset confirmation is displayed upon successful reset', () => {
    const user = new OGDUser()
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    PasswordHelpers.requestPasswordReset(user.email)
    PasswordHelpers.getPasswordResetLink(user.email).then(link => {
      cy.ensureOn(link)
      PasswordHelpers.resetPassword(user.email, 'Som3NewP@55w0rd')
    })
    cy.contains('Reset password confirmation Your password has been reset. Please click here to log in.')
    cy.contains('a', 'click here to log in').should('have.attr', 'href', loginPath())
  })

  it('user can login with new password after reset and old password stops working', () => {
    const user = new OGDUser()
    const oldPassword = user.password
    const newPassword = 'Som3NewP@55w0rd'
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    PasswordHelpers.requestPasswordReset(user.email)
    PasswordHelpers.getPasswordResetLink(user.email).then(link => {
      cy.ensureOn(link)
      PasswordHelpers.resetPassword(user.email, newPassword)
    })
    DbHelpers.setUserRequestAsApproved(user)
    cy.login(user.email, oldPassword)
    hasFormError('Invalid login attempt.')
    cy.login(user.email, newPassword)
    shouldBeLoggedIn()
  })

  it('passwords must match and meet valition when resetting', () => {
    const user = new OGDUser()
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    PasswordHelpers.requestPasswordReset(user.email)
    PasswordHelpers.getPasswordResetLink(user.email).then(link => {
      cy.ensureOn(link)
      PasswordHelpers.resetPassword(user.email, 'Som3NewP@55w0rd','Som3DifferentP@55w0rd')
      hasFormError('The password and confirmation password do not match.')
      PasswordHelpers.resetPassword(user.email, 'Pass!')
      hasFormError("The Password must be at least 8 and at max 100 characters long.")
      PasswordHelpers.resetPassword(user.email, 'Pass!Pass@')
      hasFormError("Passwords must have at least one digit ('0'-'9').")
      PasswordHelpers.resetPassword(user.email, 'password3@')
      hasFormError("Passwords must have at least one uppercase ('A'-'Z').")
      PasswordHelpers.resetPassword(user.email, 'Password3')
      hasFormError("Passwords must have at least one non alphanumeric character.")
    })
  })

  it('password reset link can only be used once', () => {
    const user = new OGDUser()
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    PasswordHelpers.requestPasswordReset(user.email)
    PasswordHelpers.getPasswordResetLink(user.email).then(link => {
      cy.ensureOn(link)
      PasswordHelpers.resetPassword(user.email, 'Som3NewP@55w0rd')
      cy.ensureOn(link)
      PasswordHelpers.resetPassword(user.email, 'Som3NewP@55w0rd')
      cy.location('pathname').should('equal', PasswordHelpers.passwordResetPath())
      cy.contains('Invalid token.')
    })
  })

  it('password reset link only works for email address that trigerred the reset', () => {
    const user = new OGDUser()
    Registration.registerAsOgdUser(user)
    Registration.verifyEmail(user.email)
    PasswordHelpers.requestPasswordReset(user.email)
    PasswordHelpers.getPasswordResetLink(user.email).then(link => {
      cy.ensureOn(link)
      PasswordHelpers.resetPassword("admin@ukmcab.gov.uk", 'Som3NewP@55w0rd')
      cy.location('pathname').should('equal', PasswordHelpers.passwordResetPath())
      cy.contains('Invalid token.')
    })
  })
})