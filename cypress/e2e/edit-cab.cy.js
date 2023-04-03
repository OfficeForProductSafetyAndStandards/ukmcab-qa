import * as CabHelpers from '../support/helpers/cab-helpers'

xdescribe('Editing a CAB', () => {

  beforeEach(function() {
    CabHelpers.getTestCab().then(cab => {
      cy.wrap(cab).as('cab')
    })
  })

  context('when logged in as OGD user', () => {

    it('is not allowed', function() {
      cy.loginAsOgdUser()
      CabHelpers.viewCabPage(this.cab.cabId)
      CabHelpers.hasEditCabPermission()    
    })
  })

  context('when logged in as OPSS user', () => {

    it('is not allowed', function() {
      cy.loginAsOpssUser()
      CabHelpers.viewCabPage(this.cab.cabId)
      CabHelpers.hasEditCabPermission()    
    })
  })

  context('when logged in as UKAS user', () => {

    it('is allowed', function() {
      cy.loginAsUkasUser()
      CabHelpers.viewCabPage(this.cab.cabId)
      CabHelpers.hasEditCabPermission()    
    })
  })
})