  import {basicAuthCreds} from '../support/helpers/common-helpers'

describe('CAB profile page', () => {
  
  beforeEach(() => {
    cy.task('getItems').then(items => {
      cy.wrap(items[0]).as('cab')
      cy.visit('/find-a-cab/profile', {...{qs: {id: items[0].id}}, ...basicAuthCreds()})
    })
  })

  it('displays CAB name', function() {
    cy.contains('.govuk-heading-l', this.cab.name)
  })
})