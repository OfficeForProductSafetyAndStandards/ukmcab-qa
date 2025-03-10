import { header } from '../../support/helpers/common-helpers'
import { loginPath } from '../../support/helpers/login-helpers'
import { userProfilePath } from '../../support/helpers/user-management-helpers'
import { serviceManagementPath } from '../../support/helpers/user-management-helpers'

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
  
  context('when logged in as internal user', function() {
    
    beforeEach(() => {
      cy.loginAsOpssUser()
      cy.ensureOn('/')
    })

    it('displays all expected links', function() {
      header().contains('a', 'GOV.UK').should('have.attr', 'href', serviceManagementPath())
      header().contains('a', 'UK Market Conformity Assessment Bodies').should('have.attr', 'href', serviceManagementPath())
      header().contains('a', 'Search').should('have.attr', 'href', '/')
      header().contains('a', 'Help').should('have.attr', 'href', '/help')
      header().contains('a', 'About').should('have.attr', 'href', '/about')
      header().contains('a', 'Updates').should('have.attr', 'href', '/updates')
      header().contains('a', 'Sign out').should('have.attr', 'href', '/account/logout')
      header().contains('a', 'Profile').should('have.attr', 'href', userProfilePath())
    })
  })

  context('when logged in as Ukas user', function() {
    
    beforeEach(() => {
      cy.loginAsUkasUser()
      cy.ensureOn('/')
    })

    it('displays all expected links', function() {
      header().contains('a', 'GOV.UK').should('have.attr', 'href', serviceManagementPath())
      header().contains('a', 'UK Market Conformity Assessment Bodies').should('have.attr', 'href', serviceManagementPath())
      header().contains('a', 'Search').should('have.attr', 'href', '/')
      header().contains('a', 'Help').should('have.attr', 'href', '/help')
      header().contains('a', 'About').should('have.attr', 'href', '/about')
      header().contains('a', 'Updates').should('have.attr', 'href', '/updates')
      header().contains('a', 'Sign out').should('have.attr', 'href', '/account/logout')
      header().contains('a', 'Profile').should('have.attr', 'href', userProfilePath())
    })
  })
})
