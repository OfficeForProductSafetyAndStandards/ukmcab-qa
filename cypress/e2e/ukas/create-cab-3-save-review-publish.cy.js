import * as CabHelpers from '../../support/helpers/cab-helpers'
import Cab from '../../support/domain/cab'
import {date} from '../../support/helpers/formatters'

describe('Creating a new CAB', () => {

    beforeEach(function () {
        cy.loginAsOpssUser()
        cy.ensureOn(CabHelpers.addCabPath())
        cy.wrap(Cab.build()).as('cab')
    })

    context('when saving as Draft', function () {
        it('displays draft saved message on Cab Management page with cab record listed', function () {
            CabHelpers.enterCabDetails(this.cab)
            CabHelpers.saveAsDraft()
            cy.location('pathname').should('equal', CabHelpers.cabManagementPath())
            cy.get('.govuk-notification-banner__content').contains(`Draft record saved for ${this.cab.name} CAB number ${this.cab.cabNumber}`)
            cy.get('a').contains(this.cab.name)
        })
    })

    context('when reviewing details', function () {

        it('allows editing any of the details', function () {
            CabHelpers.enterCabDetails(this.cab)
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.uploadSchedules(this.cab.schedules)
            cy.saveAndContinue()
            CabHelpers.uploadDocuments(this.cab.documents)
            cy.saveAndContinue()
            CabHelpers.hasDetailsConfirmation(this.cab)
            let cloneCab = this.cab
            let uniqueId = Date.now()

            // Edit cab details
            cloneCab.name = `Test Cab ${uniqueId}`
            cloneCab.appointmentDate = Cypress.dayjs().subtract('5', 'days')
            CabHelpers.editCabDetail('CAB details')
            CabHelpers.enterCabDetails(cloneCab)
            CabHelpers.hasDetailsConfirmation(cloneCab)

            // Edit contact details
            cloneCab.addressLine1 = 'Newbury house'
            cloneCab.email = 'support@gov.example.test'
            cloneCab.pointOfContactName = ''
            cloneCab.isPointOfContactPublicDisplay = true
            CabHelpers.editCabDetail('Contact details')
            CabHelpers.enterContactDetails(cloneCab)
            CabHelpers.hasDetailsConfirmation(cloneCab)

            // Edit body details
            CabHelpers.editCabDetail('Body details')
            cloneCab.bodyTypes.push('Overseas body')
            cloneCab.testingLocations.push('France')
            CabHelpers.enterBodyDetails(cloneCab)
            CabHelpers.hasDetailsConfirmation(cloneCab)
        })

        it('displays CAB name advisory if CAB name already exists', function () {
            CabHelpers.getTestCab().then(cab => {
                this.cab.name = cab.name
                CabHelpers.enterCabDetails(this.cab)
                CabHelpers.enterContactDetails(this.cab)
                CabHelpers.enterBodyDetails(this.cab)
                CabHelpers.enterLegislativeAreas(this.cab)
                cy.contains('Skip this step').click()
                cy.contains('Skip this step').click()
                cy.hasKeyValueDetail('CAB name', 'This CAB name already exists. Only create this CAB if you have contacted OPSS for approval.')
            })

            // also check that its removed when user corrects cab name to be unique
            CabHelpers.editCabDetail('CAB details')
            this.cab.name = `Test Cab ${Date.now()}`
            CabHelpers.enterCabDetails(this.cab)
            cy.hasKeyValueDetail('CAB name', 'This CAB name already exists. Only create this CAB if you have contacted OPSS for approval.').should('not.exist')
            CabHelpers.getTestCab().then(cab => {
                cab.reviewDate = null // old data has invalid dates
                this.cab.name = cab.name
            })
        })
    })

    context('when Publishing a CAB', function () {

        it('Publish button is disabled until all mandatory data has been entered', function () {
            CabHelpers.enterCabDetails(this.cab)
            CabHelpers.saveAsDraft()
            cy.ensureOn(CabHelpers.cabManagementPath())
            cy.contains('a', this.cab.name).click()
            cy.contains('This CAB profile will only become publishable when an active legislative area is added.');
            cy.contains('Edit').click();
            cy.contains('Provide all mandatory information before you are able to publish this record.');
            cy.contains('This CAB profile will only become publishable when an active legislative area is added.');
            cy.get('button').contains('Publish').should('be.disabled');
        })

        it('displays custom file labels on cab page if provided', function () {
            CabHelpers.createCab(this.cab)
            CabHelpers.hasCabPublishedConfirmation(this.cab)
            cy.contains('a', 'View CAB').click()
            CabHelpers.viewSchedules()
            this.cab.schedules.forEach(schedule => {
                schedule.label ? cy.contains(schedule.label) : cy.contains(schedule.fileName)
                // TODO: GROUP AND SORT LEGISLATIVE AREAS WHEN MULTIPE UPLOAD ISSUE IS FIXED
                cy.contains(schedule.legislativeArea) // TMP check
            })
        })

        it('point of contact info is only displayed to internal users if restricted', function () {
            this.cab.isPointOfContactPublicDisplay = false
            CabHelpers.createCab(this.cab)
            CabHelpers.hasCabPublishedConfirmation(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            cy.hasKeyValueDetail('Point of contact name', this.cab.pointOfContactName)
            cy.hasKeyValueDetail('Point of contact email', this.cab.pointOfContactEmail)
            cy.hasKeyValueDetail('Point of contact telephone', this.cab.pointOfContactPhone)
            cy.logout()
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            cy.contains('Point of contact name').should('not.exist')
            cy.contains('Point of contact email').should('not.exist')
            cy.contains('Point of contact telephone').should('not.exist')
        })

        it('sets Published Date and Last Updated Date to be current date for new cabs', function () {
            CabHelpers.createCab(this.cab)
            CabHelpers.hasCabPublishedConfirmation(this.cab)
            cy.contains('a', 'View CAB').click()
            cy.contains(`Published: ${date(new Date()).DMMMYYYY}`)
            cy.contains(`Last updated: ${date(new Date()).DMMMYYYY}`)
        })

        it('publishes an existing draft cab and removes it from Cab Management', function () {
            CabHelpers.enterCabDetails(this.cab)
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.saveAsDraft()
            cy.ensureOn(CabHelpers.cabManagementPath())
            cy.contains('a', this.cab.name).click()
            cy.contains('Edit').click()
            CabHelpers.setPublishType();
            CabHelpers.clickPublish()
            CabHelpers.clickPublishNotes()
            CabHelpers.hasCabPublishedConfirmation(this.cab)
            cy.ensureOn(CabHelpers.cabManagementPath())
            cy.get('a').contains(this.cab.name).should('not.exist')
        })

        it('shows provisional pill next to all provisional legislative areas', function () {
            CabHelpers.createCab(this.cab)
            CabHelpers.hasCabPublishedConfirmation(this.cab)
            cy.contains('a', 'View CAB').click()
            CabHelpers.viewLegislativeAreas();
            cy.contains('a', 'Measuring instruments').parent().next().contains('Provisional');
            cy.contains('a', 'Machinery').parent().next().should('not.exist');
        })
    })
})
