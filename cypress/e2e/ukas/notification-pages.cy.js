import * as CabHelpers from "../../support/helpers/cab-helpers";

describe('Error pages', () => {

    it("completed notifications should be archived after 6 months", function () {
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
    })
})
