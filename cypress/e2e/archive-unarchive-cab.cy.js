import * as CabHelpers from '../support/helpers/cab-helpers'
import { getEmailsLink } from '../support/helpers/email-subscription-helpers'

describe('Archiving a CAB', () => {
  
  it('is not possible when logged out', function() {
    CabHelpers.getTestCab().then(cab => {
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      CabHelpers.archiveCabButton().should('not.be.visible')
    })
  })

  it('allows canceling or closing of the Archive modal', function() {
    cy.loginAsOpssUser()
    CabHelpers.getTestCab().then(cab => {
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      CabHelpers.archiveCabButton().click()
      CabHelpers.archiveModal().contains('a', 'Close').click()
      CabHelpers.archiveModal().should('not.be.visible')
      CabHelpers.archiveCabButton().click()
      CabHelpers.archiveModal().contains('a', 'Cancel').click()
      CabHelpers.archiveModal().should('not.be.visible')
    })
  })

  it('displays expected information and errors in Archive modal', function() {
    cy.loginAsOpssUser()
    CabHelpers.getTestCab().then(cab => {
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      CabHelpers.archiveCabButton().click()
      CabHelpers.archiveModal().within(() => {
        CabHelpers.archiveCabButton().click()
        cy.contains('#archive-error-message','Enter the reason for archiving this CAB profile')
      })
    })
  })

  context('when logged in and the CAB has NO draft associated', function() {

    beforeEach(function() {
      cy.loginAsOpssUser()
      CabHelpers.getTestCab().then(cab => {
        cy.wrap(cab).as('cab')
        cy.ensureOn(CabHelpers.cabProfilePage(cab))
      })
    })

    it('user is NOT shown a message that draft will be deleted and cab is archived successfully', function() {
      CabHelpers.archiveCab(this.cab)
      CabHelpers.editCabButton().should('not.exist') // edit button is removed from archived cabs
      getEmailsLink().should('not.exist')  // subscriptions are disabled for archived cabs
    })
  })
 
  context('when logged in and the CAB has a draft associated', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      CabHelpers.getTestCab().then(cab => {
        cy.wrap(cab).as('cab')
        CabHelpers.createDraftVersion(cab)
        cy.ensureOn(CabHelpers.cabProfilePage(cab))
      })
    })

    it('user is shown a message that draft will be deleted and the draft is deleted', function() {
      CabHelpers.archiveCab(this.cab, {hasAssociatedDraft: true})
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('#Filter').select('Draft', {force: true})
      cy.contains(this.cab.name).should('not.exist')
    })
  })
})

describe('Unarchiving a CAB', () => {
  
  it('is not possible when logged out', function() {
    CabHelpers.getArchivedCab().then(cab => {
      cy.ensureOn(CabHelpers.cabProfilePage(cab), {failOnStatusCode: false})
      CabHelpers.unarchiveCabButton().should('not.exist')
      cy.contains("We can't find that page")
    })
  })
  
  context('when logged in and the CAB has no draft associated', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      CabHelpers.getTestCab().then(cab => {
        cy.wrap(cab).as('cab')
        CabHelpers.archiveCab(cab) // create an archived cab without a draft
        cy.get('.govuk-notification-banner__content') // confirm cab archived
      })
    })

    it('is successful and marks it as Draft and can not be unarchived again', function() {
      CabHelpers.unarchiveCab(this.cab)
      cy.location('pathname').should('equal', CabHelpers.cabSummaryPage(this.cab.cabId)) // summary page is displayed
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('#Filter').select('Draft', {force: true})
      cy.get('a').contains(this.cab.name)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.unarchiveCabButton().should('not.be.visible')
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
        cy.contains('#unarchive-error-message', 'Enter the reason for unarchiving this CAB profile')
      })
    })

  })

  context('when logged in and the CAB has draft associated', function() {

    beforeEach(function() {
      cy.loginAsOpssUser()
      CabHelpers.getTestCab().then(cab => {
        cy.wrap(cab).as('cab')
        CabHelpers.archiveCab(cab) // create an archived cab
        CabHelpers.unarchiveCab(cab) // only to get this cab into a state where it has a draft version too
      })
    })
    
    it('should not be possible', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.unarchiveCabButton().should('not.be.visible')
    })
  })
})