  import {basicAuthCreds} from '../support/helpers/common-helpers'

describe('CAB profile page', () => {
  
  beforeEach(() => {
    // cy.task('getItems').then(items => {
    //   cy.wrap(items[0]).as('cab')
    //   cy.visit('/find-a-cab/profile', {...{qs: {id: items[0].id}}, ...basicAuthCreds()})
    // })
    // Use the only Test CAB available right now. To be read from DB later om after DEV work complete
    cy.ensureOn('/find-a-cab/cab-profile/9e521c41-e511-4099-9c8e-07891cc23f4d')
  })

  
  // TODO - TEST below have hardcoded assertions as BackEnd Data Model isn't Dev ready yet
  it('displays CAB name heading', function() {
    cy.contains('.govuk-heading-l', 'CATG Ltd')
  })

  it('displays published and updated date', function() {
    cy.contains('Published: 3 Dec 2020')
    cy.contains('Last updated: 31 Oct 2019')
  })

  context('when viewing Details', function() {

    it('displays all expected CAB details', function() {
      cy.contains('.cab-detail-section', 'About').within(() => {
        cy.hasKeyValueDetail('CAB name', 'CATG Ltd')
        cy.hasKeyValueDetail('UKAS reference number', '12345-6789')
      })
      cy.contains('.cab-detail-section', 'Contact details').within(() => {
        cy.hasKeyValueDetail('Address', '29a Prince CrescentMorecambeLA4 6BYUnited Kingdom')
        cy.hasKeyValueDetail('Website', 'catg.co.uk').and('have.attr', 'href', 'https://catg.co.uk')
        cy.hasKeyValueDetail('Email', 'info@catg.co.uk').and('have.attr', 'href', 'mailto: info@catg.co.uk')
        cy.hasKeyValueDetail('Phone', '+44 (0) 1542 400632')
        cy.hasKeyValueDetail('Registered office location', 'France Italy United Kingdom')
      })
      cy.contains('.cab-detail-section', 'Body details').within(() => {
        cy.hasKeyValueDetail('Registered test location', 'France Italy United Kingdom')
        cy.hasKeyValueDetail('Body number', '1245')
        cy.hasKeyValueDetail('Body type', 'Approved body NI Notified body')
        cy.hasKeyValueDetail('Legislative area', 'Construction products')
      })
    })
  })

  context('when viewing Product Schedules', function() {

    beforeEach(() => {
      cy.contains('#tab_product-schedules', 'Product schedules').click()
    })

    it('displays downloadable list of uploaded schedules', function() {
      cy.contains('.cab-detail-section', 'Product schedules').within(() => {
        // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
        cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
        cy.contains('a', '20230125111150-css-cheat-sheet-v1.pdf').click()
        cy.readFile('cypress/downloads/20230125111150-css-cheat-sheet-v1.pdf')
      })
    })
  })

})