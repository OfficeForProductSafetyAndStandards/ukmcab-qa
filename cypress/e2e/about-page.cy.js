describe('About page', () => {
  
  beforeEach(() => {
    cy.ensureOn('/about')
  })

  it('displays all expected content', () => {
    // TODO Copy still to be finalised
    cy.contains('h1', 'About')
    cy.contains('h3', 'Useful links')
  })

})