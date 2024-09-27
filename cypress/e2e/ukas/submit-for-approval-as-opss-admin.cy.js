import Cab from "../../support/domain/cab";
import * as CabHelpers from "../../support/helpers/cab-helpers";


describe('Given a cab is submitted for an approval by OPSS admin', () => {

    it('when OPSS admin create and submit a cab for an approval', () => {
        cy.loginAsOpssUser();
        CabHelpers.createUnpublishedCabWithoutDocuments(Cab.buildWithoutDocuments())
        cy.contains('button', 'Submit for approval').should('exist');
        CabHelpers.clickSubmitForApproval();
        cy.get('#viewCab').click()
        cy.url().as('draftUrl');
        cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB');
        cy.logout();
    });

    it('then OPSS OGD should be able to approve the LA', function () {
        cy.loginAsOpssOgdUser();
        cy.ensureOn(this.draftUrl)
        CabHelpers.editCabButton().click();
        cy.contains('Pending approval from OPSS (OGD)').should('exist');
        cy.contains('a', 'Review').click();
        cy.contains('a.govuk-button', 'Review').click();
        cy.contains('label', 'Approve').click()
        cy.confirm()
        cy.logout();
    });

});
