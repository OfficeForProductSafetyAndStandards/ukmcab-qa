import * as CabHelpers from '../support/helpers/cab-helpers'
import Cab from '../support/domain/cab'
import { date } from '../support/helpers/formatters'

describe('Creating a new CAB', () => {

  beforeEach(function(){
    cy.loginAsOpssUser()
    cy.ensureOn(CabHelpers.addCabPath())
    cy.wrap(Cab.build()).as('cab')
  })

  context('when entering cab details', function() {

    it('displays error if mandatory details are not entered', function() {
      cy.continue()
      cy.hasError('CAB name', 'Enter a CAB name')
      cy.hasError('CAB number', 'Enter a CAB number')
    })
    
    it('displays error if Cab number or Ukas ref already exists', function() {
      CabHelpers.getTestCabWithCabNumberAndUkasRef().then(cab => {
        cab.reviewDate = null // old data has invalid dates
        CabHelpers.enterCabDetails(cab)
        cy.hasError('CAB number', 'This CAB number already exists')
        cy.hasError('UKAS reference (optional)', 'This UKAS reference number already exists')
      })
    })

    it('does not display any error if optional fields are omitted', function() {
      this.cab.appointmentDate = null
      this.cab.reviewDate = null
      this.cab.ukasRef = null
      CabHelpers.enterCabDetails(this.cab)
      cy.contains('h1', 'Contact details')
    })

    it('requires appointment date to be in past', function() {
      this.cab.appointmentDate = Cypress.dayjs()
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Appointment date (optional)', 'The appointment date must be in the past.')
      this.cab.appointmentDate = Cypress.dayjs().add(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Appointment date (optional)', 'The appointment date must be in the past.')
    })
    
    it('requires review date to be in future but no more than 5 years from appointment date', function() {
      this.cab.reviewDate = Cypress.dayjs()
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be in the future.')
      this.cab.reviewDate = Cypress.dayjs().subtract(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be in the future.')
      this.cab.reviewDate = this.cab.appointmentDate.add(5, 'years').add(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be within 5 years of the appointment date.')
      // check that dates within 5 years go through
      this.cab.reviewDate = this.cab.appointmentDate.add(5, 'years')
      CabHelpers.enterCabDetails(this.cab)
      cy.contains('h1', 'Contact details')
    })

    it.only('auto populates review date 18 months from creation date when review date button is used', function() {
      CabHelpers.autoFillReviewDate()
      const expectedDate = Cypress.dayjs().add(18, 'months')
      CabHelpers.hasReviewDate(expectedDate)

      //check that any existing input is cleared if button is invoked
      CabHelpers.setReviewDate(date(this.cab.reviewDate).DD, date(this.cab.reviewDate).MM, date(this.cab.reviewDate).YYYY)
      CabHelpers.autoFillReviewDate()
      CabHelpers.hasReviewDate(expectedDate)
    })

    it('displays correct error for invalid or missing date fields', function() {
      CabHelpers.setAppointmentDate(32, 7, 2023)
      CabHelpers.setReviewDate(29, 2, 2023)
      cy.continue()
      cy.hasError('Appointment date (optional)', 'Appointment date must be a real date.')
      cy.hasError('Review date (optional)', 'Review date must be a real date.')
      CabHelpers.setAppointmentDate(32, '', 2023)
      CabHelpers.setReviewDate(32, 7, '')
      cy.continue()
      cy.hasError('Appointment date (optional)', 'Appointment date must include a month.')
      cy.hasError('Review date (optional)', 'Review date must include a year.')
      CabHelpers.setAppointmentDate(30, '', '')
      CabHelpers.setReviewDate('', 7, '')
      cy.continue()
      cy.hasError('Appointment date (optional)', 'Appointment date must include a month and year.')
      cy.hasError('Review date (optional)', 'Review date must include a day and year.')
    })

    it('validates review date to be within 5 years from yesterday if appointment date is not provided', function() {
      this.cab.appointmentDate = null
      this.cab.reviewDate = Cypress.dayjs().add(5, 'years')
      CabHelpers.enterCabDetails(this.cab)
      cy.hasError('Review date (optional)', 'The review date must be within 5 years of the appointment date.')
      // make sure date within 5 years is accepted
      this.cab.reviewDate = Cypress.dayjs().add(5, 'years').subtract(1, 'day')
      CabHelpers.enterCabDetails(this.cab)
      cy.contains('h1', 'Contact details')
    })
  })
  
  context('when entering contact details', function() {
    
    beforeEach(function() {
      CabHelpers.enterCabDetails(this.cab)
    })
    
    it('displays error if mandatory details are not entered', function() {
      cy.continue()
      cy.hasError('Address line 1', 'Enter an address')
      cy.hasError('Town or city', 'Enter a town or city')
      cy.hasError('Postcode', 'Enter a postcode')
      cy.hasError('Country', 'Enter a country')
      cy.hasError('Telephone', 'Enter a telephone number')
      cy.hasError('Registered office location', 'Enter a registered office location')
    })
    
    it('does not display any error if optional fields are omitted', function() {
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

  context('when entering body details', function() {
    
    beforeEach(function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
    })
    
    it('displays error if mandatory details are not entered', function() {
      cy.continue()
      cy.hasError('Registered test location', 'Select a registered test location')
      cy.hasError('Body type', 'Select a body type')
      cy.hasError('Legislative area', 'Select a legislative area')
    })
    
  })
  
  context('when uploading schedule of accreditation', function() {

    beforeEach(function(){
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
    })

    it('displays correct heading and other relevant copy', function() {
      cy.contains('h1', 'Upload the Schedule of Accreditation')
      cy.contains('You can upload up to 5 PDF documents.')
      cy.contains('Files you have uploaded')
      cy.contains('0 file uploaded')
    })

    it('displays error upon continuing without uploading schedule of accreditation', function() {
      CabHelpers.upload()
      cy.hasError('Select a PDF file', 'Select a PDF file 10 megabytes or less.')
    })
    
    it('displays error if schedule of accreditation is not a PDF file', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.docx' }])
      cy.hasError('Select a PDF file', 'Files must be in PDF format to be uploaded.')
    })

    it('displays error if duplicate file is uploaded', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }, { fileName: 'dummy.pdf' }])
      cy.hasError('Select a PDF file', 'Uploaded files must have different names to those already uploaded.')
    })

    it('displays error if schedule of accreditation file size is greater than 10MB', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy-pdf-10mb-plus.pdf' }])
      cy.hasError('Select a PDF file', 'Files must be no more that 10Mb in size.')
    })

    it('only allows upto 5 files to be uploaded', function() {
      const files = [{ fileName: 'dummy.pdf' }, { fileName: 'dummy1.pdf' }, { fileName: 'dummy2.pdf' }, { fileName: 'dummy3.pdf' }, { fileName: 'dummy4.pdf' }]
      CabHelpers.uploadFiles(files)
      CabHelpers.hasUploadedSchedules(files)
      cy.contains('Upload another file').should('not.exist')
    })

    it('allows user to assign label and legislative area for uploaded files', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }, { fileName: 'dummy1.pdf' }, { fileName: 'dummy2.pdf' }])
      CabHelpers.setFileLabel('dummy.pdf', 'New Dummy Label')
      CabHelpers.setLegislativeArea('dummy.pdf', 'Cableway installation')
      CabHelpers.setFileLabel('dummy1.pdf', 'NewDummy1Label.pdf')
      CabHelpers.setLegislativeArea('dummy1.pdf', 'Cableway installation')
      CabHelpers.setFileLabel('dummy2.pdf', 'ReaaaaaaaaaaaaaaaaaaaaaaaallyLooooooooooooooooooooooongLaaaaaaaaaaaaaabel')
      CabHelpers.setLegislativeArea('dummy2.pdf', 'Cableway installation')
      cy.continue()
      cy.contains('Upload the supporting documents')
    })

    it('displays error if legislative area is not assigned', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }])
      cy.continue()
      cy.hasError('Legislative area', 'Enter a legislative area')
    })

    it('displays error if legislative area is not selected and draft is saved', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }])
      CabHelpers.saveAsDraft()
      cy.hasError('Legislative area', 'Enter a legislative area')
    })

    it('canceling file upload returns user back to Admin page', function() {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', CabHelpers.cabManagementPath())
    })

    it('allows skipping of schedule upload', function() {
      cy.contains('Skip this step').click()
      cy.contains('Upload the supporting documents')
    })

    it('user can remove uploaded file', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.pdf' }])
      cy.contains('Remove').click()
      cy.contains('0 file uploaded')
    })

  })

  context('when uploading supporting documents', function() {

    beforeEach(function(){
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.uploadSchedules(this.cab)
    })

    it('displays correct heading and other relevant copy', function() {
      cy.contains('h1', 'Upload the supporting documents')
      cy.contains('You can upload up to 10 Word, Excel, or PDF documents.')
      cy.contains('Files you have uploaded')
      cy.contains('0 file uploaded')
    })

    it('displays error upon uploading without selecting a file', function() {
      CabHelpers.upload()
      cy.hasError('Select a file', 'Select a Word, Excel or PDF file 10 megabytes or less.')
    })
    
    it('displays error is uploading file is not a DOC, XLSX or PDF', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy.txt' }])
      cy.hasError('Select a file', 'Files must be in Word, Excel or PDF format to be uploaded.')
    })

    it('displays error if document file size is greater than 10MB', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy-pdf-10mb-plus.pdf' }])
      cy.hasError('Select a file', 'Files must be no more that 10Mb in size.')
    })

    it('only allows upto 10 files to be uploaded', function() {
      const files = [{ fileName: 'dummy2.pdf' }, { fileName: 'dummy3.pdf' }, { fileName: 'dummy4.pdf' }, { fileName: 'dummy5.pdf' }, { fileName: 'dummy6.pdf' }, { fileName: 'dummy7.pdf' }, { fileName: 'dummy8.pdf' }, { fileName: 'dummy.doc' }, { fileName: 'dummy.xlsx' }, { fileName: 'dummy.xls' }]
      CabHelpers.uploadFiles(files)
      CabHelpers.hasUploadedFileNames(files)
      cy.contains('Upload another file').should('not.exist')
    })

    it('canceling file upload returns user back to Admin page', function() {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', CabHelpers.cabManagementPath())
    })

    it('allows skipping supporting document upload', function() {
      cy.contains('Skip this step').click()
      cy.contains('Check details before publishing')
    })

    it('user can remove uploaded file', function() {
      CabHelpers.uploadFiles([{ fileName: 'dummy3.pdf' }])
      cy.contains('Remove').click()
      cy.contains('0 file uploaded')
    })
  })

  context('when saving as Draft', function() {
    it('displays draft saved message on Cab Management page with cab record listed', function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.saveAsDraft()
      cy.location('pathname').should('equal', CabHelpers.cabManagementPath())
      cy.get('.govuk-notification-banner__content').contains(`Draft record saved for ${this.cab.name} CAB number ${this.cab.cabNumber}`)
      cy.get('a').contains(this.cab.name)
    })
  })

  context('when reviewing details', function() {
    
    beforeEach(function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.uploadSchedules(this.cab)
      CabHelpers.uploadDocuments(this.cab)
      CabHelpers.hasDetailsConfirmation(this.cab)
    })

    it('allows editing any of the details', function() {
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
      cloneCab.legislativeAreas.push('Lifts')
      cloneCab.testingLocations.push('France')
      CabHelpers.enterBodyDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
    })
  })

  context('when Publishing a CAB', function() {

    it('displays CAB name advisory if CAB name already exists', function() {
      CabHelpers.getTestCab().then(cab => {
        cab.reviewDate = null // old data has invalid dates
        this.cab.name = cab.name
        CabHelpers.enterCabDetails(this.cab)
        CabHelpers.enterContactDetails(this.cab)
        CabHelpers.enterBodyDetails(this.cab)
        CabHelpers.uploadSchedules(this.cab)
        CabHelpers.uploadDocuments(this.cab)
        cy.hasKeyValueDetail('CAB name', 'This CAB name already exists. Only create this CAB if you have contacted OPSS for approval.')

        // also check that its removed when user corrects cab name to be unique
        CabHelpers.editCabDetail('CAB details')
        this.cab.name = `Test Cab ${Date.now()}`
        CabHelpers.enterCabDetails(this.cab)
        cy.hasKeyValueDetail('CAB name', 'This CAB name already exists. Only create this CAB if you have contacted OPSS for approval.').should('not.exist')
      })
    })

    it('Publish button is disabled until all mandatory data has been entered', function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.saveAsDraft()
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.contains('a', this.cab.name).click()
      cy.contains('Provide all mandatory information before you are able to publish this record.')
      cy.get('button').contains('Publish').should('be.disabled')
    })

    it('displays custom file labels on cab page if provided', function() {
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

    it('point of contact info is only displayed to internal users if restricted', function() {
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

    it('sets Published Date and Last Updated Date to be current date for new cabs', function() {
      CabHelpers.createCab(this.cab)
      CabHelpers.hasCabPublishedConfirmation(this.cab)
      cy.contains('a', 'View CAB').click()
      cy.contains(`Published: ${date(new Date()).DMMMYYYY}`)
      cy.contains(`Last updated: ${date(new Date()).DMMMYYYY}`)
    })

    it('publishes an existing draft cab and removes it from Cab Management', function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.enterContactDetails(this.cab)
      CabHelpers.enterBodyDetails(this.cab)
      CabHelpers.saveAsDraft()
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.contains('a', this.cab.name).click()
      CabHelpers.clickPublish()
      CabHelpers.hasCabPublishedConfirmation(this.cab)
      cy.ensureOn(CabHelpers.cabManagementPath())
      cy.get('a').contains(this.cab.name).should('not.exist')
    })
  })
})