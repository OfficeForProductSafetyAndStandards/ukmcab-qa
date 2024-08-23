import {accessibilityUrl, contactUs, cookiesUrl, privacyUrl, termsUrl} from "../../support/helpers/url-helpers";

describe('Contact Us Page', () => {
    const enquiryEmail = 'opss.enquiries@businessandtrade.gov.uk';
    beforeEach(() => {
        cy.ensureOn(contactUs())
    });

    it('should verify the banner content', () => {
        cy.get('.govuk-phase-banner__content')
            .should('contain', 'beta')
            .and('contain', `Email us at ${enquiryEmail} with any questions about using this service.`)
            .find('a')
            .should('have.attr', 'href', `mailto:${enquiryEmail}`);
    });

    it('should verify the header and body content', () => {
        cy.contains('Contact us').should('exist');
        cy.get('p.govuk-body')
            .should('contain.text', `Email us at ${enquiryEmail} with any questions about using this service.`)
            .find('a')
            .should('have.attr', 'href', `mailto:${enquiryEmail}`);
    });


it('should verify the footer links', () => {
    cy.get('.govuk-footer__inline-list')
        .within(() => {
            cy.get('.govuk-footer__inline-list-item').eq(0)
                .should('contain', 'Privacy')
                .find('a')
                .should('have.attr', 'href', privacyUrl());
            cy.get('.govuk-footer__inline-list-item').eq(1)
                .should('contain', 'Cookies')
                .find('a')
                .should('have.attr', 'href', cookiesUrl());
            cy.get('.govuk-footer__inline-list-item').eq(2)
                .should('contain', 'Accessibility statement')
                .find('a')
                .should('have.attr', 'href', accessibilityUrl());
            cy.get('.govuk-footer__inline-list-item').eq(3)
                .should('contain', 'Terms and conditions')
                .find('a')
                .should('have.attr', 'href', termsUrl());
            cy.get('.govuk-footer__inline-list-item').eq(4)
                .should('contain', 'Department for Business & Trade')
                .find('a')
                .should('have.attr', 'href', 'https://www.gov.uk/government/organisations/department-for-business-and-trade')
                .and('have.attr', 'target', '_blank');
        });
});
})
;
