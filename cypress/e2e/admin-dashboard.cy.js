import { cabManagementPath } from '../support/helpers/cab-helpers'
import { userManagementPath } from '../support/helpers/user-management-helpers'

describe('Admin Dashboard', () => {

  context('for user with both CAB and User Management permissions', function() {
    beforeEach(function() {
      cy.loginAsOpssUser()
    })

    it('redirects user to GOV UK One login upon clicking Sign in', () => {
      cy.ensureOn('/admin')
      cy.contains('h1', 'Admin dashboard')
      cy.contains('a', 'Manage CABs').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Manage users').should('have.attr', 'href', userManagementPath())
    })

  })

})