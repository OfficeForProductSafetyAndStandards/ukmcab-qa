import * as CabHelpers from '../support/helpers/cab-helpers'
import Cab from '../support/domain/cab'
import { date, valueOrNotProvided } from '../support/helpers/formatters'
import { searchPath } from '../support/helpers/search-helpers'
import { CabNumberVisibility } from '../support/domain/cab-number-visibility'

describe('CAB profile page', function () {

  const supportingDocumentsTab = () => {
    return cy.contains('#tab_supporting-documents', 'Supporting documents')
  }

  context('when logged out', function() {

    beforeEach(function() {
      CabHelpers.getTestCabWithDocuments().then(cab => {
        cy.wrap(cab).as('cab')
        cy.ensureOn(CabHelpers.cabProfilePage(cab))
      })
    })

    it('displays CAB name heading', function() {
      cy.get('.govuk-heading-l').contains(this.cab.name)
    })

    it('has back to search results link', function() {
      cy.get('a').contains('Back to Search Results').and('has.attr', 'href', searchPath())
    })

    it('displays published and updated date', function() {
      cy.contains(`Published: ${date(this.cab.publishedDate).DMMMYYYY}`)
      cy.contains(`Last updated: ${date(this.cab.lastUpdatedDate).DMMMYYYY}`)
    })

    it('displays all expected CAB details', function() {
      cy.contains('.cab-detail-section', 'CAB details').within(() => {
        cy.hasKeyValueDetail('CAB name', this.cab.name)
        cy.hasKeyValueDetail('Body number', valueOrNotProvided(this.cab.cabNumber))
        cy.contains('Appointment date').should('not.exist')
        cy.contains('Review date').should('not.exist')
        cy.hasKeyValueDetail('UKAS reference number', valueOrNotProvided(this.cab.ukasRef))
      })
      cy.contains('.cab-detail-section', 'Contact details').within(() => {
        cy.hasKeyValueDetail('Address', this.cab.addressLines.join(', '))
        if(this.cab.website) {
          cy.hasKeyValueDetail('Website', this.cab.website).and('have.attr', 'href', this.cab.website.startsWith('https://') ? this.cab.website : 'https://' + this.cab.website).and('have.attr', 'target', '_blank')
        } else {
          valueOrNotProvided(this.cab.website)
        }
        if(this.cab.email) {
          cy.hasKeyValueDetail('Email', this.cab.email).and('have.attr', 'href', `mailto: ${this.cab.email}`)
        } else {
          valueOrNotProvided(this.cab.email)
        }
        cy.hasKeyValueDetail('Telephone', this.cab.phone)
        cy.hasKeyValueDetail('Registered office location', this.cab.registeredOfficeLocation)
      })
      cy.contains('.cab-detail-section', 'Body details').within(() => {
        cy.hasKeyValueDetail('Registered test location', valueOrNotProvided(this.cab.testingLocations?.join(' ')))
        cy.hasKeyValueDetail('Body type', this.cab.bodyTypes.join(' '))
        cy.hasKeyValueDetail('Legislative area', this.cab.legislativeAreas.join(' '))
      })
    })

    it('does not display Supporting Documents to logged out users', function() {
      supportingDocumentsTab().should('not.exist')
    })
  })

  context('when logged in', function () {

    beforeEach(function () {
      CabHelpers.getTestCabWithDocuments().then(cab => {
        cy.wrap(cab).as('cab')
        cy.loginAsOpssUser()
        cy.ensureOn(CabHelpers.cabProfilePage(cab))
      })
    })

    it('displays all expected CAB details', function() {
      cy.contains('.cab-detail-section', 'CAB details').within(() => {
        cy.hasKeyValueDetail('CAB name', this.cab.name)
        cy.hasKeyValueDetail('CAB number', valueOrNotProvided(this.cab.cabNumber))
        cy.hasKeyValueDetail('Appointment date', valueOrNotProvided(date(this.cab.appointmentDate)?.DMMMYYYY))
        cy.hasKeyValueDetail('Review date', valueOrNotProvided(date(this.cab.reviewDate)?.DMMMYYYY))
        cy.hasKeyValueDetail('UKAS reference number', valueOrNotProvided(this.cab.ukasRef))
      })
      cy.contains('.cab-detail-section', 'Contact details').within(() => {
        cy.hasKeyValueDetail('Address', this.cab.addressLines.join(', '))
        if(this.cab.website) {
          cy.hasKeyValueDetail('Website', this.cab.website).and('have.attr', 'href', this.cab.website.startsWith('https://') ? this.cab.website : 'https://' + this.cab.website).and('have.attr', 'target', '_blank')
        } else {
          valueOrNotProvided(this.cab.website)
        }
        if(this.cab.email) {
          cy.hasKeyValueDetail('Email', this.cab.email).and('have.attr', 'href', `mailto: ${this.cab.email}`)
        } else {
          valueOrNotProvided(this.cab.email)
        }
        cy.hasKeyValueDetail('Telephone', this.cab.phone)
        cy.hasKeyValueDetail('Registered office location', this.cab.registeredOfficeLocation)
      })
      cy.contains('.cab-detail-section', 'Body details').within(() => {
        cy.hasKeyValueDetail('Registered test location', valueOrNotProvided(this.cab.testingLocations?.join(' ')))
        cy.hasKeyValueDetail('Body type', this.cab.bodyTypes.join(' '))
        cy.hasKeyValueDetail('Legislative area', this.cab.legislativeAreas.join(' '))
      })
    })

    it('displays viewable and downloadable list of uploaded schedules', function() {
      CabHelpers.viewSchedules()
      cy.contains('.cab-detail-section', 'Product schedules').within(() => {

        // TODO: GROUP AND SORT LEGISLATIVE AREAS WHEN MULTIPE UPLOAD ISSUE IS FIXED

        this.cab.schedules.forEach((schedule,index) => {
          // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
          cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
          cy.get('.govuk-summary-list__row').eq(index).within(() => {
            cy.get('dt').contains(schedule.label)
            cy.get('dd').eq(0).contains('a', 'View').should('have.attr', 'target', '_blank').invoke('attr', 'href').should('match', /^\/search\/cab-schedule-view/)
            cy.get('dd').eq(1).contains('a', 'Download').click()
            cy.readFile(`cypress/downloads/${schedule.fileName}`)
          })
        })
      })
    })

    // Some mapping has been added that maps legacy(imported) cab schedules to legislative areas.
    // This is done at DB level. This test has picked out an entry from that mapping spreadhseet
    // and validates that all those entries are displayed on the page for this cab.
    // skipping this test as now with Archiving in place this test CAB is often archived on DEV env so tests are flaky
    it.skip('displays correct mapping of legislative areas for legacy cabs', function() {
      const expectedData = [
        {
          "Lifts": 'Lifts regulations 2016'
        },
        {
          "Transportable pressure equipment": 'Transportable Pressure Equipment Regulations 2009'
        },
        {
          "Gas appliances and related": 'Appliances Burning Gas Regulations EU 2016/426 (as retained in UK law and amended)'
        },
        {
          "Measuring instruments": 'Measuring Instruments Regulations 2016'
        },
        {
          "Construction products": 'The Construction Products Regulation 2011 (EU) No 305/2011 as it has effect in the UK as retained EU law and by virtue of the Northern Ireland Protocol'
        },
        {
          "Marine equipment": 'Marine Equipment Regulations 2016'
        },
        {
          "Personal protective equipment": 'Personal Protective Equipment Regulations (Regulation (EU) 2016/425 as brought into UK law and amended) and the Personal Protective Equipment (Enforcement) Regulations 2018'
        },
        {
          "Pressure equipment": 'Pressure Equipment (Safety) Regulations 2016'
        },
        {
          "Radio equipment": 'Radio Equipment Regulations 2017'
        },
        {
          "Ecodesign": 'Ecodesign (Boiler Efficiency Regulations)'
        },
        {
          "Medical devices": 'UK-Australia MRA'
        }
      ]
      cy.ensureOn('/search/cab-profile/bsi-assurance-uk-ltd')
      CabHelpers.viewSchedules()
      expectedData.forEach(data => {
        Object.entries(data).forEach(entry => {
          cy.contains('h3', entry[0]).next('dl').contains(entry[1])
        })
      })
    })

    it('displays viewable and downloadable list of supporting documents', function() {
      supportingDocumentsTab().click()
      cy.contains('.cab-detail-section', 'Supporting documents').within(() => {
        this.cab.documents.sort((a,b) => a.fileName.localeCompare(b.fileName)).forEach((document,index) => {
          // Known cypress issue with dowbload links timeout  - https://github.com/cypress-io/cypress/issues/14857
          cy.window().then((win) => { setTimeout(() => { win.location.reload() },5000) }) 
          cy.get('.govuk-summary-list__row').eq(index).within(() => {
            cy.get('dt').contains(document.fileName)
            if(document.fileName.endsWith('.pdf')) {
              cy.get('dd').eq(0).contains('a', 'View').should('have.attr', 'target', '_blank').invoke('attr', 'href').should('match', /^\/search\/cab-schedule-view/)
            } else {
              cy.get('dd').eq(0).contains('a', 'View').should('not.exist')
            }
            cy.get('dd').eq(1).contains('a', 'Download').click()
            cy.readFile(`cypress/downloads/${document.fileName}`)
          })
        })
      })
    })

    it('displays paginated Cab history ordered by latest first', function () {
      CabHelpers.viewHistory()
      // Assuming you have previously defined and wrapped 'cabs' using cy.wrap()
      cy.contains(`Showing 1 - ${this.cab.auditLog.slice(0, 10).length} of ${this.cab.auditLog.length}`)
      cy.wrap(Cypress._.orderBy(this.cab.auditLog, 'DateTime', 'desc').slice(0, 10)).each((log, index) => {
        cy.get('tbody tr').eq(index).within(() => {
          cy.get('td').eq(0).contains(Cypress.dayjs(log.DateTime).utc().format('DD/MM/YYYYHH:mm'))
          cy.get('td').eq(1).contains(log.UserName)
          cy.get('td').eq(2).contains(log.UserRole.toUpperCase())
          cy.get('td').eq(3).contains(Cypress._.capitalize(Cypress._.startCase(log.Action)))
          if (log.Comment) {
            cy.get('td').eq(4).contains('View more ') // + log.Comment - removed comment check as its seems to be wrapped in HTML. // TODO check with devs
          }
        })
      })
    })
  })

  context('for CABs with Cab number visibility set to public(default)', function() {

    it('displays Cab(Body) number for public and internal users', function() {
      const cab = Cab.build()
      cy.loginAsOpssUser()
      CabHelpers.createCab(cab)
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.hasKeyValueDetail('CAB number', cab.cabNumber)
      cy.logout()
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.hasKeyValueDetail('Body number', cab.cabNumber)
    })
  })

  context('for CABs with Cab number visibility set to internal(Display for all internal)', function() {

    it('displays Cab(Body) number for UKAS/OPSS users but not for Public users', function() {
      const cab = Cab.build()
      cab.cabNumberVisibility = CabNumberVisibility.Internal
      cy.loginAsOpssUser()
      CabHelpers.createCab(cab)
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.hasKeyValueDetail('CAB number', cab.cabNumber)
      cy.logout()
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.hasKeyValueDetail('CAB number', cab.cabNumber)
      cy.logout()
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.contains('Body number').should('not.exist')
    })
  })

  context('for CABs with Cab number visibility set to private(Display for only internal gov users)', function() {

    it('displays Cab(Body) number for OPSS users but not for Public/UKAS users', function() {
      const cab = Cab.build()
      cab.cabNumberVisibility = CabNumberVisibility.Private
      cy.loginAsOpssUser()
      CabHelpers.createCab(cab)
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.hasKeyValueDetail('CAB number', cab.cabNumber)
      cy.logout()
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.contains('CAB number').should('not.exist')
      cy.logout()
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.contains('Body number').should('not.exist')
    })
  })

})