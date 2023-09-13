import { cabManagementPath } from '../support/helpers/cab-helpers'
import { userManagementPath } from '../support/helpers/user-management-helpers'

describe('Admin Dashboard', () => {

  context('user with both CAB and User Management permissions', function() {
    beforeEach(function() {
      cy.loginAsOpssUser()
    })

    it('sees options for Cab and User Management', () => {
      cy.ensureOn('/admin')
      cy.contains('h1', 'Admin dashboard')
      cy.contains('a', 'Manage CABs').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Manage users').should('have.attr', 'href', userManagementPath())
    })

  })

  context('user with only CAB Management permissions', function() {
    beforeEach(function() {
      cy.loginAsUkasUser()
    })

    it('sees options for Cab Management not not User management', () => {
      cy.ensureOn('/admin')
      cy.contains('h1', 'Admin dashboard')
      cy.contains('a', 'Manage CABs').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Manage users').should('not.exist')
    })

  })

})