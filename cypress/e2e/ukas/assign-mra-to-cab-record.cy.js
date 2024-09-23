import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import {
    clickPublish,
    setPublishType,
    uploadAdditionalDocuments,
    uploadDocuments,
} from "/cypress/support/helpers/cab-helpers";

describe('UKAS or OPSS user assign MRA to CAB record via stand alone list on \'Body details\' page', () => {
    let cabProfileName;
    const bodyType = "UK body designated under MRA";
    const mraList = ["Australia", "Canada", "Japan", "New Zealand", "USA"];
    let selectedMraCountries = [];

    const verifySelectedMra = (selectedMraCountries) => {
        cy.get('.govuk-summary-list__row')
            .contains(bodyType)
            .parents('.govuk-summary-list__row')
            .find('.govuk-summary-list__value')
            .invoke('html')
            .then(html => {
                const summaryText = html.split('<br>').map(str => str.trim());
                expect(summaryText.sort()).to.deep.equal(selectedMraCountries.sort());
            });
    };


    beforeEach(function () {
        cy.wrap(Cab.build()).as('cab')
    })

    context('Assign MRA to associated CAB records and submits for approval', function () {
        it('given A UKAS user assigns MRA to associated CAB records and submits for approval', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `mra-${uniqueId}`;
            cy.get('#Name').type(cabProfileName);
            cy.continue();
            CabHelpers.enterContactDetails(this.cab);
            CabHelpers.enterBodyDetails(this.cab);
            CabHelpers.enterLegislativeAreas(this.cab);
            CabHelpers.skipThisStep();
            uploadDocuments(this.cab.documents);
            cy.saveAndContinue();
            CabHelpers.editCabDetail('Body details');
            cy.get(`input[value='${bodyType}']`).check();
            cy.continue();
            cy.get('h1.govuk-heading-l').should('have.text', bodyType);

            mraList.forEach(country => {
                cy.get(`input.govuk-checkboxes__input[value="${country}"]`).should('exist');
            });

            selectedMraCountries = ['Canada', 'New Zealand', 'USA'];
            selectedMraCountries.forEach(country => {
                cy.get(`input[value='${country}']`).check();
            });

            cy.contains('button', 'Continue').should('exist');
            cy.contains('button', 'Save').should('exist');
            cy.contains('a', 'Cancel').should('exist');
            cy.get('button[name="submitType"][value="Continue"]').click();
            verifySelectedMra(selectedMraCountries);
            CabHelpers.clickSubmitForApproval();
            cy.get('#viewCab').click();
            cy.url().as('draftUrl');
        });


        it('then selected MRA countries should be visible to OPSS OGD user', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click();
            verifySelectedMra(selectedMraCountries);
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.ensureOn(this.draftUrl);
            cy.logout();
        });


        it('then opss admin should be able to edit MRA country list', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            verifySelectedMra(selectedMraCountries);

            CabHelpers.editCabDetail('Body details');
            cy.get(`input[value='${bodyType}']`).check();
            cy.continue();
            cy.get('h1.govuk-heading-l').should('have.text', bodyType);

            cy.get(`input[value='New Zealand']`).click({force: true});
            cy.get(`input[value='Australia']`).click({force: true});

            selectedMraCountries = ['Canada', 'Australia', 'USA'];

            cy.get('button[name="submitType"][value="Continue"]').click();
            verifySelectedMra(selectedMraCountries);

            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            setPublishType();
            clickPublish();
            cy.get('#CABNumber').type(Date.now().toString());
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve');
            cy.get('#approve').click();
            cy.get('h1').should('contain', 'Draft management');
            cy.logout();
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`);
            cy.contains(bodyType).should('exist');
            selectedMraCountries.forEach(country => {
                cy.contains(country).should('exist');
            });
        });
    });

})
