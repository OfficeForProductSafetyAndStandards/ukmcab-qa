import * as CabHelpers from '../support/helpers/cab-helpers'

describe('Adding a CAB', () => {

  context('when logged in as OGD user', () => {

    it('is not allowed', () => {
      cy.loginAsOgdUser()
      cy.ensureOn(CabHelpers.findCabPath()) 
      CabHelpers.hasNoAddCabPermission()    
    })
  })

  context('when logged in as OPSS user', () => {

    it('is not allowed', () => {
      cy.loginAsAdmin()
      cy.ensureOn(CabHelpers.findCabPath()) 
      CabHelpers.hasNoAddCabPermission()    
    })
  })

  context('when logged in as UKAS user', () => {

    it('is allowed', () => {
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.findCabPath()) 
      CabHelpers.hasAddCabPermission()    
    })
  })
})