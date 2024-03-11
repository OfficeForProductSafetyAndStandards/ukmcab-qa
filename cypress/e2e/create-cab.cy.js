import * as CabHelpers from '../support/helpers/cab-helpers'
import Cab from '../support/domain/cab'
import { date } from '../support/helpers/formatters'

describe('Creating a new CAB', () => {

  beforeEach(function () {
    cy.loginAsOpssUser()
    cy.ensureOn(CabHelpers.addCabPath())
    cy.wrap(Cab.build()).as('cab')
  })

  context('when entering cab details', function () {

    it('displays error if mandatory details are not entered', function () {
      cy.continue()
      cy.hasError('CAB name', 'Enter a CAB name')
      cy.hasError('CAB number', 'Enter a CAB number')
    })

    it('displays error if Cab number already exists', function () {
      CabHelpers.getTestCabWithCabNumber().then(cab => {
        cab.reviewDate = null // old data has invalid dates
        cab.ukasRef = null;
        CabHelpers.enterCabDetails(cab)
        cy.hasError('CAB number', 'This CAB number already exists')
      })
    })

    it('displays error if Cab Ukas ref already exists', function () {
      CabHelpers.getTestCabWithCabNumberAndUkasRef().then(cab => {
        cab.reviewDate = null // old data has invalid dates
        cab.ukasRef = "1707085598389"
        CabHelpers.enterCabDetails(cab)
        cy.hasError('UKAS reference (optional)', 'This UKAS reference number already exists')
      })
    })

    it('does not display any error if optional fields are omitted', function () {
      this.cab.appointmentDate = null
      this.cab.reviewDate = null
      this.cab.ukasRef = null
      CabHelpers.enterCabDetails(this.cab)
      cy.contains('h1', 'Contact details')
    })

    it('requires appointment date to be in past', function () {
      this.cab.appointmentDate = Cypress.dayjs()
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Appointment date (optional)', 'The appointment date must be in the past')
      this.cab.appointmentDate = Cypress.dayjs().add(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Appointment date (optional)', 'The appointment date must be in the past')
    })

    it('requires review date to be in future but no more than 5 years from appointment date', function () {
      this.cab.reviewDate = Cypress.dayjs()
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be in the future')
      this.cab.reviewDate = Cypress.dayjs().subtract(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be in the future')
      this.cab.reviewDate = this.cab.appointmentDate.add(5, 'years').add(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be within 5 years of the appointment date')
      // check that dates within 5 years go through
      this.cab.reviewDate = this.cab.appointmentDate.add(5, 'years')
      CabHelpers.enterCabDetails(this.cab)
      cy.contains('h1', 'Contact details')
    })

    it('auto populates review date 18 months from creation date when review date button is used', function () {
      CabHelpers.autoFillReviewDate()
      const expectedDate = Cypress.dayjs().add(18, 'months')
      CabHelpers.hasReviewDate(expectedDate)

      //check that any existing input is cleared if button is invoked
      CabHelpers.setReviewDate(date(this.cab.reviewDate).DD, date(this.cab.reviewDate).MM, date(this.cab.reviewDate).YYYY)
      CabHelpers.autoFillReviewDate()
      CabHelpers.hasReviewDate(expectedDate)
    })

    it('displays correct error for invalid or missing date fields', function () {
      CabHelpers.setAppointmentDate(32, 7, 2023)
      CabHelpers.setReviewDate(29, 2, 2023)
      cy.continue()
      cy.hasError('Appointment date (optional)', 'Appointment date must be a real date')
      cy.hasError('Review date (optional)', 'Review date must be a real date')
      CabHelpers.setAppointmentDate(32, '', 2023)
      CabHelpers.setReviewDate(32, 7, '')
      cy.continue()
      cy.hasError('Appointment date (optional)', 'Appointment date must include a month')
      cy.hasError('Review date (optional)', 'Review date must include a year')
      CabHelpers.setAppointmentDate(30, '', '')
      CabHelpers.setReviewDate('', 7, '')
      cy.continue()
      cy.hasError('Appointment date (optional)', 'Appointment date must include a month and year')
      cy.hasError('Review date (optional)', 'Review date must include a day and year')
    })

    it('validates review date to be within 5 years from yesterday if appointment date is not provided', function () {
      this.cab.appointmentDate = null
      this.cab.reviewDate = Cypress.dayjs().add(5, 'years')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be within 5 years of the appointment date')
      // make sure date within 5 years is accepted
      this.cab.reviewDate = Cypress.dayjs().add(5, 'years').subtract(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.contains('h1', 'Contact details')
    })
  })

  context('when entering contact details', function () {

    beforeEach(function () {
      CabHelpers.enterCabDetails(this.cab)
    })

    it('displays error if mandatory details are not entered', function () {
      cy.continue()
      cy.hasError('Address line 1', 'Enter an address')
      cy.hasError('Town or city', 'Enter a town or city')
      cy.hasError('Postcode', 'Enter a postcode')
      cy.hasError('Country', 'Enter a country')
      cy.hasError('Telephone', 'Enter a telephone number')
      cy.hasError('Registered office location', 'Enter a registered office location')
    })

    it('does not display any error if optional fields are omitted', function () {
      this.cab.addressLine2 = null
      this.cab.county = null
      this.cab.website = null
      this.cab.email = null
      this.cab.pointOfContactName = null
      this.cab.pointOfContactEmail = null
      this.cab.pointOfContactPhone = null
      CabHelpers.enterContactDetails(this.cab)
      cy.contains('h1', 'Body details')
    })
  })

  context('when entering body details', function () {

    beforeEach(function () {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
    })

    it('displays error if mandatory details are not entered', function () {
      cy.continue()
      cy.hasError('Registered test location', 'Select a registered test location')
      cy.hasError('Body type', 'Select a body type')
    })

  })

  context('when uploading schedule of accreditation', function () {

    beforeEach(function () {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.enterLegislativeAreas(this.cab)
    })

    it('displays correct heading and other relevant copy', function () {
      cy.contains('h1', 'Product schedules upload')
      cy.contains('You can upload up to 35 PDF files.')
      cy.contains('Files you have uploaded')
      cy.contains('0 files uploaded')
    })

    it('displays error upon continuing without uploading schedule of accreditation', function () {
      CabHelpers.upload()
      cy.hasError('Select PDF files', 'Select a PDF file 10 megabytes or less.')
    })

    it('displays error if schedule of accreditation is not a PDF file', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy.docx' }])
      cy.hasError('Select PDF files', "dummy.docx can't be uploaded. Files must be in PDF format to be uploaded.")
    })

    it('displays error if duplicate file is uploaded', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Lifts' }, { fileName: 'dummy.pdf' }])
      cy.hasError('Select PDF files', "dummy.pdf has already been uploaded. Select the existing file and the Use file again option, or upload a different file.")
    })

    //regression
    it.skip('displays error if schedule of accreditation file size is greater than 10MB', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy-pdf-10mb-plus.pdf' }])
      cy.hasError('Select PDF files', "dummy-pdf-10mb-plus.pdf can't be uploaded. Select a PDF file 10 megabytes or less.")
    })

    it('allows user to assign label and legislative area for uploaded files', function () {
      CabHelpers.uploadSchedules([{ fileName: 'dummy.pdf', label: 'New Dummy Label', legislativeArea: 'Machinery' }, { fileName: 'dummy1.pdf', label: 'NewDummy1Label.pdf', legislativeArea: 'Machinery' }, { fileName: 'dummy2.pdf', label: 'ReaaaaaaaaaaaaaaaaaaaaaaaallyLooooooooooooooooooooooongLaaaaaaaaaaaaaabel', legislativeArea: 'Machinery' }])
      cy.saveAndContinue()
      cy.contains('Upload the supporting documents')
    })

    it.skip('displays error if legislative area is not assigned', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }])
      cy.saveAndContinue()
      cy.hasError('Legislative area', 'Select a legislative area')
    })

    it.skip('displays error if legislative area is not selected and draft is saved', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }])
      CabHelpers.saveAsDraft()
      cy.hasError('Legislative area', 'Select a legislative area')
    })

    it('canceling file upload returns user back to Admin page', function () {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', CabHelpers.cabManagementPath())
    })

    it('allows skipping of schedule upload', function () {
      cy.contains('Skip this step').click()
      cy.contains('Upload the supporting documents')
    })

    it('user can remove uploaded file', function () {
      CabHelpers.uploadSchedules([{ fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Machinery' }])
      cy.get(`.govuk-checkboxes__input`).click()
      cy.contains('Remove').click()
      cy.contains('0 files uploaded')
    })

    it('allows uploading multiple files at once', function () {
      const files = [{ fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Machinery' }, { fileName: 'dummy1.pdf', label: 'My Label1', legislativeArea: 'Machinery' },
      { fileName: 'dummy2.pdf', label: 'My Label2', legislativeArea: 'Machinery' }]
      CabHelpers.uploadSchedules(files)
      CabHelpers.hasUploadedSchedules(files)
    })

  })

  context('when uploading schedule of accreditation without adding a legislative area', function () {

    beforeEach(function () {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      cy.wrap(this.cab.testingLocations).each((location, index, locations) => {
        Cypress._.times(
          locations - 1,
          cy.contains("a", "Add another registered test location").click()
        );
        cy.get(".test-location select").eq(index).select(location);
      });
      this.cab.bodyTypes.forEach((bodyType) => {
        cy.get(`input[value='${bodyType}']`).check();
      });
      CabHelpers.saveAsDraft()
      cy.contains('a', this.cab.name).click()
      cy.contains('Edit').click()
      CabHelpers.editCabDetail('Product schedules')
    })

    it('forces user to add legislative area if legislative area is not previously created', function () {
      cy.contains('Legislative area')
    })
  })


  context('when uploading supporting documents', function () {

    beforeEach(function () {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.enterLegislativeAreas(this.cab)
      CabHelpers.uploadSchedules(this.cab.schedules)
      cy.saveAndContinue()
    })

    it('displays correct heading and other relevant copy', function () {
      cy.contains('h1', 'Upload the supporting documents')
      cy.contains('You can upload Word, Excel, or PDF files.')
      cy.contains('Files you have uploaded')
      cy.contains('0 files uploaded')
    })

    it('displays error upon uploading without selecting a file', function () {
      CabHelpers.upload()
      cy.hasError('Select files', 'Select a Word, Excel or PDF file 10 megabytes or less.')
    })

    it('displays error is uploading file is not a DOC, XLSX or PDF', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy.txt' }])
      cy.hasError('Select files', "dummy.txt can't be uploaded. Files must be in PDF format to be uploaded.")
    })

    //regression
    it.skip('displays error if document file size is greater than 10MB', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy-pdf-10mb-plus.pdf' }])
      cy.hasError('Select a file', "dummy-pdf-10mb-plus.pdf can't be uploaded. Select a Word, Excel or PDF file 10 megabytes or less.")
    })

    //regression
    it.skip('only allows upto 10 files to be uploaded', function () {
      const files = [{ fileName: 'dummy2.pdf', category: 'Appointment' }, { fileName: 'dummy3.pdf', category: 'Appointment' }, { fileName: 'dummy4.pdf', category: 'Appointment' }, { fileName: 'dummy5.pdf', category: 'Appointment' }, { fileName: 'dummy6.pdf', category: 'Appointment' },
      { fileName: 'dummy7.pdf', category: 'Appointment' }, { fileName: 'dummy8.pdf', category: 'Appointment' }, { fileName: 'dummy.doc', category: 'Appointment' }, { fileName: 'dummy.xlsx', category: 'Appointment' }, { fileName: 'dummy.xls', category: 'Appointment' }]
      CabHelpers.uploadDocuments(files)
      CabHelpers.hasUploadedFileNames(files)
      cy.contains('Save and upload another file').should('not.exist')
    })

    it('canceling file upload returns user back to Admin page', function () {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', CabHelpers.cabManagementPath())
    })

    it('allows skipping supporting document upload', function () {
      cy.contains('Skip this step').click()
      cy.contains('Once published this record will be visible to the public')
    })

    it('user can remove uploaded file', function () {
      CabHelpers.uploadFiles([{ fileName: 'dummy3.pdf' }])
      cy.get('.govuk-checkboxes__input').click()
      cy.contains('Remove').click()
      cy.contains('0 files uploaded')
    })
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
      cloneCab.email = 'support@gov.uk'
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

    it.skip('displays Legislative area advisory if Legislative area has not been entered', function () {
      this.cab.legislativeAreas = null
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.enterLegislativeAreas(this.cab)
      cy.contains('Skip this step').click()
      cy.contains('Skip this step').click()
      cy.hasKeyValueDetail('Legislative area', 'No legislative area has been selected.')
      // also check that user can still publish cab without a Legislative Area
      CabHelpers.clickPublish()
      CabHelpers.clickPublishNotes()
      CabHelpers.hasCabPublishedConfirmation(this.cab)
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
      cy.contains('Provide all mandatory information before you are able to publish this record.')
      cy.contains('Edit').click()
      cy.get('button').contains('Publish').should('be.disabled')
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