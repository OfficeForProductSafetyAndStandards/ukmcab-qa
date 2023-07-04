import { header } from '../support/helpers/common-helpers'
import { loginPath } from '../support/helpers/login-helpers'
import { changePasswordPath } from '../support/helpers/password-helpers'
import { cabManagementPath } from '../support/helpers/cab-helpers'

describe('Header', function() {

  
  context('when logged out', function() {

    beforeEach(() => {
      cy.ensureOn('/')
    })
    
    it('displays all expected links', function() {
      header().contains('a', 'GOV.UK').should('have.attr', 'href', '/')
      header().contains('a', 'UK Market Conformity Assessment Bodies').should('have.attr', 'href', '/')
      header().contains('a', 'Search').should('have.attr', 'href', '/')
      header().contains('a', 'Help').should('have.attr', 'href', '/help')
      header().contains('a', 'Updates').should('have.attr', 'href', '/updates')
      header().contains('a', 'About').should('have.attr', 'href', '/about')
      header().contains('a', 'Sign in').should('have.attr', 'href', loginPath())
    })
  })
  
  context('when logged in', function() {
    
    beforeEach(() => {
      cy.login()
      cy.ensureOn('/')
    })

    it('displays all expected links', function() {
      header().contains('a', 'GOV.UK').should('have.attr', 'href', '/')
      header().contains('a', 'UK Market Conformity Assessment Bodies').should('have.attr', 'href', '/')
      header().contains('a', 'Search').should('have.attr', 'href', '/')
      header().contains('a', 'Help').should('have.attr', 'href', '/help')
      header().contains('a', 'About').should('have.attr', 'href', '/about')
      header().contains('a', 'Updates').should('have.attr', 'href', '/updates')
      header().contains('a', 'Admin').should('have.attr', 'href', cabManagementPath())
      header().contains('a', 'Change password').should('have.attr', 'href', changePasswordPath())
      header().contains('button', 'Sign out')
    })
  })
})