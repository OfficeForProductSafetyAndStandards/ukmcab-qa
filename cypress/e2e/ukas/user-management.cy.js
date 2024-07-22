import * as UserManagementHelpers from '../../support/helpers/user-management-helpers'
import { contactUs } from '../../support/helpers/url-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../../support/helpers/common-helpers'
import { getLastUserEmail } from "../../support/helpers/email-helpers";
import * as AccountRequestHelpers from '../../support/helpers/account-request-helpers'

describe('User Management', () => {

  it('users can not manage their own account', function () {
    UserManagementHelpers.getTestUsers().then(users => {
      const user = users.OpssAdminUser
      cy.loginAs(user)
      cy.ensureOn(UserManagementHelpers.userAdminPath(user))
      cy.contains('button', 'Lock account').should('not.exist')
      cy.contains('button', 'Archive account').should('not.exist')
    })
  })

  context('when viewing active user list', function () {

    beforeEach(function () {
      cy.loginAsOpssUser()
      UserManagementHelpers.getUsers().then(users => {
        const activeUsers = users.filter(user => !user.isLocked)
        cy.wrap(activeUsers).as('activeUsers')
        cy.ensureOn(UserManagementHelpers.userManagementPath())
        cy.contains('a', 'Active').click()
      })
    })

    it('displays correct order of users by default and upon sorting by any of the sortable columns', function () {
      // default sort order has changed, needs investigating
      // cy.contains('h1', 'User accounts')
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, [user => user.lastname.toLowerCase()], 'asc').slice(0, 20))

      cy.log('First name Asc sort')
      cy.get('thead th a').eq(0).click()
      UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, [user => user.firstname.toLowerCase()], 'asc').slice(0, 10))

      cy.log('First name Desc sort')
      cy.get('thead th a').eq(0).click()
      UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, [user => user.firstname.toLowerCase()], 'desc').slice(0, 10))

      cy.log('Last name Asc sort')
      cy.get('thead th a').eq(1).click()
      UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, [user => user.lastname.toLowerCase()], 'asc').slice(0, 10))

      cy.log('Last name Desc sort')
      cy.get('thead th a').eq(1).click()
      UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, [user => user.lastname.toLowerCase()], 'desc').slice(0, 10))

      // TODO: This order doesn't match JS in-memory sort. Talk to DEV if they are doing via cosmos 
      // cy.log('Email Asc sort')
      // cy.get('thead th a').eq(2).click()
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, [user => user.contactEmail.toLowerCase()], 'asc').slice(0,20))

      // cy.log('Email Desc sort')
      // cy.get('thead th a').eq(2).click()
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, 'contactEmail', 'desc').slice(0,20))

      // cy.log('User group Asc sort')
      // cy.get('thead th a').eq(3).click()
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, 'userGroup', 'asc').slice(0,20))

      // cy.log('User group Desc sort')
      // cy.get('thead th a').eq(3).click()
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, 'userGroup', 'desc').slice(0,20))

      // cy.log('Last logon Asc sort')
      // cy.get('thead th a').eq(4).click()
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, 'lastLogon', 'asc').slice(0,20))

      // cy.log('Last logon Desc sort')
      // cy.get('thead th a').eq(4).click()
      // UserManagementHelpers.hasUserList(Cypress._.orderBy(this.activeUsers, 'lastLogon', 'desc').slice(0,20))
    })
  })

  context('when viewing user requests', function () {

    beforeEach(function () {
      UserManagementHelpers.seedAccountRequest()
      cy.loginAsOpssUser()
      UserManagementHelpers.getPendingAccountRequests().then(requests => {
        cy.wrap(requests).as('requests')
        cy.ensureOn(UserManagementHelpers.userManagementPath())
      })
    })

    it('displays a list of pending requests under Requests tab', function () {
      cy.contains('a', `Requests (${this.requests.length})`).click()
      UserManagementHelpers.hasAccountRequestsList(this.requests.slice(0, 10))
    })
  })

  context('when viewing Locked user list', function () {

    beforeEach(function () {
      cy.loginAsOpssUser()
      UserManagementHelpers.getUsers().then(users => {
        cy.wrap(users.filter(user => user.isLocked && !user.isArchived)).as('lockedUsers')
        cy.ensureOn(UserManagementHelpers.userManagementPath())
        cy.contains('a', 'Locked').click()
      })
    })

    it('displays correct data sorted by last name', function () {
      cy.get('thead th a').eq(1).click()
      UserManagementHelpers.hasUserList(Cypress._.orderBy(this.lockedUsers, [user => user.lastname.toLowerCase()], 'asc').slice(0, 10))
    })
  })

  context('when viewing Archived user list', function () {

    beforeEach(function () {
      cy.loginAsOpssUser()
      UserManagementHelpers.getUsers().then(users => {
        cy.wrap(users.filter(user => user.isArchived)).as('archivedUsers')
        cy.ensureOn(UserManagementHelpers.userManagementPath())
        cy.contains('a', 'Archived').click()
      })
    })

    it('displays correct data sorted by last name', function () {
      cy.get('thead th a').eq(1).click()
      UserManagementHelpers.hasUserList(Cypress._.orderBy(this.archivedUsers, [user => user.lastname.toLowerCase()], 'asc').slice(0, 10))
    })
  })

  context('when viewing user profile page', function () {

    beforeEach(function () {
      UserManagementHelpers.getTestUsers().then(users => {
        const user = users.SomeUser
        cy.wrap(user).as('user')
        cy.loginAs(users.OpssAdminUser)
        cy.ensureOn(UserManagementHelpers.userAdminPath(user))
      })
    })

    it('displays expected user details', function () {
      cy.contains('a', 'Back').should('have.attr', 'href', UserManagementHelpers.userManagementList())
      UserManagementHelpers.hasUserProfileDetails(this.user)
    })
  })

  context('when locking user account', function () {

    beforeEach(function () {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.SomeUser).as('lockedUser')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('both reason and user notes are mandatory', function () {
      UserManagementHelpers.lockUser(this.lockedUser, '', '')
      cy.hasError('Reason', 'Enter a reason')
      cy.hasError('User notes', 'Enter notes')
    })

    it('account is locked stopping user from logging in and sends user email', function () {
      UserManagementHelpers.lockUser(this.lockedUser)
      cy.contains('Account locked You have locked the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.lockedUser))
      cy.logout()
      cy.login(this.lockedUser)
      shouldBeLoggedOut()
      cy.contains('Your account is locked. If you need support, use the UKMCAB contact page.')
      cy.contains('a', 'UKMCAB contact page').should('have.attr', 'href', contactUs())
      getLastUserEmail(this.lockedUser.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountLockedEmail()).to.be.true
      })
    })
  })

  context('when unlocking user account', function () {

    beforeEach(function () {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.LockedUser).as('lockedUser')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('both reason and internal notes are mandatory', function () {
      UserManagementHelpers.unlockUser(this.lockedUser, '', '')
      cy.hasError('Reason', 'Enter a reason')
      cy.hasError('User notes', 'Enter notes')
    })

    it('account is unlocked allowing user to login  and sends user email', function () {
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

  context('when archiving user account', function () {

    beforeEach(function () {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.SomeUser).as('user')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('account is archived stopping user from logging in and sends user email', function () {
      UserManagementHelpers.archiveUser(this.user)
      cy.contains('Account archived You have archived the user account').click()
      cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath(this.user))
      cy.logout()
      cy.login(this.user)
      shouldBeLoggedOut()
      cy.contains('Your account has been archived. If you need support, use the UKMCAB contact page.')
      cy.contains('a', 'UKMCAB contact page').should('have.attr', 'href', contactUs())
      getLastUserEmail(this.user.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountArchivedEmail()).to.be.true
      })
    })
  })

  context('when unarchiving user account', function () {

    beforeEach(function () {
      UserManagementHelpers.getTestUsers().then(users => {
        cy.wrap(users.ArchivedUser).as('user')
        cy.loginAs(users.OpssAdminUser)
      })
    })

    it('account is unarchived allowing user to log in and sends user email', function () {
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

  context('when reviewing user account requests', function () {

    beforeEach(function () {
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

    it('displays all expected information about the request', function () {
      UserManagementHelpers.hasAccountRequestDetails(this.pendingRequest)
    })

    it('can be approved - request is removed from pending requests list - user is notified by email - allows user system access', function () {
      UserManagementHelpers.approveAccountRequest(this.pendingRequest, 'OPSS')
      // UserManagementHelpers.hasAccountRequestsList(this.pendingRequests.filter(req => req.id !== this.pendingRequest.id).slice(0,20))
      getLastUserEmail(this.pendingRequest.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountRequestApprovedEmail('OPSS')).to.be.true
      })
      cy.login({ id: this.pendingRequest.subjectId })
      shouldBeLoggedIn()
    })

    it('can not be approved without assigning a user group', function () {
      cy.contains('button', 'Approve').click()
      cy.hasError('Select a user group', 'Select a user group')
    })

    it('can be declined - request is removed from pending requests list - user is notified by email - user can not access system', function () {
      UserManagementHelpers.rejectAccountRequest(this.pendingRequest)
      // UserManagementHelpers.hasAccountRequestsList(this.pendingRequests.filter(req => req.id !== this.pendingRequest.id).slice(0,20))
      getLastUserEmail(this.pendingRequest.contactEmail).then(_email => {
        expect(_email.isRecent).to.be.true
        expect(_email.isAccountRequestRejectedEmail()).to.be.true
      })
      cy.login({ id: this.pendingRequest.subjectId })
      shouldBeLoggedOut()
      cy.contains('Request user account')
    })

    it('can not be declined without supplying a reason', function () {
      cy.contains('button', 'Decline').click()
      cy.continue()
      cy.hasError('Enter the reason for declining this account request. This will be sent in the response to the request.', 'Enter the reason for declining this account request')
    })
  })

  context('when viewing user history', function () {

    beforeEach(function () {
      const uniqueId = Date.now() // unique non-existent user id.
      const user = {
        id: uniqueId,
        firstname: `Automated ${uniqueId}`,
        lastname: 'Test',
        contactEmail: uniqueId + '@ContactEmailAddress.com'
      }
      cy.wrap(user).as('user')
      cy.login(user)
    })

    it('user account is locked, unlocked, archived and unarchived then checked in user history', function () {
      UserManagementHelpers.requestAccount(this.user)
      cy.contains('Request submitted You will receive an email with the outcome once your request has been reviewed.')
      cy.loginAsOpssUser()
      UserManagementHelpers.getRequestAccount(this.user.firstname).then(createdUser => {
        const account = createdUser.find(r => r.isPending())
        cy.ensureOn(UserManagementHelpers.userApprovePath(account))
        AccountRequestHelpers.approveRequest()
        UserManagementHelpers.archiveUser({ id: account.subjectId })
        cy.contains('Account archived You have archived the user account').click()
        cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        cy.ensureOn(UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        UserManagementHelpers.unarchiveUser({ id: account.subjectId })
        cy.contains('Account unarchived You have unarchived the user account').click()
        cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        cy.ensureOn(UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        UserManagementHelpers.lockUser({ id: account.subjectId })
        cy.contains('Account locked You have locked the user account').click()
        cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        UserManagementHelpers.unlockUser({ id: account.subjectId })
        cy.contains('Account unlocked You have unlocked the user account').click()
        cy.contains('a', 'Continue').should('have.attr', 'href', UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        cy.ensureOn(UserManagementHelpers.userAdminPath({ id: account.subjectId }))
        UserManagementHelpers.viewHistory()
        UserManagementHelpers.getApprovedAccount(this.user.firstname).then(aprovedUser => {
          const newuser = aprovedUser.find(r => r.status === 'Active')
          cy.wrap(Cypress._.orderBy(newuser.history, 'dateTime', 'desc').slice(0, 10)).each((log, index) => {
            cy.get('tbody tr').eq(index).within(() => {
              const logValue = log.action
              cy.log(`log Action value is:${log.action}`)
              cy.get('td').eq(0).contains(Cypress.dayjs(log.dateTime).utc().format('DD/MM/YYYYHH:mm'))
              cy.get('td').eq(1).contains(log.userName)
              if (log.userRole) {
                cy.get('td').eq(2).contains(log.userRole.toUpperCase())
              } else {
                // do nothing if it happens to be initial user access request
              }
              cy.get('td').eq(3).contains(UserManagementHelpers.getValuefromKey(logValue))
            })
          })
        })
      })
    })
  })
})
