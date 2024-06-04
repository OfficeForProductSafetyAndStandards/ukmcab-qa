import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import * as EmailSubscriptionHelpers from "/cypress/support/helpers/email-subscription-helpers";
import * as UserManagementHelpers from "../../support/helpers/user-management-helpers";
import Constants from "/cypress/support/domain/constants";

describe('Ukas submitting a new CAB for Approval', () => {

    beforeEach(function () {
        cy.wrap(Cab.buildWithoutDocuments()).as('cab')
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
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.skipThisStep()
            CabHelpers.skipThisStep()
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
            cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB')
        })
        it('OPSS OGD approves Legislative Areas pending approval and OPSS admin publishes CAB', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.logout();
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.get('#approveCab').click()
            cy.get('#CABNumber').type(Date.now().toString())
            cy.get('#CabNumberVisibility').select('Display for all signed-in users')
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve')
            cy.contains('Enter the reason for publishing this CAB. This will be shown to all users in the CAB history page.').should('exist');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve')
            cy.get('#approve').click()
            cy.get('h1').should('contain', 'Draft management')
        })
    })

    context('Ukas submits cab for approval and opss decline', function () {
        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as("cab");
            UserManagementHelpers.getTestUsers().then((users) => {
                cy.wrap(users.UkasUser).as("ukasUser");
            });
        })
        it('Ukas submit cab for approval', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.get('#CABNumber').should('be.disabled'); //Check cab number is disabled
            cy.get('#Name').type('Test ukas create cab for decline');
            cy.continue();
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.skipThisStep()
            CabHelpers.skipThisStep()
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
            cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB')
        })
        it('OPSS decline CAB', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click()
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.logout()
            cy.loginAsOpssUser()
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click()
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.get('#declineCab').click()
            cy.get('#DeclineReason').type('OPSS TEST E2E Decline Reason')
            cy.get('#decline').click()
            cy.get('h1').should('contain', 'Draft management')
        })
        it("email is sent to UKAS that request to publish has been declined", function () {
            EmailSubscriptionHelpers.assertDeclineRequestToPublishEmailIsSent(
                this.ukasUser.email,
                "Test ukas create cab for decline"
            );
        });

        it("UKAS receives notification for declined request to publish", function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.notificationUnassignedUrlPath());
            cy.contains("tr", "Test Opss Admin User")
                .first()
                .should('contain.text', 'Test Opss Admin User')
                .within(() => {
                    cy.get('td')
                        .eq(1)
                        .find('a.govuk-link')
                        .click();
                });
            cy.get("p").contains("Unassigned").should("exist");
            cy.get("dd")
                .contains(Constants.DeclinedReason_PublishedCAB("Test ukas create cab for decline"))
                .should("exist");
        });
    })
})
