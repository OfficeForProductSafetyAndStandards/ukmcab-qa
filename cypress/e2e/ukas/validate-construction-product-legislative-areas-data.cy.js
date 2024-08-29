import * as CabHelpers from "../../support/helpers/cab-helpers";
import Cab from "../../support/domain/cab";

describe('Validate construction products from JSON file on demand', () => {
    let draftUrl;
    let testProduct;

    before(() => {
        const cab = Cab.buildWithoutDocuments();
        cy.loginAsUkasUser();
        cy.ensureOn(CabHelpers.addCabPath());
        cy.get('#Name').type(`ValidateConstructionProductLegislativeAreasData - ${Date.now()}`);
        cy.continue();
        CabHelpers.enterContactDetails(cab);
        CabHelpers.enterBodyDetails(cab);
        cy.get("label").contains("Construction products").click();
        cy.continue();
        cy.get('h2.govuk-heading-s').should('have.text', 'Legislative area');
        cy.contains('Construction products').should("exist");
        cy.contains('Designated Standards').should("exist");
        cy.url().then((url) => {
            draftUrl = url;
        });
    });

    const decodeUnicode = (str) => {
        return str.replace(/\\u2014/g, '—');
    };


    const selectSubset = (data, range) => {
        const [start, end] = range.split('-').map(Number);
        return data.products.slice(start - 1, end);
    };

    const validateProductDetails = (product) => {
        cy.contains(product.product).should('exist');
        product.details.referenceNumber.forEach(refNumber => {
            cy.contains(refNumber).should('exist');
        });
        product.details.publicReference.forEach(pubRef => {
            cy.contains(pubRef).should('exist');
        });
    }


    function verifyProductDetails({product, details}) {
        cy.get('.govuk-checkboxes__label')
            .contains(decodeUnicode(product))
            .should('exist')
            .then((label) => {
                const item = label.parents('.govuk-checkboxes__item');


                if (details.referenceNumber) {
                    details.referenceNumber.forEach((reference) => {
                        cy.wrap(item)
                            .find('details summary, details p')
                            .contains(reference)
                            .should('exist');
                    });
                }


                if (details.publicReference) {
                    details.publicReference.forEach((publicRef) => {
                        cy.wrap(item)
                            .find('details summary, details p')
                            .contains(publicRef)
                            .should('exist');
                    });
                }
            });
    }

    it('validates a subset of products from the JSON file', () => {
        cy.readFile('cypress/fixtures/constructionData.json').then((data) => {
            const productsSubset = selectSubset(data, '1-10');
            cy.loginAsUkasUser();
            cy.ensureOn(draftUrl);
            productsSubset.forEach(verifyProductDetails);
        });
    });

    it('pagination tests', () => {
        cy.loginAsUkasUser();
        cy.ensureOn(draftUrl);
        cy.get('.pagination-detail-container')
            .should('contain', 'Showing 1 - 20 of 444 designated standards');

        cy.get('.pagination-links-container')
            .contains('3')
            .click();

        cy.get('.pagination-detail-container')
            .should('contain', 'Showing 41 - 60 of 444 designated standards');

        cy.get('.pagination-links-container')
            .contains('Previous')
            .should('exist');

        cy.get('.pagination-links-container')
            .contains('Next')
            .should('exist');

    });

    it('add construction product as LA', () => {
        cy.readFile('cypress/fixtures/constructionData.json').then((data) => {
            const products = data.products.filter(product => product.product !== 'Select all');
            testProduct = products[Math.floor(Math.random() * products.length)];
            cy.loginAsUkasUser();
            cy.ensureOn(draftUrl);
            cy.get('#SearchTerm').type(testProduct.product);
            cy.get('#search-keyword-button').click();
            cy.contains(testProduct.product).should('exist');
            cy.contains(testProduct.product).parent().find('summary').click();
            testProduct.details.referenceNumber.forEach(refNumber => {
                cy.contains(refNumber).should('exist');
            });
            testProduct.details.publicReference.forEach(pubRef => {
                cy.contains(pubRef).should('exist');
            });

            cy.get('button[name="submitType"][value="Continue"]').click();
            cy.get('.govuk-error-summary__list').contains('Select a designated standard').should('exist');
            cy.get('#PageSelectedDesignatedStandardIds-2').check();
            cy.get('button[name="submitType"][value="Continue"]').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Construction products: additional information');
            cy.get('#IsProvisionalLegislativeArea-2').click();
            cy.saveAndContinue();
            cy.get('a.govuk-button')
                .contains('Continue')
                .click();
            CabHelpers.skipThisStep();
            CabHelpers.skipThisStep();
            cy.get('div.govuk-details__summary-text')
                .contains('span', 'Construction products')
                .click();
            validateProductDetails(testProduct);
            CabHelpers.clickSubmitForApproval();
            cy.get('#viewCab').click()
            cy.url().as('draftUrl');
            cy.get('.cab-status-tag--pending-approval').should('contain', 'Pending approval to publish CAB');
            cy.logout();
        });
    });

    it('OPSS admin should see the construction product details', function () {
        cy.loginAsOpssUser();
        cy.ensureOn(this.draftUrl)
        validateProductDetails(testProduct);
        cy.contains('Pending approval from DLUHC').should("exist");

    });

});
