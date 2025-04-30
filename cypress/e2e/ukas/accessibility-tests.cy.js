import * as CabHelpers from "../../support/helpers/cab-helpers";
import {helpPath, aboutPath, updatesPath} from "../../support/helpers/common-helpers";
import Cab from "../../support/domain/cab";
import 'cypress-axe'
import {terminalAndCsvLog} from "../../support/helpers/accessibilityHelper";
import {userProfilePath, userManagementPath, userManagementList} from "../../support/helpers/user-management-helpers";

describe('UKMCAB Accessibility Tests ', function () {

    const checkAccessibility = (standardOptions, terminalLogArg) => {
        cy.injectAxe();
        cy.wait(1000);
        cy.checkA11y(null, standardOptions, terminalLogArg, true);
    }

    const wcag22aaStandardOption = {
        runOnly: {
            type: 'tag',
            values: ['wcag22aa']
        }
    }

    const wcag21aaStandardOption = {
        runOnly: {
            type: 'tag',
            values: ['wcag21aa']
        }
    }

    const allStandardOptions = {
        runOnly: {
            type: 'tag',
            values: ['wcag21a', 'wcag21aa', 'wcag21aaa', 'customTag']
        }

    }

    const userTypes = ['UKAS', 'OGD', 'OPSS'];
    const loginUser = (userType) => {
        switch (userType) {
            case 'UKAS':
                cy.loginAsUkasUser();
                break;
            case 'OGD':
                cy.loginAsOpssOgdUser();
                break;
            case 'OPSS':
                cy.loginAsOpssUser();
                break;
            default:
                throw new Error(`Unknown user type: ${userType}`);
        }
    };
    userTypes.forEach((userType) => {
        context(`when logged in as ${userType} user`, function () {
            beforeEach(function () {
                loginUser(userType);
            });

            it('service management page should have no accessibility violations on load', function () {
                cy.ensureOn(CabHelpers.serviceManagementPath());
                checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            });

            it('cab management page should have no accessibility violations on load', function () {
                cy.ensureOn(CabHelpers.cabManagementPath());
                checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            });

            it('notification page should have no accessibility violations on load', function () {
                cy.ensureOn(CabHelpers.notificationUrlPath());
                checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            });

            it('notification completed page should have no accessibility violations on load', function () {
                cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
                checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            });

            it('notification unassigned page should have no accessibility violations on load', function () {
                checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            });

            it('help page should have no accessibility violations on load', function () {
                cy.ensureOn(helpPath());
                checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            });
        });
    });

    context('given a create cab journey', function () {

        beforeEach(function () {
            cy.wrap(Cab.buildWithoutDocuments()).as('cab');
        });


        it('then all create cab draft pages should have no accessibility violations on load', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.addCabPath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            cy.get('#CABNumber').should('be.disabled');
            cy.get('#Name').type('Accessibility Tests');
            cy.continue();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            CabHelpers.enterContactDetails(this.cab);
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            CabHelpers.enterBodyDetails(this.cab);
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            CabHelpers.enterLegislativeAreas(this.cab);
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            CabHelpers.skipThisStep();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            CabHelpers.skipThisStep();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            CabHelpers.clickSubmitForApproval();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);

            cy.get('#viewCab').click();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
        });
    });

    context.only('when navigate to to other pages using deeplink', function () {
        it('should check accessibility', () => {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.serviceManagementPath());
            cy.get('ul#navigation')
                .find('a.govuk-service-navigation__link:visible')
                .contains('Search')
                .click();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(helpPath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(userProfilePath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(aboutPath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(updatesPath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(userManagementPath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.get('a.govuk-tabs__tab[href="/user-admin/list"]').click();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.get('a.govuk-tabs__tab[href="/user-admin/list/locked"]').click();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.get('a.govuk-tabs__tab[href="/user-admin/list/archived"]').click();
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(userManagementList());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
            cy.ensureOn(updatesPath());
            checkAccessibility(wcag21aaStandardOption, terminalAndCsvLog);
        });
    });
});
