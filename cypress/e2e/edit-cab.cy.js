import * as CabHelpers from '../support/helpers/cab-helpers'
import { date } from '../support/helpers/formatters'

describe('Editing a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCabForEditing().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })
  
  it('if not possible when logged out', function() {
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    CabHelpers.editCabButton().should('not.exist')
  })
  
  context('when logged in', function() {
    
    beforeEach(function() {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
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
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('a').contains(cloneCab.name)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    })

    it('does not create duplicate or save cab in drafts when edited but no changes are made', function() {
      CabHelpers.editCabDetail('About')
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.clickPublish()
      cy.ensureOn(CabHelpers.cabManagementPath())
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

    it('displays error if cab is updated with name of another cab', function() {
      let cloneCab = this.cab
      CabHelpers.editCabDetail('About')
      cloneCab.name = 'Lift Cert Limited'
      CabHelpers.enterCabDetails(cloneCab)
      cy.hasError('CAB name', 'A document already exists for this CAB name, number or UKAS reference')
    })

    it('updates cab URL identifier to a hyphenated identifier based on new name and sets up redirect from old to new', function() {
      cy.url().then(x => console.log(x))
      let cloneCab = this.cab
      let uniqueId = Date.now()
      CabHelpers.editCabDetail('About')
      const newName = this.cab.name.replace(/Edited.*/,`Edited ${uniqueId} * ${uniqueId}`) // deliberately added special char to test new URL handles itc
      const newUrlSlug = newName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, '-').toLowerCase()
      cloneCab.name = newName
      CabHelpers.enterCabDetails(cloneCab)
      cloneCab.addressLine1 = 'Edited address'
      CabHelpers.editCabDetail('Contact details')
      CabHelpers.enterContactDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
      CabHelpers.clickPublish()
      CabHelpers.hasCabPublishedConfirmation(cloneCab)
      cy.contains('a', 'View CAB').click()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq('/search/cab-profile/' + newUrlSlug)
      })
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab)) // cab object still has old url set
      cy.location().then(loc => {
        expect(loc.pathname).to.eq('/search/cab-profile/' + newUrlSlug)
      })
    })

  })
})