  import * as CabHelpers from '../support/helpers/cab-helpers'

describe('CAB profile page', () => {
  
  const DEFAULT_VALUE = "Not provided"
  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"})
  }

  const spacedFormatted = (values) => {
    return values ? values.join(' ') : DEFAULT_VALUE
  }

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
      cy.ensureOn(CabHelpers.cabProfilePage(cab.id))
    })
  })

  it('displays CAB name heading', function() {
    cy.get('.govuk-heading-l').contains(this.cab.name)
  })

  it('displays published and updated date', function() {
    cy.contains(`Published: ${formattedDate(this.cab.publishedDate) ?? DEFAULT_VALUE}`)
    cy.contains(`Last updated: ${formattedDate(this.cab.lastUpdatedDate)}`)
  })

  context('when viewing Details', function() {

    it('displays all expected CAB details', function() {
      cy.contains('.cab-detail-section', 'About').within(() => {
        cy.hasKeyValueDetail('CAB name', this.cab.name)
        cy.hasKeyValueDetail('UKAS reference number', DEFAULT_VALUE)
      })
      cy.contains('.cab-detail-section', 'Contact details').within(() => {
        cy.hasKeyValueDetail('Address', this.cab.address ?? DEFAULT_VALUE)
        cy.hasKeyValueDetail('Website', this.cab.website).and('have.attr', 'href', 'https://' + this.cab.website)
        cy.hasKeyValueDetail('Email', this.cab.email).and('have.attr', 'href', `mailto: ${this.cab.email}`)
        cy.hasKeyValueDetail('Phone', this.cab.phone ?? DEFAULT_VALUE)
        cy.hasKeyValueDetail('Registered office location', this.cab.registeredOfficeLocation ?? DEFAULT_VALUE)
      })
      cy.contains('.cab-detail-section', 'Body details').within(() => {
        cy.hasKeyValueDetail('Registered test location', spacedFormatted(this.cab.testingLocations))
        cy.hasKeyValueDetail('Body number', this.cab.bodyNumber ?? DEFAULT_VALUE)
        cy.hasKeyValueDetail('Body type', spacedFormatted(this.cab.bodyTypes))
        cy.hasKeyValueDetail('Legislative area', spacedFormatted(this.cab.legislativeAreas))
      })
    })
  })

  context('when viewing Product Schedules', function() {

    beforeEach(() => {
      cy.contains('#tab_product-schedules', 'Product schedules').click()
    })

    it('displays downloadable list of uploaded schedules', function() {
      cy.contains('.cab-detail-section', 'Product schedules').within(() => {
        this.cab.pdfs.forEach((pdf,index) => {
          // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
          cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
          cy.get('.cab-profile-file-list-item a').eq(index).click()
          cy.readFile(`cypress/downloads/${pdf.fileName}`)
        })
      })
    })
  })

})