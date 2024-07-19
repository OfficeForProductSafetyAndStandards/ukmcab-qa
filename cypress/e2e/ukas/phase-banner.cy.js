import {contactUs} from '../../support/helpers/url-helpers'

describe('Phase Banner', () => {

    it.skip('displays correctly', () => {
        cy.ensureOn('/')
        cy.get('.govuk-phase-banner__content')
            .contains('beta How could we improve this service? Your feedback will help.')
            .find('a', 'feedback').should('have.attr', 'href', contactUs() + '?returnUrl=%252F')
    });

    it('displays correctly', () => {
        cy.ensureOn('/')
        cy.get('.govuk-phase-banner__content')
            .contains('Email us at')
            .find('a', 'opss.enquiries@businessandtrade.gov.uk')
            .should('have.attr', 'href', 'mailto:opss.enquiries@businessandtrade.gov.uk')
    });
});

