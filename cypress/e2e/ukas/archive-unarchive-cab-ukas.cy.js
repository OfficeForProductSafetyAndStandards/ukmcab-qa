import * as CabHelpers from "../../support/helpers/cab-helpers";
import * as UserManagementHelpers from "../../support/helpers/user-management-helpers";
import * as EmailSubscriptionHelpers from "../../support/helpers/email-subscription-helpers";
import Cab from "../../support/domain/cab";
import Constants from "../../support/domain/constants";
import {generateRandomSentence} from "../../support/helpers/common-helpers";

describe("Request to Unarchive a CAB", () => {
    context("and publish; Approved", function () {
        const uniqueId = Date.now();
        const name = `Test Cab ${uniqueId}`;
        let reasonText;


        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as("cab");
            UserManagementHelpers.getTestUsers().then((users) => {
                cy.wrap(users.UkasUser).as("ukasUser");
            });
        });

        it("UKAS creates and submits for approval a request to publish a cab", function () {
            cy.loginAsUkasUser();
            CabHelpers.createAndSubmitCabForApproval(name, this.cab);
            cy.hasStatus("Pending approval to publish CAB");
            cy.url().as("draftUrl");
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
            cy.get('#approveCab').click()
            cy.get('#CABNumber').type(Date.now().toString());
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

        it("OPSS archives CAB", function () {
            cy.loginAsOpssUser();
            CabHelpers.opssArchiveCAB(name);
            cy.logout();
        });

        it("UKAS request to unarchive and publish a CAB", function () {
            cy.loginAsUkasUser();
            reasonText = generateRandomSentence(284);
            CabHelpers.ukasRequestToUnarchiveAndPublishCab(name, reasonText);
        });

        it("OPSS approves request to unarchive and publish", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
            cy.contains(`${this.ukasUser.firstname} ${this.ukasUser.lastname} from ${this.ukasUser.role.toUpperCase()} has requested that this CAB is unarchived and published for the following reason:`);
            const partialLinkText = reasonText.substring(0, 30);
            cy.get('details.govuk-details').each(($el) => {
                cy.wrap($el).find('summary').then(($summary) => {
                    if ($summary.text().includes(partialLinkText)) {
                        cy.wrap($summary).click();
                        cy.wrap($el).find('.govuk-details__text').should('contain', reasonText);
                    }
                });
            });
            cy.get("a").contains("Approve").click();
            cy.contains(`${this.ukasUser.firstname} ${this.ukasUser.lastname} from ${this.ukasUser.role.toUpperCase()} has requested that this CAB is unarchived and published`);
            cy.get("#IsPublish").check();
            cy.get("#UserNotes").type(
                "E2E TEST - OPSS approved UKAS request to unarchive"
            );
            cy.get("button").contains("Approve").click();
            cy.logout();
        });

        it("sent email to UKAS that request to unarchive and publish has been approved", function () {
            EmailSubscriptionHelpers.assertApproveRequestToUnarchiveAndPublishEmailIsSent(
                this.ukasUser.email,
                name
            );
        });


        it("UKAS receives notification for approved request to unarchive and publish", function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
            cy.get('#tab_completed').click();
            cy.get('#completed')
                .find('table.govuk-table')
                .find('tbody.govuk-table__body')
                .find('tr.govuk-table__row')
                .first()
                .should('contain.text', 'Test Opss Admin User')
                .within(() => {
                    cy.get('td')
                        .eq(1)
                        .find('a.govuk-link')
                        .click();
                });
            cy.get("p").contains("Completed").should("exist");
            cy.get("dd")
                .contains(Constants.PublishedReason_UnarchiveAndPublishCAB(name))
                .should("exist");
        });
    });

    context("and publish; Declined", function () {
        const uniqueId = Date.now();
        const name = `Test Cab ${uniqueId}`;
        const declinedReason = `The request to unarchive CAB ${name} has been declined.`;

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as("cab");
            UserManagementHelpers.getTestUsers().then((users) => {
                cy.wrap(users.OpssAdminUser).as("opssAdminUser");
                cy.wrap(users.UkasUser).as("ukasUser");
            });
        });

        it("UKAS creates and submits for approval a request to publish a cab", function () {
            cy.loginAsUkasUser();
            CabHelpers.createAndSubmitCabForApproval(name, this.cab);
            cy.url().as("draftUrl");
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

        it("OPSS archive CAB", function () {
            cy.loginAsOpssUser();
            CabHelpers.opssArchiveCAB(name);
            cy.logout();
        });

        it("UKAS request to unarchive and publish a CAB", function () {
            cy.loginAsUkasUser();
            const text = "E2E TEST - UKAS request to unarchive and publish reasons"
            CabHelpers.ukasRequestToUnarchiveAndPublishCab(name, text);
        });

        it("sends an email from UKAS for request to unarchive and publish a CAB", function () {
            cy.log(`email is: ${Constants.TestApprovedBodiesEmailAddress}`);
            EmailSubscriptionHelpers.assertRequestToUnarchiveEmailIsSent(
                Constants.TestApprovedBodiesEmailAddress,
                name
            );
        });

        it("OPSS receives notification for request to unarchive and publish CAB", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.notificationUrlPath());
            cy.ensureOn(CabHelpers.notificationUnassignedUrlPath());
            cy.contains("tr", `${this.ukasUser.firstname} ${this.ukasUser.lastname}`)
                .first()
                .within(() => {
                    cy.get("td").eq(1).find("a").click();
                });
            cy.get("p").contains("Unassigned").should("exist");
            cy.get("dd").contains(name).should("exist");
        });

        it("OPSS declines request to unarchive and publish", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
            cy.get("a").contains("Decline").click();
            cy.get("#Reason").type(
                "E2E TEST - OPSS declined UKAS request to unarchive and publish"
            );
            cy.get("button").contains("Decline").click();
        });

        it("sent email to UKAS that request to unarchive and publish has been declined", function () {
            EmailSubscriptionHelpers.assertDeclineRequestToUnarchiveAndPublishEmailIsSent(
                this.ukasUser.email,
                name
            );
        });

        it("UKAS receives notification for declined request to unarchive and publish CAB", function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
            cy.get('#tab_completed').click();
            cy.contains("tr", "Unarchive CAB request")
                .first()
                .within(() => {
                    cy.get("td").eq(1).find("a").click();
                });
            cy.get("p").contains("Completed").should("exist");
            cy.get("dd").contains(declinedReason).should("exist");
        });
    });

    context("and save as draft; Approved", function () {
        var cabId = "";
        const uniqueId = Date.now();
        const name = `Test Cab ${uniqueId}`;

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

        it("OPSS archive CAB", function () {
            cy.loginAsOpssUser();
            CabHelpers.opssArchiveCAB(name);
            cy.logout();
        });

        it("UKAS request to unarchive CAB and save as draft", function () {
            cy.loginAsUkasUser();
            CabHelpers.ukasRequestToUnarchiveAndSaveAsDraftCab(name);
        });

        it("OPSS approves request to unarchive and save as draft", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
            cy.get("a").contains("Approve").click();
            cy.get("#IsPublish-2").check();
            cy.contains(`${this.ukasUser.firstname} ${this.ukasUser.lastname} from ${this.ukasUser.role.toUpperCase()} has requested that this CAB is unarchived and saved as draft`);
            cy.get("button").contains("Approve").click();
            cy.logout();
        });

        it("sent email to UKAS that request to unarchive and save as draft has been approved", function () {
            EmailSubscriptionHelpers.assertApproveRequestToUnarchiveAndSaveAsDraftEmailIsSent(
                this.ukasUser.email,
                name
            );
        });

        it("UKAS receives notification for approved request to unarchive and save as draft CAB", function () {
            cy.loginAsUkasUser();
            cy.ensureOn("/admin/notifications#completed");
            cy.get('#tab_completed').click();
            cy.contains("tr", "CAB unarchived")
                .first()
                .within(() => {
                    cy.get("td").eq(1).find("a").click();
                });
            cy.get("p").contains("Completed").should("exist");
            cy.get("dd")
                .contains(Constants.ApprovedReason_UnarchiveAndSaveAsDraft(name))
                .should("exist");
        });

        it("ukas able to access draft after opss approves to unarchive and save as draft", function () {
            cy.loginAsUkasUser();
            cy.ensureOn(this.draftUrl);
            cy.url().should(
                "eq",
                `https://ukmcab-stage.beis.gov.uk/admin/cab/summary/${cabId}`
            );
        });
    });

    context.only("and save as draft; Declined", function () {
        const uniqueId = Date.now();
        const name = `Test Cab ${uniqueId}`;

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as("cab");
            UserManagementHelpers.getTestUsers().then((users) => {
                cy.wrap(users.UkasUser).as("ukasUser");
            });
        });

        it("UKAS creates and submits for approval a request to publish a cab", function () {
            cy.loginAsUkasUser();
            CabHelpers.createAndSubmitCabForApproval(name, this.cab);
            cy.url().as("draftUrl");
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

        it("OPSS archive CAB", function () {
            cy.loginAsOpssUser();
            CabHelpers.opssArchiveCAB(name);
            cy.logout();
        });

        it("UKAS request to unarchive CAB and save as draft", function () {
            cy.loginAsUkasUser();
            CabHelpers.ukasRequestToUnarchiveAndSaveAsDraftCab(name);
        });

        it("OPSS declines request to unarchive and save as draft", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
            cy.contains(`${this.ukasUser.firstname} ${this.ukasUser.lastname} from ${this.ukasUser.role.toUpperCase()} has requested that this CAB is unarchived and saved as draft for the following reason:`);
            cy.get("a").contains("Decline").click();
            cy.get("#Reason").type(
                "E2E TEST - OPSS declined UKAS request to unarchive and save as draft"
            );
            cy.get("button").contains("Decline").click();
        });

        it("sent email to UKAS that request to unarchive and save as draft has been declined", function () {
            EmailSubscriptionHelpers.assertDeclineRequestToUnarchiveAndSaveAsDraftEmailIsSent(
                this.ukasUser.email,
                name
            );
        });

        it("UKAS receives notification for declined request to unarchive and save as draft CAB", function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
            cy.get('#tab_completed').click();
            cy.contains("tr", "Unarchive CAB request")
                .first()
                .within(() => {
                    cy.get("td").eq(1).find("a").click();
                });
            cy.get("p").contains("Completed").should("exist");
            cy.get("dd")
                .contains(Constants.DeclinedReason_UnarchiveAndSaveAsDraft(name))
                .should("exist");
        });
    });
});
