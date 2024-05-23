import { basicAuthCreds } from "../support/helpers/common-helpers";
import { header } from "./helpers/common-helpers";

Cypress.Commands.add("ensureOn", (urlPath, options = {}) => {
  cy.location().then((loc) => {
    if (loc.toString().replace(loc.origin, "") !== urlPath) {
      cy.visit(urlPath, { ...basicAuthCreds(), ...options });
    }
  });
});

// login using QA endpoint visually
Cypress.Commands.add("login", (user) => {
  cy.ensureOn("/account/qalogin");
  cy.get("input[name=userid]").type(user.id);
  cy.get("form").submit();
});

// login using QA endpoint request
Cypress.Commands.add("loginAs", (user) => {
  cy.request({
    method: "POST",
    url: "/account/qalogin",
    body: {
      userId: user.id,
    },
    form: true,
    ...basicAuthCreds(),
  });
});

Cypress.Commands.add("loginAsOpssUser", () => {
  cy.fixture("users").then((users) => {
    cy.loginAs(users.OpssAdminUser);
  });
});

Cypress.Commands.add("loginAsUkasUser", () => {
  cy.fixture("users").then((users) => {
    cy.loginAs(users.UkasUser);
  });
});

Cypress.Commands.add("loginAsOpssOgdUser", () => {
  cy.fixture("users").then((users) => {
    cy.loginAs(users.OpssOgdUser);
  });
});

// TODO: OTHER USERS YET TO COME

Cypress.Commands.add("logout", () => {
  header().find("a").contains("Sign out").click();
});

Cypress.Commands.add("continue", () => {
  cy.contains("button,a", "Continue").click();
});

Cypress.Commands.add("saveAndContinue", () => {
  cy.contains("button,a", "Save and continue").click();
});

Cypress.Commands.add("clickSubmit", () => {
  cy.contains("button,a", "Submit").click();
});

Cypress.Commands.add("cancel", () => {
  cy.contains("button,a", "Cancel").click();
});

Cypress.Commands.add("confirm", () => {
  cy.contains("button,a", "Confirm").click();
});

Cypress.Commands.add("getSearchResults", (keywords, options = {}) => {
  // ScheduleLabels:("${keywords}") removed until 2.0 release
  keywords =
    keywords === ""
      ? "*"
      : `Name:(${keywords})^3 TownCity:(${keywords}) Postcode:("${keywords}") HiddenText:("${keywords}") CABNumber:("${keywords}")^4 DocumentLegislativeAreas/LegislativeAreaName:(${keywords})^6`;
  cy.request({
    method: "POST",
    headers: {
      "api-key": Cypress.env("AZURE_SEARCH_API_KEY"),
    },
    url:
      Cypress.env("AZURE_SEARCH_URL") +
      "/indexes/ukmcab-search-index-v3-2/docs/search?api-version=2020-06-30",
    body: {
      search: keywords,
      queryType: "full",
      searchMode: "any",
      top: 1000,
      ...options,
    },
  }).then((resp) => {
    return resp.body.value;
  });
});

Cypress.Commands.add("hasKeyValueDetail", (key, value) => {
  cy.get(".govuk-summary-list__row").contains(key).next().contains(value);
});

Cypress.Commands.add("hasStatus", (value) => {
  cy.get(".cab-detail-date-meta").contains(value);
});

// checks error is present both at field level and form level
Cypress.Commands.add("hasError", (fieldLabel, error, inline = true) => {
  cy.contains(".govuk-form-group", fieldLabel).contains(error);
  cy.get(".govuk-error-summary__list").contains(error);
});

Cypress.Commands.add("getCabslug", (name) => {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
});
