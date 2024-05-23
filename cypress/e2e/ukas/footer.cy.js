import { footer } from '../../support/helpers/common-helpers'
import { contactUsUrl, privacyUrl, termsUrl, cookiesUrl } from "../../support/helpers/url-helpers";

describe('Footer', function() {
  
  it('displays all expected links', function() {
    cy.ensureOn('/')
    footer().contains('a', 'Privacy').should('have.attr', 'href', privacyUrl())
    footer().contains('a', 'Cookies').should('have.attr', 'href', '/cookies-policy')
    footer().contains('a', 'Accessibility statement').should('have.attr', 'href', '/accessibility-statement')
    footer().contains('a', 'Contact').should('have.attr', 'href', contactUsUrl() + '?returnUrl=%252F')
    footer().contains('a', 'Terms and conditions').should('have.attr', 'href', termsUrl())
    footer().contains('a', 'Department for Business & Trade (opens in a new tab)').should('have.attr', 'href', 'https://www.gov.uk/government/organisations/department-for-business-and-trade').and('have.attr', 'target', '_blank')
    footer().contains('All content is available under the Open Government Licence v3.0 (opens in a new tab), except where otherwise stated').find('a', 'Open Government Licence v3.0').should('have.attr', 'href', 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/').and('have.attr', 'target', '_blank')
    footer().find('svg.govuk-footer__licence-logo').should('be.visible')
    footer().contains('a', '© Crown copyright ').should('have.attr', 'href', 'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/')
    .and('have.attr', 'target', '_blank')
    .and('have.class', 'govuk-footer__copyright-logo')
  })

  it('displays Privacy page as expected', () => {
    cy.ensureOn(privacyUrl())
    cy.contains('Privacy Notice - UKMCAB') //just check that page is not 404
  })

  it('displays Cookies page as expected', () => {
    cy.ensureOn(cookiesUrl())
    cy.contains('Cookies policy') //just check that page is not 404
  })
})
