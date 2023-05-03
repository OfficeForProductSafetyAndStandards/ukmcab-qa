import { addCabPath, cabSummaryPage } from "../support/helpers/cab-helpers"
import * as CabHelpers from '../support/helpers/cab-helpers'

describe('Work Queue', function() {

  const sortedByLastUpdatedDesc = (cabs) => {
    return cabs.sort(c => c.lastUpdatedDate).reverse()
  }

  const sortedByNameAsc = (cabs) => {
    return cabs.sort((a,b) => a.name.localeCompare(b.name) || a.createdDate - b.createdDate)
  }

  const sortedByNameDesc = (cabs) => {
    return cabs.sort((a,b) => b.name.localeCompare(a.name) || a.createdDate - b.createdDate)
  }

  const sortedByNumberAsc = (cabs) => {
    return cabs.sort((a,b) => a.cabNumber.localeCompare(b.cabNumber) || a.createdDate - b.createdDate)
  }

  const sortedByNumberDesc = (cabs) => {
    return cabs.sort((a,b) => b.cabNumber.localeCompare(a.cabNumber) || a.createdDate - b.createdDate)
  }

  beforeEach(function() {
    cy.loginAsOpssUser()
    cy.ensureOn(CabHelpers.workQueuePath())
    CabHelpers.getAllDraftOrArchivedCabs().then(cabs => {
      cy.wrap(cabs).as('cabs')
    })
    CabHelpers.getAllDraftCabs().then(cabs => {
      cy.wrap(cabs).as('draftCabs')
    })
  })

  it('displays option to create a new CAB', function() {
    cy.get('a.govuk-button').should('contain', 'Create a CAB').and('has.attr', 'href', addCabPath())
  })

  it('displays All(Draft or Archived) CABs sorted by Last Updated Date by default', function() {
    sortedByLastUpdatedDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(cab.cabNumber)
        cy.get('td').eq(2).contains(cab.status)
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
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(cab.cabNumber)
        cy.get('td').eq(2).contains(cab.status)
      })
    })
    // TODO - Archive not yet developed
    // cy.get('#Filter').select('Archived')
    // this.sortedCabs.filter(cab => cab.Status === "Archived").forEach((cab, index) => {
    //   cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
    //     cy.get('td').eq(0).contains(cab.Name).and('has.attr', 'href', '#')
    //     cy.get('td').eq(1).contains(cab.CABNumber ?? 'Not provided')
    //     cy.get('td').eq(2).contains(cab.Status)
    //   })
    // })
  })

  it('displays correct CAB order upon sorting by any of the sortable columns', function() {
    cy.get('thead th a').eq(0).click() // CAB name Asc sort
    sortedByNameAsc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(cab.cabNumber)
        cy.get('td').eq(2).contains(cab.status)
      })
    })
    cy.get('thead th a').eq(0).click() // CAB name desc sort
    sortedByNameDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(cab.cabNumber)
        cy.get('td').eq(2).contains(cab.status)
      })
    })
    cy.get('thead th a').eq(1).click() // CAB Number asc sort
    sortedByNumberAsc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(cab.cabNumber)
        cy.get('td').eq(2).contains(cab.status)
      })
    })
    cy.get('thead th a').eq(1).click() // CAB Number desc sort
    sortedByNumberDesc(this.cabs).slice(0,10).forEach((cab, index) => {
      cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
        cy.get('td').eq(0).contains(cab.name).and('has.attr', 'href', cabSummaryPage(cab.cabId))
        cy.get('td').eq(1).contains(cab.cabNumber)
        cy.get('td').eq(2).contains(cab.status)
      })
    })
    // TODO Sort by Status when Archiving is developed
  })
})