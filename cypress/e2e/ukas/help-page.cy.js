import {helpPath} from '../../support/helpers/common-helpers'

describe('Help Page Tests', function () {

    context('when logged in as a public user', function () {
        it('displays all expected subheaders and bodies', function () {
            cy.ensureOn(helpPath());
            cy.fixture("help-page-content").then((helpPageContent) => {
                cy.get('h1').should('contain', helpPageContent.mainHeader);
                helpPageContent.subHeaders.forEach((section) => {
                    cy.get('[id*="accordion-default-heading-"]').contains(section.header).should('exist');
                    section.text.forEach((paragraph) => {
                        cy.get('[id*="accordion-default-content-"]').contains(paragraph).should('exist');
                    });
                });
            });
        });
    });

    context('when logged in as OPSS Admin user', function () {
        it('displays all expected subheaders and bodies', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(helpPath());
            cy.fixture("help-page-content").then((helpPageContent) => {
                cy.get('h1').should('contain', helpPageContent.mainHeader);
                helpPageContent.subHeaders.forEach((section) => {
                    cy.get('[id*="accordion-default-heading-"]').contains(section.header).should('exist');
                    section.text.forEach((paragraph) => {
                        cy.get('[id*="accordion-default-content-"]').contains(paragraph).should('exist');
                    });
                });
            });
        });
    });

    context('when logged in as OGD user', function () {
        it('displays all expected subheaders and bodies', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(helpPath());
            cy.fixture("help-page-content").then((helpPageContent) => {
                cy.get('h1').should('contain', helpPageContent.mainHeader);
                helpPageContent.subHeaders.forEach((section) => {
                    cy.get('[id*="accordion-default-heading-"]').contains(section.header).should('exist');
                    section.text.forEach((paragraph) => {
                        cy.get('[id*="accordion-default-content-"]').contains(paragraph).should('exist');
                    });
                });
            });
        });
    });

    context('when logged in as UKAS user', function () {
        it('displays all expected subheaders and bodies', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(helpPath());
            cy.fixture("help-page-content").then((helpPageContent) => {
                cy.get('h1').should('contain', helpPageContent.mainHeader);
                helpPageContent.subHeaders.forEach((section) => {
                    cy.get('[id*="accordion-default-heading-"]').contains(section.header).should('exist');
                    section.text.forEach((paragraph) => {
                        cy.get('[id*="accordion-default-content-"]').contains(paragraph).should('exist');
                    });
                });
            });
        });
    });
});
