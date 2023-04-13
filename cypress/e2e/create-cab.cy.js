import * as CabHelpers from '../support/helpers/cab-helpers'
import Cab from '../support/domain/cab'

describe('Creating a new CAB', () => {

  beforeEach(function(){
    cy.loginAsOpssUser()
    cy.ensureOn(CabHelpers.addCabPath())
    cy.wrap(Cab.build()).as('cab')
  })

  it('is successful with valid data entry', function() {
    CabHelpers.createCab(this.cab)
    CabHelpers.hasCabPublishedConfirmation()
  })

  context('when entering cab details', function() {

    it('displays error if mandatory details are not entered', function() {
      cy.continue()
      cy.hasError('CAB name', 'Enter a CAB name')
      cy.hasError('CAB number', 'Enter a CAB number')
    })
    
    it('displays error if a CAB with name or number already exists', function() {
      CabHelpers.getTestCab().then(cab => {
        CabHelpers.enterCabDetails(cab)
        cy.hasError('CAB name', 'A document already exists for this CAB name, number or UKAS reference')
      })
    })

    it('does not display any error if optional fields are omitted', function() {
      this.cab.appointmentDate = null
      this.cab.renewalDate = null
      this.cab.ukasRef = null
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
      cy.hasError('Email', 'Enter either an email or phone')
      cy.hasError('Phone', 'Enter either an email or phone')
      cy.hasError('Registered office location', 'Enter a registered office location')
    })

    it('only one of email or phone is mandatory', function() {
      this.cab.email = null
      CabHelpers.enterContactDetails(this.cab)
      cy.contains('h1', 'Body details')
    })
    
    it('does not display any error if optional fields are omitted', function() {
      this.cab.addressLine2 = null
      this.cab.website = null
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
      CabHelpers.hasUploadedFileNames(files)
      cy.contains('Upload another file').should('not.exist')
    })

    it('canceling file upload returns user back to Admin page', function() {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', CabHelpers.workQueuePath())
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
      cy.location('pathname').should('equal', CabHelpers.workQueuePath())
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
    it('displays Work Queye and draft saved message', function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.saveAsDraft()
      cy.location('pathname').should('equal', CabHelpers.workQueuePath())
      cy.get('.govuk-notification-banner__content').contains(`Draft record saved for ${this.cab.name} (CAB number ${this.cab.cabNumber})`)
    })
  })

  context('when Publishing a CAB', function() {
    it('Publish button is disabled until all mandatory data has been entered', function() {
      CabHelpers.enterCabDetails(this.cab)
      CabHelpers.saveAsDraft()
      cy.ensureOn(CabHelpers.workQueuePath())
      cy.contains('a', this.cab.name).click()
      cy.contains('Provide all mandatory information before you are able to publish this record.')
      cy.get('button').contains('Publish').should('be.disabled')
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
      const editSection = (heading) => { cy.get('.cab-summary-header').contains(heading).next('a').click() }
      
      // Edit cab details
      cloneCab.name = `Test Cab ${uniqueId}`
      cloneCab.appointmentDate = Cypress.dayjs().add('1', 'day')
      editSection('About')
      CabHelpers.enterCabDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)

       // Edit contact details
      cloneCab.addressLine1 = 'Newbury house'
      cloneCab.email = 'support@gov.uk'
      cloneCab.pointOfContactName = ''
      cloneCab.isPointOfContactPublicDisplay = true
      editSection('Contact details')
      CabHelpers.enterContactDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)

      // Edit body details
      editSection('Body details')
      cloneCab.bodyTypes.push('NI Notified body')
      cloneCab.legislativeAreas.push('Lifts')
      cloneCab.testingLocations.push('France')
      CabHelpers.enterBodyDetails(cloneCab)
      CabHelpers.hasDetailsConfirmation(cloneCab)
    })
    
  })
})