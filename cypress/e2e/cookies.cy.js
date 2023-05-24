import { cookiesUrl } from "../support/helpers/url-helpers"
describe('Cookies', () => {

  const cookiesBanner = () => { return cy.get('.govuk-cookie-banner') }
  const cookiesForm = () => { return cy.contains('Change your cookie settings').next(`form[action='${cookiesUrl()}']`) }
  const cookiesSuccessBannerExists = () => {
    cy.get('.govuk-notification-banner__content')
    .contains('Your cookie settings were saved Government services may set additional cookies and, if so, will have their own cookie policy and banner. Go to UK Market Conformity Assessment Bodies homepage')
    .find('a', 'Go to UK Market Conformity Assessment Bodies homepage').should('have.attr', 'href', '/')
  }

  it('banner is displayed until user accepts or rejects cookies', () => {
    cy.ensureOn('/')
    cookiesBanner().contains('h2', 'Cookies on UK Market Conformity Assessment Bodies')
    cookiesBanner().contains('a', 'View cookies').and('have.attr', 'href', cookiesUrl())
    cy.reload()
    cookiesBanner().should('exist')
    cookiesBanner().contains('button', 'Accept analytics cookies').click()
    cookiesBanner().should('not.exist')
    cy.clearCookies()
    cy.reload()
    cookiesBanner().should('exist')
    cookiesBanner().contains('button', 'Reject analytics cookies').click()
    cookiesBanner().should('not.exist')
  })
  
  it('can be saved via cookies page', () => {
    cy.ensureOn(cookiesUrl())
    cookiesBanner().should('exist')
    cookiesForm().within(() => {
      cy.contains('No').click()
      cy.contains('button', 'Save cookie settings').click()
    })
    cookiesSuccessBannerExists()    
    cookiesBanner().should('not.exist')
    
    cy.clearCookies()
    cy.reload()
    cookiesBanner().should('exist')
    
    cookiesForm().within(() => {
      cy.contains('Yes').click()
      cy.contains('button', 'Save cookie settings').click()
    })
    cookiesSuccessBannerExists() 
    cookiesBanner().should('not.exist')
  })
})