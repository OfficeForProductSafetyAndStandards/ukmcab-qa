import * as CabHelpers from '../../support/helpers/cab-helpers'
import Cab from '../../support/domain/cab'
import {date} from '../../support/helpers/formatters'

describe('Creating a new CAB', () => {

    beforeEach(function () {
        cy.loginAsOpssUser()
        cy.ensureOn(CabHelpers.addCabPath())
        cy.wrap(Cab.build()).as('cab')
    })

    context('when uploading schedule of accreditation for unpublished CAB', function () {

        beforeEach(function () {
            CabHelpers.enterCabDetails(this.cab)
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
        })

        it('displays correct heading and other relevant copy', function () {
            cy.contains('h1', 'Product schedules upload')
            cy.contains('You can upload up to 35 PDF files.')
        })

        it('displays error upon continuing without uploading schedule of accreditation', function () {
            CabHelpers.upload()
            cy.hasError('Select PDF files', 'Select a PDF file 10 megabytes or less.')
        })

        it('displays error if schedule of accreditation is not a PDF file', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy.docx'}])
            cy.hasError('Select PDF files', "dummy.docx can't be uploaded. Files must be in PDF format to be uploaded.")
        })

        it('displays error if duplicate file is uploaded', function () {
            CabHelpers.uploadFiles([{
                fileName: 'dummy.pdf',
                label: 'My Label',
                legislativeArea: 'Lifts'
            }, {fileName: 'dummy.pdf'}])
            cy.hasError('Select PDF files', "dummy.pdf has already been uploaded. Select the existing file and the Use file again option, or upload a different file.")
        })

        //regression
        it.skip('displays error if schedule of accreditation file size is greater than 10MB', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy-pdf-10mb-plus.pdf'}])
            cy.hasError('Select PDF files', "dummy-pdf-10mb-plus.pdf can't be uploaded. Select a PDF file 10 megabytes or less.")
        })

        it('allows user to assign label and legislative area for uploaded files', function () {
            CabHelpers.uploadSchedules([{
                fileName: 'dummy.pdf',
                label: 'New Dummy Label',
                legislativeArea: 'Machinery',
                createdBy: 'OPSS'
            }, {
                fileName: 'dummy1.pdf',
                label: 'NewDummy1Label.pdf',
                legislativeArea: 'Machinery',
                createdBy: 'OPSS'
            }, {
                fileName: 'dummy2.pdf',
                label: 'ReaaaaaaaaaaaaaaaaaaaaaaaallyLooooooooooooooooooooooongLaaaaaaaaaaaaaabel',
                legislativeArea: 'Machinery',
                createdBy: 'UKAS'
            }])
            cy.saveAndContinue()
            cy.contains('Upload the supporting documents')
        })

        it.skip('displays error if legislative area is not assigned', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy.pdf'}])
            cy.saveAndContinue()
            cy.hasError('Legislative area', 'Select a legislative area')
        })

        it.skip('displays error if legislative area is not selected and draft is saved', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy.pdf'}])
            CabHelpers.saveAsDraft()
            cy.hasError('Legislative area', 'Select a legislative area')
        })

        it('cancelling file upload returns user back to List page', function () {
            cy.contains('Cancel').click()
            cy.location('pathname').should('contain', CabHelpers.cabSchedulesListPath())
        })

        it('allows skipping of schedule upload', function () {
            cy.contains('Skip this step').click()
            cy.contains('Upload the supporting documents')
        })

        it('show error on non selection of schedule on remove product schedule', function () {
            CabHelpers.uploadSchedules([{fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Machinery'}])
            cy.contains('Remove').click()
            cy.contains('Select a schedule')
        })

        it('user can remove uploaded schedule without publish', function () {
            CabHelpers.uploadSchedules([{fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Machinery'}])
            cy.get(`.govuk-radios__input`).click({ force: true })
            cy.contains('Remove').click()
            cy.contains('0 files uploaded')
            cy.contains('The product schedule has been removed.')
        })

        it('user can remove uploaded schedule with no legislative area without publish', function () {
            CabHelpers.uploadSchedules([{fileName: 'dummy.pdf', label: 'My Label', legislativeArea: null}])
            cy.get(`.govuk-radios__input`).click({ force: true })
            cy.contains('Remove').click()
            cy.contains('0 files uploaded')
            cy.contains('The product schedule has been removed.')
        })

        it('user can use schedule uploaded file again', function () {
            CabHelpers.uploadSchedules([{fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Machinery'}])
            cy.get(`.govuk-radios__input`).click({ force: true })
            cy.contains('Use file again').click()
            cy.contains('The file has been used again.')
        })

        it('user cannot archive file', function () {
            CabHelpers.uploadSchedules([{fileName: 'dummy.pdf', label: 'My Label', legislativeArea: 'Machinery'}])
            cy.get(`.govuk-radios__input`).click({ force: true })
            cy.contains('Archive product schedule').should('not.exist')
        })

        it('allows uploading multiple files at once', function () {
            const files = [
                {
                    fileName: 'dummy.pdf',
                    label: 'My Label',
                    legislativeArea: 'Machinery',
                    createdBy: 'OPSS'
                },
                {
                    fileName: 'dummy1.pdf',
                    label: 'My Label1',
                    legislativeArea: 'Machinery',
                    createdBy: 'UKAS'
                },
                {
                    fileName: 'dummy2.pdf',
                    label: 'My Label2',
                    legislativeArea: 'Machinery',
                    createdBy: 'OPSS'
                }
            ];
            CabHelpers.uploadSchedules(files)
            CabHelpers.hasUploadedSchedules(files)
        })

    })

    context('when uploading schedule of accreditation for published CAB', function () {

        it('user can archive uploaded file', function () {
            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click({ force: true })
            cy.contains('Archive product schedule').click()
            cy.get('label').contains('Archive').click()
            cy.contains('Confirm').click()
            cy.contains('0 files uploaded')
            cy.contains('Archived product schedules')
            cy.get('h3').contains('The product schedule and legislative area have been archived.')
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
            CabHelpers.uploadFiles([{fileName: 'dummy.txt'}])
            cy.hasError('Select files', "dummy.txt can't be uploaded. Files must be in PDF format to be uploaded.")
        })

        //regression
        it.skip('displays error if document file size is greater than 10MB', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy-pdf-10mb-plus.pdf'}])
            cy.hasError('Select a file', "dummy-pdf-10mb-plus.pdf can't be uploaded. Select a Word, Excel or PDF file 10 megabytes or less.")
        })

        //regression
        it.skip('only allows up to 10 files to be uploaded', function () {
            const files = [
                { fileName: 'dummy2.pdf', category: 'Appointment', publications: 'All users (public)' },
                { fileName: 'dummy3.pdf', category: 'Appointment', publications: 'Internal users' },
                { fileName: 'dummy4.pdf', category: 'Appointment', publications: 'All users (public)' },
                { fileName: 'dummy5.pdf', category: 'Appointment', publications: 'Internal users' },
                { fileName: 'dummy6.pdf', category: 'Appointment', publications: 'All users (public)' },
                { fileName: 'dummy7.pdf', category: 'Appointment', publications: 'Internal users' },
                { fileName: 'dummy8.pdf', category: 'Appointment', publications: 'All users (public)' },
                { fileName: 'dummy.doc', category: 'Appointment', publications: 'Internal users' },
                { fileName: 'dummy.xlsx', category: 'Appointment', publications: 'All users (public)' },
                { fileName: 'dummy.xls', category: 'Appointment', publications: 'Internal users' }
            ];

            CabHelpers.uploadDocuments(files);
            CabHelpers.hasUploadedFileNames(files);
            cy.contains('Save and upload another file').should('not.exist');
        });


        it('cancelling file upload returns user back to List page', function () {
            cy.contains('Cancel').click()
            cy.location('pathname').should('contain', CabHelpers.cabDocumentsListPath())
        })

        it('allows skipping supporting document upload', function () {
            cy.contains('Skip this step').click()
            cy.contains('Everyone can see a CAB profile when it is published')
        })

        it('user can remove uploaded file', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy3.pdf'}])
            cy.contains('Replace').should('exist');
            cy.contains('Use again').should('exist');
            cy.contains('Remove').click()
            cy.contains('0 files uploaded')
        })
//Test not valid again after fixes to UKMCAB-2077 - "Publication" should be mandatory, with a default value of "Internal."
        it.skip('publication should be mandatory', function () {
            CabHelpers.uploadFiles([{fileName: 'dummy3.pdf',category: 'Recommendations'}])
            cy.saveAndContinue();
            cy.get("span.govuk-error-message[data-valmsg-for='UploadedFiles[0].Publication']")
                .should('have.text', 'Select a publication');
            cy.get('.govuk-error-summary__title')
                .should('have.text', 'There is a problem');
            cy.get('.govuk-error-summary__title')
                .should('have.text', 'There is a problem');
        })
    })
})
