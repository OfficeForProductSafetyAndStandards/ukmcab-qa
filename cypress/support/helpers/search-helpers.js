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

export const azureSearchResults = (keyword, options={}) => {
  return cy.task('azureSearch', {keyword: keyword, options: options}).then(results => {
    return results.map(result => new AzureCabResult(result))
  })
}