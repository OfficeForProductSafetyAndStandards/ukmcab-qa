import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'

describe('Ukas submitting a new CAB for Approval', () => {

  beforeEach(function () {
    cy.wrap(Cab.build()).as('cab')
  })

  context('Ukas submits cab for approval and opss approve', function () {
    it('Ukas submit cab for approval', function () {
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.addCabPath())
      cy.get('#CABNumber').should('be.disabled'); //Check cab number is disabled
      cy.get('#Name').type('Test ukas create cab');
      cy.continue();
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.skipThisStep()
      CabHelpers.skipThisStep()
      CabHelpers.clickSubmitForApproval()
      cy.get('#viewCab').click()
      cy.url().as('draftUrl')
      cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB')
    })
    it('OPSS approve CAB', function () {
      cy.loginAsOpssUser();
      cy.ensureOn(this.draftUrl)
      cy.get('#approveCab').click()
      cy.get('#CABNumber').type(Date.now().toString())
      cy.get('#CabNumberVisibility').select('Display for all signed-in users')
      cy.get('#UserNotes').type('OPSS TEST E2E User notes approve')
      cy.get('#Reason').type('OPSS TEST E2E Reason approve')
      cy.get('#approve').click()
      cy.get('h1').should('contain', 'CAB management')
    })
  })

  context('Ukas submits cab for approval and opss decline', function () {
    it('Ukas submit cab for approval', function () {
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.addCabPath())
      cy.get('#CABNumber').should('be.disabled'); //Check cab number is disabled
      cy.get('#Name').type('Test ukas create cab for decline');
      cy.continue();
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.skipThisStep()
      CabHelpers.skipThisStep()
      CabHelpers.clickSubmitForApproval()
      cy.get('#viewCab').click()
      cy.url().as('draftUrl')
      cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB')
    })
    it('OPSS decline CAB', function () {
      cy.loginAsOpssUser();
      cy.ensureOn(this.draftUrl)
      cy.get('#declineCab').click()
      cy.get('#DeclineReason').type('OPSS TEST E2E Decline Reason')
      cy.get('#decline').click()
      cy.get('h1').should('contain', 'CAB management')
    })
  })
})