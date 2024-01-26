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
      cy.url().as('draftUrl')
    })
    it('OPSS approve CAB', function () {
      cy.loginAsOpssUser();
      cy.ensureOn(this.draftUrl)
    })
  })
})