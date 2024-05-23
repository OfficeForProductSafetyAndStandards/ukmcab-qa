describe('Error pages', () => {

  it('400 displays!', function() {
    cy.ensureOn('/__diag/cmd/http-error-handling/domainex', {failOnStatusCode: false})
    cy.contains("There was a problem Test domain exception")
  })

  it('401 displays!', function() {
    cy.ensureOn('/__diag/cmd/http-error-handling/permissiondenied')
    cy.contains("Forbidden You do not have appropriate permissions to access this area or perform this operation.")
  })

  it('404 displays!', function() {
    cy.ensureOn('/fsdfsdfsdfsdfsfd', {failOnStatusCode: false})
    cy.contains("We can't find that page")
  })

  it('500 displays!', function() {
    cy.ensureOn('/__diag/cmd/http-error-handling/unhandledex', {failOnStatusCode: false})
    cy.contains("There's an error on our server")
  })
})