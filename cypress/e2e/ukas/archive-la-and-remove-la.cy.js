import * as CabHelpers from "../../support/helpers/cab-helpers";
import * as UserManagementHelpers from "../../support/helpers/user-management-helpers";
import * as EmailSubscriptionHelpers from "../../support/helpers/email-subscription-helpers";
import Cab from "../../support/domain/cab";
import Constants from "../../support/domain/constants";

describe("Request to Archive an LA and to Remove an LA", () => {
    context("Archive an LA", function () {
        const uniqueId = Date.now();
        const name = `Test Cab ${uniqueId}`;
        var cabId = "";

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as("cab");
            UserManagementHelpers.getTestUsers().then((users) => {
                cy.wrap(users.UkasUser).as("ukasUser");
            });
        });

        it("UKAS creates and submits for approval a request to publish a cab", function () {
            cy.loginAsUkasUser();
            CabHelpers.createAndSubmitCabForApproval(name, this.cab);
            cy.url()
                .as("draftUrl")
                .then((url) => {
                    cabId = CabHelpers.getIdFromLastPartOfUrl(url);
                });
            cy.logout();
        });

        it("OPSS approves and publish CAB requested by UKAS", function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click()
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.logout()
            cy.loginAsOpssUser()
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click()
            CabHelpers.approveLegislativeAreas(this.cab)
            CabHelpers.setPublishType();
            cy.get('#approveCab').click()
            cy.get('#CABNumber').type(Date.now().toString())
            cy.generateRandomNumber(5).then((randomNumber) => {
                const dateNow = Date.now().toString();
                cy.get('#PreviousCABNumbers').type(`${dateNow},${randomNumber}`);
            });
            cy.get('#CabNumberVisibility').select('Display for all signed-in users')
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve')
            cy.get('#Reason').type('OPSS TEST E2E Reason approve')
            cy.get('#approve').click()
            cy.get('h1').should('contain', 'Draft management')
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
            cy.hasStatus("Published");
        });

        it("OPSS archives an LA", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Legislative areas')
            CabHelpers.opssArchiveLA(cabId);
            cy.logout();
        });
    });

    context("Remove an LA", function () {
        const uniqueId = Date.now();
        const name = `Test Kab ${uniqueId}`;
        var cabId = "";

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as("cab");
            UserManagementHelpers.getTestUsers().then((users) => {
                cy.wrap(users.UkasUser).as("ukasUser");
            });
        });

        it("UKAS creates and submits for approval a request to publish a cab", function () {
            cy.loginAsUkasUser();
            CabHelpers.createAndSubmitCabForApproval(name, this.cab);
            cy.url()
                .as("draftUrl")
                .then((url) => {
                    cabId = CabHelpers.getIdFromLastPartOfUrl(url);
                });
            cy.logout();
        });

        it("OPSS approves and publish CAB requested by UKAS", function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click()
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.logout()
            cy.loginAsOpssUser()
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab)
            CabHelpers.setPublishType();
            cy.get('#approveCab').click()
            cy.get('#CABNumber').type(Date.now().toString())
            cy.generateRandomNumber(5).then((randomNumber) => {
                const dateNow = Date.now().toString();
                cy.get('#PreviousCABNumbers').type(`${dateNow},${randomNumber}`);
            });
            cy.get('#CabNumberVisibility').select('Display for all signed-in users')
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve')
            cy.get('#Reason').type('OPSS TEST E2E Reason approve')
            cy.get('#approve').click()
            cy.get('h1').should('contain', 'Draft management')
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
            cy.hasStatus("Published");
        });

        it("OPSS removes an LA", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click();
            CabHelpers.editCabDetail('Legislative areas');
            CabHelpers.opssRemoveLA(cabId);
            cy.logout();
        });
    });
});
