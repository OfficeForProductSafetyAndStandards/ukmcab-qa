import {header} from "../../support/helpers/common-helpers"
import * as SearchHelpers from '../../support/helpers/search-helpers'
import * as CabHelpers from "../../support/helpers/cab-helpers"
import Cab from '../../support/domain/cab'
import {valueOrNotProvided} from "../../support/helpers/formatters"

describe('CAB Search', () => {
    const checkPagination = (paginationContainer, previous, current, next) => {
        paginationContainer.within(() => {
            if (previous) {
                cy.contains('Previous').should('have.attr', 'href', `/?pagenumber=${previous}`);
            } else {
                cy.contains('Previous').should('not.exist');
            }
            cy.contains(current).should('not.have.attr', 'href');
            if (next) {
                cy.contains('Next').should('have.attr', 'href', `/?pagenumber=${next}`);
            } else {
                cy.contains('Next').should('not.exist');
            }
        });
    };
    beforeEach(() => {
        cy.ensureOn(SearchHelpers.searchPath())
    })

    context('when logged in and searches existing cabs', function () {

        beforeEach(() => {
            cy.loginAsOpssUser()
            cy.ensureOn(SearchHelpers.searchPath())
            cy.reload()
        })

        it.skip('displays expected information for each result', function () {
            SearchHelpers.azureSearchResults('', {orderby: 'Name'}).then(expectedResults => {
                SearchHelpers.displayedSearchResults().then(displayedResults => {
                    Cypress._.zip(displayedResults.slice(0, 20), expectedResults.slice(0, 20)).forEach(([$displayedResult, expectedResult]) => {
                        cy.wrap($displayedResult).contains('h3 a', expectedResult.name).and('have.attr', 'href', expectedResult.path + '?returnUrl=%252F')
                        if (expectedResult.isDraft) {
                            cy.wrap($displayedResult).find('li').eq(0).contains(`Status: ${expectedResult.status} User group: ${expectedResult.lastUserGroup.toUpperCase()}`)
                        } else {
                            cy.wrap($displayedResult).find('li').eq(0).contains('Status: ' + expectedResult.status)
                        }
                        cy.wrap($displayedResult).find('li').eq(1).should('have.text', 'Address: ' + valueOrNotProvided(expectedResult.addressLines.join(', ')))
                        cy.wrap($displayedResult).find('li').eq(2).should('have.text', 'Body type: ' + expectedResult.bodyTypesFormatted)
                        cy.wrap($displayedResult).find('li').eq(3).should('have.text', 'Registered office location: ' + valueOrNotProvided(expectedResult.registeredOfficeLocation))
                        cy.wrap($displayedResult).find('li').eq(4).should('have.text', 'Testing location: ' + expectedResult.testingLocationsFormatted)
                        cy.wrap($displayedResult).find('li').eq(5).should('have.text', 'Legislative area: ' + expectedResult.legislativeAreasFormatted)
                    })
                })
            })
        })

        it.skip('displays expected filter categories and selections', function () {
            SearchHelpers.azureSearchResults('').then(expectedResults => {
                cy.get('.search-filter-option h3').contains('Body type').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(SearchHelpers.bodyTypeFilterOptions(expectedResults))
                        cy.log(`Azure body type fileter elements are  ${SearchHelpers.bodyTypeFilterOptions(expectedResults)} and actual filter results are ${filterOptions}`)

                    })
                cy.get('.search-filter-option h3').contains('Registered office location').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        cy.log(`Azure body type fileter elements are  ${SearchHelpers.registeredOfficeLocationFilterOptions(expectedResults)} and actual filter results are ${filterOptions}`)
                        expect(filterOptions).to.eql(SearchHelpers.registeredOfficeLocationFilterOptions(expectedResults))
                    })
                cy.get('.search-filter-option h3').contains('Legislative area').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(SearchHelpers.legislativeAreaFilterOptions(expectedResults))
                    })
                cy.get('.search-filter-option h3').contains('Status').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(['Draft', 'Published', 'Archived'])
                    })
                cy.get('.search-filter-option h3').contains('User groups').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(['OPSS', 'UKAS'])
                    })
            })
        })

        it.skip('displays correct results for Status filters', function () {
            const filterOptions = {"Status": ['Draft', 'Archived']}
            SearchHelpers.filterByStatus(['Draft', 'Archived'])
            SearchHelpers.azureSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'Name'
            }).then(expectedResults => {
                const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                    const actualCabs = Cypress._.map(actualResults, 'innerText')
                    // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                    expect(actualCabs).to.eql(expectedCabs)
                })
            })
        })

        it.skip('displays correct results for User Group filters', function () {
            const filterOptions = {"UserGroups": ['OPSS', 'UKAS']}
            SearchHelpers.filterByUserGroup(['OPSS', 'UKAS'])
            SearchHelpers.azureSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'Name'
            }).then(expectedResults => {
                const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                    const actualCabs = Cypress._.map(actualResults, 'innerText')
                    // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                    expect(actualCabs).to.eql(expectedCabs)
                })
            })
        })
        //skipping due to result set returned from azure search greater than 1000 limit
        it.skip('displays correct results for filters on multiple categories', function () {
            const filterOptions = {
                "BodyTypes": ['Approved body'],
                "Status": ['Draft', 'Published'],
                "UserGroups": ['OPSS']
            }
            SearchHelpers.filterByBodyType(['Approved body'])
            SearchHelpers.filterByStatus(['Draft', 'Published'])
            SearchHelpers.filterByUserGroup(['OPSS'])
            SearchHelpers.azureSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'Name'
            }).then(expectedResults => {
                const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                    const actualCabs = Cypress._.map(actualResults, 'innerText')
                    // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                    expect(actualCabs).to.eql(expectedCabs)
                })
            })
        })
    })

    context('when logged in while searching new cabs', function () {

        beforeEach(() => {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.buildWithoutDocuments()).as('cab')
        })

        it('displays newly created cab in search results', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(SearchHelpers.searchPath())
            SearchHelpers.sortView('Last updated')
            cy.reload()
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                cy.wrap(actualCabs).should('include', this.cab._name);
            })
        })
    })

    it('is accessible via Search link in header', function () {
        header().contains('a', 'Search').should('have.attr', 'href', SearchHelpers.searchPath())
    })

    context('when viewing search results', function () {
        const filterOptions = {"Status": ['Published']}
        it.skip('displays pagination top and bottom', function () {
            SearchHelpers.azureSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'RandomSort asc'
            }).then(cabs => {
                SearchHelpers.topPagination().contains(`Showing 1 - 20 of ${cabs.length} bodies`)
                SearchHelpers.bottomPagination().contains(`Showing 1 - 20 of ${cabs.length} bodies`)
            })
        })

        it('paginates correctly', function () {
            cy.loginAsOpssUser()
            cy.reload()

            cy.get('.search-results-pagination-container', {timeout: 15000}).should('be.visible');

            // Default order
            SearchHelpers.topPagination().then($pagination => {
                if ($pagination.length > 0) {
                    checkPagination(SearchHelpers.topPagination(), null, '1', '2');

                    // Paginate once forward
                    cy.contains('Next').click({force: true});
                    cy.get('.search-results-pagination-container').should('be.visible');
                    checkPagination(SearchHelpers.topPagination(), '1', '2', '3');

                    // Paginate once backward
                    cy.contains('Previous').click({force: true});
                    cy.get('.search-results-pagination-container').should('be.visible');
                    checkPagination(SearchHelpers.topPagination(), null, '1', '2');

                    // Paginate once forward using the next link
                    cy.contains('Next').click({force: true});
                    cy.get('.search-results-pagination-container').should('be.visible');
                    checkPagination(SearchHelpers.topPagination(), '1', '2', '3');
                } else {
                    cy.log('No pagination found');
                }
            });
        });

        //skipping due to result set returned from azure search greater than 1000 limit
        it.skip('displays randomly sorted results by default', function () {
            const filterOptions = {"Status": ['Published']}
            SearchHelpers.azureSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'RandomSort asc'
            }).then(expectedResults => {
                const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                    const actualCabs = Cypress._.map(actualResults, 'innerText')
                    // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                    expect(actualCabs).to.eql(expectedCabs)
                })
            })
        })


        it.skip('displays expected information for each result', function () {
            SearchHelpers.azureSearchResults('', {orderby: 'RandomSort asc'}).then(expectedResults => {
                SearchHelpers.displayedSearchResults().then(displayedResults => {
                    Cypress._.zip(displayedResults.slice(0, 20), expectedResults.slice(0, 20)).forEach(([$displayedResult, expectedResult]) => {
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

    context('when searching', function () {
        it('displays all search results for no input search', function () {
            SearchHelpers.searchCab('')
            SearchHelpers.topPagination().contains(`Showing 1 - 20`)
        })

        it('displays no results found if no results matches', function () {
            cy.ensureOn('/?Keywords=NonMatchingInput')
            cy.contains('Showing 0 bodies')
            cy.contains('There are no matching results.')
            cy.contains('Please try:')
            cy.contains('li', 'removing filters')
            cy.contains('li', 'double-checking your spelling')
            cy.contains('li', 'use fewer keywords')
            cy.contains('li', 'searching for something less specific')
        })

        it.skip('displays correct results by searching across all CAB metadata', function () {
            CabHelpers.getTestCabWithCabNumber().then(cab => {
                // set some test keywords from a published test cab as some cabs can be archived!
                let name = 'Limited'
                let address = 'London'
                let cabNumber = cab.cabNumber
                let bodyType = 'overseas body'
                let legislativeArea = 'equipment'
                let registeredOfficeLocation = 'United Kingdom'
                let email = '.co.uk'
                const keywords = [name, address, cabNumber, bodyType, legislativeArea, registeredOfficeLocation, email]
                keywords.forEach(keyword => {
                    SearchHelpers.searchCab(keyword)
                    SearchHelpers.publishedSearchResults(keyword).then(expectedResults => {
                        const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                        SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                            const actualCabs = Cypress._.map(actualResults, 'innerText')
                            // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                            expect(actualCabs).to.eql(expectedCabs)
                        })
                    })
                })
            })
        })
    })

    context('when filtering search results', function () {
        it.skip('displays expected filter categories and selections', function () {
            SearchHelpers.publishedSearchResults('').then(expectedResults => {

                cy.get('.search-filter-option h3').contains('Body type').next('.search-filter-option-list').find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(SearchHelpers.bodyTypeFilterOptions(expectedResults))
                    })
                cy.get('.search-filter-option h3').contains('Registered office location').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(SearchHelpers.registeredOfficeLocationFilterOptions(expectedResults))
                    })
                cy.get('.search-filter-option h3').contains('Legislative area').next().find('.search-filter-option-item label')
                    .then(($els) => {
                        const filterOptions = Cypress._.map($els, 'innerText')
                        expect(filterOptions).to.eql(SearchHelpers.legislativeAreaFilterOptions(expectedResults))
                    })
            })
        })

        it.skip('displays correct results for Body type filters', function () {
            const filterOptions = {"BodyTypes": ['Approved body', 'Overseas body']}
            SearchHelpers.filterByBodyType(['Approved body', 'Overseas body'])
            SearchHelpers.publishedSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'RandomSort asc'
            }).then(expectedResults => {
                const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                    const actualCabs = Cypress._.map(actualResults, 'innerText')
                    SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                    expect(actualCabs).to.eql(expectedCabs)
                })
            })
        })

        it.skip('displays correct results for Registered office location filters', function () {
            const filterOptions = {"RegisteredOfficeLocation": ['United Kingdom']}
            SearchHelpers.filterByRegisteredofficeLocation(['United Kingdom'])
            SearchHelpers.publishedSearchResults('', {
                filter: SearchHelpers.buildFilterQuery(filterOptions),
                orderby: 'RandomSort asc'
            }).then(expectedResults => {
                const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
                SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                    const actualCabs = Cypress._.map(actualResults, 'innerText')
                    // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                    expect(actualCabs).to.eql(expectedCabs)
                })
            })
        })

        // Removed as part of UKMCAB - 831 but may return in future so keeping commented out
        // it('displays correct results for Testing location filters', function () {
        //   const filterOptions = { "TestingLocations": ['United Kingdom'] }
        //   SearchHelpers.filterByTestingLocation(['United Kingdom'])
        //   SearchHelpers.publishedSearchResults('', { filter: SearchHelpers.buildFilterQuery(filterOptions), orderby: 'RandomSort asc' }).then(expectedResults => {
        //     const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
        //     SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
        //       const actualCabs = Cypress._.map(actualResults, 'innerText')
        //       SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
        //       expect(actualCabs).to.eql(expectedCabs)
        //     })
        // })
    })

    it.skip('displays correct results for Legislative area filters', function () {
        const filterOptions = {"LegislativeAreas": ['Construction products', 'Electromagnetic compatibility']}
        SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
        SearchHelpers.publishedSearchResults('', {
            filter: SearchHelpers.buildFilterQuery(filterOptions),
            orderby: 'RandomSort asc'
        }).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('displays correct results for filters on multiple categories', function () {
        const filterOptions = {
            "BodyTypes": ['Approved body', 'Overseas body'],
            "LegislativeAreas": ['Construction products', 'Electromagnetic compatibility']
        }
        SearchHelpers.filterByBodyType(['Approved body', 'Overseas body'])
        SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
        SearchHelpers.publishedSearchResults('', {
            filter: SearchHelpers.buildFilterQuery(filterOptions),
            orderby: 'RandomSort asc'
        }).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('displays correct results when filtering on keyword search', function () {
        SearchHelpers.searchCab('Limited')
        const filterOptions = {"LegislativeAreas": ['Construction products', 'Electromagnetic compatibility']}
        SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
        SearchHelpers.publishedSearchResults('Limited', {filter: SearchHelpers.buildFilterQuery(filterOptions)}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it('displays applied filters above the search results', function () {
        const bodyTypes = ['Approved body', 'Overseas body']
        const legislativeAreas = ['Construction products', 'Electromagnetic compatibility']
        SearchHelpers.filterByBodyType(bodyTypes)
        SearchHelpers.filterByLegislativeArea(legislativeAreas)
        SearchHelpers.hasAppliedFilters(bodyTypes.concat(legislativeAreas))
    })

    it.skip('displays correct results when some of the applied filters are removed', function () {
        const bodyTypes = ['Approved body', 'Overseas body']
        const legislativeAreas = ['Construction products', 'Electromagnetic compatibility']
        SearchHelpers.filterByBodyType(bodyTypes)
        SearchHelpers.filterByLegislativeArea(legislativeAreas)
        const filterOptions = {"BodyTypes": ['Overseas body'], "LegislativeAreas": ['Electromagnetic compatibility']}
        SearchHelpers.removeFromTopFilters(['Approved body', 'Construction products'])
        SearchHelpers.publishedSearchResults('', {
            filter: SearchHelpers.buildFilterQuery({
                "BodyTypes": ['Overseas body'],
                "LegislativeAreas": ['Electromagnetic compatibility']
            }), orderby: 'RandomSort asc'
        }).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('clears all applied filters and displays default results when filters are cleared', function () {
        SearchHelpers.searchCab('Limited')
        SearchHelpers.filterByLegislativeArea(['Construction products', 'Electromagnetic compatibility'])
        cy.contains('Remove all filters').click()
        SearchHelpers.publishedSearchResults('', {orderby: 'RandomSort asc'}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })
})

//skipping due to result set returned from azure search greater than 1000 limit
context('when sorting search results', function () {
    it.skip('displays correct sort order for - Last updated', function () {
        SearchHelpers.sortView('Last updated')
        SearchHelpers.publishedSearchResults('', {orderby: 'LastUpdatedDate desc'}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('displays correct sort order for - A to Z', function () {
        SearchHelpers.sortView('A to Z')
        SearchHelpers.publishedSearchResults('', {orderby: 'Name'}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('displays correct sort order for - Z to A', function () {
        SearchHelpers.sortView('Z to A')
        SearchHelpers.publishedSearchResults('', {orderby: 'Name desc'}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                // SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('mainatains sort order when paginating', function () {
        SearchHelpers.sortView('Z to A')
        SearchHelpers.topPagination().contains('a', '2').click({force: true})
        SearchHelpers.publishedSearchResults('', {orderby: 'Name desc'}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(20, 40).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                expect(actualCabs).to.eql(expectedCabs)
            })
        })
    })

    it.skip('resets to page 1 if sort order is changed', function () {
        SearchHelpers.sortView('Z to A')
        SearchHelpers.topPagination().contains('a', '2').click({force: true})
        SearchHelpers.sortView('A to Z')
        SearchHelpers.publishedSearchResults('', {orderby: 'Name asc'}).then(expectedResults => {
            const expectedCabs = expectedResults.slice(0, 20).map(r => r.name)
            SearchHelpers.displayedSearchResults().find('h3').then(actualResults => {
                const actualCabs = Cypress._.map(actualResults, 'innerText')
                expect(actualCabs).to.eql(expectedCabs)
                SearchHelpers.topPagination().contains(`Showing 1 - ${expectedCabs.length} of ${expectedResults.length} bodies`)
            })
        })
    })
})


