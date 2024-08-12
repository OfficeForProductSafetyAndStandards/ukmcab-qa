import * as CabHelpers from '../../support/helpers/cab-helpers'
import Cab from '../../support/domain/cab'

describe('Editing a CAB', () => {

    function verifyUserNotePageIsDisplayed(cab, newReviewDate, reviewer) {
        CabHelpers.editCabDetail('Legislative areas');
        const legislativeAreaName = cab.documentLegislativeAreas?.slice(-1)[0]?.Name;
        CabHelpers.editLegislativeAreaReviewDate(newReviewDate, legislativeAreaName);
        cy.contains(`Legislative area ${legislativeAreaName} review date updated`);
        cy.get('#UserNotes').type('Legislative area additional information review date is edited by: ' + reviewer);
        cy.get('#Reason').type('to verify user note page');
        cy.contains('Confirm').click();
    }

    context('when logged out', function () {

        beforeEach(function () {
            CabHelpers.getTestCabForEditing().then(cab => {
                cy.wrap(cab).as('cab')
            })
        })

        it('if not possible when logged out', function () {
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().should('not.exist')
        })

    })

    context('when logged in', function () {

        beforeEach(function () {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.buildWithoutDocuments()).as('cab')
        })

        it('allows editing a cab and publishing updated cab details', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            let cloneCab = Cypress._.cloneDeep(this.cab)
            let uniqueId = Date.now()
            CabHelpers.editCabDetail('CAB details')
            cloneCab.name = `Test Cab Edited ${uniqueId}`
            CabHelpers.enterCabDetails(cloneCab)
            cloneCab.addressLine1 = 'Edited address'
            CabHelpers.editCabDetail('Contact details')
            CabHelpers.enterContactDetails(cloneCab)
            CabHelpers.hasDetailsConfirmation(cloneCab)
            CabHelpers.clickPublish()
            CabHelpers.clickPublishNotes()
            CabHelpers.hasCabPublishedConfirmation(cloneCab)
        })

        it('displays error if mandatory fields are omitted', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            let cloneCab = Cypress._.cloneDeep(this.cab)
            CabHelpers.editCabDetail('CAB details')
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
            cy.hasError('Country', 'Select a country')
            cy.hasError('Telephone', 'Enter a telephone number')
            cy.hasError('Registered office location', 'Select a registered office location')
        })

        it('allows saving an edited cab as draft with original cab still viewable', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            let cloneCab = Cypress._.cloneDeep(this.cab)
            let uniqueId = Date.now()
            CabHelpers.editCabDetail('CAB details')
            cloneCab.name = `Test Cab Edited ${uniqueId}`
            CabHelpers.enterCabDetails(cloneCab)
            CabHelpers.saveAsDraft()
            cy.ensureOn(CabHelpers.cabManagementPath())
            cy.get('a').contains(cloneCab.name)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
        })

        it('does not create duplicate or save cab in drafts when edited but no changes are made', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('CAB details')
            CabHelpers.enterCabDetails(this.cab)
            CabHelpers.clickPublish()
            CabHelpers.clickPublishNotes()
            cy.ensureOn(CabHelpers.cabManagementPath())
            cy.get('a').contains(this.cab.name).should('not.exist')
        })

        it('does not affect Published Date and only updates Last Updated Date', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            let cloneCab = Cypress._.cloneDeep(this.cab)
            let uniqueId = Date.now()
            CabHelpers.editCabDetail('CAB details')
            cloneCab.name = `Test Cab Edited ${uniqueId}`
            CabHelpers.enterCabDetails(cloneCab)
            cloneCab.addressLine1 = 'Edited address'
            CabHelpers.editCabDetail('Contact details')
            CabHelpers.enterContactDetails(cloneCab)
            CabHelpers.hasDetailsConfirmation(cloneCab)
            CabHelpers.clickPublish()
            CabHelpers.clickPublishNotes()
            CabHelpers.hasCabPublishedConfirmation(cloneCab)
            cy.contains('a', 'View CAB').click()
        })

        it('updates cab URL identifier to a hyphenated identifier based on new name and sets up redirect from old to new', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            let cloneCab = Cypress._.cloneDeep(this.cab)
            let uniqueId = Date.now()
            CabHelpers.editCabDetail('CAB details')
            cloneCab.name = `Test Cab Edited ${uniqueId} * ${uniqueId}` // deliberately added special char to test new URL handles itc
            CabHelpers.enterCabDetails(cloneCab)
            cloneCab.addressLine1 = 'Edited address'
            CabHelpers.editCabDetail('Contact details')
            CabHelpers.enterContactDetails(cloneCab)
            CabHelpers.hasDetailsConfirmation(cloneCab)
            CabHelpers.clickPublish()
            CabHelpers.clickPublishNotes()
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

        it('returns user back to summary page when editing is cancelled at any step', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('CAB details')
            cy.cancel()
            CabHelpers.isSummaryPage()
            CabHelpers.editCabDetail('Contact details')
            cy.cancel()
            CabHelpers.isSummaryPage()
            CabHelpers.editCabDetail('Body details')
            cy.cancel()
            CabHelpers.isSummaryPage()
            CabHelpers.editCabDetail('Product schedules')
            cy.cancel()
            CabHelpers.isSummaryPage()
            CabHelpers.editCabDetail('Supporting documents')
            cy.cancel()
            CabHelpers.isSummaryPage()
        })

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

    context('when logged in and using cabs with documents', function () {

        beforeEach(function () {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.build()).as('cab')
        })

        it.skip('legislative areas assigned to uploaded schedules can not be modified', function () {
            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Body details')
            cy.contains('Pre-selected areas are linked to the product schedule and cannot be removed here')
            this.cab.schedules.forEach(schedule => {
                cy.get(`input[value='${schedule.legislativeArea}']`).should('be.checked').and('be.disabled')
            })
            cy.continue()
            cy.contains('Everyone can see a CAB profile when it is published.')
        })
    })

    context('when editing a CAB with review date', function () {

        beforeEach(function () {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.buildWithoutDocuments()).as('cab')
        })

        it('sets review date to 18 years from current date if auto fill button is invoked', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('CAB details')
            CabHelpers.autoFillReviewDate()
            const expectedDate = Cypress.dayjs().add(18, 'months')
            CabHelpers.hasReviewDate(expectedDate)
        })
    })

    context('when editing a CAB as OPSS and accessing it as UKAS', function () {

        beforeEach(function () {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.buildWithoutDocuments()).as('cab')
        })

        it('verify draft cab created by OPSS not accessible by UKAS user', function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('CAB details')
            CabHelpers.autoFillReviewDate()
            CabHelpers.saveAsDraft()
            cy.logout()
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            cy.contains('This CAB profile cannot be edited as a draft CAB profile has already been created by an OPSS user.')
            cy.contains('a', 'Approve').should('not.exist')
            cy.contains('a', 'Decline').should('not.exist')
            cy.hasStatus('Published')
        })
    })

    context('when editing a CAB, remove and archive product schedule with no legislative area assigned', function () {

        beforeEach(function () {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.buildWithoutDocuments()).as('cab')
        })

        it('user can upload and remove uploaded schedule with no legislative area assigned', function () {

            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.contains('Upload a file').click();
            const newSchedule = {fileName: 'dummy.pdf', label: 'MyCustomLabel3', legislativeArea: null}
            this.cab.schedules.push(newSchedule)
            CabHelpers.uploadSchedules([newSchedule])
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Remove').click()
            cy.contains('Remove product schedule')
            cy.contains('Confirm').click()
            cy.contains('0 files uploaded')
            cy.contains('The product schedule has been removed.')

        })

        it('user can upload and archive uploaded schedule with no legislative area assigned', function () {

            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.contains('Upload a file').click();
            const newSchedule = {fileName: 'dummy.pdf', label: 'MyCustomLabel3', legislativeArea: null}
            this.cab.schedules.push(newSchedule)
            CabHelpers.uploadSchedules([newSchedule])
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been archived.')

        })

        it('user can upload and remove archived uploaded schedule with no legislative area assigned', function () {

            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.contains('Upload a file').click();
            const newSchedule = {fileName: 'dummy.pdf', label: 'MyCustomLabel3', legislativeArea: null}
            this.cab.schedules.push(newSchedule)
            CabHelpers.uploadSchedules([newSchedule])
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.contains('Confirm').click()
            cy.get("input[name='SelectedArchivedScheduleId']:first-of-type").check()
            cy.get('button[id="RemoveArchived"]').click()
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been removed.')
        })
    })

    context('when editing a CAB, remove and archive product schedule with legislative area assigned', function () {

        beforeEach(function () {
            cy.loginAsOpssUser()
            cy.ensureOn(CabHelpers.addCabPath())
            cy.wrap(Cab.build()).as('cab')
        })

        it('user can remove uploaded schedule and show error on non selection of legislative area option', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Remove').click()
            cy.contains('Remove product schedule')
            cy.contains('Confirm').click()
            cy.contains('Select an option for the legislative area')
        })

        it('user can remove uploaded schedule and archive legislative area after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Remove').click()
            cy.contains('Remove product schedule')
            cy.get(`.govuk-radios__input`).check('Archive')
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been removed and the legislative area has been archived.')
        })

        it('user can remove uploaded schedule and remove legislative area after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Remove').click()
            cy.contains('Remove product schedule')
            cy.get(`.govuk-radios__input`).check('Remove')
            cy.contains('Confirm').click()
            cy.contains('The product schedule and legislative area have been removed.')
        })

        it('user can remove uploaded schedule and set legislative area as provisional after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Remove').click()
            cy.contains('Remove product schedule')
            cy.get(`.govuk-radios__input`).check('MarkAsProvisional')
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been removed and the legislative area will be shown as provisional.')
        })

        it('user can archive uploaded schedule and archive legislative area after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.get(`.govuk-radios__input`).check('Archive')
            cy.contains('Confirm').click()
            cy.contains('The product schedule and legislative area have been archived.')
        })

        it('user can archive uploaded schedule and set legislative area as provisional after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.get(`.govuk-radios__input`).check('MarkAsProvisional')
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been archived and the legislative area will be shown as provisional.')
        })

        it('user can remove archived product schedule and archive legislative area after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.get(`.govuk-radios__input`).check('MarkAsProvisional')
            cy.contains('Confirm').click()
            cy.get("input[name='SelectedArchivedScheduleId']:first-of-type").check()
            cy.get('button[id="RemoveArchived"]').click()
            cy.get(`.govuk-radios__input`).check('Archive')
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been removed and the legislative area has been archived.')
        })

        it('user can remove archived product schedule and remove legislative area after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.get(`.govuk-radios__input`).check('MarkAsProvisional')
            cy.contains('Confirm').click()
            cy.get("input[name='SelectedArchivedScheduleId']:first-of-type").check()
            cy.get('button[id="RemoveArchived"]').click()
            cy.get(`.govuk-radios__input`).check('Remove')
            cy.contains('Confirm').click()
            cy.contains('The product schedule and legislative area have been removed.')
        })

        it('user can remove archived product schedule and set legislative area as provisional after publish', function () {

            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
            CabHelpers.editCabButton().click()
            CabHelpers.editCabDetail('Product schedules')
            cy.get(`.govuk-radios__input`).click()
            cy.contains('Archive').click()
            cy.contains('Archive product schedule')
            cy.get(`.govuk-radios__input`).check('MarkAsProvisional')
            cy.contains('Confirm').click()
            cy.get("input[name='SelectedArchivedScheduleId']:first-of-type").check()
            cy.get('button[id="RemoveArchived"]').click()
            cy.get(`.govuk-radios__input`).check('MarkAsProvisional')
            cy.contains('Confirm').click()
            cy.contains('The product schedule has been removed and the legislative area will be shown as provisional.')
        })
    });


    context('when review date is changed in LA additional information page', function () {

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as('cab');
        });

        it('then it should display a page with "User notes" and "Reason" fields fo UKAS User', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.addCabPath());
            cy.get('#CABNumber').should('be.disabled');
            cy.get('#Name').type('Change of review date tests');
            cy.continue();
            CabHelpers.enterContactDetails(this.cab);
            CabHelpers.enterBodyDetails(this.cab);
            CabHelpers.enterLegislativeAreas(this.cab);
            CabHelpers.skipThisStep();
            CabHelpers.skipThisStep();
            const reviewDate = Cypress.dayjs().add(14, "days");
            verifyUserNotePageIsDisplayed(this.cab, reviewDate, 'UKAS User');
            CabHelpers.clickSubmitForApproval();
            cy.get('#viewCab').click();
            cy.url().as('draftUrl');
            cy.logout();
        });

        it('then it should display a page with "User notes" and "Reason" fields fo OGD(OPSS) and OPSS Admin User', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            CabHelpers.editCabButton().click();
            const odgReviewDate = Cypress.dayjs().add(15, "days");
            verifyUserNotePageIsDisplayed(this.cab, odgReviewDate, 'OGD (OPSS) User');
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.logout();
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            const opssReviewDate = Cypress.dayjs().add(16, "days");
            verifyUserNotePageIsDisplayed(this.cab, opssReviewDate, 'OPSS Admin User');
        });
    });
});
