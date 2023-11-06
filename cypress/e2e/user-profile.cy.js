import * as UserManagementHelpers from '../support/helpers/user-management-helpers'

describe('User Profile', () => {

  beforeEach(function() {
    UserManagementHelpers.getTestUsers().then(users => {
      const user = users.OpssAdminUser
      cy.wrap(user).as('user')
      cy.loginAs(user)
    })
    cy.ensureOn(UserManagementHelpers.userProfilePath())
  })

  it('displays correct user data', function() {
    UserManagementHelpers.hasMyDetails(this.user)
  })

  context('when Editing', function() {

    beforeEach(function() {
      cy.contains('a', 'Edit').click()
    })

    it('displays user details pre-filled', function() {
      cy.get('#FirstName').should('have.attr', 'value', this.user.firstname)
      cy.get('#LastName').should('have.attr', 'value', this.user.lastname)
      cy.get('#ContactEmailAddress').should('have.attr', 'value', this.user.contactEmail)
    })

    it('displays error if any fields ar left blank', function() {
      this.user.firstname = ''
      this.user.lastname = ''
      this.user.contactEmail = ''
      UserManagementHelpers.editUserProfileDetails(this.user)
      cy.hasError('First name', 'Enter a first name')
      cy.hasError('Last name', 'Enter a last name')
      cy.hasError('Contact email', 'Enter an email address')
    })

    it('validates email address', function() {
      this.user.contactEmail = 'malformed'
      UserManagementHelpers.editUserProfileDetails(this.user)
      cy.hasError('Contact email', 'Enter an email address in the correct format, like name@example.com')
      cy.get('#ContactEmailAddress').should('have.attr', 'data-val-regex-pattern', '^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$')
    })

    it('saves new details', function() {
      this.user.firstname += 'Edited'
      this.user.lastname += 'Edited'
      this.user.phone += '123'
      this.user.contactEmail += '.au'
      UserManagementHelpers.editUserProfileDetails(this.user)
      cy.contains('Your details have been updated')
      UserManagementHelpers.hasMyDetails(this.user)
    })
  })

})