import * as CabHelpers from "../../support/helpers/cab-helpers";
import Cab from "../../support/domain/cab";

describe('Validate Legislative Areas', () => {
    beforeEach(() => {
        cy.fixture('legislativeAreas').then((data) => {
            cy.wrap(data.legislativeAreas).as('legislativeAreas');
        });
        cy.wrap(Cab.buildWithoutDocuments()).as('cab');
    });

    it('should display all legislative areas', function () {
        cy.loginAsUkasUser();
        cy.ensureOn(CabHelpers.addCabPath());
        cy.get('#Name').type(`Validate Legislative Areas Data - ${Date.now()}`);
        cy.continue();
        CabHelpers.enterContactDetails(this.cab);
        CabHelpers.enterBodyDetails(this.cab);
        this.legislativeAreas.forEach((area) => {
            cy.contains(area).should('exist');
        });
    });
});
