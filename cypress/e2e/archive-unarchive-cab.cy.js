import * as CabHelpers from '../support/helpers/cab-helpers'
import { getEmailsLink } from '../support/helpers/email-subscription-helpers'
import Cab from '../support/domain/cab'
import * as EmailSubscriptionHelpers from '../support/helpers/email-subscription-helpers'
import * as UserManagementHelpers from '../support/helpers/user-management-helpers'


describe('Archiving a CAB', () => {

  it('is not possible when logged out', function () {
    CabHelpers.getTestCab().then(cab => {
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      CabHelpers.archiveCabButton().should('not.exist')
    })
  })

  it('displays expected information and errors in Archive page', function () {
    cy.loginAsOpssUser()
    const cab = Cab.buildWithoutDocuments()
    cy.ensureOn(CabHelpers.addCabPath())
    CabHelpers.createCabWithoutDocuments(cab)
    cy.ensureOn(CabHelpers.cabProfilePage(cab))
    CabHelpers.archiveCabButton().click()
    CabHelpers.mainPage().within(() => {
      CabHelpers.archiveCabButton().click()
      cy.contains('.govuk-error-summary', 'Enter notes')
    })
  })

  context('when logged in and the CAB has NO draft associated', function () {

    beforeEach(function () {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.addCabPath())
      cy.wrap(Cab.buildWithoutDocuments()).as('cab')
    })

    it('user is NOT shown a message that draft will be deleted and cab is archived successfully', function () {
      CabHelpers.createCabWithoutDocuments(this.cab)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.archiveCab(this.cab)
      CabHelpers.editCabButton().should('not.exist') // edit button is removed from archived cabs
      getEmailsLink().should('not.exist')  // subscriptions are disabled for archived cabs
    })
  })

  context('when logged in and the CAB has a draft associated', function () {

    beforeEach(function () {
      // cy.loginAsOpssUser()
      UserManagementHelpers.getTestUsers().then(users => {
        const user = users.OpssAdminUser
        cy.loginAs(user)
        cy.wrap(user).as('user')
        cy.ensureOn(UserManagementHelpers.userAdminPath(user))
      })
      cy.ensureOn(CabHelpers.addCabPath())
      cy.wrap(Cab.buildWithoutDocuments()).as('cab')
    })

    it('user is shown a message that draft will be deleted and the draft is deleted and deletion notification email sent to the creator of the CAB', function () {
      CabHelpers.createCabWithoutDocuments(this.cab)
      CabHelpers.createDraftVersion(this.cab)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.archiveCab(this.cab, { hasAssociatedDraft: true })
      cy.log(`email is: ${this.user.email} `)
      EmailSubscriptionHelpers.assertDraftCabDeletionEmailIsSent(this.user.email)
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('#Filter').select('Draft', { force: true })
      cy.contains(this.cab.name).should('not.exist')
    })
  })
})

describe('Unarchiving a CAB', () => {

  it('is possible when logged out', function () {
    CabHelpers.getArchivedCab().then(cab => {
      cy.ensureOn(CabHelpers.cabProfilePage(cab), { failOnStatusCode: false })
      cy.contains("Archived")
    })
  })

  context('when logged in and the CAB has no draft associated', function () {

    beforeEach(function () {
      cy.loginAsOpssUser()
      cy.ensureOn(CabHelpers.addCabPath())
      cy.wrap(Cab.buildWithoutDocuments()).as('cab')
    })

    it('is successful and marks it as Draft and can not be unarchived again', function () {
      CabHelpers.createCabWithoutDocuments(this.cab)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.archiveCab(this.cab) // create an archived cab without a draft
      cy.get('.govuk-warning-text')
      CabHelpers.unarchiveCab(this.cab)
      // cy.location('pathname').should('equal', CabHelpers.cabSummaryPage(this.cab.cabId)) // summary page is displayed
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('#Filter').select('Draft', { force: true })
      cy.get('a').contains(this.cab.name)
      cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
      CabHelpers.unarchiveCabButton().should('not.exist')
    })
  })
})

context('when logged in and the CAB has draft associated', function () {

  beforeEach(function () {
    cy.loginAsOpssUser()
    cy.ensureOn(CabHelpers.addCabPath())
    cy.wrap(Cab.buildWithoutDocuments()).as('cab')
  })

  it('should not be possible', function () {
    CabHelpers.createCabWithoutDocuments(this.cab)
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    CabHelpers.archiveCab(this.cab) // create an archived cab
    CabHelpers.unarchiveCab(this.cab) // only to get this cab into a state where it has a draft version too
    cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
    CabHelpers.unarchiveCabButton().should('not.exist')
  })
})

