import { date } from '../support/helpers/formatters'
import * as CabHelpers from '../support/helpers/cab-helpers'
import { getEmailsLink } from '../support/helpers/email-subscription-helpers'

describe('Archiving a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('is not possible when logged out', function() {
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
      CabHelpers.archiveModal().contains('a', 'Close').click()
      CabHelpers.archiveModal().should('not.be.visible')
      CabHelpers.archiveCabButton().click()
      CabHelpers.archiveModal().contains('a', 'Cancel').click()
      CabHelpers.archiveModal().should('not.be.visible')
    })

    it('displays expected information and errors(when applicable) in modal', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.archiveCabButton().click()
      CabHelpers.archiveModal().within(() => {
        CabHelpers.archiveCabButton().click()
        cy.contains('#archive-error-message','Enter the reason for archiving this CAB profile')
      })
    })

  })
})

describe('Unarchiving a CAB', () => {

  beforeEach(function() {
    CabHelpers.getArchivedCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('is not possible when logged out', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab), {failOnStatusCode: false})
    CabHelpers.unarchiveCabButton().should('not.exist')
    cy.contains("We can't find that page")
  })
  
  context('when logged in', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    })

    it('is successful and marks it as Draft', function() {
      CabHelpers.unarchiveCab(this.cab)
      cy.location('pathname').should('equal', CabHelpers.cabSummaryPage(this.cab.cabId)) // summary page is displayed
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('#Filter').select('Draft', {force: true})
      cy.get('a').contains(this.cab.name)
    })

    it('allows canceling or closing of the modal', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.unarchiveCabButton().click()
      CabHelpers.unarchiveModal().contains('a', 'Close').click()
      CabHelpers.unarchiveModal().should('not.be.visible')
      CabHelpers.unarchiveCabButton().click()
      CabHelpers.unarchiveModal().contains('a', 'Cancel').click()
      CabHelpers.unarchiveModal().should('not.be.visible')
    })

    it('displays expected information and errors(when applicable) in modal', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.unarchiveCabButton().click()
      CabHelpers.unarchiveModal().within(() => {
        CabHelpers.unarchiveCabButton().click()
        cy.contains('#unarchive-error-message','Enter the reason for unarchiving this CAB profile')
      })
    })

  })
})