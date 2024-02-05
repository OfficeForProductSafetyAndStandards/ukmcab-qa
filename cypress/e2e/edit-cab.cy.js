import * as CabHelpers from '../support/helpers/cab-helpers'
import Cab from '../support/domain/cab'
import { date } from '../support/helpers/formatters'

describe('Editing a CAB', () => {

  context('when logged out', function () {

    beforeEach(function () {
      CabHelpers.getTestCabForEditing().then(cab => {
        cy.wrap(cab).as('cab')
      })
    })

    // it('if not possible when logged out', function () {
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().should('not.exist')
    // })

  })

  context('when logged in', function () {

    beforeEach(function () {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.addCabPath())
      cy.wrap(Cab.buildWithoutDocuments()).as('cab')
    })

    // it('allows editing a cab and publishing updated cab details', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   let cloneCab = Cypress._.cloneDeep(this.cab)
    //   let uniqueId = Date.now()
    //   CabHelpers.editCabDetail('CAB details')
    //   cloneCab.name = `Test Cab Edited ${uniqueId}`
    //   CabHelpers.enterCabDetails(cloneCab)
    //   cloneCab.addressLine1 = 'Edited address'
    //   CabHelpers.editCabDetail('Contact details')
    //   CabHelpers.enterContactDetails(cloneCab)
    //   CabHelpers.hasDetailsConfirmation(cloneCab)
    //   CabHelpers.clickPublish()
    //   CabHelpers.clickPublishNotes()
    //   CabHelpers.hasCabPublishedConfirmation(cloneCab)
    // })

    // it('displays error if mandatory fields are omitted', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   let cloneCab = Cypress._.cloneDeep(this.cab)
    //   CabHelpers.editCabDetail('CAB details')
    //   cloneCab.name = null
    //   cloneCab.cabNumber = null
    //   CabHelpers.enterCabDetails(cloneCab)
    //   cy.continue()
    //   cy.hasError('CAB name', 'Enter a CAB name')
    //   cy.hasError('CAB number', 'Enter a CAB number')
    //   CabHelpers.enterCabDetails(this.cab)
    //   CabHelpers.editCabDetail('Contact details')
    //   cloneCab.addressLine1 = null
    //   cloneCab.townCity = null
    //   cloneCab.postcode = null
    //   cloneCab.country = null
    //   cloneCab.phone = null
    //   cloneCab.registeredOfficeLocation = 'Choose location'
    //   CabHelpers.enterContactDetails(cloneCab)
    //   cy.hasError('Address line 1', 'Enter an address')
    //   cy.hasError('Town or city', 'Enter a town or city')
    //   cy.hasError('Postcode', 'Enter a postcode')
    //   cy.hasError('Country', 'Enter a country')
    //   cy.hasError('Telephone', 'Enter a telephone number')
    //   cy.hasError('Registered office location', 'Enter a registered office location')
    // })

    // it('allows saving an edited cab as draft with original cab still viewable', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   let cloneCab = Cypress._.cloneDeep(this.cab)
    //   let uniqueId = Date.now()
    //   CabHelpers.editCabDetail('CAB details')
    //   cloneCab.name = `Test Cab Edited ${uniqueId}`
    //   CabHelpers.enterCabDetails(cloneCab)
    //   CabHelpers.saveAsDraft()
    //   cy.ensureOn(CabHelpers.cabManagementPath())
    //   cy.get('a').contains(cloneCab.name)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    // })

    // it('does not create duplicate or save cab in drafts when edited but no changes are made', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   CabHelpers.editCabDetail('CAB details')
    //   CabHelpers.enterCabDetails(this.cab)
    //   CabHelpers.clickPublish()
    //   CabHelpers.clickPublishNotes()
    //   cy.ensureOn(CabHelpers.cabManagementPath())
    //   cy.get('a').contains(this.cab.name).should('not.exist')
    // })

    // it('does not affect Published Date and only updates Last Updated Date', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   let cloneCab = Cypress._.cloneDeep(this.cab)
    //   let uniqueId = Date.now()
    //   CabHelpers.editCabDetail('CAB details')
    //   cloneCab.name = `Test Cab Edited ${uniqueId}`
    //   CabHelpers.enterCabDetails(cloneCab)
    //   cloneCab.addressLine1 = 'Edited address'
    //   CabHelpers.editCabDetail('Contact details')
    //   CabHelpers.enterContactDetails(cloneCab)
    //   CabHelpers.hasDetailsConfirmation(cloneCab)
    //   CabHelpers.clickPublish()
    //   CabHelpers.clickPublishNotes()
    //   CabHelpers.hasCabPublishedConfirmation(cloneCab)
    //   cy.contains('a', 'View CAB').click()

    //   // need to check published and last updated timestamps with devs

    //   // cy.contains(`Published: ${date(this.cab.publishedDate).DMMMYYYY}`)
    //   // cy.contains(`Last updated: ${date(new Date()).DMMMYYYY}`)
    // })

    // it('updates cab URL identifier to a hyphenated identifier based on new name and sets up redirect from old to new', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   let cloneCab = Cypress._.cloneDeep(this.cab)
    //   let uniqueId = Date.now()
    //   CabHelpers.editCabDetail('CAB details')
    //   cloneCab.name = `Test Cab Edited ${uniqueId} * ${uniqueId}` // deliberately added special char to test new URL handles itc
    //   CabHelpers.enterCabDetails(cloneCab)
    //   cloneCab.addressLine1 = 'Edited address'
    //   CabHelpers.editCabDetail('Contact details')
    //   CabHelpers.enterContactDetails(cloneCab)
    //   CabHelpers.hasDetailsConfirmation(cloneCab)
    //   CabHelpers.clickPublish()
    //   CabHelpers.clickPublishNotes()
    //   CabHelpers.hasCabPublishedConfirmation(cloneCab)
    //   cy.contains('a', 'View CAB').click()
    //   cy.location().then(loc => {
    //     expect(loc.pathname).to.eq(CabHelpers.cabProfilePage(cloneCab))
    //   })
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab)) // cab object still has old url set
    //   cy.location().then(loc => {
    //     expect(loc.pathname).to.eq(CabHelpers.cabProfilePage(cloneCab))
    //   })
    // })

    // it('returns user back to summary page when editing is cancelled at any step', function () {
    //   CabHelpers.createCabWithoutDocuments(this.cab)
    //   cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    //   CabHelpers.editCabButton().click()
    //   CabHelpers.editCabDetail('CAB details')
    //   cy.cancel()
    //   CabHelpers.isSummaryPage()
    //   CabHelpers.editCabButton().click()
    //   CabHelpers.editCabDetail('Contact details')
    //   cy.cancel()
    //   CabHelpers.isSummaryPage()
    //   CabHelpers.editCabButton().click()
    //   CabHelpers.editCabDetail('Body details')
    //   cy.cancel()
    //   CabHelpers.isSummaryPage()
    //   CabHelpers.editCabButton().click()
    //   CabHelpers.editCabDetail('Product schedules')
    //   cy.cancel()
    //   CabHelpers.isSummaryPage()
    //   CabHelpers.editCabDetail('Supporting documents')
    //   cy.cancel()
    //   CabHelpers.isSummaryPage()
    // })

    it('returns user back to cab page when editing is cancelled from summary page', function () {
      CabHelpers.createCabWithoutDocuments(this.cab)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.editCabButton().click()
      cy.cancel()
      cy.location().then(loc => {
        expect(loc.pathname).contains(CabHelpers.cabProfilePage(this.cab))
      })
    })

  })

  // context('when logged in and using cabs with documents', function () {

  //   beforeEach(function () {
  //     cy.loginAsOpssUser()
  //     cy.ensureOn(CabHelpers.addCabPath())
  //     cy.wrap(Cab.build()).as('cab')
  //   })

  //   it('legislative areas assigned to uploaded schedules can not be modified', function () {
  //     CabHelpers.createCab(this.cab)
  //     cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
  //     CabHelpers.editCabButton().click()
  //     CabHelpers.editCabDetail('Body details')
  //     cy.contains('Pre-selected areas are linked to the product schedule and cannot be removed here')
  //     this.cab.schedules.forEach(schedule => {
  //       cy.get(`input[value='${schedule.legislativeArea}']`).should('be.checked').and('be.disabled')
  //     })
  //     cy.continue()
  //     cy.contains('Once published this record will be visible to the public')
  //   })
  // })

  // context('when editing a CAB with review date', function () {

  //   beforeEach(function () {
  //     cy.loginAsOpssUser()
  //     cy.ensureOn(CabHelpers.addCabPath())
  //     cy.wrap(Cab.buildWithoutDocuments()).as('cab')
  //   })

  //   it('sets review date to 18 years from current date if auto fill button is invoked', function () {
  //     CabHelpers.createCabWithoutDocuments(this.cab)
  //     cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
  //     CabHelpers.editCabButton().click()
  //     CabHelpers.editCabDetail('CAB details')
  //     CabHelpers.autoFillReviewDate()
  //     const expectedDate = Cypress.dayjs().add(18, 'months')
  //     CabHelpers.hasReviewDate(expectedDate)
  //   })
  // })

  // context('when editing a CAB with review date', function () {

  //   beforeEach(function () {
  //     cy.loginAsOpssUser()
  //     cy.ensureOn(CabHelpers.addCabPath())
  //     cy.wrap(Cab.build()).as('cab')

  //   })

  //   it('legislative areas on summary page and profile page are in sync', function () {
  //     CabHelpers.createCab(this.cab)
  //     cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
  //     CabHelpers.editCabButton().click()
  //     CabHelpers.editCabDetail('Product schedules')
  //     cy.contains('Save and upload another file').click()
  //     const newSchedule = { fileName: 'dummy3.pdf', label: 'MyCustomLabel3', legislativeArea: 'Pyrotechnics' }
  //     this.cab.schedules.push(newSchedule)
  //     CabHelpers.uploadSchedules([newSchedule])
  //     cy.saveAndContinue()
  //     cy.contains('Once published this record will be visible to the public')
  //     cy.contains('Schedule').next().contains(newSchedule.legislativeArea)
  //     CabHelpers.clickPublish()
  //     CabHelpers.clickPublishNotes()
  //     cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
  //     cy.hasKeyValueDetail('Legislative area', newSchedule.legislativeArea)
  //   })
  // })
})