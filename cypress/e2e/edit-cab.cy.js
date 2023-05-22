import * as CabHelpers from '../support/helpers/cab-helpers'
import { date } from '../support/helpers/formatters'

describe('Editing a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCabForEditing().then(cab => {
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
      cloneCab.name = cloneCab.name = this.cab.name.replace(/Edited.*/,`Edited ${uniqueId}`)
      CabHelpers.enterCabDetails(cloneCab)
      cloneCab.addressLine1 = 'Edited address'
      CabHelpers.editCabDetail('Contact details')
      CabHelpers.enterContactDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
      CabHelpers.clickPublish()
      CabHelpers.hasCabPublishedConfirmation(cloneCab)
    })

    it('displays error if mandatory fields are omitted', function() {
      let cloneCab = Object.assign({}, this.cab)
      CabHelpers.editCabDetail('About')
      cloneCab.name = null
      cloneCab.cabNumber = null
      CabHelpers.enterCabDetails(cloneCab)
      cy.continue()
      cy.hasError('CAB name', 'Enter a CAB name')
      cy.hasError('CAB number', 'Enter a CAB number')
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.editCabDetail('Contact details')
      cloneCab.addressLine1 = null
      cloneCab.townCity = null
      cloneCab.postcode = null
      cloneCab.country = null
      cloneCab.email = null
      cloneCab.phone = null
      cloneCab.registeredOfficeLocation = 'Choose location'
      CabHelpers.enterContactDetails(cloneCab)
      cy.hasError('Address line 1', 'Enter an address')
      cy.hasError('Town or city', 'Enter a town or city')
      cy.hasError('Postcode', 'Enter a postcode')
      cy.hasError('Country', 'Enter a country')
      cy.hasError('Email', 'Enter either an email or phone')
      cy.hasError('Phone', 'Enter either an email or phone')
      cy.hasError('Registered office location', 'Enter a registered office location')
    })

    it('allows saving an edited cab as draft with original cab still viewable', function() {
      let cloneCab = this.cab
      let uniqueId = Date.now()
      CabHelpers.editCabDetail('About')
      cloneCab.name = this.cab.name.replace(/Edited.*/,`Edited ${uniqueId}`)
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

    it('does not affect Published Date and only updates Last Updated Date', function() {
      let cloneCab = this.cab
      let uniqueId = Date.now()
      CabHelpers.editCabDetail('About')
      cloneCab.name = this.cab.name.replace(/Edited.*/,`Edited ${uniqueId}`)
      CabHelpers.enterCabDetails(cloneCab)
      cloneCab.addressLine1 = 'Edited address'
      CabHelpers.editCabDetail('Contact details')
      CabHelpers.enterContactDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
      CabHelpers.clickPublish()
      CabHelpers.hasCabPublishedConfirmation(cloneCab)
      cy.contains('a', 'View CAB').click()
      cy.contains(`Published: ${date(this.cab.publishedDate).DMMMYYYY}`)
      cy.contains(`Last updated: ${date(new Date()).DMMMYYYY}`)
    })

  })
})