beforeEach(() => {
  console.log(Cypress.spec.name)
  if(Cypress.spec.name !== 'cookies.cy.js') {
    cy.setCookie('accept_analytics_cookies', 'accept')
  }
})