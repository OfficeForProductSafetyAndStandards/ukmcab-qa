import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import {
    clickPublish,
    setPublishType,
    uploadAdditionalDocuments,
    uploadDocuments,
} from "/cypress/support/helpers/cab-helpers";

describe('Ability for supporting documents to be marked as viewable by the public or internal user', () => {
    let cabProfileName;

    const verifySupportingDocumentInSummaryPage = (Documents, publication) => {
        Documents.forEach((document) => {
            cy.get('li.cab-summary-schedule-item').should('exist').within(() => {
                cy.get('a').contains(document.fileName)
                    .parent().parent()
                    .within(() => {
                        cy.contains(document.category).should('exist');
                        cy.contains(publication).should('exist');
                    });
            });
        });
    };

    const verifySupportingDocumentInProfilePage = (documents, publication) => {
        documents.forEach((document) => {
            cy.contains('p', document.category).should('exist');
            cy.contains('p', document.fileName).should('exist');
            cy.contains('p', publication).should('exist');
            cy.contains('a', 'View').should('exist');
            cy.contains('a', 'Download').should('exist');
        });
    };

    const verifySupportingDocumentIsNotVisible = (documents) => {
        documents.forEach((document) => {
            cy.contains('p', document.category).should('not.exist');
            cy.contains('p', document.fileName).should('not.exist');
        });
    };


    const supportingDocumentsTab = () => {
        return cy.contains('#tab_supporting-documents', 'Supporting documents')
    }


    beforeEach(function () {
        cy.wrap(Cab.build()).as('cab')
    })

    context('Given A UKAS user submits a CAB for approval, and the OPSS approves it - All users (public)', function () {
        it('when a supporting docs publication is set to All users (public)', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `mark-supporting-docs-as-public-${uniqueId}`;
            cy.get('#Name').type(cabProfileName);
            cy.continue();
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.skipThisStep();
            uploadDocuments(this.cab.documents)
            cy.saveAndContinue();
            CabHelpers.editCabDetail('Supporting documents')
            cy.get('select[name="UploadedFiles[0].Publication"]')
                .select('All users (public)');
            cy.saveAndContinue();
            verifySupportingDocumentInSummaryPage(this.cab.documents, 'All users (public)');
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
        });

        it('then the supporting docs should be marked as All users (public) for OPSS OGD user in the summary page', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            verifySupportingDocumentInSummaryPage(this.cab.documents, 'All users (public)');
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.ensureOn(this.draftUrl);
            cy.logout();
        });


        it('and the supporting docs should be visible to All users (public) after OPSS Admin publishes the cab', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            verifySupportingDocumentInSummaryPage(this.cab.documents, 'All users (public)');
            CabHelpers.editCabButton().click();
            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            setPublishType();
            clickPublish();
            cy.get('#CABNumber').type(Date.now().toString());
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve');
            cy.get('#approve').click();
            cy.get('h1').should('contain', 'Draft management');
            cy.logout();
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`)
            supportingDocumentsTab().click();
            cy.get('.govuk-grid-row.display-from-desktop').within(() => {
                cy.contains('h3', 'File').should('exist');
                cy.contains('h3', 'Category').should('exist');
                cy.contains('h3', 'Publications').should('exist');
                cy.contains('h3', 'Actions').should('exist');
            });
            verifySupportingDocumentInProfilePage(this.cab.documents, 'All users (public)');
        });
    });


    context('Given A UKAS user submits a CAB for approval, and the OPSS approves it - Internal users and All users (public)', function () {
        it('when a supporting docs publication is set to Internal users', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `mark-supporting-docs-as-internal-${uniqueId}`;
            cy.get('#Name').type(cabProfileName);
            cy.continue();
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.skipThisStep();
            uploadDocuments(this.cab.documents)
            cy.saveAndContinue();
            verifySupportingDocumentInSummaryPage(this.cab.documents, 'Internal users');
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
        });

        it('then the supporting docs should be marked as Internal users for OPSS OGD user in the summary page', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(this.draftUrl)
            verifySupportingDocumentInSummaryPage(this.cab.documents, 'Internal users');
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.ensureOn(this.draftUrl);
            cy.logout();
        });


        it('and the supporting docs should not be visible to All users (public) after OPSS Admin publishes the cab', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            verifySupportingDocumentInSummaryPage(this.cab.documents, 'Internal users');
            CabHelpers.editCabButton().click();
            cy.get('#reviewLa').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            setPublishType();
            clickPublish();
            cy.get('#CABNumber').type(Date.now().toString());
            cy.get('#UserNotes').type('OPSS TEST E2E User notes approve');
            cy.get('#Reason').type('OPSS TEST E2E Reason approve');
            cy.get('#approve').click();
            cy.get('h1').should('contain', 'Draft management');
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`);
            supportingDocumentsTab().click();
            cy.get('.govuk-grid-row.display-from-desktop').within(() => {
                cy.contains('h3', 'File').should('exist');
                cy.contains('h3', 'Category').should('exist');
                cy.contains('h3', 'Publications').should('exist');
                cy.contains('h3', 'Actions').should('exist');
            });
            verifySupportingDocumentInProfilePage(this.cab.documents, 'Internal users');
            cy.logout();
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`);
            supportingDocumentsTab().should('not.exist');
        });


        it('then publications for Internal users and All users (public) should be visible to internal users, while only All users (public) should be visible to public users', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`);
            cy.contains('a.govuk-button', 'Edit').click();
            CabHelpers.editCabDetail('Supporting documents')
            const newDocuments = [
                {
                    fileName: 'dummy8.pdf',
                    category: 'Recommendations',
                    publications: 'All users (public)'
                }
            ];
            uploadAdditionalDocuments(newDocuments);
            cy.saveAndContinue();
            setPublishType('minor');
            clickPublish();
            cy.contains('button.govuk-button', 'Publish').click();
            cy.contains('a', 'View CAB').click();
            supportingDocumentsTab().click();
            cy.contains('h2.govuk-heading-l', 'Supporting documents').should('exist');
            verifySupportingDocumentInProfilePage(this.cab.documents, 'Internal users');
            verifySupportingDocumentInProfilePage(newDocuments, 'All users (public)');
            cy.logout();
            cy.ensureOn(`/search/cab-profile/${cabProfileName}`);
            supportingDocumentsTab().click();
            verifySupportingDocumentInProfilePage(newDocuments, 'All users (public)');
            verifySupportingDocumentIsNotVisible(this.cab.documents);
        });
    });
})
