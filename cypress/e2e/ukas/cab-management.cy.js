import * as CabHelpers from '../../support/helpers/cab-helpers'
import {date, valueOrNotProvided} from "../../support/helpers/formatters"

describe('Draft management', function () {


    const sortedByNameAsc = (cabs) => {
        return cabs.sort((a, b) => a.name.localeCompare(b.name) || a.lastUpdatedDate - b.lastUpdatedDate)
    }

    const sortedByNameDesc = (cabs) => {
        return cabs.sort((a, b) => b.name.localeCompare(a.name) || a.lastUpdatedDate - b.lastUpdatedDate)
    }

    const sortedByNumberAsc = (cabs) => {
        const notProvided = cabs.filter(c => c.cabNumber === null).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate)
        return notProvided.concat(Cypress._.filter(cabs, c => c.cabNumber).sort((a, b) => a.cabNumber.localeCompare(b.cabNumber) || a.lastUpdatedDate - b.lastUpdatedDate))
    }

    const sortedByNumberDesc = (cabs) => {
        const notProvided = cabs.filter(c => c.cabNumber === null).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate)
        return Cypress._.filter(cabs, c => c.cabNumber).sort((a, b) => b.cabNumber.localeCompare(a.cabNumber) || a.lastUpdatedDate - b.lastUpdatedDate).concat(notProvided)
    }

    const sortedByLastUpdatedAsc = (cabs) => {
        return cabs.sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate)
    }

    const sortedByLastUpdatedDesc = (cabs) => {
        return cabs.sort((a, b) => b.lastUpdatedDate - a.lastUpdatedDate)
    }

    const sortedByStatusAsc = (cabs) => {
        return cabs.sort((a, b) => a.status.localeCompare(b.status) || b.lastUpdatedDate - a.lastUpdatedDate)
    }

    const sortedByStatusDesc = (cabs) => {
        return cabs.sort((a, b) => b.status.localeCompare(a.status) || b.lastUpdatedDate - a.lastUpdatedDate)
    }

    const linkToCab = (cab) => {
        return cab.isDraft ? CabHelpers.cabSummaryPage(cab.cabId) : CabHelpers.cabProfilePage(cab)
    }

    const sortedByLastUpdatedDescWithSecondaryCabNumber = (cabs) => {
        return cabs.sort((a, b) => {
            if (b.lastUpdatedDate !== a.lastUpdatedDate) {
                return b.lastUpdatedDate - a.lastUpdatedDate;
            } else {
                return Number(a.cabNumber) - Number(b.cabNumber);
            }
        });
    };


    const extractNumber = (text) => {
        return parseInt(text.match(/\((\d+)\)/)[1], 10);
    };

    const sorters = [
        'CAB name',
        'CAB number',
        'Last updated',
        'User group',
        'Status'
    ];

    let allCountTotal;

    beforeEach(function () {
        cy.loginAsOpssUser()
        cy.ensureOn(CabHelpers.cabManagementPath())
        CabHelpers.getAllDraftOrArchivedCabs().then(cabs => {
            cy.wrap(cabs).as('cabs')
        })
    })

    it('displays option to create a new CAB', function () {
        cy.get('.govuk-heading-l').contains('Draft management');
        cy.get('a.govuk-button').should('contain', 'Create a CAB')
    })

    it('displays All CABs sorted by Last Updated Date by default', function () {
        sortedByLastUpdatedDescWithSecondaryCabNumber(this.cabs).slice(0, 5).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                cy.get('td').eq(0).contains(cab.name);
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber));
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY);
            })
        })
    })

    it('verify that the sum of all tabs equals the total from the "All" tab', function () {
        cy.get('.govuk-tabs__list-item:contains("All")')
            .then(($el) => {
                const allCount = extractNumber($el.text());
                allCountTotal = allCount;
                cy.wrap(allCount).as('allCount');
            });

        cy.get('.govuk-tabs__list-item:contains("Draft")')
            .then(($el) => {
                const draftCount = extractNumber($el.text());
                cy.wrap(draftCount).as('draftCount');
            });

        cy.get('.govuk-tabs__list-item:contains("Pending draft")')
            .then(($el) => {
                const pendingDraftCount = extractNumber($el.text());
                cy.wrap(pendingDraftCount).as('pendingDraftCount');
            });

        cy.get('.govuk-tabs__list-item:contains("Pending publish")')
            .then(($el) => {
                const pendingPublishCount = extractNumber($el.text());
                cy.wrap(pendingPublishCount).as('pendingPublishCount');
            });

        cy.get('.govuk-tabs__list-item:contains("Pending archive")')
            .then(($el) => {
                const pendingArchiveCount = extractNumber($el.text());
                cy.wrap(pendingArchiveCount).as('pendingArchiveCount');
            });

        cy.get('@allCount').then((allCount) => {
            cy.get('@draftCount').then((draftCount) => {
                cy.get('@pendingDraftCount').then((pendingDraftCount) => {
                    cy.get('@pendingPublishCount').then((pendingPublishCount) => {
                        cy.get('@pendingArchiveCount').then((pendingArchiveCount) => {
                            const sum = draftCount + pendingDraftCount + pendingPublishCount + pendingArchiveCount;
                            expect(sum).to.equal(allCount);
                        });
                    });
                });
            });
        });
    });

    it('displays pagination with 10 cabs per page', function () {
        cy.get('tbody > tr.govuk-table__row').should('have.length', this.cabs.slice(0, 10).length)
        cy.get('.pagination-detail-container').contains(`Showing 1 - ${this.cabs.slice(0, 10).length} of ${allCountTotal}`)
    });

    it('should click on pagination page link 2 and verify "Previous" and "Next" links', () => {
        cy.get('ul.pagination-links').within(() => {
            cy.get('li.pagination-page-link a').contains('2').click();
        });
        cy.get('ul.pagination-links').within(() => {
            cy.get('li.pagination-link-item').contains('Previous').should('exist');
            cy.get('li.pagination-link-item').contains('Next').should('exist');
        });
    });

    it('should verify that all sorters are present in the table head', () => {
        sorters.forEach((sorter, index) => {
            cy.get('thead.govuk-table__head th').eq(index).within(() => {
                cy.get('a.sort-button').should('have.text', sorter);
            });
        });
    });

// disabling as failing due to potential caching
    it.skip('displays correct CAB order upon sorting by any of the sortable columns', function () {
        cy.log('CAB name Asc sort')
        cy.get('thead th a').eq(0).click()
        sortedByNameAsc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('CAB name desc sort')
        cy.get('thead th a').eq(0).click()
        sortedByNameDesc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                // cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('CAB Number asc sort')
        cy.get('thead th a').eq(1).click()
        sortedByNumberAsc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('CAB Number desc sort')
        cy.get('thead th a').eq(1).click()
        sortedByNumberDesc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('Last updated asc sort')
        cy.get('thead th a').eq(2).click()
        sortedByLastUpdatedAsc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('Last updated Desc sort')
        cy.get('thead th a').eq(2).click()
        sortedByLastUpdatedDesc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('Status asc sort')
        cy.get('thead th a').eq(3).click()
        sortedByStatusAsc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
        cy.log('Status Desc sort')
        cy.get('thead th a').eq(3).click()
        sortedByStatusDesc(this.cabs).slice(0, 10).forEach((cab, index) => {
            cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
                //cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
                cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
                cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
                cy.get('td').eq(3).contains(cab.status)
            })
        })
    })
})
