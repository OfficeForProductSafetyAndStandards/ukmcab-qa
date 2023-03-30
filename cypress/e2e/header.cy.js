import { header } from '../support/helpers/common-helpers'
import { searchPath } from '../support/helpers/search-helpers'
import { loginPath } from '../support/helpers/login-helpers'
import { changePasswordPath } from '../support/helpers/password-helpers'

describe('Header', function() {

  beforeEach(() => {
    cy.ensureOn('/')
  })

  context('when logged out', function() {
    it('displays all expected links', function() {
      header().contains('a', 'GOV.UK').should('have.attr', 'href', '/')
      header().contains('a', 'UK Market Conformity Assessment Bodies').should('have.attr', 'href', '/')
      header().contains('a', 'Search').should('have.attr', 'href', searchPath())
      header().contains('a', 'Help').should('have.attr', 'href', '/help')
      header().contains('a', 'About').should('have.attr', 'href', '/about')
      header().contains('a', 'Sign in').should('have.attr', 'href', loginPath())
    })
  })

  context('when logged in', function() {

    beforeEach(() => {
      cy.loginAsOpssUser()
    })

    it('displays all expected links', function() {
      header().contains('a', 'GOV.UK').should('have.attr', 'href', '/')
      header().contains('a', 'UK Market Conformity Assessment Bodies').should('have.attr', 'href', '/')
      header().contains('a', 'Search').should('have.attr', 'href', searchPath())
      header().contains('a', 'Help').should('have.attr', 'href', '/help')
      header().contains('a', 'About').should('have.attr', 'href', '/about')
      header().contains('a', 'Admin').should('have.attr', 'href', '/admin/work-queue')
      header().contains('a', 'Change password').should('have.attr', 'href', changePasswordPath())
      header().contains('button', 'Sign out')
    })
  })
})