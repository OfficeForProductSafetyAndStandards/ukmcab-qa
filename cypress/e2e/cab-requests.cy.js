// import * as CabHelpers from '../support/helpers/cab-helpers'
// import Cab from '../support/domain/cab'

// describe('Cab requests', function() {

//   // it("can't be accessed by OPSS users", function() {
//   //   cy.loginAsOpssUser()
//   //   cy.ensureOn(CabHelpers.cabRequestsPath(), {failOnStatusCode: false})
//   //   // TODO - HTML PAGE NOT IMPLEMENTED YET FOR ASSERTIONS
//   // })

//   // it("can't be accessed by UKAS users", function() {
//   //   cy.loginAsUkasUser()
//   //   cy.ensureOn(CabHelpers.cabRequestsPath(), {failOnStatusCode: false})
//   //   // TODO - HTML PAGE NOT IMPLEMENTED YET FOR ASSERTIONS
//   // })

//   context('when logged in as OGD user', function() {
//     beforeEach(function() {
//       var cab = new Cab()
//       cy.wrap(cab).as('cab')
//       cy.loginAsUkasUser()
//       cy.ensureOn(CabHelpers.addCabPath())
//       CabHelpers.addCabAsUkasUser(cab)
//       cy.logout()
//       cy.loginAsOgdUser()
//       cy.ensureOn(CabHelpers.cabRequestsPath())
//     })

//     it('are displayed with created cabs', function() {
//       cy.get('.govuk-summary-list__row').eq(1).should('contain', this.cab.name).and('contain', "Review")
//     })
//   })
// })