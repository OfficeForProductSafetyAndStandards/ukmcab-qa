import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import {clickPublish, setPublishType} from "/cypress/support/helpers/cab-helpers";
import * as UserManagementHelpers from "../../support/helpers/user-management-helpers";

describe('OPSS admin can choose to publish a record without updating the last update dates', () => {
    let firstMajorPublish;

    const getLastUpdatedDate = (cabName) => {
        return UserManagementHelpers.getCabUpdateStatus(cabName).then(cabDocs => {
            const publishedCab = cabDocs.find(doc => doc.status === "Published" && doc.name === cabName);

            if (publishedCab) {
                const lastUpdateDate = publishedCab.lastUpdatedDate;
                const message = `Last Updated Date for Published CAB: ${lastUpdateDate}`;
                console.log(message);
                cy.log(message);
                return cy.wrap(lastUpdateDate);
            } else {
                const errorMessage = `No Published CAB found with the name ${cabName}.`;
                console.log(errorMessage);
                cy.log(errorMessage);
                assert.fail(errorMessage);
            }
        });
    };


    beforeEach(function () {
        cy.wrap(Cab.buildWithoutDocuments()).as('cab');
    })

    context('Given a cab is created by OPSS and ready to be published by OPSS', function () {

        it('when OPSS admin creates and publish a cab', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.addCabPath());
            CabHelpers.createCabWithoutDocuments(this.cab);
            cy.contains('a', 'View CAB').click();

            cy.get('h1.govuk-heading-l').invoke('text').then((cabName) => {
                cy.log("cabName: " + cabName.trim());

                getLastUpdatedDate(cabName.trim()).then((lastUpdatedDate) => {
                    cy.log("firstMajorPublish: " + lastUpdatedDate);
                    firstMajorPublish = lastUpdatedDate;
                });
            });

            const date = new Date();
            const day = date.getDate();
            const month = date.toLocaleString('en-US', {month: 'short'});
            const year = date.getFullYear();
            const currentDate = `${day} ${month} ${year}`;

            cy.get('.cab-detail-date-meta').each(($el) => {
                const text = $el.text();
                if (text.includes('Published') && text.includes('Last updated')) {
                    cy.wrap($el).within(() => {
                        cy.contains(`Published: ${currentDate}`).should('exist');
                        cy.contains(`Last updated: ${currentDate}`).should('exist');
                    });
                }
            });

            cy.url().as('draftUrl');
            cy.logout();

        });


        it('then the minor publish should not affect the last updated date', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            CabHelpers.editCabDetail('Contact details');
            cy.get('#AddressLine1')
                .clear()
                .type('11 testing road');
            cy.continue();
            setPublishType('minor');
            clickPublish();
            cy.contains('button.govuk-button', 'Publish').click();
            cy.contains('a', 'View CAB').click();

            cy.get('h1.govuk-heading-l')
                .invoke('text')
                .then((cabName) => {
                    cy.log("cabName: " + cabName.trim());

                    getLastUpdatedDate(cabName.trim()).then((minorPublish) => {
                        expect(minorPublish).to.equal(firstMajorPublish);
                    });
                });


            cy.logout();

        });


        it('then the new major publish should affect the last updated date', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            CabHelpers.editCabDetail('Contact details');
            cy.get('#AddressLine1')
                .clear()
                .type('22 testing road');
            cy.continue();
            setPublishType();
            clickPublish();
            cy.contains('button.govuk-button', 'Publish').click();
            cy.contains('a', 'View CAB').click();

            cy.get('h1.govuk-heading-l')
                .invoke('text')
                .then((cabName) => {
                    cy.log("cabName: " + cabName.trim());

                    getLastUpdatedDate(cabName.trim()).then((secondMajorPublish) => {
                        expect(secondMajorPublish).not.to.equal(firstMajorPublish);
                    });
                });


            cy.logout();

        });
    });
});

