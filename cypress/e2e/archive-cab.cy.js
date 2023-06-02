import { date } from '../support/helpers/formatters'
import { searchCab } from '../support/helpers/search-helpers'
import * as CabHelpers from '../support/helpers/cab-helpers'

describe('Archiving a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('if not possible when logged out', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab.cabId))
    CabHelpers.archiveCabButton().should('not.exist')
  })
  
  context('when logged in', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab.cabId))
    })

    it('works and removes it from search results!', function() {
      CabHelpers.archiveCab(this.cab)
      cy.get('.govuk-notification-banner__content').contains(`Archived on ${date(new Date()).DDMMMYYYY}`)
      searchCab(this.cab.name)
      cy.contains('a', this.cab.name).should('not.exist')
    })

  })
})