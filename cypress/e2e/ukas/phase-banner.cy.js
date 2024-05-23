import { contactUsUrl } from '../../support/helpers/url-helpers'
describe('Phase Banner', () => {

  it('displays correctly', () => {
    cy.ensureOn('/')
    cy.get('.govuk-phase-banner__content')
    .contains('beta How could we improve this service? Your feedback will help.')
    .find('a', 'feedback').should('have.attr', 'href', contactUsUrl() + '?returnUrl=%252F')
  })
})
