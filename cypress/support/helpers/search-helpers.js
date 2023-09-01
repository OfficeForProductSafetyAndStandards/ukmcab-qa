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


export const bodyTypeFilterOptions = (searchResults) => {
  const bodyTypes = Cypress._.map(searchResults, 'bodyTypes').flat().filter(Boolean)
  return [...new Set(bodyTypes)].sort() // unique values
}

export const registeredOfficeLocationFilterOptions = (searchResults) => {
  const registeredOfficeLocations = Cypress._.map(searchResults, 'registeredOfficeLocation').flat().filter(Boolean)
  let registeredOfficeLocationsUnique = [...new Set(registeredOfficeLocations)]
  registeredOfficeLocationsUnique = Cypress._.without(registeredOfficeLocationsUnique, "United Kingdom")
  registeredOfficeLocationsUnique.sort().unshift("United Kingdom")
  return registeredOfficeLocationsUnique
}

export const legislativeAreaFilterOptions = (searchResults) => {
  const legislativeAreas = Cypress._.map(searchResults, 'legislativeAreas').flat().filter(Boolean)
  return [...new Set(legislativeAreas)].sort() // unique values
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

export const filterByStatus = (filters) => {
  _applyFilter('Status', filters)
}

const _applyFilter = (filterGroup, filters) => {
  cy.get('.search-filter-option h3').contains(filterGroup).next().within(() => {
    filters.forEach(filter => {
      cy.contains('.search-filter-option-item label', filter).click({force: true})
    })
  })
}

export const topFilterSelection = () => {
  return cy.get('#search-results-filter-list')
} 

export const hasAppliedFilters = (filters) => {
  topFilterSelection().within(() => {
    cy.get('a').eq(0).invoke('text')
    filters.forEach(filter => {
      cy.contains(filter + ' x')
    })
  })
} 

export const removeFromTopFilters = (filters) => {
  topFilterSelection().within(() => {
    filters.forEach(filter => {
      cy.contains('a', filter).click().should('not.exist')
    })
  })
} 

export const azureSearchResults = (term, options) => {
  return cy.getSearchResults(term, options).then(results => {
    return results.map(result => new AzureCabResult(result))
  })
}

export const publishedSearchResults = (term, options) => {
  return azureSearchResults(term, options).then(results => {
    return results.filter(result => result.status === 'Published')
  })
}

export const StatusValues = {
  'Unknown': 0,
  'Created': 10,
  'Draft': 20,
  'Published': 30,
  'Archived': 40,
  'Historical': 50
}

// TODO validate filter names
// e.g filters = {"BodyTypes": ['Approved', 'Overseas], "RegisteredOfficeLocation": [xxx, yyy], "TestingLocations: []"}
export const buildFilterQuery = (filterOptions) => {
  var filters = []
  Object.entries(filterOptions).forEach(([filterCategory, options]) => {
    if(filterCategory === 'RegisteredOfficeLocation') {
      filters.push(Array.from(options).map(option => `RegisteredOfficeLocation eq '${option}'`).join(' or '))
    } else if(filterCategory === 'Status') {
      filters.push(Array.from(options).map(option => `StatusValue eq '${StatusValues[option]}'`).join(' or '))
      // filters.push(`StatusValue\/any\(x\: ${Array.from(options).map(option => `x eq \'${option}\'`).join(' or ')}\)`)
    } else {
      filters.push(`${filterCategory}\/any\(x\: ${Array.from(options).map(option => `x eq \'${option}\'`).join(' or ')}\)`)
    }
  })
  // return filters.join(' and ')
  return filters.map(f => '(' + f + ')').join(' and ')
}