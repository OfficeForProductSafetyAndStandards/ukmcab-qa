import * as CabHelpers from '../support/helpers/cab-helpers'

describe('Editing a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('if not possible when logged out', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab.cabId))
    CabHelpers.editCabButton().should('not.exist')
  })
  
  context('when logged in', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab.cabId))
      CabHelpers.editCabButton().click()
    })

    it('allows editing a cab and publishing updated cab details', function() {
      let cloneCab = this.cab
      let uniqueId = Date.now()
      CabHelpers.editCabDetail('About')
      cloneCab.name = this.cab.name + ` Edited ${uniqueId}`
      CabHelpers.enterCabDetails(cloneCab)
      cloneCab.addressLine1 = 'Edited address'
      CabHelpers.editCabDetail('Contact details')
      CabHelpers.enterContactDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
      CabHelpers.clickPublish()
      CabHelpers.hasCabPublishedConfirmation(cloneCab)
    })

    it('allows saving an edited cab as draft with original cab still viewable', function() {
      let cloneCab = this.cab
      let uniqueId = Date.now()
      CabHelpers.editCabDetail('About')
      cloneCab.name = this.cab.name + ` Edited ${uniqueId}`
      CabHelpers.enterCabDetails(cloneCab)
      CabHelpers.saveAsDraft()
      cy.ensureOn(CabHelpers.workQueuePath())
      cy.get('a').contains(cloneCab.name)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab.cabId))
    })

    it('does not create duplicate or save cab in drafts when edited but no changes are made', function() {
      CabHelpers.editCabDetail('About')
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.clickPublish()
      cy.ensureOn(CabHelpers.workQueuePath())
      cy.get('a').contains(this.cab.name).should('not.exist')
    })

  })
})