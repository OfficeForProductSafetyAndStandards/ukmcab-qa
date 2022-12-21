import { hasFieldError, hasFormError } from '../support/helpers/validation-helpers'
import * as EmailHelpers from '../support/helpers/email-helpers'
import * as PasswordHelpers from '../support/helpers/password-helpers'
import * as Registration from '../support/helpers/registration-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import UKASUser from '../support/domain/ukas-user'

describe('Change of password', () => {

  context('on change password page', () => {
    
    beforeEach(() => {
      cy.loginAsOgdUser()
      cy.ensureOn(PasswordHelpers.changePasswordPath())
    })

    it('all mandatory fields must be entered', () => {
      PasswordHelpers.changePassword('','')
      hasFieldError('Current password', PasswordHelpers.errors.currentPasswordRequired)
      hasFieldError('New password', PasswordHelpers.errors.newPasswordRequired)
      hasFieldError('Confirm new password', PasswordHelpers.errors.confirmNewPasswordRequired)
    })
    
    it('current password must match existing password', () => {
      PasswordHelpers.changePassword('Inc0rr3ctExistingP@ssw0rd','S0meN3wP@ss0rd')
      hasFormError('Incorrect password.') // TODO clarify this
    })
    
    it('new passwords must match', () => {
      PasswordHelpers.changePassword(Cypress.env('OGD_PASS'),'N3wP@ss0rd', 'NonM@tch1ngP@ssw0rd')
      hasFormError(PasswordHelpers.errors.passwordsDontMatch)
    })
  
    it('new password must meet GDS standards', () => {
      const currentPassword = Cypress.env('OGD_PASS')
      PasswordHelpers.changePassword(currentPassword, 'Pass!')
      hasFormError(PasswordHelpers.errors.passwordLength)
  
      PasswordHelpers.changePassword(currentPassword, 'Pass!Pass@')
      hasFormError(PasswordHelpers.errors.passwordAtleastOneDigit)
  
      PasswordHelpers.changePassword(currentPassword, 'password3@')
      hasFormError(PasswordHelpers.errors.passwordAtleastOneUppercase)
  
      PasswordHelpers.changePassword(currentPassword, 'Password3')
      hasFormError(PasswordHelpers.errors.passwordAtleastOneNonAlphanum)
    })
  })


  context('when successful', () => {

    beforeEach(function() {
      const user = new UKASUser()
      cy.wrap(user).as('user')
      Registration.registerAsUkasUser(user)
      Registration.verifyEmail(user.email)
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
      cy.logout()
      cy.login(this.user.email, this.newPassword)
      shouldBeLoggedIn()
      cy.logout()
      cy.login(this.user.email, this.user.password)
      hasFormError(PasswordHelpers.errors.invalidLoginAttempt)
      shouldBeLoggedOut()
    })
  })
})