import * as CabHelpers from "../support/helpers/cab-helpers";
import * as UserManagementHelpers from "../support/helpers/user-management-helpers";
import * as EmailSubscriptionHelpers from "../support/helpers/email-subscription-helpers";
import Cab from "../support/domain/cab";
import Constants from "../support/domain/constants";

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
      cy.loginAsOpssUser();
      CabHelpers.opssApprovesCAB(this.draftUrl, uniqueId);
      cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
      cy.hasStatus("Published");
    });

    it("OPSS archives an LA", function () {
      cy.loginAsOpssUser();
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
      cy.loginAsOpssUser();
      CabHelpers.opssApprovesCAB(this.draftUrl, uniqueId);
      cy.ensureOn(CabHelpers.cabProfileUrlPathByCabName(name));
      cy.hasStatus("Published");
    });

    it("OPSS removes an LA", function () {
      cy.loginAsOpssUser();
      CabHelpers.opssRemoveLA(cabId);
      cy.logout();
    });
  });
});
