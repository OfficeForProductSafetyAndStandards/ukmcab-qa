import * as EmailHelpers from '../support/helpers/email-helpers'
import * as PasswordHelpers from '../support/helpers/password-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import OpssAdminUser from '../support/domain/opss-admin-user'

describe('Change of password', () => {

  context('on change password page', () => {
    
    beforeEach(() => {
      cy.loginAsOpssUser()
      cy.ensureOn(PasswordHelpers.changePasswordPath())
    })

    it('all mandatory fields must be entered', () => {
      PasswordHelpers.changePassword('','')
      cy.hasError('Current password', PasswordHelpers.errors.currentPasswordRequired)
      cy.hasError('New password', PasswordHelpers.errors.newPasswordRequired)
      cy.hasError('Confirm new password', PasswordHelpers.errors.confirmNewPasswordRequired)
    })
    
    it('current password must match existing password', () => {
      PasswordHelpers.changePassword('Inc0rr3ctExistingP@ssw0rd','S0meN3wP@ss0rd')
      cy.hasError('Current password', PasswordHelpers.errors.incorrectPassword)
    })
    
    it('new passwords must match', () => {
      PasswordHelpers.changePassword(Cypress.env('OPSS_PASS'),'N3wP@ss0rd', 'NonM@tch1ngP@ssw0rd')
      cy.hasError('Confirm new password', PasswordHelpers.errors.passwordsDontMatch)
    })
  
    it('new password must meet GDS standards', () => {
      const currentPassword = Cypress.env('OPSS_PASS')
      PasswordHelpers.changePassword(currentPassword, 'Pass!')
      cy.hasError('New password', PasswordHelpers.errors.passwordLength)
  
      PasswordHelpers.changePassword(currentPassword, 'Pass!Pass@')
      cy.hasError('New password', PasswordHelpers.errors.passwordAtleastOneDigit)
  
      PasswordHelpers.changePassword(currentPassword, 'password3@')
      cy.hasError('New password', PasswordHelpers.errors.passwordAtleastOneUppercase)
  
      PasswordHelpers.changePassword(currentPassword, 'Password3')
      cy.hasError('New password', PasswordHelpers.errors.passwordAtleastOneNonAlphanum)
    })
  })


  context('when successful', () => {

    beforeEach(function() {
      const user = new OpssAdminUser()
      cy.wrap(user).as('user')
      cy.registerViaApi(user.email, user.password)
      cy.login(user.email, user.password)
      cy.ensureOn(PasswordHelpers.changePasswordPath())
      const newPassword = 'N3wP255w0rd!'
      cy.wrap(newPassword).as('newPassword')
      PasswordHelpers.changePassword(user.password, newPassword)
    })

    it('displays confirmatiom and notification is emailed to user', function() {
      PasswordHelpers.hasPasswordChangeConfirmation()
      EmailHelpers.getLastUserEmail(this.user.email).then(email => {
        expect(email.isRecent).to.be.true
        expect(email.isPasswordChangedConfirmationEmail).to.be.true
      })
    })

    it('user can login with the updated password and old password ceases to work', function() {
      PasswordHelpers.hasPasswordChangeConfirmation()
      cy.logout()
      cy.login(this.user.email, this.newPassword)
      shouldBeLoggedIn()
      cy.logout()
      cy.login(this.user.email, this.user.password)
      cy.hasError('Email address', PasswordHelpers.errors.invalidLoginAttempt)
      shouldBeLoggedOut()
    })
  })
})