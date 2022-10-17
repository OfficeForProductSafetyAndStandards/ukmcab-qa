describe('UKMCAB Homepage', () => {
  
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays link to Find a CAB', () => {
    cy.get('main').contains('a', 'Find a CAB').should('have.attr', 'href', '/find-a-cab')
  })
})