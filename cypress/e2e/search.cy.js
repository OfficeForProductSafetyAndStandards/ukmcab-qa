import { header } from "../support/helpers/common-helpers"
import * as SearchHelpers from '../support/helpers/search-helpers'
import * as DbHelpers from "../support/helpers/db-helpers"
import Cab from '../support/domain/cab'

describe('CAB Search', () => {

  beforeEach(() => {
    cy.ensureOn(SearchHelpers.searchPath())
  })

  it('is accessible via Search link in header', function() {
    header().contains('a', 'Search').should('have.attr', 'href', SearchHelpers.searchPath())
  })

  context('when viewing search results', function() {
    it('displays pagination top and bottom', function() {
      DbHelpers.getAllCabs().then(cabs => {
        SearchHelpers.topPagination().contains(`Showing 1 - 20 of ${cabs.length} bodies`)
        SearchHelpers.bottomPagination().contains(`Showing 1 - 20 of ${cabs.length} bodies`)
      })
    })

    it('paginates correctly', function() {
      SearchHelpers.topPagination().within(() => {
        // Default order
        cy.get('li').eq(0).find('a').should('not.exist')
        cy.get('li').eq(0).should('have.text', '1')
        cy.get('li').eq(1).find('a').should('have.attr', 'href', '/search?&pagenumber=2').and('have.text', '2')
        cy.get('li').eq(2).find('a').should('have.attr', 'href', '/search?&pagenumber=3').and('have.text', '3')
        cy.get('li').eq(3).find('a').should('have.attr', 'href', '/search?&pagenumber=4').and('have.text', '4')
        cy.get('li').eq(4).find('a').should('have.attr', 'href', '/search?&pagenumber=5').and('have.text', '5')
        cy.get('li').eq(5).find('a').should('have.attr', 'href', '/search?&pagenumber=2').and('have.text', 'Next')

        // Paginate once forward
        cy.get('li').eq(5).contains('Next').click()
        cy.get('li').eq(0).find('a').should('have.attr', 'href', '/search?&pagenumber=1').and('have.text', 'Previous')
        cy.get('li').eq(1).find('a').should('have.attr', 'href', '/search?&pagenumber=1').and('have.text', '1')
        cy.get('li').eq(2).find('a').should('not.exist')
        cy.get('li').eq(2).should('have.text', '2')
        cy.get('li').eq(3).find('a').should('have.attr', 'href', '/search?&pagenumber=3').and('have.text', '3')
        cy.get('li').eq(4).find('a').should('have.attr', 'href', '/search?&pagenumber=4').and('have.text', '4')
        cy.get('li').eq(5).find('a').should('have.attr', 'href', '/search?&pagenumber=5').and('have.text', '5')
        cy.get('li').eq(6).find('a').should('have.attr', 'href', '/search?&pagenumber=3').and('have.text', 'Next')

        // Paginate once a few pages ahead
        cy.get('li').eq(5).contains('5').click({force: true})
        cy.get('li').eq(0).find('a').should('have.attr', 'href', '/search?&pagenumber=4').and('have.text', 'Previous')
        cy.get('li').eq(1).find('a').should('have.attr', 'href', '/search?&pagenumber=3').and('have.text', '3')
        cy.get('li').eq(2).find('a').should('have.attr', 'href', '/search?&pagenumber=4').and('have.text', '4')
        cy.get('li').eq(3).find('a').should('not.exist')
        cy.get('li').eq(3).should('have.text', '5')
        cy.get('li').eq(4).find('a').should('have.attr', 'href', '/search?&pagenumber=6').and('have.text', '6')
        cy.get('li').eq(5).find('a').should('have.attr', 'href', '/search?&pagenumber=7').and('have.text', '7')
        cy.get('li').eq(6).find('a').should('have.attr', 'href', '/search?&pagenumber=6').and('have.text', 'Next')
      })
    })

    it('displays randomly sorted results by default', function() {
      SearchHelpers.azureSearchResults('', {orderBy: ['RandomSort asc']}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays expected information for each result', function() {
      SearchHelpers.azureSearchResults('', {orderBy: ['RandomSort asc']}).then(expectedResults => {
        SearchHelpers.displayedSearchResults().then(displayedResults => {
          Cypress._.zip(displayedResults.slice(0,20), expectedResults.slice(0,20)).forEach(([$displayedResult, expectedResult]) => {
            cy.wrap($displayedResult).contains('h3 a', expectedResult.name).and('have.attr', 'href', `/search/cab-profile/${expectedResult.id}`)
            cy.wrap($displayedResult).contains(expectedResult.address)
            cy.wrap($displayedResult).contains('Body type: ' + expectedResult.bodyTypesFormatted)
            cy.wrap($displayedResult).contains('Registered office location: ' + expectedResult.registeredOfficeLocation)
            cy.wrap($displayedResult).contains('Testing location: ' + expectedResult.testingLocationsFormatted)
            cy.wrap($displayedResult).contains('Legislative ares: ' + expectedResult.legislativeAreasFormatted)
          })
        })
      })
    })
  })

  context('when searching', function() {
    it('displays all search results for no input search', function() {
      SearchHelpers.searchCab('')
      SearchHelpers.topPagination().contains(`Showing 1 - 20`)
    })

    it('displays no results found if no results matches', function() {
      SearchHelpers.searchCab('NonMatchingInput')
      cy.contains('Showing 0 bodies')
      cy.contains('There are no matching results.')
      cy.contains('Please try:')
      cy.contains('li', 'removing filters')
      cy.contains('li', 'double-checking your spelling')
      cy.contains('li', 'use fewer keywords')
      cy.contains('li', 'searching for something less specific')
    })

    it('displays correct results by searching across all CAB metadata', function() {
      let name = 'Limited'
      let address = 'Rusholme'
      let bodyNumber = '8508'
      let bodyType = 'overseas body'
      let legislativeArea = 'equipment'
      let registeredOfficeLocation = 'United Kingdom'
      let email = 'www.RNelectronics.com'
      const keywords = [name, address, bodyNumber, bodyType, legislativeArea, registeredOfficeLocation, email]
      keywords.forEach(keyword => {
        SearchHelpers.searchCab(keyword)
        SearchHelpers.azureSearchResults(keyword).then(expectedResults => {
          const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
          SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
            const actualCabs = Cypress._.map(actualResults, 'innerText')
            SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
            expect(actualCabs).to.eql(expectedCabs)
          })
        })
      })
    })
  })

  context('when filtering search results', function() {
    it('displays expected filter options')
    it('displays correct results for Body type filters')
    it('displays correct results for Registered office location filters')
    it('displays correct results for Testing location filters')
    it('displays correct results for Legislative area filters')
    it('displays correct results for filters on multiple categories')
    it('displays default random results when filters are cleared')
  })

  context('when sorting search results', function() {
    it('displays correct sort order for - Last updated')
    it('displays correct sort order for - A to Z')
    it('displays correct sort order for - Z to A')
  })
})