import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import * as UserManagementHelpers from "../support/helpers/user-management-helpers";
import * as EmailSubscriptionHelpers from "../support/helpers/email-subscription-helpers";
import Constants from "../support/domain/constants";


describe('Ukas submitting a new CAB for Approval', () => {

  context('Ukas submits cab for approval and opss approve', function () {
    const uniqueId = Date.now();
    const name = `Test Cab ${uniqueId}`;
    beforeEach(function () {
      cy.wrap(Cab.buildWithoutDocuments()).as("cab");
      UserManagementHelpers.getTestUsers().then((users) => {
        cy.wrap(users.UkasUser).as("ukasUser");
      });
    });

    it('Ukas submit cab for approval', function () {
      cy.loginAsUkasUser();
      CabHelpers.createAndSubmitCabForApproval(name, this.cab);
      cy.url().as('draftUrl')
      cy.hasStatus('Pending approval to publish CAB')
    })
    
    it('OPSS approve CAB', function () {
      cy.loginAsOpssUser();
      CabHelpers.opssApprovesCAB(this.draftUrl, uniqueId);
      cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
      cy.hasStatus('Published')
    })

    it("email is sent to UKAS that request to publish has been approved", function () {
      EmailSubscriptionHelpers.assertApproveRequestToPublishEmailIsSent(
        this.ukasUser.email,
        name
      );
    });

    it("UKAS receives notification for approved request to publish", function () {
      cy.loginAsUkasUser();
      cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
      cy.contains("tr", "Test Opss Admin User")
        .first()
        .within(() => {
          cy.get("td").eq(1).find("a").click();
        });
      cy.get("p").contains("Completed").should("exist");
      cy.get("dd")
        .contains(Constants.ApprovedReason_PublishedCAB(name))
        .should("exist");
    });
  })

  context('Ukas submits cab for approval and opss decline', function () {
    const uniqueId = Date.now();
    const name = `Test Cab ${uniqueId}`;
    beforeEach(function () {
      cy.wrap(Cab.buildWithoutDocuments()).as("cab");
      UserManagementHelpers.getTestUsers().then((users) => {
        cy.wrap(users.UkasUser).as("ukasUser");
      });
    })

    it('Ukas submit cab for approval', function () {
      cy.loginAsUkasUser();
      CabHelpers.createAndSubmitCabForApproval(name, this.cab);
      cy.url().as('draftUrl')
      cy.hasStatus('Pending approval to publish CAB')
    })

    it('OPSS decline CAB', function () {
      cy.loginAsOpssUser();
      cy.ensureOn(this.draftUrl)
      cy.get('#declineCab').click()
      cy.get('#DeclineReason').type('OPSS TEST E2E Decline Reason')
      cy.get('#decline').click()
      cy.get('h1').should('contain', 'CAB management')
    })

    it("email is sent to UKAS that request to publish has been declined", function () {
      EmailSubscriptionHelpers.assertDeclineRequestToPublishEmailIsSent(
        this.ukasUser.email,
        name
      );
    });

    it("UKAS receives notification for declined request to publish", function () {
      cy.loginAsUkasUser();
      cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
      cy.contains("tr", "Test Opss Admin User")
        .first()
        .within(() => {
          cy.get("td").eq(1).find("a").click();
        });
      cy.get("p").contains("Completed").should("exist");
      cy.get("dd")
        .contains(Constants.DeclinedReason_PublishedCAB(name))
        .should("exist");
    });
  })
})