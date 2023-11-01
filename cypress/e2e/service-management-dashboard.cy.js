import { addCabPath, cabManagementPath } from '../support/helpers/cab-helpers'
import { serviceManagementPath, userManagementPath } from '../support/helpers/user-management-helpers'
import { searchPath } from '../support/helpers/search-helpers'

describe('Service Management Dashboard', () => {

  context('user with both CAB and User Management permissions', function() {
    beforeEach(function() {
      cy.loginAsOpssUser()
    })

    it('sees options for Cab and User Management', () => {
      cy.ensureOn(serviceManagementPath())
      cy.contains('h1', 'Manage the service')
      cy.contains('a', 'Search for a CAB').should('have.attr', 'href', searchPath())
      cy.contains('a', 'Manage users').should('have.attr', 'href', userManagementPath())
      cy.contains('a', 'Manage CABs').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Draft').should('have.attr', 'href', `${cabManagementPath()}?filter=draft`)
      cy.contains('a', 'Awaiting approval').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Create a CAB').should('have.attr', 'href', addCabPath())

    })

  })

  context('user with only CAB Management permissions', function() {
    beforeEach(function() {
      cy.loginAsUkasUser()
    })

    it('sees options for Cab Management not not User management', () => {
      cy.ensureOn(serviceManagementPath())
      cy.contains('a', 'Manage CABs').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Search for a CAB').should('have.attr', 'href', searchPath())
      cy.contains('a', 'Draft').should('have.attr', 'href', `${cabManagementPath()}?filter=draft`)
      cy.contains('a', 'Awaiting approval').should('have.attr', 'href', cabManagementPath())
      cy.contains('a', 'Create a CAB').should('have.attr', 'href', addCabPath())
      cy.contains('a', 'Manage users').should('not.exist')
    })

  })

})