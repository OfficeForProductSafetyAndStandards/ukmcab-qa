  import * as CabHelpers from '../support/helpers/cab-helpers'
  import { date, valueOrNotProvided } from '../support/helpers/formatters'
  import { searchPath } from '../support/helpers/search-helpers'

describe('CAB profile page', function() {

  beforeEach(function() {
    CabHelpers.getTestCabWithDocuments().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  const supportingDocumentsTab = () => {
    return cy.contains('#tab_supporting-documents', 'Supporting documents')
  }
  
  it('displays CAB name heading', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    cy.get('.govuk-heading-l').contains(this.cab.name)
  })

  it('has back to search results link', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    cy.get('a').contains('Back to Search Results').and('has.attr', 'href', searchPath())
  })
  
  it('displays published and updated date', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    cy.contains(`Published: ${date(this.cab.publishedDate).DMMMYYYY}`)
    cy.contains(`Last updated: ${date(this.cab.lastUpdatedDate).DMMMYYYY}`)
  })

  it('does not display Supporting Documents to logged out users', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    supportingDocumentsTab().should('not.exist')
  })
  
  context('when viewing Details', function() {
    
    it('displays all expected CAB details', function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      cy.contains('.cab-detail-section', 'About').within(() => {
        cy.hasKeyValueDetail('CAB name', this.cab.name)
        cy.hasKeyValueDetail('UKAS reference number', valueOrNotProvided(this.cab.ukasRef))
      })
      cy.contains('.cab-detail-section', 'Contact details').within(() => {
        cy.hasKeyValueDetail('Address', this.cab.addressLines.join(', '))
        if(this.cab.website) {
          cy.hasKeyValueDetail('Website', this.cab.website).and('have.attr', 'href', this.cab.website.startsWith('https://') ? this.cab.website : 'https://' + this.cab.website)
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
    
    beforeEach(function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      cy.contains('#tab_product-schedules', 'Product schedules').click()
    })
    
    it('displays viewable and downloadable list of uploaded schedules', function() {
      cy.contains('.cab-detail-section', 'Product schedules').within(() => {
        this.cab.schedules.forEach((schedule,index) => {
          // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
          cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
          cy.get('.govuk-summary-list__row').eq(index).within(() => {
            cy.get('dt').contains(schedule.label)
            cy.get('dd').eq(0).contains('a', 'View').should('have.attr', 'target', '_blank').invoke('attr', 'href').should('match', /^\/search\/cab-schedule-view/)
            cy.get('dd').eq(1).contains('a', 'Download').click()
            cy.readFile(`cypress/downloads/${schedule.fileName}`)
          })
        })
      })
    })
  })

  context('when viewing Supporting Documents', function() {
    
    beforeEach(function() {
      cy.login()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      supportingDocumentsTab().click()
    })

    it('displays viewable and downloadable list of supporting documents', function() {
      cy.contains('.cab-detail-section', 'Supporting documents').within(() => {
        this.cab.documents.forEach((document,index) => {
          // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
          cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
          cy.get('.govuk-summary-list__row').eq(index).within(() => {
            cy.get('dt').contains(document.fileName)
            if(document.fileName.endsWith('.pdf')) {
              cy.get('dd').eq(0).contains('a', 'View').should('have.attr', 'target', '_blank').invoke('attr', 'href').should('match', /^\/search\/cab-schedule-view/)
            } else {
              cy.get('dd').eq(0).contains('a', 'View').should('not.exist')
            }
            cy.get('dd').eq(1).contains('a', 'Download').click()
            cy.readFile(`cypress/downloads/${document.fileName}`)
          })
        })
      })
    })
  })

})