describe('Find a CAB', () => {
  
  beforeEach(() => {
    cy.ensureOn('/find-a-cab')
  })

  it('displays a list of fields that a CAB can be searched with', () => {
    cy.contains('fieldset', 'Enter your keyword(s)').within(() => {
      cy.contains('Search on any of the following:')
      cy.get('li').then($lis => {
        const keywords = Array.from($lis, $li => $li.innerText)
        expect(keywords).to.deep.equal(['standards number', 'product name', 'regulation name', 'schedule name', 'module name', 'part name', 'body number', 'CAB name'])
      })
    })
  })

  it('displays error message for no search input', () => {
    cy.contains('Continue').click()
    cy.get('#Keywords').prev().contains('Enter a keyword or keywords')
  })

  it('displays search results page for valid search input', () => {
    const searchInput = 'test'
    cy.get('#Keywords').type(searchInput)
    cy.contains('Continue').click()
    cy.contains('Search results')
    cy.contains(`CABs matching "${searchInput}"`)
  })
})