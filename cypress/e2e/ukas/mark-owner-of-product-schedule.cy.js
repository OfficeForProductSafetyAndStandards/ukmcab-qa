import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import {clickPublish, setPublishType, uploadSchedules} from "/cypress/support/helpers/cab-helpers";

describe('Ability for product schedules to be marked with an owner', () => {
    let cabProfileName;

    const productScheduleIsCreatedByUkas = () => {
        cy.contains("Product schedules supplied by UKAS are the active schedules at the time of appointment.")
            .should("exist");
    };

    const productScheduleIsNotCreatedByUkas = () => {
        cy.contains("Product schedules supplied by UKAS are the active schedules at the time of appointment.")
            .should("not.exist");
    };

    const verifyProductScheduleIsCreatedByUKAS = () => {
        cy.get('li.cab-summary-schedule-item')
            .should('contain.text', 'Machinery')
            .should('contain.text', 'UKAS');
        productScheduleIsCreatedByUkas();
    };

    const verifyProductScheduleIsCreatedByOPSS = () => {
        cy.get('li.cab-summary-schedule-item')
            .should('contain.text', 'Machinery')
            .should('contain.text', 'OPSS');
        productScheduleIsNotCreatedByUkas();
    };


    beforeEach(function () {
        cy.wrap(Cab.build()).as('cab')
    })

    context('Given A UKAS user submits a CAB for approval, and the OPSS approves it', function () {
        it('when a product schedule is created by a UKAS user', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `mark-ukas-as-the-product-schedules-owner-${uniqueId}`;
            cy.get('#Name').type(cabProfileName);
            cy.continue();
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            uploadSchedules(this.cab.schedules);
            cy.saveAndContinue();
            CabHelpers.skipThisStep()
            CabHelpers.editCabDetail('Product schedules')
            cy.get('select[name*="CreatedBy"]')
                .select('UKAS')
                .should('have.value', 'ukas');
            cy.saveAndContinue();
            verifyProductScheduleIsCreatedByUKAS();
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
        });

        it('then the OPSS OGD sees a warning message on the Product Schedule page', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            productScheduleIsCreatedByUkas();
            CabHelpers.editCabButton().click();
            verifyProductScheduleIsCreatedByUKAS();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.ensureOn(this.draftUrl);
            cy.logout();
        });


        it('then the OPSS Admin sees a warning message on the Product Schedule page', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            productScheduleIsCreatedByUkas();
            CabHelpers.editCabButton().click();
            verifyProductScheduleIsCreatedByUKAS();
            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            setPublishType();
            clickPublish();
            cy.get('#CABNumber').type(Date.now().toString());
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve');
            cy.get('#approve').click();
            cy.get('h1').should('contain', 'Draft management');
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`)
            CabHelpers.viewSchedules();
            productScheduleIsCreatedByUkas();
        });

    });

    context('Given A UKAS user submits a CAB for approval, and the OPSS approves it', function () {
        beforeEach(function () {
            cy.wrap(Cab.build()).as('cab')
        });

        it('when a product schedule is created by a OPSS user', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `mark-ukas-as-the-product-schedules-owner-2-${uniqueId}`;
            cy.get('#Name').type(cabProfileName);
            cy.continue();
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            uploadSchedules(this.cab.schedules);
            cy.saveAndContinue();
            CabHelpers.skipThisStep()
            verifyProductScheduleIsCreatedByOPSS();
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
            cy.logout();
        })

        it('then the OGD and OPSS should not see the warning message on the Product Schedule page', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            productScheduleIsNotCreatedByUkas();
            CabHelpers.editCabButton().click();
            verifyProductScheduleIsCreatedByOPSS();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.ensureOn(this.draftUrl);
            cy.logout();
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            productScheduleIsNotCreatedByUkas();
            CabHelpers.editCabButton().click();
            verifyProductScheduleIsCreatedByOPSS();
        });
    });

})
