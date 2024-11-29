// runs before each spec file. Uses user fixtures and upserts them into Cosmos
beforeEach(() => {
  cy.fixture('users').then(users => {
    Object.values(users).forEach(user => {
      user.passwordHash = Cypress.env('PASS_HASH');
      cy.task('upsertItem', {db: 'main', container: 'user-accounts', item: user})
    })
  })
})

// routine to delete cab documents
// cy.fixture('cabData.json').then((fixtureData) => {
//   fixtureData.forEach((item) => {
//     const _id = item.id;
//     const _partitionKey = item.CABId;
//     cy.log(`ID: ${_id}, CABId: ${_partitionKey}`);
//     cy.task('deleteItem', {db: 'main', container: 'cab-documents', id: _id, partitionKey: _partitionKey})
//       });
// });


beforeEach(() => {
  if(Cypress.spec.name !== 'cookies.cy.js') {
    cy.setCookie('accept_analytics_cookies', 'accept')
  }
})