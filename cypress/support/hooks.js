// runs before each spec file. Uses user fixtures and upserts them into Cosmos
beforeEach(() => {
  cy.fixture('users').then(users => {
    Object.values(users).forEach(user => {
      cy.task('upsertUser', user)
    })
  })
})

beforeEach(() => {
  if(Cypress.spec.name !== 'cookies.cy.js') {
    cy.setCookie('accept_analytics_cookies', 'accept')
  }
})