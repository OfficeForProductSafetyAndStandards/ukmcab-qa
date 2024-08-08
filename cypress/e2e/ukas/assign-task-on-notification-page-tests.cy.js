import * as CabHelpers from '/cypress/support/helpers/cab-helpers'
import Cab from '/cypress/support/domain/cab'
import * as UserManagementHelpers from "../../support/helpers/user-management-helpers";

describe('Assign tasks on notification page tests', () => {
    let cabProfileName;
    let initialCounts = {};

    function countNotifications() {
        const counts = {};
        cy.get('#tab_Unassigned').then(($el) => {
            counts.unassignedCount = parseInt($el.text().match(/\d+/)[0]);
        });
        cy.get('#tab_assigned-me').then(($el) => {
            counts.assignedToMeCount = parseInt($el.text().match(/\d+/)[0]);
        });
        cy.get('#tab_assigned-group').then(($el) => {
            counts.assignedToAnotherUserCount = parseInt($el.text().match(/\d+/)[0]);
        });
        cy.get('#tab_completed').then(($el) => {
            counts.completedCount = parseInt($el.text().match(/\d+/)[0]);
        });
        return cy.wrap(counts);
    }

    beforeEach(function () {
        cy.wrap(Cab.buildWithoutDocuments()).as('cab');
        UserManagementHelpers.getTestUsers().then((users) => {
            cy.wrap(users.UkasUser).as("ukasUser");
        });
    })

    context('When task is created and assigned', function () {
        it('and Ukas submit cab for approval', function () {
            cy.loginAsUkasUser()
            cy.ensureOn(CabHelpers.addCabPath());
            const uniqueId = Date.now();
            cabProfileName = `assignTask-${uniqueId}`;
            cy.get('#Name').type(cabProfileName);
            cy.continue();
            CabHelpers.enterContactDetails(this.cab)
            CabHelpers.enterBodyDetails(this.cab)
            CabHelpers.enterLegislativeAreas(this.cab)
            CabHelpers.skipThisStep()
            CabHelpers.skipThisStep()
            CabHelpers.clickSubmitForApproval()
            cy.get('#viewCab').click()
            cy.url().as('draftUrl')
        });

        it('then OPSS OGD is able to use assign functionality and approves', function () {
            cy.loginAsOpssOgdUser();
            cy.ensureOn(CabHelpers.notificationUrlPath());
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for OPSS (OGD)');
            cy.ensureOn(CabHelpers.notificationUnassignedUrlPath());
            countNotifications().then(counts => {
                initialCounts = counts;
            });
            cy.clickOnCabFromNotificationTable('Unassigned', 'Approve legislative area request', cabProfileName);
            cy.contains('Select an assignee').should('be.visible');
            cy.contains('The user will be assigned to this notification').should('be.visible');
            cy.get('select#SelectedAssignee').select('Test Opss OGD User');
            cy.contains('button', 'Assign').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for OPSS (OGD)');
            countNotifications().then(newCounts => {
                expect(newCounts.assignedToMeCount).to.be.greaterThan(initialCounts.assignedToMeCount);
            });
            cy.ensureOn(CabHelpers.notificationAssignedMeUrlPath());
            cy.clickOnCabFromNotificationTable('assigned-me', 'Approve legislative area request', cabProfileName);
            cy.get('h1.govuk-heading-l').should('have.text', 'Approve legislative area request');
            cy.get('.govuk-summary-list__row:contains("Assignee") .govuk-summary-list__value .govuk-body')
                .should('have.text', 'Test Opss OGD User');
            cy.get('select#SelectedAssignee option[selected="selected"]')
                .should('have.text', 'Test Opss OGD User');
            cy.get('select#SelectedAssignee').select('Deselect assignee');
            cy.contains('button', 'Update').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for OPSS (OGD)');
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click()
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.logout();
        });

        it('then OPSS Admin is able to use assign functionality and decline to publish', function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.notificationUrlPath());
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for OPSS');
            cy.ensureOn(CabHelpers.notificationUnassignedUrlPath());
            countNotifications().then(counts => {
                initialCounts = counts;
            });
            cy.clickOnCabFromNotificationTable('Unassigned', 'Approve CAB request', cabProfileName);
            cy.get('h1.govuk-heading-l').should('have.text', 'Approve CAB request');
            cy.get('select#SelectedAssignee').select('Test Opss Admin User');
            cy.contains('button', 'Assign').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for OPSS');
            countNotifications().then(newCounts => {
                expect(newCounts.assignedToMeCount).to.be.greaterThan(initialCounts.assignedToMeCount);
            });
            cy.ensureOn(CabHelpers.notificationAssignedMeUrlPath());
            cy.clickOnCabFromNotificationTable('assigned-me', 'Approve CAB request', cabProfileName);
            cy.get('h1.govuk-heading-l').should('have.text', 'Approve CAB request');
            cy.get('.govuk-summary-list__row:contains("Assignee") .govuk-summary-list__value .govuk-body')
                .should('have.text', 'Test Opss Admin User');
            cy.get('select#SelectedAssignee option[selected="selected"]')
                .should('have.text', 'Test Opss Admin User');
            cy.get('select#SelectedAssignee').select('Deselect assignee');
            cy.contains('button', 'Update').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for OPSS');
            cy.ensureOn(this.draftUrl);
            CabHelpers.editCabButton().click();
            cy.contains('a', 'Review').click();
            CabHelpers.approveLegislativeAreas(this.cab);
            cy.get('#declineCab').click();
            cy.get('#DeclineReason').type('OPSS Admin Decline assign user tests');
            cy.get('#decline').click();
            cy.get('h1').should('contain', 'Draft management');
            cy.logout();
        });


        it('then Ukas is able to use assign functionality', function () {
            cy.loginAsUkasUser();
            cy.ensureOn(CabHelpers.notificationUrlPath());
            cy.ensureOn(CabHelpers.notificationUnassignedUrlPath());
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for UKAS');
            countNotifications().then(counts => {
                initialCounts = counts;
            });
            cy.clickOnCabFromNotificationTable('Unassigned', 'CAB declined', cabProfileName);
            cy.get('h1.govuk-heading-l').should('have.text', 'CAB declined');
            cy.get('select#SelectedAssignee').select('Test Ukas User');
            cy.contains('button', 'Assign').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for UKAS');
            countNotifications().then(newCounts => {
                expect(newCounts.assignedToMeCount).to.be.greaterThan(initialCounts.assignedToMeCount);
            });
            cy.ensureOn(CabHelpers.notificationAssignedMeUrlPath());
            cy.clickOnCabFromNotificationTable('assigned-me', 'CAB declined', cabProfileName);
            cy.get('h1.govuk-heading-l').should('have.text', 'CAB declined');
            cy.get('.govuk-summary-list__row:contains("Assignee") .govuk-summary-list__value .govuk-body')
                .should('have.text', 'Test Ukas User');
            cy.get('select#SelectedAssignee option[selected="selected"]')
                .should('have.text', 'Test Ukas User');
            cy.get('select#SelectedAssignee').select('Deselect assignee');
            cy.contains('button', 'Update').click();
            cy.get('h1.govuk-heading-l').should('have.text', 'Notifications for UKAS');
            cy.ensureOn(CabHelpers.notificationUnassignedUrlPath());
            cy.clickOnCabFromNotificationTable('Unassigned', 'CAB declined', cabProfileName);
            cy.contains('a', 'Back').click();
            cy.url().should('include', 'Unassigned');
        });
    });

    context('When i navigate to notification page', function () {
        it("then i should see - Completed notifications will be archived after 6 months.", function () {
            cy.loginAsOpssUser();
            cy.ensureOn(CabHelpers.notificationCompletedUrlPath());
            cy.contains("Completed notifications will be archived after 6 months.").should("exist");
            cy.get('#tab_completed').click();
            cy.get('th').contains('Completed on').click();
            const today = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            cy.get('td.govuk-table__cell').each($el => {
                const dateText = $el.text().trim();
                const datePattern = /\d{2}\/\d{2}\/\d{4}/;
                if (datePattern.test(dateText)) {
                    const dateString = dateText.match(datePattern)[0];
                    const [day, month, year] = dateString.split('/');
                    const completedDate = new Date(`${year}-${month}-${day}`);
                    expect(completedDate).to.be.within(sixMonthsAgo, today);
                }
            });
        });
    });
})
