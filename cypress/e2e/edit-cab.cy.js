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
      let cloneCab = Cypress._.cloneDeep(this.cab)
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
    })

    it('displays error if mandatory fields are omitted', function() {
      let cloneCab = Cypress._.cloneDeep(this.cab)
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
      cloneCab.phone = null
      cloneCab.registeredOfficeLocation = 'Choose location'
      CabHelpers.enterContactDetails(cloneCab)
      cy.hasError('Address line 1', 'Enter an address')
      cy.hasError('Town or city', 'Enter a town or city')
      cy.hasError('Postcode', 'Enter a postcode')
      cy.hasError('Country', 'Enter a country')
      cy.hasError('Telephone', 'Enter a telephone number')
      cy.hasError('Registered office location', 'Enter a registered office location')
    })

    it('allows saving an edited cab as draft with original cab still viewable', function() {
      let cloneCab = Cypress._.cloneDeep(this.cab)
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
      let cloneCab = Cypress._.cloneDeep(this.cab)
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
      let cloneCab = Cypress._.cloneDeep(this.cab)
      CabHelpers.editCabDetail('About')
      cloneCab.name = 'Lift Cert Limited'
      CabHelpers.enterCabDetails(cloneCab)
      cy.hasError('CAB name', 'This CAB name already exists')
    })

    it('updates cab URL identifier to a hyphenated identifier based on new name and sets up redirect from old to new', function() {
      let cloneCab = Cypress._.cloneDeep(this.cab)
      let uniqueId = Date.now()
      CabHelpers.editCabDetail('About')
      cloneCab.name = this.cab.name.replace(/Edited.*/,`Edited ${uniqueId} * ${uniqueId}`) // deliberately added special char to test new URL handles itc
      CabHelpers.enterCabDetails(cloneCab)
      cloneCab.addressLine1 = 'Edited address'
      CabHelpers.editCabDetail('Contact details')
      CabHelpers.enterContactDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
      CabHelpers.clickPublish()
      CabHelpers.hasCabPublishedConfirmation(cloneCab)
      cy.contains('a', 'View CAB').click()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabProfilePage(cloneCab))
      })
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab)) // cab object still has old url set
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabProfilePage(cloneCab))
      })
    })

    it('returns user back to summary page when editing is cancelled at any step', function() {
      CabHelpers.editCabDetail('About')
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabSummaryPage(this.cab.cabId))
      })
      CabHelpers.editCabDetail('Contact details')
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabSummaryPage(this.cab.cabId))
      })
      CabHelpers.editCabDetail('Body details')
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabSummaryPage(this.cab.cabId))
      })
      CabHelpers.editCabDetail('Product schedules')
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabSummaryPage(this.cab.cabId))
      })
      CabHelpers.editCabDetail('Supporting documents')
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabSummaryPage(this.cab.cabId))
      })
    })

    it('returns user back to cab page when editing is cancelled from summary page', function() {
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).to.eq(CabHelpers.cabProfilePage(this.cab))
      })
    })

  })
})