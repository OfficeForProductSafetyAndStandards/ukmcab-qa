import * as CabHelpers from '../support/helpers/cab-helpers'
import { hasError } from '../support/helpers/validation-helpers'
import Cab from '../support/domain/cab'

describe('Adding a CAB', () => {

  beforeEach(function(){
    cy.wrap(new Cab()).as('cab')
  })
  
  context('when logged in as OGD user', () => {
    
    it('is not allowed', () => {
      cy.loginAsOgdUser()
      cy.ensureOn(CabHelpers.findCabPath()) 
      CabHelpers.hasNoAddCabPermission()    
    })
  })
  
  context('when logged in as OPSS user', () => {
    
    beforeEach(() => {
      cy.loginAsAdmin()
      cy.ensureOn(CabHelpers.addCabPath())
    })

    it('displays error when mandatory values are not entered', function() {
      CabHelpers.saveAsDraft()
      hasError('What is the name of the Conformity Assessment Body (CAB)?', CabHelpers.errors.nameRequired)
      hasError('Address', CabHelpers.errors.addressRequired)
      hasError('Website', CabHelpers.errors.emailPhoneOrWebsiteRequired)
      hasError('Which Regulation(s) does this CAB cover?', CabHelpers.errors.regulationRequired)
    })
    
    it('displays error if at least on of email phone or website is not provided', function() {
      this.cab.email = null
      this.cab.phone = null
      this.cab.website = null
      CabHelpers.addCabAsOpssUser(this.cab)
      hasError('Website', CabHelpers.errors.emailPhoneOrWebsiteRequired)
    })
    
    it('does not display error if any one of email phone or website is provided', function() {
      this.cab.address = null // setting to null to avoid creating new cab
      this.cab.phone = null
      this.cab.website = null
      CabHelpers.addCabAsOpssUser(this.cab)
      cy.contains(CabHelpers.errors.emailPhoneOrWebsiteRequired).should('not.exist')
    })
    
    it('does error if cab name is already registered', function() {
      CabHelpers.addCabAsOpssUser(this.cab)
      cy.ensureOn(CabHelpers.addCabPath())
      CabHelpers.addCabAsOpssUser(this.cab)
      hasError('What is the name of the Conformity Assessment Body (CAB)?', CabHelpers.errors.cabNameExists)
    })

    it('is successful if all details are provided correctly', function() {
      CabHelpers.addCabAsOpssUser(this.cab)
      // TODO: Assert CAB creation when front end built
    })
  })

  context('when logged in as UKAS user', () => {

    beforeEach(() => {
      cy.loginAsUkasUser()
      cy.ensureOn(CabHelpers.addCabPath())
    })

    it('is successful if all details are provided correctly', function() {
      CabHelpers.addCabAsUkasUser(this.cab)
      // TODO: Assert CAB creation when front end built   
    })

    it('UKAS ref number is not mandatory', function() {
      this.cab.ukasRefNo = null
      CabHelpers.addCabAsUkasUser(this.cab)
      // TODO: Assert CAB creation when front end built   
    })

    it('displays error when mandatory values are not entered before submitting for approval', function() {
      CabHelpers.saveAsDraft()
      hasError('What is the name of the Conformity Assessment Body (CAB)?', CabHelpers.errors.nameRequired)
      hasError('Address', CabHelpers.errors.addressRequired)
      hasError('Website', CabHelpers.errors.emailPhoneOrWebsiteRequired)
      hasError('Which Regulation(s) does this CAB cover?', CabHelpers.errors.regulationRequired)
    })
  })
})