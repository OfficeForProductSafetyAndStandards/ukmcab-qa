import * as UserManagementHelpers from '../../support/helpers/user-management-helpers'
import * as AccountRequestHelpers from '../../support/helpers/account-request-helpers'

describe('User account request', () => {

  beforeEach(function () {
    const uniqueId = Date.now() // unique non-existent user id.
    const user = {
      id: uniqueId,
      firstname: `Automated ${uniqueId}`,
      lastname: 'Test',
      contactEmail: uniqueId + '@contactexample.test'
    }
    cy.wrap(user).as('user')
    cy.login(user)
  })

  it('goes for approval when successful', function () {
    UserManagementHelpers.requestAccount(this.user)
    cy.contains('Request submitted You will receive an email with the outcome once your request has been reviewed.')

  })

  it('successfully approves user request', function () {
    UserManagementHelpers.requestAccount(this.user)
    cy.contains('Request submitted You will receive an email with the outcome once your request has been reviewed.')
    cy.loginAsOpssUser()
    UserManagementHelpers.getRequestAccount(this.user.firstname).then(createdUser => {
      const account = createdUser.find(r => r.isPending())
      if (!account) {
        throw new Error('No pending account request found')
      }
      cy.ensureOn(UserManagementHelpers.userApprovePath(account))
      AccountRequestHelpers.approveRequest()
      cy.logout()

      UserManagementHelpers.addPasswordToUserAccount(account);
      cy.login({ id: account.subjectId });
      cy.logout();
      cy.task('deleteItem', { db: 'main', container: 'user-accounts', id: account.subjectId, partitionKey: account.subjectId });
    })
  })

  it('error messages are displayed when required details are not supplied', function () {
    cy.get('#ContactEmailAddress').clear() // This field is pre-populated
    cy.clickSubmit()
    cy.hasError('First name', 'Enter a first name')
    cy.hasError('Last name', 'Enter a last name')
    cy.hasError('Email', 'Enter an email address')
    cy.hasError('Organisation', 'Enter your organisation name')
    cy.hasError('Can you provide more detail?', 'Enter a reason for your request')
  })

  it('user is informed where a request is pending already', function () {
    UserManagementHelpers.seedAccountRequest()
    UserManagementHelpers.getAccountRequests().then(requests => {
      const pendingReq = requests.find(r => r.isPending())
      cy.login({ id: pendingReq.subjectId })
      cy.contains("You have already requested an account. You will receive an email when your request has been reviewed.")
    })
  })

})
