import * as CabHelpers from '/cypress/support/helpers/cab-helpers';
import Cab from '/cypress/support/domain/cab';


describe('CAB profile cannot be edited message', () => {

    const profileCannotBeEdited = () => {
        CabHelpers.editCabButton().should('not.exist');
        cy.contains("This CAB profile cannot be edited until it's been approved or declined.").should('exist');
    }
    context('when new cab is created and submitted for an approval', function () {

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as('cab');
        })

        it('message is displayed for UKAS user after submission for approval', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.addCabPath());
            cy.get('#CABNumber').should('be.disabled');
            cy.get('#Name').type('Edit CAB Message Tests');
            cy.continue();
            CabHelpers.enterContactDetails(this.cab);
            CabHelpers.enterBodyDetails(this.cab);
            CabHelpers.enterLegislativeAreas(this.cab);
            CabHelpers.skipThisStep();
            CabHelpers.skipThisStep();
            CabHelpers.clickSubmitForApproval();
            cy.get('#viewCab').click();
            cy.url().as('draftUrl');
            profileCannotBeEdited();
        })

        it('message is displayed for OPSS Admin pending OGD user approval', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            profileCannotBeEdited();
        });

        it('message is displayed for OGD user after OGD user approval', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            profileCannotBeEdited();
            cy.logout();
        });

        it('message is not display for OPSS Admin user after OGD user approval', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.notificationUrlPath());
            cy.ensureOn(this.draftUrl);
            cy.contains("This CAB profile cannot be edited until it's been approved or declined.").should('not.exist');
            CabHelpers.editCabButton().should('exist');
            CabHelpers.editCabButton().click();
            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.get('#approveCab').click();
            cy.get('#CABNumber').type(Date.now().toString());
            cy.get('#CabNumberVisibility').select('Display for all signed-in users');
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
            cy.contains('Enter the reason for publishing this CAB. This will be shown to all users in the CAB history page.').should('exist');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve');
            cy.get('#approve').click();
            cy.logout();
        });

        it('message is displayed for OPSS Admin user pending OGD user approval for when published cab (name) is edited', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            CabHelpers.editCabDetail('CAB details');
            this.cab.name = `New Edit Test Cab Name ${Date.now()}`
            CabHelpers.editCabName(this.cab);
            CabHelpers.clickSubmitForApproval();
            cy.logout();
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            profileCannotBeEdited();
        });

        it('message is displayed for UKAS user pending OGD user approval when published cab is edited', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(this.draftUrl);
            profileCannotBeEdited();
        });

    });

    context('given an already published CAB and a UKAS user adds new LA', function () {

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as('cab');
            cy.wrap(Cab.additionalLegislativeAreas()).as('additionalLa');
        })

        it('when i submit a created cab for an approval ', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.addCabPath());
            cy.get('#Name').type('Edit Already Published CAB Message Tests');
            cy.continue();
            CabHelpers.enterContactDetails(this.cab);
            CabHelpers.enterBodyDetails(this.cab);
            CabHelpers.enterLegislativeAreas(this.cab);
            CabHelpers.skipThisStep();
            CabHelpers.skipThisStep();
            CabHelpers.clickSubmitForApproval();
            cy.get('#viewCab').click();
            cy.url().as('publishedDraftUrl');
            cy.logout();
        });

        it('and i approve as an OGD user ', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.publishedDraftUrl);
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.logout();
        });

        it('and i review and approve as OPSS admin user ', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.publishedDraftUrl)
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click()
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.get('#approveCab').click();
            cy.get('#CABNumber').type(Date.now().toString());
            cy.get('#CabNumberVisibility').select('Display for all signed-in users');
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
            cy.contains('Enter the reason for publishing this CAB. This will be shown to all users in the CAB history page.').should('exist');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve');
            cy.get('#approve').click();
            cy.logout();
        });

        it('when i add additional LA as UKAS user ', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(this.publishedDraftUrl);
            CabHelpers.editCabButton().click();
            CabHelpers.editCabDetail('Legislative areas');
            CabHelpers.addLegislativeAreaButton().click();
            CabHelpers.enterLegislativeAreas(this.additionalLa);
            CabHelpers.clickSubmitForApproval();
            cy.logout();
        })

        it('then the message is displayed for OPSS Admin user pending OGD user approval ', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.publishedDraftUrl);
            profileCannotBeEdited();
            cy.logout();
        });

        it('then the message is not display for OGD user', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.publishedDraftUrl);
            CabHelpers.editCabButton().should('exist');
            cy.logout();
        });
    });
});
