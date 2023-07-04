import AzureCabResult from "../domain/azure-cab-result"
export const searchPath = () => { return '/'}

export const topPagination = () => { return cy.get('.search-results-pagination-container').eq(0)}
export const bottomPagination = () => { return cy.get('.search-results-pagination-container').eq(1)}

export const searchCab = (searchInput) => {
  cy.ensureOn(searchPath())
  cy.get('#Keywords').invoke('val', searchInput).next('button').click()
}

export const displayedSearchResults = () => {
  return cy.get('ul#search-results-list > li')
}

export const sortView = (choice) => {
  cy.get('#search-results-sort-container a').contains(choice).click()
}

export const filterByBodyType = (filters) => {
  _applyFilter('Body type', filters)
}

export const filterByRegisteredofficeLocation = (filters) => {
  _applyFilter('Registered office location', filters)
}

export const filterByTestingLocation = (filters) => {
  _applyFilter('Testing location', filters)
}

export const filterByLegislativeArea = (filters) => {
  _applyFilter('Legislative area', filters)
}

const _applyFilter = (filterGroup, filters) => {
  cy.get('.search-filter-option h3').contains(filterGroup).next().within(() => {
    filters.forEach(filter => {
      cy.contains('.search-filter-option-item label', filter).click({force: true})
    })
  })
}

export const azureSearchResults = (term, options) => {
  return cy.getSearchResults(term, options).then(results => {
    return results.map(result => new AzureCabResult(result))
  })
}

// TODO validate filter names
// e.g filters = {"BodyTypes": ['Approved', 'Overseas], "RegisteredOfficeLocation": [xxx, yyy], "TestingLocations: []"}
export const buildFilterQuery = (filterOptions) => {
  var filters = []
  Object.entries(filterOptions).forEach(([filterCategory, options]) => {
    if(filterCategory === 'RegisteredOfficeLocation') {
      filters.push(Array.from(options).map(option => `RegisteredOfficeLocation eq '${option}'`).join(' or '))
    } else {
      filters.push(`${filterCategory}\/any\(x\: ${Array.from(options).map(option => `x eq \'${option}\'`).join(' or ')}\)`)
    }
  })
  return filters.join(' and ')
}