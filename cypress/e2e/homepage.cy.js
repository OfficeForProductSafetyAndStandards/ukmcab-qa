import {header} from '../support/helpers/common-helpers'
import {changePasswordPath} from '../support/helpers/password-helpers'
describe('UKMCAB Homepage', () => {
  
  beforeEach(() => {
    cy.ensureOn('/')
  })
  
  context('when logged out', () => {

    it('displays link to Find a CAB', () => {
      cy.get('main').contains('a', 'Find a CAB').should('have.attr', 'href', '/find-a-cab')
    })

    it('does not display link to Change password', () => {
      header().contains('a', 'Change password').should('not.exist')
    })

  })

  context('when logged in', () => {

    beforeEach(() => {
      cy.loginAsAdmin()
    })

    it('displays link to Change password', () => {
      header().contains('a', 'Change password').should('have.attr', 'href', changePasswordPath())
    })
  })




})