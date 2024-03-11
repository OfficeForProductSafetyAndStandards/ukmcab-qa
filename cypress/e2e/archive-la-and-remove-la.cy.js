import * as CabHelpers from "../support/helpers/cab-helpers";
import * as UserManagementHelpers from "../support/helpers/user-management-helpers";
import * as EmailSubscriptionHelpers from "../support/helpers/email-subscription-helpers";
import Cab from "../support/domain/cab";
import Constants from "../support/domain/constants";

describe("Request to Archive an LA and to Remove an LA", () => {
  context("Archive an LA", function () {
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
      cy.hasStatus("Pending approval to publish CAB");
      cy.url().as("draftUrl");
      cy.logout();
    });

    it("OPSS archives an LA", function () {
      cy.loginAsOpssUser();
      CabHelpers.opssArchiveCAB(name);
      cy.logout();
    });
  });

  context("and Delete", function () {
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

    it("OPSS archive CAB", function () {
      cy.loginAsOpssUser();
      CabHelpers.opssArchiveCAB(name);
      cy.logout();
    });
  });
});
