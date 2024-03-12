import Cab from "../domain/cab";
import { CabNumberVisibility } from "../domain/cab-number-visibility";
import { date, valueOrNotProvided } from "./formatters";
export const serviceManagementPath = () => {
  return "/service-management";
};
export const cabManagementPath = () => {
  return "/admin/cab-management";
};
export const cabProfilePage = (cab) => {
  return `/search/cab-profile/${cab.urlSlug}`;
};
export const cabSummaryPage = (id) => {
  return `/admin/cab/summary/${id}`;
};
export const addCabPath = () => {
  return `/admin/cab/create`;
};

export const notificationUrlPath = () => {
  return `/admin/notifications`;
};
export const notificationCompletedUrlPath = () => {
  return `/admin/notifications#completed`;
};
export const notificationUnassignedUrlPath = () => {
  return `/admin/notifications#Unassigned`;
};

export const cabProfileUrlPathByCabName = (name) => {
  return `/search/cab-profile/${getSlug(name)}`;
};

export const getSlug = (name) => {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export const getIdFromLastPartOfUrl = (url) => {
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  return lastPart;
};

export const createCab = (cab) => {
  cy.ensureOn(addCabPath());
  enterCabDetails(cab);
  enterContactDetails(cab);
  enterBodyDetails(cab);
  enterLegislativeAreas(cab)  
  uploadSchedules(cab.schedules);
  cy.saveAndContinue();
  uploadDocuments(cab.documents);
  cy.saveAndContinue();
  hasDetailsConfirmation(cab);
  clickPublish();
  clickPublishNotes();
};

export const createCabWithoutDocuments = (cab) => {
  cy.ensureOn(addCabPath());
  enterCabDetails(cab);
  enterContactDetails(cab);
  enterBodyDetails(cab);
  enterLegislativeAreas(cab)
  skipThisStep();
  skipThisStep();
  clickPublish();
  clickPublishNotes();
};

export const draftCab = (cab) => {
  enterCabDetails(cab);
  enterContactDetails(cab);
  enterBodyDetails(cab);
  uploadSchedules(cab.schedules);
  cy.saveAndContinue();
  uploadDocuments(cab);
  hasDetailsConfirmation(cab);
  saveAsDraft();
};

export const setAppointmentDate = (day, month, year) => {
  cy.get("#AppointmentDateDay").invoke("val", day);
  cy.get("#AppointmentDateMonth").invoke("val", month);
  cy.get("#AppointmentDateYear").invoke("val", year);
};

export const setReviewDate = (day, month, year) => {
  cy.get("#ReviewDateDay").invoke("val", day);
  cy.get("#ReviewDateMonth").invoke("val", month);
  cy.get("#ReviewDateYear").invoke("val", year);
};

export const autoFillReviewDate = () => {
  cy.contains("button", "Add 18 months from today").click();
};
export const isSummaryPage = (cab) => {
  cy.contains("CAB profile");
};

export const hasReviewDate = (date) => {
  cy.get("#ReviewDateDay").invoke("val").should("eq", date.date().toString());
  cy.get("#ReviewDateMonth")
    .invoke("val")
    .should("eq", (date.month() + 1).toString());
  cy.get("#ReviewDateYear").invoke("val").should("eq", date.year().toString());
};

export const enterCabDetails = (cab) => {
  // const currentDate = new Date(); // Get the current date and time
  // currentDate.setDate(currentDate.getDate()); // Add 3 days to the current date
  // const futureDate = currentDate.getTime(); // Get the timestamp of the future date in milliseconds
  cy.get("#Name").invoke("val", cab.name);
  cy.get("#CABNumber").invoke("val", cab.cabNumber);
  cy.get("#CabNumberVisibility option").then(($options) => {
    const options = Cypress._.map($options, "innerText");
    expect(options).to.eql([
      "Select an option",
      "Display for all users",
      "Display for all signed-in users",
      "Display for government users only",
    ]);
  });
  if (cab.cabNumberVisibility === CabNumberVisibility.Internal) {
    cy.get("#CabNumberVisibility").select("Display for all signed-in users");
  } else if (cab.cabNumberVisibility === CabNumberVisibility.Private) {
    cy.get("#CabNumberVisibility").select("Display for government users only");
  } else if (cab.cabNumberVisibility === CabNumberVisibility.Public) {
    cy.get("#CabNumberVisibility").select("Display for all users", { force: true });
  }
  if (cab.appointmentDate) {
    setAppointmentDate(
      date(cab.appointmentDate).DD,
      date(cab.appointmentDate).MM,
      date(cab.appointmentDate).YYYY
    );
  }
  if (cab.reviewDate) {
    // cab.reviewDate = futureDate
    setReviewDate(
      date(cab.reviewDate).DD,
      date(cab.reviewDate).MM,
      date(cab.reviewDate).YYYY
    );
  }
  if (cab.ukasRef) {
    cy.get("#UKASReference").invoke("val", cab.ukasRef);
  }
  cy.continue();
};

export const enterContactDetails = (cab) => {
  cy.get("#AddressLine1").invoke("val", cab.addressLine1);
  cy.get("#AddressLine2").invoke("val", cab.addressLine2);
  cy.get("#TownCity").invoke("val", cab.townCity);
  cy.get("#Postcode").invoke("val", cab.postcode);
  cy.get("#County").invoke("val", cab.county);
  cy.get("#Country").invoke("val", cab.country);
  cy.get("#Website").invoke("val", cab.website);
  cy.get("#Email").invoke("val", cab.email);
  cy.get("#Phone").invoke("val", cab.phone);
  cy.get("#PointOfContactName").invoke("val", cab.pointOfContactName);
  cy.get("#PointOfContactEmail").invoke("val", cab.pointOfContactEmail);
  cy.get("#PointOfContactPhone").invoke("val", cab.pointOfContactPhone);
  if (cab.isPointOfContactPublicDisplay) {
    cy.get("#PublicDisplay").check();
  }
  if (!cab.isPointOfContactPublicDisplay) {
    cy.get("#InternalDisplay").check();
  }
  cy.get("#RegisteredOfficeLocation").select(cab.registeredOfficeLocation);
  cy.continue();
};

export const enterBodyDetails = (cab) => {
  cy.wrap(cab.testingLocations).each((location, index, locations) => {
    Cypress._.times(
      locations - 1,
      cy.contains("a", "Add another registered test location").click()
    );
    cy.get(".test-location select").eq(index).select(location);
  });
  cab.bodyTypes.forEach((bodyType) => {
    cy.get(`input[value='${bodyType}']`).check();
  });
  cy.continue();
};

export const enterLegislativeAreas = (cab) => {

  cab.documentLegislativeAreas?.forEach((legislativeArea, laIndex) => {
    cy.get('label').contains(legislativeArea.Name).click();
    cy.continue();

    legislativeArea.ScopeOfAppointments.forEach((scopeOfAppointment, soaIndex) => {
      if (scopeOfAppointment.PurposeOfAppointment != null) {
        cy.get('label').contains(scopeOfAppointment.PurposeOfAppointment.Name).click();
        cy.continue();
      }
      if (scopeOfAppointment.Category != null) {
        cy.get('label').contains(scopeOfAppointment.Category.Name).click();
        cy.continue();
      }
      if (scopeOfAppointment.Subcategory != null) {
        cy.get('label').contains(scopeOfAppointment.Subcategory.Name).click();
        cy.continue();
      }

      // Select the products, if any.
      var hasProducts = false;
      scopeOfAppointment.ProductAndProcedures.forEach((productAndProcedure) => {
        if (productAndProcedure.Product != null) {
          cy.get('label').contains(productAndProcedure.Product.Name).click();
          hasProducts = true;
        }
      });
      if (hasProducts) {
        cy.continue();
      }

      // Select procedures for each product.
      scopeOfAppointment.ProductAndProcedures.forEach((productAndProcedure, prodIndex) => {
        // This block is needed to stop cypress selecting checkboxes before the screen is fully loaded when the current element (e.g. product) has same procedure choices as previous element.
        if (productAndProcedure.Product != null) {
          cy.contains('p', `${productAndProcedure.Product.Name}`).should('exist');
        }
        else if (scopeOfAppointment.Subcategory != null) {
          cy.contains('p', `${scopeOfAppointment.Subcategory.Name}`).should('exist');
        }
        else if (scopeOfAppointment.Category != null) {
          cy.contains('p', `${scopeOfAppointment.Category.Name}`).should('exist');
        }
        else if (scopeOfAppointment.PurposeOfAppointment != null) {
          cy.contains('p', `${scopeOfAppointment.PurposeOfAppointment.Name}`).should('exist');
        }

        productAndProcedure.Procedures.forEach((procedure) => {
          cy.get('label').contains(procedure.Name).click();
        });

        // If we are on the last product of current SoA and there are more SoAs in list, click the "Add more" button.
        if (prodIndex == scopeOfAppointment.ProductAndProcedures.length - 1 && soaIndex < legislativeArea.ScopeOfAppointments.length - 1) {
          cy.contains('button', 'Add more to this legislative area').click();
        }
        else {
          // Otherwise click Continue to go to next product or Additional Info screen.
          cy.continue();
        }
      });
    });

    // Additional information screen.
    cy.get('label').contains(legislativeArea.IsProvisional).click();
    if (legislativeArea.AppointmentDate != null) {
      // Note: "cy.get("#AppointmentDate.Day")" doesn't work even though that is the id!;
      cy.get("input[name='AppointmentDate.Day']").invoke("val", date(legislativeArea.AppointmentDate).DD);
      cy.get("input[name='AppointmentDate.Month']").invoke("val", date(legislativeArea.AppointmentDate).MM);
      cy.get("input[name='AppointmentDate.Year']").invoke("val", date(legislativeArea.AppointmentDate).YYYY);
    }
    if (legislativeArea.ReviewDate != null) {
      cy.get("input[name='ReviewDate.Day']").invoke("val", date(legislativeArea.ReviewDate).DD);
      cy.get("input[name='ReviewDate.Month']").invoke("val", date(legislativeArea.ReviewDate).MM);
      cy.get("input[name='ReviewDate.Year']").invoke("val", date(legislativeArea.ReviewDate).YYYY);
    }
    if (legislativeArea.Reason != null) {
      cy.get("#Reason").invoke("val", legislativeArea.Reason);
    }
    cy.continue();

    // Legislative areas review screen.
    cy.contains('span', 'Legislative areas').should('exist');

    // If there are more legislative areas to add, click the "Add legislative area" link/button.
    if (laIndex < cab.documentLegislativeAreas.length - 1) {
      cy.contains('a', 'Add legislative area').click();
    }
    else {
      // Otherwise click Continue.
      cy.continue();
    }
  });
};

export const uploadSchedules = (schedules) => {
  uploadFiles(schedules);
  cy.wrap(schedules).each((schedule) => {
    if (schedule.label) {
      setFileLabel(schedule.fileName, schedule.label);
    }
    if (schedule.legislativeArea) {
      setLegislativeArea(schedule.fileName, schedule.legislativeArea);
    }
  });
};

export const skipSchedules = () => {
  cy.contains("Skip this step").click();
};

export const skipThisStep = () => {
  cy.contains("Skip this step").click({ force: true });
};

export const skipDocuments = () => {
  cy.contains("Skip this step").click();
};

export const clickSubmitForApproval = () => {
  cy.contains("Submit for approval").click({ force: true });
};

export const uploadDocuments = (documents) => {
  cy.wrap(documents).each((document, index) => {
    cy.get("input[type=file]").selectFile(
      `cypress/fixtures/${document.fileName}`
    );
    upload();
    if (document.category) {
      setCategory(document.fileName, document.category);
    }
    if (index < documents.length - 1) {
      cy.contains("Save and upload another file").click();
    }
  });
};

export const clickPublish = () => {
  cy.get("button,a").contains("Publish").click();
};

export const clickPublishNotes = () => {
  cy.get("button,a").contains("Publish").click();
};

export const hasDetailsConfirmation = (cab) => {
  //disabling to check for other unrelated regressions
  // cy.get('.govuk-caption-m').contains('Create a CAB')
  cy.hasKeyValueDetail("CAB name", cab.name);
  cy.hasKeyValueDetail("CAB number", cab.cabNumber);
  cy.hasKeyValueDetail(
    "Appointment date (optional)",
    valueOrNotProvided(date(cab.appointmentDate)?.DMMMYYYY)
  );
  cy.hasKeyValueDetail(
    "Review date (optional)",
    valueOrNotProvided(date(cab.reviewDate)?.DMMMYYYY)
  );
  cy.hasKeyValueDetail(
    "UKAS reference number (optional)",
    valueOrNotProvided(cab.ukasRef)
  );
  // cy.hasKeyValueDetail('Address', valueOrNotProvided(cab.addressLines.join('\n')))
  cy.hasKeyValueDetail("Website (optional)", valueOrNotProvided(cab.website));
  cy.hasKeyValueDetail("Email (optional)", valueOrNotProvided(cab.email));
  cy.hasKeyValueDetail("Telephone", valueOrNotProvided(cab.phone));
  cy.hasKeyValueDetail(
    "Point of contact name (optional)",
    valueOrNotProvided(cab.pointOfContactName)
  );
  cy.hasKeyValueDetail(
    "Point of contact email (optional)",
    valueOrNotProvided(cab.pointOfContactEmail)
  );
  cy.hasKeyValueDetail(
    "Point of contact telephone (optional)",
    valueOrNotProvided(cab.pointOfContactPhone)
  );
  cy.hasKeyValueDetail(
    "Display point of contact details",
    cab.pointOfContactDetailsDisplayStatus()
  );
  cy.hasKeyValueDetail(
    "Registered office location",
    cab.registeredOfficeLocation
  );

  cy.hasKeyValueDetail(
    "Registered test location",
    valueOrNotProvided(cab.testingLocations?.join(""))
  );
  cy.hasKeyValueDetail("Body type", cab.bodyTypes.join(""));
  // cy.hasKeyValueDetail(
  //   "Legislative area",
  //   valueOrNotProvided(cab.legislativeAreas?.join(""))
  // );

  cab.documentLegislativeAreas?.forEach((legislativeArea, index) => {
    cy.get('.govuk-details__summary-text').eq(index).contains(legislativeArea.Name)
  })

  if (cab.schedules) {
    cab.schedules.forEach((schedule) => {
      cy.contains("Schedule (optional)")
        .next()
        .contains("a", schedule.label ?? schedule.fileName);
      cy.contains("Schedule (optional)").next().contains(schedule.legislativeArea);
    });
  } else {
    cy.hasKeyValueDetail("Schedule (optional)", "Not provided");
  }

  if (cab.documents) {
    filenames(cab.documents).forEach((filename) => {
      cy.contains("Document").next().contains(filename);
    });
  } else {
    cy.hasKeyValueDetail("Document", "Not provided");
  }

  cy.contains("Once published this record will be visible to the public.");
};

export const hasCabPublishedConfirmation = (cab) => {
  cy.get(".govuk-panel--confirmation");
  cy.get(".govuk-panel--confirmation").contains(
    cab.name + " published " + "CAB number" + cab.cabNumber
  );
  // cy.contains(`What happens next CAB is now publicly available.`)
  cy.contains("a", "View CAB").should(
    "have.attr",
    "href",
    cabProfilePage(cab) + "?returnURL=confirmation"
  );
  cy.contains("a", "Go to Home page").should(
    "have.attr",
    "href",
    serviceManagementPath()
  );
};

// expects files in fixtures folder
export const uploadFile = (file) => {
  cy.get("input[type=file]").selectFile(`cypress/fixtures/${file.fileName}`);
  upload();
};

// expects files in fixtures folder
export const uploadFiles = (files) => {
  const filePaths = Cypress._.map(
    files,
    (file) => `cypress/fixtures/${file.fileName}`
  );
  cy.get("input[type=file]").selectFile(filePaths);
  upload();
};

export const filenames = (files) => {
  return files.map((f) => {
    return f.fileName;
  });
};

export const hasUploadedSchedules = (files) => {
  cy.wrap(files).each((file, index) => {
      cy.get(".govuk-radios__item")
      .eq(index)
      .should("contain", `${index + 1}. ${file.fileName}`);
      cy.get(".govuk-radios__item")
      .eq(index)
      .next("div")
      .find("div")
      .first()
      .find("input")
      .should("have.value", file.label);
      cy.get(".govuk-radios__item")
      .eq(index)
      .next("div")
      .find("select")
      .find(":selected")
      .should("have.text", file.legislativeArea);
  });
};

export const hasUploadedFileNames = (files) => {
  cy.get("tbody tr").each(($row, index) => {
    cy.wrap($row)
      .find("td")
      .eq(0)
      .should("contain", `${index + 1}.`);
    cy.wrap($row).find("td").eq(1).should("contain", files[index].fileName);
    cy.wrap($row)
      .find("td")
      .eq(2)
      .contains("button", "Remove")
      .and("has.attr", "value", files[index].fileName);
  });
};

export const uploadedFile1 = (filename) => {
  return cy.get(`input[value='${filename}']:visible`).parent().next("div");
};

export const uploadedFile = (filename) => {
  return cy.get(`input[value='${filename}']:visible`);
};

export const uploadedDocument = (filename) => {
  return cy
    .contains("a", `${filename}`)
    .parents("#uploaded-file-name-tr")
    .next("tr");
};

export const setFileLabel = (filename, newFileName) => {
  uploadedFile(filename).clear().type(newFileName);
};

export const setLegislativeArea = (filename, value) => {
  uploadedFile1(filename).find("select").select(value);
};

export const setCategory = (filename, value) => {
  uploadedFile1(filename).find("select").select(value);
};

export const mainPage = () => {
  return cy.get("main#main-content");
};

export const archiveCab = (cab, options) => {
  options = {
    reason: "Test archive reason",
    hasAssociatedDraft: false,
    ...options,
  };
  const draftDeletionWarningText =
    "This CAB has a draft profile connected to it. If you archive this CAB, the draft will be deleted";
  cy.ensureOn(cabProfilePage(cab));
  archiveCabButton().click();
  mainPage().within(() => {
    cy.contains("h1", `Archive ${cab.name}`);
    cy.contains("Enter the reason for archiving this CAB.");
    options.hasAssociatedDraft
      ? cy.contains(draftDeletionWarningText)
      : cy.contains(draftDeletionWarningText).should("not.exist");
    cy.contains(
      "Archived CAB profiles cannot be edited and users cannot view them in the search results."
    );
    cy.get("#ArchiveInternalReason").type(options.reason);
    archiveCabButton().click();
  });
  cy.get(".govuk-warning-text").contains(
    `Archived on ${date(new Date()).DDMMYYYY}`
  );
};

export const unarchiveCab = (cab, reason = "Test Unarchive reason") => {
  cy.ensureOn(cabProfilePage(cab));
  unarchiveCabButton().click();
  mainPage().within(() => {
    cy.contains("h1", `Unarchive ${cab.name}`);
    cy.contains("User notes");
    cy.contains("Unarchived CAB profiles will be saved as draft.");
    cy.get("#UnarchiveInternalReason").type(reason);
    cy.contains("a", "Cancel")
      .should("have.attr", "href")
      .and("contains", "search/cab-profile");
    unarchiveCabButton().click();
  });
  cy.contains("Edit").click();
  cy.contains("Once published this record will be visible to the public.");
};

export const viewLegislativeAreas = () => {
  cy.contains("#tab_legislative-areas", "Legislative areas").click();
};

export const viewSchedules = () => {
  cy.contains("#tab_product-schedules", "Product schedules").click();
};

export const viewHistory = () => {
  cy.contains("#tab_history", "History").click();
};

export const getTestCab = () => {
  return getAllPublishedCabs().then((cabs) => {
    return cabs[0];
  });
};

export const getTestCabWithCabNumber = () => {
  return getAllPublishedCabs().then((cabs) => {
    return cabs.find((c) => c.cabNumber !== null);
  });
};

export const getTestCabWithReviewDate = () => {
  return getAllPublishedCabs().then((cabs) => {
    return cabs.find((c) => c.reviewDate !== null);
  });
};

export const getTestCabWithCabNumberAndUkasRef = () => {
  return getAllPublishedCabs().then((cabs) => {
    return cabs.find((c) => c.cabNumber !== null && c.ukasRef !== null);
  });
};

export const getTestCabWithDocuments = () => {
  return getAllPublishedCabs().then((cabs) => {
    return cabs.find(
      (c) => c.documents && c.documents.length > 0 && c.schedules.length > 0 && c.isRecent
    );
  });
};

export const getTestCabForEditing = () => {
  return getAllPublishedCabs().then((cabs) => {
    return cabs.find((cab) => cab.name.startsWith("Test Cab"));
  });
};

export const getAllCabs = () => {
  return cy.task("getItems").then((items) => {
    return items.map((item) => new Cab(item));
  });
};

export const getAllPublishedCabs = () => {
  return getAllCabs().then((cabs) => {
    return cabs.filter((cab) => cab.isPublished);
  });
};

export const getAllDraftCabs = () => {
  return getAllCabs().then((cabs) => {
    return cabs.filter((cab) => cab.isDraft);
  });
};

export const getAllDraftOrArchivedCabs = () => {
  return getAllCabs().then((cabs) => {
    return cabs.filter((cab) => cab.isDraft || cab.isArchived);
  });
};

export const getArchivedCab = () => {
  return getAllCabs().then((cabs) => {
    return cabs.find((cab) => cab.isArchived);
  });
};

export const addACabButton = () => {
  return cy.contains("a", "Add a new CAB");
};

export const editCabButton = () => {
  return cy.get("a,button").contains("Edit");
};

export const archiveCabButton = () => {
  return cy.get("a,button").contains("Archive");
};
export const unarchiveCabButton = () => {
  return cy.get("a,button").contains("Unarchive");
};

export const editCabDetail = (heading) => {
  cy.get(".cab-summary-header")
    .contains(heading)
    .parents(".govuk-summary-list__key")
    .next()
    .contains("a", "Edit")
    .click();
};

export const editProductSchedules = (heading) => {
    cy.get(".cab-summary-header")
        .contains(heading)
        .parents(".govuk-summary-list__key")
        .next()
        .contains("a", "Edit")
        .click();
};

export const upload = () => {
  cy.contains("button", "Upload").click();
};

export const saveAsDraft = () => {
  cy.contains("button,a", "Save as draft").click();
};

export const submitForApproval = () => {
  cy.contains("button", "Submit for approval").click();
};

export const hasAddCabPermission = () => {
  addACabButton().should("exist").and("have.attr", "href", addCabPath());
};

export const hasNoAddCabPermission = () => {
  addACabButton().should("not.exist");
};

export const editACabButton = () => {
  return cy.contains("a", "Edit CAB");
};

export const hasEditCabPermission = () => {
  editACabButton().should("exist");
};

export const hasNoEditCabPermission = () => {
  editACabButton().should("not.exist");
};

export const createDraftVersion = (cab) => {
  cy.ensureOn(cabProfilePage(cab));
  editCabButton().click();
  editCabButton().click();
  saveAsDraft();
};

export const createAndSubmitCabForApproval = (name, cab) => {
  cy.ensureOn(addCabPath());
  var cabSummaryPageUrl = "";

  cy.get("#CABNumber").should("be.disabled"); //Check cab number is disabled
  cy.get("#Name").type(String(name));
  cy.continue();
  enterContactDetails(cab);
  enterBodyDetails(cab);
  enterLegislativeAreas(cab)
  skipThisStep();
  skipThisStep();
  cy.get(".govuk-button-group").contains("Submit for approval").click();
  cy.get("#viewCab").click();
};

export const opssApprovesCAB = (draftUrl, uniqueId) => {
  cy.ensureOn(draftUrl);
  cy.get("#approveCab").click();
  cy.get("#CABNumber").type(uniqueId);
  cy.get("#CabNumberVisibility").select("Display for all signed-in users");
  cy.get("#UserNotes").type("OPSS TEST E2E User notes");
  cy.get("#Reason").type("OPSS TEST E2E Reason");
  cy.get("#approve").click();
};

export const opssArchiveCAB = (name) => {
  cy.ensureOn(`/search/cab-profile/${getSlug(name)}`);
  cy.get("#archive-button").click();
  cy.get("#ArchiveInternalReason").type(
    "OPSS E2E TEST for Archive internal/user notes"
  );
  cy.get(".govuk-button-group").contains("Archive").click();
};

export const ukasRequestToUnarchiveAndPublishCab = (name) => {
  cy.ensureOn(`/search/cab-profile/${getSlug(name)}`);
  cy.get("a").contains("Request to unarchive").click();
  cy.get("#IsPublish").check();
  cy.get("#Reason").type(
    "E2E TEST - UKAS request to unarchive and publish reasons"
  );
  cy.get(".govuk-button-group").contains("Confirm").click();
  cy.logout();
};
export const ukasRequestToUnarchiveAndSaveAsDraftCab = (name) => {
  cy.loginAsUkasUser();
  cy.ensureOn(`/search/cab-profile/${getSlug(name)}`);
  cy.get("a").contains("Request to unarchive").click();
  cy.get("#IsPublish-2").check();
  cy.get("#Reason").type(
    "E2E TEST - UKAS request to unarchive and save as draft reasons"
  );
  cy.get(".govuk-button-group").contains("Confirm").click();
  cy.logout();
};
