import Cab from "../../support/domain/cab";
import * as CabHelpers from "../../support/helpers/cab-helpers";
import {clickPublish, setPublishType} from "../../support/helpers/cab-helpers";

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

describe('PPE Product Test', () => {
    let draftUrl;
    let ppeData;
    let cabName;

    const testPpeData = {
        productType: [],
        risks: [],
        specialisedAreas: [],
        assessmentProcedures: []
    };

    const validatePpeDataOnSummaryPage = (testPpeData) => {
        cy.get('div.govuk-details__summary-text')
            .contains('span', 'Personal protective equipment')
            .click();

        cy.contains(testPpeData.productType[0])
            .should('exist');

        cy.contains(testPpeData.risks[0])
            .should('exist');

        cy.contains(testPpeData.specialisedAreas[0])
            .should('exist');

        testPpeData.assessmentProcedures.forEach(procedure => {
            cy.contains(procedure)
                .should('exist');
        });
    };


    before(() => {
        cy.fixture("ppe_data").then((data) => {
            ppeData = data;
        });

        const cab = Cab.buildWithoutDocuments();
        cy.loginAsUkasUser();
        cy.ensureOn(CabHelpers.addCabPath());
        cabName = `ppe-${Date.now()}`;
        cy.get('#Name').type(cabName);
        cy.continue();
        CabHelpers.enterContactDetails(cab);
        CabHelpers.enterBodyDetails(cab);
        cy.get("label").contains("Personal protective equipment").click();
        cy.continue();
        cy.get('h2.govuk-heading-s').should('have.text', 'Legislative area');
        cy.contains('Personal protective equipment').should("exist");
        cy.contains('PPE Product Type').should("exist");
        cy.url().then((url) => {
            draftUrl = url;
        });
    });

    it('Validates PPE Product Types, risks, specialised areas, and conformity assessment procedures', () => {
        cy.wrap(ppeData).should('exist');
        ppeData.ppes.productType.forEach(productType => {
            cy.contains(productType).should('exist');
        });
        const ppeProductType = getRandomElement(ppeData.ppes.productType);
        cy.contains(ppeProductType).click();
        testPpeData.productType.push(ppeProductType);
        cy.contains('Continue to next step').click();
        const risks = ppeData.ppes.risks;
        risks.forEach(risk => {
            cy.contains(risk).should('exist');
        });
        const randomRisk = getRandomElement(risks);
        cy.contains(randomRisk).click();
        testPpeData.risks.push(randomRisk);
        cy.contains('Continue to next step').click();
        const specialisedAreas = ppeData.ppes.specialisedAreas;
        specialisedAreas.forEach(area => {
            cy.contains(area).should('exist');
        });
        const randomArea = getRandomElement(specialisedAreas);
        cy.contains(randomArea).click();
        testPpeData.specialisedAreas.push(randomArea);
        cy.contains('Continue to next step').click();
        cy.contains('Applicable conformity assessment procedure').should('exist');
        testPpeData.productType.forEach(type => {
            cy.contains(type).should('exist');
        });
        testPpeData.risks.forEach(risk => {
            cy.contains(risk).should('exist');
        });
        testPpeData.specialisedAreas.forEach(area => {
            cy.contains(area).should('exist');
        });
        ppeData.ppes.assessmentProcedures.forEach(procedure => {
            cy.contains(procedure).should('exist');
        });
        const selectedProcedures = [];
        ppeData.ppes.assessmentProcedures.forEach(procedure => {
            cy.contains(procedure).click();
            selectedProcedures.push(procedure);
        });
        testPpeData.assessmentProcedures = selectedProcedures;
        cy.contains('Continue to next step').click();
        cy.log('Selected Test Data:', JSON.stringify(testPpeData, null, 2));
        cy.get('h1.govuk-heading-l').should('have.text', 'Personal protective equipment: additional information');
        cy.get('#IsProvisionalLegislativeArea-2').click();
        cy.saveAndContinue();
        cy.get('a.govuk-button')
            .contains('Continue')
            .click();
        CabHelpers.skipThisStep();
        CabHelpers.skipThisStep();
        validatePpeDataOnSummaryPage(testPpeData);
        CabHelpers.clickSubmitForApproval();
        cy.get('#viewCab').click()
        cy.url().as('draftUrl');
        cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB');
        cy.logout();
    });

    it('OPSS OGD should be able to approve PPE LA', function () {
        cy.loginAsOpssOgdUser();
        cy.ensureOn(this.draftUrl)
        validatePpeDataOnSummaryPage(testPpeData);
        CabHelpers.editCabButton().click();
        cy.contains('a', 'Review').click();
        cy.get('span').contains(`Personal protective equipment`).parent().next().contains('Review').click();
        testPpeData.productType.forEach((productType) => {
            cy.contains(productType).should('exist');
        });

        testPpeData.risks.forEach((risk) => {
            cy.contains(risk).should('exist');
        });

        testPpeData.specialisedAreas.forEach((area) => {
            cy.contains(area).should('exist');
        });

        testPpeData.assessmentProcedures.forEach((procedure) => {
            cy.contains(procedure).should('exist');
        });
        cy.contains('label', 'Approve').click()
        cy.confirm()
        cy.ensureOn(this.draftUrl);
        cy.logout();
    });

    it('OPSS Admin should be able to approve and publish PPE LA', function () {
        cy.loginAsOpssUser();
        cy.ensureOn(this.draftUrl);
        CabHelpers.editCabButton().click();
        validatePpeDataOnSummaryPage(testPpeData);
        cy.get('#reviewLa').click();
        cy.get('span').contains(`Personal protective equipment`).parent().next().contains('Review').click();
        testPpeData.productType.forEach((productType) => {
            cy.contains(productType).should('exist');
        });

        testPpeData.risks.forEach((risk) => {
            cy.contains(risk).should('exist');
        });

        testPpeData.specialisedAreas.forEach((area) => {
            cy.contains(area).should('exist');
        });

        testPpeData.assessmentProcedures.forEach((procedure) => {
            cy.contains(procedure).should('exist');
        });
        cy.contains('label', 'Approve').click()
        cy.confirm();
        setPublishType();
        clickPublish();
        cy.get('#CABNumber').type(Date.now().toString());
        cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
        cy.get('#Reason').type('OPSS TEST E2E Reason approve');
        cy.get('#approve').click();
        cy.get('h1').should('contain', 'Draft management');
        cy.logout();
        cy.ensureOn(`/search/cab-profile/${cabName}`);
        CabHelpers.viewLegislativeAreas();
        cy.contains('a.govuk-link', 'Personal protective equipment')
            .click();
        cy.contains('a.govuk-link', testPpeData.productType[0])
            .should('exist')
            .click();
        cy.contains('a.govuk-link', testPpeData.risks[0])
            .should('exist')
            .click();
        cy.contains('a.govuk-link', testPpeData.specialisedAreas[0])
            .should('exist')
            .click();
        testPpeData.productType.forEach((productType) => {
            cy.contains(productType).should('exist');
        });

        testPpeData.risks.forEach((risk) => {
            cy.contains(risk).should('exist');
        });

        testPpeData.specialisedAreas.forEach((area) => {
            cy.contains(area).should('exist');
        });

        testPpeData.assessmentProcedures.forEach((procedure) => {
            cy.contains(procedure).should('exist');
        });
    });
});
