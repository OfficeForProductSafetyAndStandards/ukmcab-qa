import * as UserManagementHelpers from '../support/helpers/user-management-helpers'

describe('User Profile', () => {

  beforeEach(function() {
    UserManagementHelpers.getUsers().then(users => {
      const user = users.OpssAdminUser
      cy.wrap(user).as('user')
      cy.loginAs(user)
    })
    cy.ensureOn(UserManagementHelpers.userProfilePath())
  })

  it('displays correct user data', function() {
    UserManagementHelpers.hasUserProfileDetails(this.user)
  })

  context('when Editing', function() {

    beforeEach(function() {
      cy.contains('a', 'Edit').click()
    })

    it('displays user details pre-filled', function() {
      cy.get('#FirstName').should('have.attr', 'value', this.user.firstname)
      cy.get('#LastName').should('have.attr', 'value', this.user.lastname)
      cy.get('#PhoneNumber').should('have.attr', 'value', this.user.phone)
      cy.get('#ContactEmailAddress').should('have.attr', 'value', this.user.contactEmail)
    })

    it('displays error if any fields ar left blank', function() {
      this.user.firstname = ''
      this.user.lastname = ''
      this.user.phone = ''
      this.user.contactEmail = ''
      UserManagementHelpers.editUserProfileDetails(this.user)
      cy.hasError('First name', 'Enter a first name')
      cy.hasError('Last name', 'Enter a last name')
      cy.hasError('Email address', 'Enter an email address')
    })

    it.only('validates email address', function() {
      this.user.contactEmail = 'malformed'
      UserManagementHelpers.editUserProfileDetails(this.user)
      cy.hasError('Email address', 'Enter a valid email address')
      cy.get('#ContactEmailAddress').should('have.attr', 'data-val-regex-pattern', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
    })

    it('saves new details', function() {
      this.user.firstname += 'Edited'
      this.user.lastname += 'Edited'
      this.user.phone += '123'
      this.user.contactEmail += '.au'
      UserManagementHelpers.editUserProfileDetails(this.user)
      cy.contains('User profile has been updated')
      UserManagementHelpers.hasUserProfileDetails(this.user)
    })
  })

})