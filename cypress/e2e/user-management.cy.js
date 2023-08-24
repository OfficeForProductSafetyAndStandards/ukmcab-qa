import * as UserManagementHelpers from '../support/helpers/user-management-helpers'
import { contactUsUrl } from '../support/helpers/url-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import { getLastUserEmail } from "../support/helpers/email-helpers";
describe('User Management', () => {

  context('when viewing user admin page for active user', function() {

    beforeEach(function() {
      UserManagementHelpers.getUsers().then(users => {
        const user = users.SomeUser
        cy.wrap(user).as('user')
        cy.loginAs(users.OpssAdminUser)
        cy.ensureOn(UserManagementHelpers.userAdminPath(user))
      })
    })

    it('displays expected user details', function() {
      cy.contains('h1', 'User account')
      cy.contains('a', 'Back').should('have.attr', 'href', UserManagementHelpers.userManagementPath())
      cy.hasKeyValueDetail('First name', this.user.firstname)
      cy.hasKeyValueDetail('Last name', this.user.lastname)
      cy.hasKeyValueDetail('Email', this.user.contactEmail)
      cy.hasKeyValueDetail('Last logon date', /^ \d{2}\/\d{2}\/\d{2} \d{2}:\d{2} $/)
    })
  })

  context('when locking user account', function() {

    beforeEach(function() {
      UserManagementHelpers.getUsers().then(users => {
        cy.wrap(users.SomeUser).as('lockedUser')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('account is locked stopping user from logging in and sends user email', function() {
      UserManagementHelpers.lockUser(this.lockedUser)
      cy.contains('Account locked You have locked the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.lockedUser))
      cy.logout()
      cy.login(this.lockedUser)
      shouldBeLoggedOut()
      cy.contains('Account locked Sorry your account is locked, please contact the help desk for further assistance.')
      cy.contains('a', 'Contact support').should('have.attr', 'href', contactUsUrl())
      getLastUserEmail(this.lockedUser.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountLockedEmail()).to.be.true
      })
    })
  })

  context('when unlocking user account', function() {

    beforeEach(function() {
      UserManagementHelpers.getUsers().then(users => {
        cy.wrap(users.LockedUser).as('lockedUser')
        cy.loginAs(users.OpssAdminUser)
      })
    })
    
    it('account is unlocked allowing user to login  and sends user email', function() {
      cy.ensureOn(UserManagementHelpers.userAdminPath(this.lockedUser))
      cy.contains('This account is locked')
      UserManagementHelpers.unlockUser(this.lockedUser)
      cy.contains('Account unlocked You have unlocked the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.lockedUser))
      cy.login(this.lockedUser)
      shouldBeLoggedIn()
      getLastUserEmail(this.lockedUser.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountUnlockedEmail()).to.be.true
      })
    })
  })
})