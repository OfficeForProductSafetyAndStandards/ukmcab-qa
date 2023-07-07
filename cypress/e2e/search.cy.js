import { header } from "../support/helpers/common-helpers"
import * as SearchHelpers from '../support/helpers/search-helpers'
import * as CabHelpers from "../support/helpers/cab-helpers"
import { valueOrNotProvided } from "../support/helpers/formatters"

describe('CAB Search', () => {

  beforeEach(() => {
    cy.ensureOn(SearchHelpers.searchPath())
  })

  it('is accessible via Search link in header', function() {
    header().contains('a', 'Search').should('have.attr', 'href', SearchHelpers.searchPath())
  })

  context('when viewing search results', function() {
    it('displays pagination top and bottom', function() {
      CabHelpers.getAllPublishedCabs().then(cabs => {
        SearchHelpers.topPagination().contains(`Showing 1 - 20 of ${cabs.length} bodies`)
        SearchHelpers.bottomPagination().contains(`Showing 1 - 20 of ${cabs.length} bodies`)
      })
    })

    it('paginates correctly', function() {
      SearchHelpers.topPagination().within(() => {
        // Default order
        cy.get('li').eq(0).find('a').should('not.exist')
        cy.get('li').eq(0).should('have.text', '1')
        cy.get('li').eq(1).find('a').should('have.attr', 'href', '/?pagenumber=2').and('have.text', '2')
        cy.get('li').eq(2).find('a').should('have.attr', 'href', '/?pagenumber=3').and('have.text', '3')
        cy.get('li').eq(3).find('a').should('have.attr', 'href', '/?pagenumber=4').and('have.text', '4')
        cy.get('li').eq(4).find('a').should('have.attr', 'href', '/?pagenumber=5').and('have.text', '5')
        cy.get('li').eq(5).find('a').should('have.attr', 'href', '/?pagenumber=2').and('have.text', 'Next')

        // Paginate once forward
        cy.get('li').eq(5).contains('Next').click()
        cy.get('li').eq(0).find('a').should('have.attr', 'href', '/?pagenumber=1').and('have.text', 'Previous')
        cy.get('li').eq(1).find('a').should('have.attr', 'href', '/?pagenumber=1').and('have.text', '1')
        cy.get('li').eq(2).find('a').should('not.exist')
        cy.get('li').eq(2).should('have.text', '2')
        cy.get('li').eq(3).find('a').should('have.attr', 'href', '/?pagenumber=3').and('have.text', '3')
        cy.get('li').eq(4).find('a').should('have.attr', 'href', '/?pagenumber=4').and('have.text', '4')
        cy.get('li').eq(5).find('a').should('have.attr', 'href', '/?pagenumber=5').and('have.text', '5')
        cy.get('li').eq(6).find('a').should('have.attr', 'href', '/?pagenumber=3').and('have.text', 'Next')

        // Paginate once a few pages ahead
        cy.get('li').eq(5).contains('5').click({force: true})
        cy.get('li').eq(0).find('a').should('have.attr', 'href', '/?pagenumber=4').and('have.text', 'Previous')
        cy.get('li').eq(1).find('a').should('have.attr', 'href', '/?pagenumber=3').and('have.text', '3')
        cy.get('li').eq(2).find('a').should('have.attr', 'href', '/?pagenumber=4').and('have.text', '4')
        cy.get('li').eq(3).find('a').should('not.exist')
        cy.get('li').eq(3).should('have.text', '5')
        cy.get('li').eq(4).find('a').should('have.attr', 'href', '/?pagenumber=6').and('have.text', '6')
        cy.get('li').eq(5).find('a').should('have.attr', 'href', '/?pagenumber=7').and('have.text', '7')
        cy.get('li').eq(6).find('a').should('have.attr', 'href', '/?pagenumber=6').and('have.text', 'Next')
      })
    })

    it('displays randomly sorted results by default', function() {
      SearchHelpers.azureSearchResults('', {orderby: 'RandomSort asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays expected information for each result', function() {
      SearchHelpers.azureSearchResults('', {orderby: 'RandomSort asc'}).then(expectedResults => {
        SearchHelpers.displayedSearchResults().then(displayedResults => {
          Cypress._.zip(displayedResults.slice(0,20), expectedResults.slice(0,20)).forEach(([$displayedResult, expectedResult]) => {
            cy.wrap($displayedResult).contains('h3 a', expectedResult.name).and('have.attr', 'href', CabHelpers.cabProfilePage(expectedResult) + '?returnUrl=%252F')
            cy.wrap($displayedResult).find('li').eq(0).should('have.text', 'Address: ' + valueOrNotProvided(expectedResult.addressLines.join(', ')))
            cy.wrap($displayedResult).find('li').eq(1).should('have.text', 'Body type: ' + expectedResult.bodyTypesFormatted)
            cy.wrap($displayedResult).find('li').eq(2).should('have.text', 'Registered office location: ' + expectedResult.registeredOfficeLocation)
            cy.wrap($displayedResult).find('li').eq(3).should('have.text', 'Testing location: ' + expectedResult.testingLocationsFormatted)
            cy.wrap($displayedResult).find('li').eq(4).should('have.text', 'Legislative area: ' + expectedResult.legislativeAreasFormatted)
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
      CabHelpers.getTestCab().then(cab => {
        // set some test keywords from a published test cab as some cabs can be archived!
        let name = 'Limited'
        let address = 'United Kingdom'
        let cabNumber = cab.cabNumber
        let bodyType = 'overseas body'
        let legislativeArea = 'equipment'
        let registeredOfficeLocation = 'United Kingdom'
        let email = '.co.uk'
        const keywords = [name, address, cabNumber, bodyType, legislativeArea, registeredOfficeLocation, email]
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
  })

  context('when filtering search results', function() {
    it('displays expected filter categories and selections', function() {
      CabHelpers.getDistinctBodyTypes().then(bodyTypes => {
        cy.get('.search-filter-option h3').contains('Body type').next().find('.search-filter-option-item label')
        .then(($els) => {
          const filterOptions = Cypress._.map($els, 'innerText')
          expect(filterOptions).to.eql(bodyTypes)
        })
      })
      CabHelpers.getDistinctRegisteredOfficeLocations().then(registeredOfficeLocations => {
        cy.get('.search-filter-option h3').contains('Registered office location').next().find('.search-filter-option-item label')
        .then(($els) => {
          const filterOptions = Cypress._.map($els, 'innerText')
          expect(filterOptions).to.eql(registeredOfficeLocations)
        })
      })
      // Removed as part of UKMCAB-831 but may return in future so keeping commented out
      // CabHelpers.getDistinctTestingLocations().then(testingLocations => {
      //   cy.get('.search-filter-option h3').contains('Testing location').next().find('.search-filter-option-item label')
      //   .then(($els) => {
      //     const filterOptions = Cypress._.map($els, 'innerText')
      //     expect(filterOptions).to.eql(testingLocations)
      //   })
      // })
      CabHelpers.getDistinctLegislativeAreas().then(legislativeAreas => {
        cy.get('.search-filter-option h3').contains('Legislative area').next().find('.search-filter-option-item label')
        .then(($els) => {
          const filterOptions = Cypress._.map($els, 'innerText')
          expect(filterOptions).to.eql(legislativeAreas)
        })
      })
    })

    it('displays correct results for Body type filters', function() {
      const filterOptions = {"BodyTypes": ['Approved body', 'Overseas body']}
      SearchHelpers.filterByBodyType(['Approved body', 'Overseas body'])
      SearchHelpers.azureSearchResults('', {filter: SearchHelpers.buildFilterQuery(filterOptions), orderby: 'RandomSort asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays correct results for Registered office location filters', function() {
      const filterOptions = {"RegisteredOfficeLocation": ['United Kingdom']}
      SearchHelpers.filterByRegisteredofficeLocation(['United Kingdom'])
      SearchHelpers.azureSearchResults('', {filter: SearchHelpers.buildFilterQuery(filterOptions), orderby: 'RandomSort asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    // Removed as part of UKMCAB-831 but may return in future so keeping commented out
    // it('displays correct results for Testing location filters', function() {
    //   const filterOptions = {"TestingLocations": ['United Kingdom']}
    //   SearchHelpers.filterByTestingLocation(['United Kingdom'])
    //   SearchHelpers.azureSearchResults('', {filter: SearchHelpers.buildFilterQuery(filterOptions), orderby: 'RandomSort asc'}).then(expectedResults => {
    //     const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
    //     SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
    //       const actualCabs = Cypress._.map(actualResults, 'innerText')
    //       SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
    //       expect(actualCabs).to.eql(expectedCabs)
    //     })
    //   })
    // })

    it('displays correct results for Legislative area filters', function() {
      const filterOptions = {"LegislativeAreas": ['Construction products', 'Electromagnetic compatibility']}
      SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
      SearchHelpers.azureSearchResults('', {filter: SearchHelpers.buildFilterQuery(filterOptions), orderby: 'RandomSort asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays correct results for filters on multiple categories', function() {
      const filterOptions = {"BodyTypes": ['Approved body', 'Overseas body'], "LegislativeAreas": ['Construction products', 'Electromagnetic compatibility']}
      SearchHelpers.filterByBodyType(['Approved body', 'Overseas body'])
      SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
      SearchHelpers.azureSearchResults('', {filter: SearchHelpers.buildFilterQuery(filterOptions), orderby: 'RandomSort asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays correct results when filtering on keyword search', function() {
      SearchHelpers.searchCab('Limited')
      const filterOptions = {"LegislativeAreas": ['Construction products', 'Electromagnetic compatibility']}
      SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
      SearchHelpers.azureSearchResults('Limited', {filter: SearchHelpers.buildFilterQuery(filterOptions)}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('clears all applied filters and displays default results when filters are cleared', function() {
      SearchHelpers.searchCab('Limited')
      SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
      cy.contains('Remove all filters').click()
      SearchHelpers.azureSearchResults('', {orderby: 'RandomSort asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })
  })

  context('when sorting search results', function() {
    it('displays correct sort order for - Last updated', function() {
      SearchHelpers.sortView('Last updated')
      SearchHelpers.azureSearchResults('', {orderby: 'LastUpdatedDate desc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays correct sort order for - A to Z', function() {
      SearchHelpers.sortView('A to Z')
      SearchHelpers.azureSearchResults('', {orderby: 'Name'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('displays correct sort order for - Z to A', function() {
      SearchHelpers.sortView('Z to A')
      SearchHelpers.azureSearchResults('', {orderby: 'Name desc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('mainatains sort order when paginating', function() {
      SearchHelpers.sortView('Z to A')
      SearchHelpers.topPagination().contains('a', '2').click({force: true})
      SearchHelpers.azureSearchResults('', {orderby: 'Name desc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(20,40).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          expect(actualCabs).to.eql(expectedCabs)
        })
      })
    })

    it('resets to page 1 if sort order is changed', function() {
      SearchHelpers.sortView('Z to A')
      SearchHelpers.topPagination().contains('a', '2').click({force: true})
      SearchHelpers.sortView('A to Z')
      SearchHelpers.azureSearchResults('', {orderby: 'Name asc'}).then(expectedResults => {
        const expectedCabs = expectedResults.slice(0,20).map(r => r.name)
        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
          const actualCabs = Cypress._.map(actualResults, 'innerText')
          expect(actualCabs).to.eql(expectedCabs)
          SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
        })
      })
    })
  })
})