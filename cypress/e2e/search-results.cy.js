describe('CAB search results page', () => {
  
  const searchCab = (searchInput) => {
    cy.ensureOn('/find-a-cab')
    cy.get('#Keywords').type(searchInput)
    cy.contains('Continue').click()
  }

  it('displays No results found messaging for no results', () => {
    searchCab('ShouldNotYieldSearchResults')
    cy.get('#results-container').within(() => {
      cy.contains('0 results')
      cy.contains('There are no matching CABs.')
      cy.contains('Improve your search results by:')
      cy.contains('li', 'removing filters')
      cy.contains('li', 'double-checking your spelling')
      cy.contains('li', 'using fewer keywords')
      cy.contains('li', 'searching for something less specific')
    })
  })
})