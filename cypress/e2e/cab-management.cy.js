import * as CabHelpers from '../support/helpers/cab-helpers'
import { date, valueOrNotProvided } from "../support/helpers/formatters"

describe('Cab management', function() {

  
  const sortedByNameAsc = (cabs) => {
    return cabs.sort((a,b) => a.name.localeCompare(b.name) || a.createdDate - b.createdDate)
  }
  
  const sortedByNameDesc = (cabs) => {
    return cabs.sort((a,b) => b.name.localeCompare(a.name) || a.createdDate - b.createdDate)
  }
  
  const sortedByNumberAsc = (cabs) => {
    const notProvided = cabs.filter(c => c.cabNumber === null)
    return notProvided.concat(Cypress._.filter(cabs, c => c.cabNumber).sort((a,b) => a.cabNumber.localeCompare(b.cabNumber) || a.createdDate - b.createdDate))
  }
  
  const sortedByNumberDesc = (cabs) => {
    const notProvided = cabs.filter(c => c.cabNumber === null)
    return Cypress._.filter(cabs, c => c.cabNumber).sort((a,b) => b.cabNumber.localeCompare(a.cabNumber) || a.createdDate - b.createdDate).concat(notProvided)
  }

  const sortedByLastUpdatedAsc = (cabs) => {
    return cabs.sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate)
  }

  const sortedByLastUpdatedDesc = (cabs) => {
    return cabs.sort((a, b) => b.lastUpdatedDate - a.lastUpdatedDate)
  }

  const sortedByStatusAsc = (cabs) => {
    return cabs.sort((a,b) => a.status.localeCompare(b.status) || a.createdDate - b.createdDate)
  }

  const sortedByStatusDesc = (cabs) => {
    return cabs.sort((a,b) => b.status.localeCompare(a.status) || a.createdDate - b.createdDate)
  }

  const linkToCab = (cab) => {
    return cab.isDraft ? CabHelpers.cabSummaryPage(cab.cabId) : CabHelpers.cabProfilePage(cab.cabId)
  }

  beforeEach(function() {
    cy.loginAsOpssUser()
    cy.ensureOn(CabHelpers.cabManagementPath())
    CabHelpers.getAllDraftOrArchivedCabs().then(cabs => {
      cy.wrap(cabs).as('cabs')
    })
    CabHelpers.getAllDraftCabs().then(cabs => {
      cy.wrap(cabs).as('draftCabs')
    })
  })

  it('displays option to create a new CAB', function() {
    cy.get('a.govuk-button').should('contain', 'Create a CAB').and('has.attr', 'href', CabHelpers.addCabPath())
  })

  it('displays All(Draft or Archived) CABs sorted by Last Updated Date by default', function() {
    sortedByLastUpdatedDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
  })

  it('displays pagination with 10 cabs per page', function() {
    cy.get('tbody > tr.govuk-table__row').should('have.length', this.cabs.slice(0,10).length)
    cy.get('.pagination-detail-container').contains(`Showing 1 - ${this.cabs.slice(0,10).length} of ${this.cabs.length} items`)
  })

  it('displays correct CAB details when filtered by Draft or Archived', function() {
    cy.get('#Filter').select('Draft')
    sortedByLastUpdatedDesc(this.draftCabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', CabHelpers.cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.get('#Filter').select('Archived')
    sortedByLastUpdatedDesc(this.cabs.filter(cab => cab.isArchived)).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', CabHelpers.cabProfilePage(cab.cabId))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
  })

  it('displays correct CAB order upon sorting by any of the sortable columns', function() {
    cy.log('CAB name Asc sort')
    cy.get('thead th a').eq(0).click()
    sortedByNameAsc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('CAB name desc sort')
    cy.get('thead th a').eq(0).click()
    sortedByNameDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('CAB Number asc sort')
    cy.get('thead th a').eq(1).click()
    sortedByNumberAsc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('CAB Number desc sort')
    cy.get('thead th a').eq(1).click()
    sortedByNumberDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('Last updated asc sort')
    cy.get('thead th a').eq(2).click()
    sortedByLastUpdatedAsc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('Last updated Desc sort')
    cy.get('thead th a').eq(2).click()
    sortedByLastUpdatedDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('Status asc sort')
    cy.get('thead th a').eq(3).click()
    sortedByStatusAsc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
    cy.log('Status Desc sort')
    cy.get('thead th a').eq(3).click()
    sortedByStatusDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', linkToCab(cab))
        cy.get('td').eq(1).contains(valueOrNotProvided(cab.cabNumber))
        cy.get('td').eq(2).contains(date(cab.lastUpdatedDate).DDMMYYYY)
        cy.get('td').eq(3).contains(cab.status)
      })
    })
  })
})