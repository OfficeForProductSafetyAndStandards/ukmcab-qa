import * as CabHelpers from '../support/helpers/cab-helpers'
import Cab from '../support/domain/cab'

describe('New CAB creation', () => {

  beforeEach(function(){
    cy.wrap(new Cab()).as('cab')
  })
  
  context('when uploading schedule of accreditation', function() {

    beforeEach(function(){
      cy.loginAsAdmin()
      CabHelpers.onUploadSchedulePage(this.cab)
    })

    it('displays correct heading and other relevant copy', function() {
      cy.contains('h1', 'Upload the Schedule of Accreditation')
      cy.contains('You can upload up to 5 PDF documents.')
      cy.contains('Files you have uploaded')
      cy.contains('0 file uploaded')
    })

    it('displays error upon continuing without uploading schedule of accreditation', function() {
      CabHelpers.upload()
      cy.hasError('Select a PDF file', 'Please select a file for upload')
    })
    
    it('displays error if schedule of accreditation is not a PDF file', function() {
      const files = ['dummy.docx', 'dummy.xlsx', 'dummy.txt']
      files.forEach(file => {
        CabHelpers.uploadFiles([file])
        cy.hasError('Select a PDF file', 'Files must be in PDF format to be uploaded.')
      })
    })

    it('displays error if schedule of accreditation file size is greater than 10MB', function() {
      CabHelpers.uploadFiles(['dummy-pdf-10mb-plus.pdf'])
      cy.hasError('Select a PDF file', 'Files must be no more that 10Mb in size.')
    })

    it('only allows upto 5 files to be uploaded', function() {
      const files = ['dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.pdf']
      CabHelpers.uploadFiles(files)
      cy.contains('Upload another file').should('not.exist')
    })
    
    it('displays uploaded file names', function() {
      const files = ['dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.pdf']
      CabHelpers.uploadFiles(files)
      CabHelpers.hasUploadedFileNames(files)
    })

    it('canceling file upload returns user back to Add cab journey', function() {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', '/')
    })

    it('user can remove uploaded file', function() {
      CabHelpers.uploadFiles(['dummy.pdf'])
      cy.contains('Remove').click()
      cy.contains('0 file uploaded')
    })

    it('redirects back to upload files page if only one file is uploaded and then removed', function() {
      CabHelpers.uploadFiles(['dummy.pdf'])
      cy.contains('Remove').click()
      cy.contains('Upload the Schedule of Accreditation')
    })

  })

  context('when uploading supporting documents', function() {

    beforeEach(function(){
      cy.loginAsAdmin()
      CabHelpers.onUploadSupportingDocsPage(this.cab)
    })

    it('displays correct heading and other relevant copy', function() {
      cy.contains('h1', 'Upload the supporting documents')
      cy.contains('You can upload up to 10 Word, Excel, or PDF documents.')
      cy.contains('Files you have uploaded')
      cy.contains('0 file uploaded')
    })

    it('displays error upon continuing without uploading schedule of accreditation', function() {
      CabHelpers.upload()
      cy.hasError('Select a PDF file', 'Please select a file for upload')
    })
    
    it('displays error is uploading file is not a DOC, XLSX or PDF', function() {
      const files = ['dummy.txt', 'dummy.json']
      files.forEach(file => {
        CabHelpers.uploadFiles([file])
        cy.hasError('Select a PDF file', 'Files must be in Word, Excel or PDF format to be uploaded.')
      })
    })

    it('displays error if document file size is greater than 10MB', function() {
      CabHelpers.uploadFiles(['dummy-pdf-10mb-plus.pdf'])
      cy.hasError('Select a PDF file', 'Files must be no more that 10Mb in size.')
    })

    it('only allows upto 10 files to be uploaded', function() {
      const files = ['dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.pdf', 'dummy.docx', 'dummy.docx', 'dummy.xlsx', 'dummy.xlsx', 'dummy.xlsx']
      CabHelpers.uploadFiles(files)
      cy.contains('Upload another file').should('not.exist')
    })
    
    it('displays uploaded file names', function() {
      const files = ['dummy.pdf', 'dummy.pdf', 'dummy.doc', 'dummy.docx', 'dummy.xls', 'dummy.xlsx', 'dummy.pdf', 'dummy.pdf']
      CabHelpers.uploadFiles(files)
      CabHelpers.hasUploadedFileNames(files)
    })

    it('canceling file upload returns user back to Add cab journey', function() {
      cy.contains('Cancel').click()
      cy.location('pathname').should('equal', '/')
    })

    it('user can remove uploaded file', function() {
      CabHelpers.uploadFiles(['dummy.pdf'])
      cy.contains('Remove').click()
      cy.contains('0 file uploaded')
    })

    it('redirects back to upload files page if only one file is uploaded and then removed', function() {
      CabHelpers.uploadFiles(['dummy.pdf'])
      cy.contains('Remove').click()
      cy.contains('Upload the supporting documents')
    })

    it('allows skipping uploading of supporting docs', function() {
      cy.contains('Skip this step').click()
      // TODO cy.contains('Check your answers')
    })
  })

  context('when logged in as OGD user', () => {
    
    it('is allowed', () => {
      cy.loginAsOgdUser()
      cy.ensureOn(CabHelpers.findCabPath()) 
      CabHelpers.hasAddCabPermission()    
    })
  })
  
  context('when logged in as OPSS user', () => {
    
    beforeEach(() => {
      cy.loginAsAdmin()
      cy.ensureOn(CabHelpers.addCabPath())
    })

    it('displays error when mandatory values are not entered', function() {
      CabHelpers.saveAndContinue()
      cy.hasError('What is the name of the Conformity Assessment Body (CAB)?', CabHelpers.errors.nameRequired)
      cy.hasError('Address', CabHelpers.errors.addressRequired)
      cy.hasError('Website', CabHelpers.errors.emailPhoneOrWebsiteRequired)
      cy.hasError('Which Regulation(s) does this CAB cover?', CabHelpers.errors.regulationRequired)
    })
    
    it('displays error if at least on of email phone or website is not provided', function() {
      this.cab.email = null
      this.cab.phone = null
      this.cab.website = null
      CabHelpers.enterCommonCabDetails(this.cab)
      CabHelpers.saveAndContinue()
      cy.hasError('Website', CabHelpers.errors.emailPhoneOrWebsiteRequired)
    })
    
    it('does not display error if any one of email phone or website is provided', function() {
      this.cab.address = null // setting to null to avoid creating new cab
      this.cab.phone = null
      this.cab.website = null
      CabHelpers.enterCommonCabDetails(this.cab)
      CabHelpers.saveAndContinue()
      cy.contains(CabHelpers.errors.emailPhoneOrWebsiteRequired).should('not.exist')
    })
    
    it('does error if cab name is already registered', function() {
      CabHelpers.addCabAsOpssUser(this.cab)
      CabHelpers.enterCommonCabDetails(this.cab)
      CabHelpers.saveAndContinue()
      cy.hasError('What is the name of the Conformity Assessment Body (CAB)?', CabHelpers.errors.cabNameExists)
    })

    it('is successful if all details are provided correctly', function() {
      CabHelpers.addCabAsOpssUser(this.cab)
      // TODO: Assert CAB creation when front end built
    })
  })

  context('when logged in as UKAS user', () => {

    beforeEach(() => {
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.addCabPath())
    })

    it('is successful if all details are provided correctly', function() {
      CabHelpers.addCabAsUkasUser(this.cab)
      // TODO: Assert CAB creation when front end built   
    })

    it('UKAS ref number is not mandatory', function() {
      this.cab.ukasRefNo = null
      CabHelpers.addCabAsUkasUser(this.cab)
      // TODO: Assert CAB creation when front end built   
    })

    it('displays error when mandatory values are not entered before submitting for approval', function() {
      CabHelpers.saveAndContinue()
      cy.hasError('What is the name of the Conformity Assessment Body (CAB)?', CabHelpers.errors.nameRequired)
      cy.hasError('Address', CabHelpers.errors.addressRequired)
      cy.hasError('Website', CabHelpers.errors.emailPhoneOrWebsiteRequired)
      cy.hasError('Which Regulation(s) does this CAB cover?', CabHelpers.errors.regulationRequired)
    })
  })
})