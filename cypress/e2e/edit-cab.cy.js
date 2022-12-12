import * as CabHelpers from '../support/helpers/cab-helpers'

describe('Editing a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })

  context('when logged in as OGD user', () => {

    it('is not allowed', function() {
      cy.loginAsOgdUser()
      CabHelpers.viewCabPage(this.cab.id)
      CabHelpers.hasNoEditCabPermission()    
    })
  })

  context('when logged in as OPSS user', () => {

    it('is not allowed', function() {
      cy.loginAsAdmin()
      CabHelpers.viewCabPage(this.cab.id)
      CabHelpers.hasNoEditCabPermission()    
    })
  })

  context('when logged in as UKAS user', () => {

    it('is allowed', function() {
      cy.loginAsUkasUser()
      CabHelpers.viewCabPage(this.cab.id)
      CabHelpers.hasEditCabPermission()    
    })
  })
})