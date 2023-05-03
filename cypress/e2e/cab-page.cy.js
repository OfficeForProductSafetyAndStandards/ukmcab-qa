  import * as CabHelpers from '../support/helpers/cab-helpers'
  import { date, valueOrNotProvided } from '../support/helpers/formatters'
  import { searchPath } from '../support/helpers/search-helpers'

describe('CAB profile page', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
      cy.ensureOn(CabHelpers.cabProfilePage(cab.cabId))
    })
  })

  it('displays CAB name heading', function() {
    cy.get('.govuk-heading-l').contains(this.cab.name)
  })

  it('has back to search results link', function() {
    cy.get('a').contains('Return to Search Results').and('has.attr', 'href', searchPath())
  })

  it('displays published and updated date', function() {
    cy.contains(`Published: ${date(this.cab.publishedDate).DMMMYYYY}`)
    cy.contains(`Last updated: ${date(this.cab.lastUpdatedDate).DMMMYYYY}`)
  })

  context('when viewing Details', function() {

    it('displays all expected CAB details', function() {
      cy.contains('.cab-detail-section', 'About').within(() => {
        cy.hasKeyValueDetail('CAB name', this.cab.name)
        cy.hasKeyValueDetail('UKAS reference number', valueOrNotProvided(this.cab.ukasRef))
      })
      cy.contains('.cab-detail-section', 'Contact details').within(() => {
        cy.hasKeyValueDetail('Address', this.cab.addressLines.join(', '))
        if(this.cab.website) {
          cy.hasKeyValueDetail('Website', this.cab.website).and('have.attr', 'href', this.cab.website)
        } else {
          valueOrNotProvided(this.cab.website)
        }
        if(this.cab.email) {
          cy.hasKeyValueDetail('Email', this.cab.email).and('have.attr', 'href', `mailto: ${this.cab.email}`)
        } else {
          valueOrNotProvided(this.cab.email)
        }
        cy.hasKeyValueDetail('Phone', this.cab.phone)
        cy.hasKeyValueDetail('Registered office location', this.cab.registeredOfficeLocation)
      })
      cy.contains('.cab-detail-section', 'Body details').within(() => {
        cy.hasKeyValueDetail('Registered test location', valueOrNotProvided(this.cab.testingLocations?.join(' ')))
        cy.hasKeyValueDetail('Body number', valueOrNotProvided(this.cab.cabNumber))
        cy.hasKeyValueDetail('Body type', this.cab.bodyTypes.join(' '))
        cy.hasKeyValueDetail('Legislative area', this.cab.legislativeAreas.join(' '))
      })
    })
  })

  context('when viewing Product Schedules', function() {

    beforeEach(() => {
      cy.contains('#tab_product-schedules', 'Product schedules').click()
    })

    it('displays downloadable list of uploaded schedules', function() {
      cy.contains('.cab-detail-section', 'Product schedules').within(() => {
        this.cab.schedules.forEach((schedule,index) => {
          // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
          cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
          cy.get('.cab-profile-file-list-item a').eq(index).click()
          cy.readFile(`cypress/downloads/${schedule.fileName}`)
        })
      })
    })
  })

})