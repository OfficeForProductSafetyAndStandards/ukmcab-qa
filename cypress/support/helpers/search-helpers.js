import AzureCabResult from "../domain/azure-cab-result"
export const searchPath = () => { return '/search'}

export const topPagination = () => { return cy.get('.search-results-pagination-container').eq(0)}
export const bottomPagination = () => { return cy.get('.search-results-pagination-container').eq(1)}

export const searchCab = (searchInput) => {
  cy.ensureOn(searchPath())
  cy.get('#Keywords').invoke('val', searchInput).next('button').click()
}

export const displayedSearchResults = () => {
  return cy.get('ul#search-results-list > li')
}

export const azureSearchResults = (keyword) => {
  return cy.task('azureSearch', keyword).then(results => {
    return results.map(result => new AzureCabResult(result))
  })
}