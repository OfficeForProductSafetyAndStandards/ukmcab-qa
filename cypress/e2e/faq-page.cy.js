describe('FAQ page', () => {
  
  beforeEach(() => {
    cy.ensureOn('/faq')
  })

  it('displays all expected content', () => {
    // TODO Copy still to be finalised
    cy.contains('Frequently asked questions (FAQs)')
  })

})