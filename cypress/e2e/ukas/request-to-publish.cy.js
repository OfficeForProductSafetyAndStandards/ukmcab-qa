import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import * as EmailSubscriptionHelpers from "/cypress/support/helpers/email-subscription-helpers";
import * as UserManagementHelpers from "../../support/helpers/user-management-helpers";
import Constants from "/cypress/support/domain/constants";

describe('Ukas submitting a new CAB for Approval', () => {
    let cabProfileName;

    beforeEach(function () {
        cy.wrap(Cab.buildWithoutDocuments()).as('cab')
    })

    context('Ukas submits cab for approval and opss approve', function () {
        it('Ukas submit cab for approval', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `Request to publish tests - ${uniqueId}`;
            cy.get('#CABNumber').should('be.disabled'); //Check cab number is disabled
            cy.get('#Name').type(cabProfileName);
            cy.get('#PreviousCABNumbers').should('be.disabled');
            cy.contains('Previous CAB numbers can be added on approval').should('exist');
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
        });

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

            // add Government user note-UKMCAB-2027
            const governmentUserNote = 'lets test the government user note';
            cy.contains('a', 'Add note').click();
            cy.contains('h1', 'Government user note').should('be.visible');
            cy.contains('These notes will be only be seen by government users that are signed in to the UKMCAB service.').should('be.visible');
            cy.get('textarea#Note').type(governmentUserNote);
            cy.contains('button', 'Save').click();
            cy.contains('a', 'View government user notes (1)').should('be.visible');

            // verify user is able to delete government -UKMCAB-2027
            cy.contains('a', 'View government user notes (1)').click();
            cy.contains('h2', 'Government user notes').should('be.visible');
            cy.contains('a', 'View').click();
            cy.contains(governmentUserNote).should('exist');
            cy.contains('a', 'Delete').click();
            cy.contains('Are you sure you want to delete this government user note?').should('be.visible');
            cy.get('input[name="delete"]').click();
            cy.contains('There are no notes').should('be.visible');
            cy.contains('a', 'Back').click();

            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab)
            cy.get('#approveCab').click()
            cy.get('#CABNumber').type(Date.now().toString())
            cy.generateRandomNumber(5).then((randomNumber) => {
                const dateNow = Date.now().toString();
                cy.get('#PreviousCABNumbers').type(`${dateNow},${randomNumber}`);
            });
            cy.get('#CabNumberVisibility').select('Display for all signed-in users')
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve')
            cy.contains('Enter the reason for publishing this CAB. This will be shown to all users in the CAB history page.').should('exist');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve')
            cy.get('#approve').click()
            cy.get('h1').should('contain', 'Draft management')
        });

        it('it should display warning messages for signed-in users on published CABs where a draft CAB exists', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            CabHelpers.editCabDetail('CAB details');
            this.cab.name = `Create a draft from published ${Date.now()}`
            CabHelpers.editCabName(this.cab);
            CabHelpers.saveAsDraft();
            cy.get('h1').should('contain', 'Draft management');
            cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(cabProfileName));
            cy.contains('A Draft CAB exists for this record.').should('exist');
            cy.get('#tab_usernotes').click();
            cy.contains('Government user notes need to be added to the Draft record.').should('exist');
        });
    });

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
            cy.get('#PreviousCABNumbers').should('be.disabled');
            cy.contains('Previous CAB numbers can be added on approval').should('exist');
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
