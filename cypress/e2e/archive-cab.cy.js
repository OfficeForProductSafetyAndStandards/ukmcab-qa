import { date } from '../support/helpers/formatters'
import { searchCab } from '../support/helpers/search-helpers'
import * as CabHelpers from '../support/helpers/cab-helpers'
import { getEmailsLink } from '../support/helpers/email-subscription-helpers'

describe('Archiving a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('if not possible when logged out', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    CabHelpers.archiveCabButton().should('not.exist')
  })
  
  context('when logged in', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    })

    it('is successful and make it uneditable and removes it from search results!', function() {
      CabHelpers.archiveCab(this.cab)
      cy.get('.govuk-notification-banner__content').contains(`Archived on ${date(new Date()).DDMMMYYYY}`)
      CabHelpers.editCabButton().should('not.exist') // edit button is removed from archived cabs
      CabHelpers.editCabButton().should('not.exist') // edit button is removed from archived cabs
      cy.get('a,button').contains('Archived') // tab changes to Archived
      getEmailsLink().should('not.exist') // subscriptions are disabled for archived cabs
      searchCab(this.cab.name)
      cy.contains('a', this.cab.name).should('not.exist')
    })

  })
})