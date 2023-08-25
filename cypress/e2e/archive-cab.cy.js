import { date } from '../support/helpers/formatters'
import * as CabHelpers from '../support/helpers/cab-helpers'
import { getEmailsLink } from '../support/helpers/email-subscription-helpers'

describe('Archiving a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('if not possible when logged out', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    CabHelpers.archiveCabButton().should('not.be.visible')
  })
  
  context('when logged in', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    })

    it('is successful and makes it uneditable', function() {
      CabHelpers.archiveCab(this.cab)
      cy.get('.govuk-notification-banner__content').contains(`Archived on ${date(new Date()).DDMMMYYYY}`)
      CabHelpers.editCabButton().should('not.exist') // edit button is removed from archived cabs
      getEmailsLink().should('not.exist') // subscriptions are disabled for archived cabs
    })

    it('allows canceling or closing of the modal', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.archiveCabButton().click()
      cy.get('.modal-content').contains('a', 'Close').click()
      cy.get('.modal-content').should('not.be.visible')
      CabHelpers.archiveCabButton().click()
      cy.get('.modal-content').contains('a', 'Cancel').click()
      cy.get('.modal-content').should('not.be.visible')
    })

    it('displays expected information and errors(when applicable) in modal', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.archiveCabButton().click()
      cy.get('.modal-content').within(() => {
        CabHelpers.archiveCabButton().click()
        cy.contains('#archive-error-message','Enter the reason for archiving this CAB profile')
      })
    })

  })
})