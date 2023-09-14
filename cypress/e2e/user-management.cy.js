import * as UserManagementHelpers from '../support/helpers/user-management-helpers'
import { contactUsUrl } from '../support/helpers/url-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import { getLastUserEmail } from "../support/helpers/email-helpers";
describe('User Management', () => {

  context('when viewing active user list', function() {

    beforeEach(function() {
      cy.loginAsOpssUser()
      UserManagementHelpers.getUsers().then(users => {
        const activeUsers = users
        .filter(user => !user.isLocked && user.id !== "1" )
        .sort((a, b) => a.lastname.localeCompare(b.lastname))
        cy.wrap(activeUsers).as('activeUsers')
        const lockedOrArchivedUsers = users
        .filter(user => user.isLocked)
        .sort((a, b) => a.lastname.localeCompare(b.lastname))
        cy.wrap(lockedOrArchivedUsers).as('lockedOrArchivedUsers')
        cy.ensureOn(UserManagementHelpers.userManagementPath())
        cy.contains('a', 'Active').click()
      })
    })
    
    it('displays list of active users except the logged in user under Active tab', function() {
      cy.contains('h1', 'User accounts')
      UserManagementHelpers.hasUserList(this.activeUsers.slice(0,20))
    })

    it('displays link to view locked or archived users', function() {
      cy.contains('a', 'View locked/archived accounts').click()
      UserManagementHelpers.hasUserList(this.lockedOrArchivedUsers.slice(0,20))
      cy.contains('a', 'View active accounts').and('has.attr', 'href', UserManagementHelpers.userManagementPath())
    })
  })

  context('when viewing user requests', function() {

    beforeEach(function() {
      UserManagementHelpers.seedAccountRequest()
      cy.loginAsOpssUser()
      UserManagementHelpers.getPendingAccountRequests().then(requests => {
        cy.wrap(requests).as('requests')
        cy.ensureOn(UserManagementHelpers.userManagementPath())
      })
    })

    it('displays a list of pending requests under Requests tab', function() {
      cy.contains('a', `Requests (${this.requests.length})`).click()
      UserManagementHelpers.hasAccountRequestsList(this.requests.slice(0,20))
    })
  })

  context('when viewing user profile page', function() {

    beforeEach(function() {
      UserManagementHelpers.getTestUsers().then(users => {
        const user = users.SomeUser
        cy.wrap(user).as('user')
        cy.loginAs(users.OpssAdminUser)
        cy.ensureOn(UserManagementHelpers.userAdminPath(user))
      })
    })

    it('displays expected user details', function() {
      cy.contains('a', 'Back').should('have.attr', 'href', UserManagementHelpers.userManagementPath())
      UserManagementHelpers.hasUserProfileDetails(this.user)
    })
  })

  context('when locking user account', function() {

    beforeEach(function() {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.SomeUser).as('lockedUser')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('both reason and internal notes are mandatory', function() {
      UserManagementHelpers.lockUser(this.lockedUser, '', '')
      cy.hasError('Reason', 'Enter a reason')
      cy.hasError('Internal notes', 'Enter notes')
    })

    it('account is locked stopping user from logging in and sends user email', function() {
      UserManagementHelpers.lockUser(this.lockedUser)
      cy.contains('Account locked You have locked the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.lockedUser))
      cy.logout()
      cy.login(this.lockedUser)
      shouldBeLoggedOut()
      cy.contains('Your account is locked. If you need support, use the UKMCAB contact page.')
      cy.contains('a', 'UKMCAB contact page').should('have.attr', 'href', contactUsUrl())
      getLastUserEmail(this.lockedUser.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountLockedEmail()).to.be.true
      })
    })
  })

  context('when unlocking user account', function() {

    beforeEach(function() {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.LockedUser).as('lockedUser')
        cy.loginAs(users.OpssAdminUser)
      })
    })
    
    it('both reason and internal notes are mandatory', function() {
      UserManagementHelpers.unlockUser(this.lockedUser, '', '')
      cy.hasError('Reason', 'Enter a reason')
      cy.hasError('Internal notes', 'Enter notes')
    })

    it('account is unlocked allowing user to login  and sends user email', function() {
      cy.ensureOn(UserManagementHelpers.userAdminPath(this.lockedUser))
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

  context('when archiving user account', function() {

    beforeEach(function() {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.SomeUser).as('user')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('account is archived stopping user from logging in and sends user email', function() {
      UserManagementHelpers.archiveUser(this.user)
      cy.contains('Account archived You have archived the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.user))
      cy.logout()
      cy.login(this.user)
      shouldBeLoggedOut()
      cy.contains('Your account has been archived. If you need support, use the UKMCAB contact page.')
      cy.contains('a', 'UKMCAB contact page').should('have.attr', 'href', contactUsUrl())
      getLastUserEmail(this.user.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountArchivedEmail()).to.be.true
      })
    })
  })

  context('when unarchiving user account', function() {

    beforeEach(function() {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.ArchivedUser).as('user')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('account is unarchived allowing user to log in and sends user email', function() {
      cy.ensureOn(UserManagementHelpers.userAdminPath(this.user))
      UserManagementHelpers.unarchiveUser(this.user)
      cy.contains('Account unarchived You have unarchived the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.user))
      cy.login(this.user)
      shouldBeLoggedIn()
      getLastUserEmail(this.user.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountUnarchivedEmail()).to.be.true
      })
    })
  })

  context('when reviewing user account requests', function() {

    beforeEach(function() {
      UserManagementHelpers.seedAccountRequest()
      UserManagementHelpers.getPendingAccountRequests().then(requests => {
        const pendingRequests = requests
        const pendingRequest = requests[0]
        cy.wrap(pendingRequests).as('pendingRequests')
        cy.wrap(pendingRequest).as('pendingRequest')
        cy.loginAsOpssUser()
        cy.ensureOn(UserManagementHelpers.reviewRequestPath(pendingRequest))
      })
    })

    it('displays all expected information about the request', function() {
      UserManagementHelpers.hasAccountRequestDetails(this.pendingRequest)
    })

    it('can be approved - request is removed from pending requests list - user is notified by email - allows user system access', function() {
      UserManagementHelpers.approveAccountRequest(this.pendingRequest, 'OPSS')
      UserManagementHelpers.hasAccountRequestsList(this.pendingRequests.filter(req => req.id !== this.pendingRequest.id).slice(0,20))
      getLastUserEmail(this.pendingRequest.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountRequestApprovedEmail('OPSS')).to.be.true
      })
      cy.login({id: this.pendingRequest.subjectId})
      shouldBeLoggedIn()
    })

    it('can not be approved without assigning a user group', function() {
      cy.contains('button', 'Approve').click()
      cy.hasError('Select a user group', 'Select a user group')
    })
    
    it('can be declined - request is removed from pending requests list - user is notified by email - user can not access system', function() {
      UserManagementHelpers.rejectAccountRequest(this.pendingRequest)
      UserManagementHelpers.hasAccountRequestsList(this.pendingRequests.filter(req => req.id !== this.pendingRequest.id).slice(0,20))
      getLastUserEmail(this.pendingRequest.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountRequestRejectedEmail()).to.be.true
      })
      cy.login({id: this.pendingRequest.subjectId})
      shouldBeLoggedOut()
      cy.contains('Request user account')
    })
    
    it('can not be declined without supplying a reason', function() {
      cy.contains('button', 'Decline').click()
      cy.continue()
      cy.hasError('Enter the reason for declining this account request. This will be sent in the response to the request.', 'Enter the reason for declining this account request')
    })

  })
})