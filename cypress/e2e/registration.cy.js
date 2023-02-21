import { hasFieldError, hasFormError } from '../support/helpers/validation-helpers'
import * as Registration from '../support/helpers/registration-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import OGDUser from '../support/domain/ogd-user'
import UKASUser from '../support/domain/ukas-user'
import OpssAdminUser from '../support/domain/opss-admin-user'

xdescribe('Registration', () => {
  
  context('as a new user', () => {
    beforeEach(() => {
      cy.ensureOn(Registration.path())
    })

    it('displays options to register as OGD, UKAS or OPSS Admin user', () => {
      cy.contains('a', 'Register as OGD user').should('have.attr', 'href', Registration.registerOgdUserPath())
      cy.contains('a', 'Register as UKAS user').should('have.attr', 'href', Registration.registerUkasUserPath())
      cy.contains('a', 'Register as OPSS administrator').should('have.attr', 'href', Registration.registerOpssAdminUserPath())
    })
  })

  context('as an OGD user', () => {

    beforeEach(() => {
      cy.ensureOn(Registration.registerOgdUserPath())
    })

    it('is successful if all details are supplied correctly', () => {
      Registration.registerAsOgdUser(new OGDUser())
      Registration.hasConfirmYourEmailMessage()
    })

    it('when successful sends verification email to user to verify email ', () => {
      const user = new OGDUser()
      Registration.registerAsOgdUser(user)
      Registration.verifyEmail(user.email)
      Registration.hasPendingApprovalMessage()
    })

    it('displays expected list of legislative areas', () => {
      cy.contains('Legislative areas').next().within(() => {
        cy.get('label').then($labels => {
          const legislativeAreas = Array.from($labels, $label => $label.innerText)
          expect(legislativeAreas).to.deep.equal(['Cableway Installation', 'Construction Products', 'Ecodesign', 'Electromagnetic Compatibility', 'Equipment and protective systems for use in potentially explosive atmospheres', 'Explosives', 'Gas appliances and related', 'Lifts', 'Machinery', 'Marine equipment', 'Measuring instruments', 'Medical devices', 'Noise emissions in the environment by equipment for use outdoors', 'Non-automatic weighing instruments', 'Personal protective equipment', 'Pressure equipment', 'Pyrotechnics', 'Radio equipment', 'Railway interoperability', 'Recreational craft', 'Simple pressure vessels', 'Toys', 'Transportable pressure equipment'])
        })
      })
    })

    it('is unsuccessful if email used is already taken', () => {
      const user = new OGDUser({email: `OgdUser${Date.now()}@ukmcab.gov.uk`})
      Registration.registerAsOgdUser(user)
      Registration.verifyEmail(user.email)
      Registration.registerAsOgdUser(user)
      hasFormError(Registration.errors.emailAlreadyRegistered)
    })


    it('displays error messages if mandatory details are not supplied', () => {
      Registration.submitForm()
      hasFieldError('Email', Registration.errors.emailRequired)
      hasFieldError('Password', Registration.errors.passwordRequired)
      hasFieldError('Confirm password', Registration.errors.confirmPasswordRequired)
      hasFieldError('Legislative area', Registration.errors.selectLegislativeArea)
      hasFieldError('Reason for request', Registration.errors.enterRequestReason)
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new OGDUser()
      user.password = 'Pass!'
      Registration.registerAsOgdUser(user)
      hasFormError(Registration.errors.passwordLength)

      user.password = 'Pass!Pass@'
      Registration.registerAsOgdUser(user)
      hasFormError(Registration.errors.passwordAtleastOneDigit)

      user.password = 'password3@'
      Registration.registerAsOgdUser(user)
      hasFormError(Registration.errors.passwordAtleastOneUppercase)

      user.password = 'Password3'
      Registration.registerAsOgdUser(user)
      hasFormError(Registration.errors.passwordAtleastOneNonAlphanum)

      Registration.enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      Registration.submitForm()
      hasFormError(Registration.errors.passwordsDontMatch)
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new OGDUser({email: '12345@ukmcab.gov.sco'})
      Registration.registerAsOgdUser(user)
      hasFieldError('Email', Registration.errors.onlyGovUkEmailAllowedForOGD)
    })
  })

  context('as a UKAS user', () => {

    beforeEach(() => {
      cy.ensureOn(Registration.registerUkasUserPath())
    })

    it('is successful if all details are supplied correctly', () => {
      Registration.registerAsUkasUser(new UKASUser())
      Registration.hasConfirmYourEmailMessage()

    })

    it('when successful triggers email confirmation to the user', () => {
      const user = new UKASUser()
      Registration.registerAsUkasUser(user)
      Registration.verifyEmail(user.email)
      Registration.hasConfirmation()
    })

    it('when successful and email verified allows user to login', () => {
      const user = new UKASUser()
      Registration.registerAsUkasUser(user)
      Registration.verifyEmail(user.email)
      cy.login(user.email, user.password)
      shouldBeLoggedIn()
    })

    it('when successful but email is not verified blocks user from login', () => {
      const user = new UKASUser()
      Registration.registerAsUkasUser(user)
      cy.login(user.email, user.password)
      shouldBeLoggedOut()
      hasFormError(Registration.errors.invalidLoginAttempt)
    })

    it('is unsuccessful if email used is already taken', () => {
      const user = new UKASUser({email: `UkasUser${Date.now()}@ukas.com`})
      Registration.registerAsUkasUser(user)
      Registration.verifyEmail(user.email)
      Registration.registerAsUkasUser(user)
      hasFormError(Registration.errors.emailAlreadyRegistered)
    })

    it('displays error messages if mandatory details are not supplied', () => {
      Registration.submitForm()
      hasFieldError('Email', Registration.errors.emailRequired)
      hasFieldError('Password', Registration.errors.passwordRequired)
      hasFieldError('Confirm password', Registration.errors.confirmPasswordRequired)
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new UKASUser()
      user.password = 'Pass!'
      Registration.registerAsUkasUser(user)
      hasFormError(Registration.errors.passwordLength)

      user.password = 'Pass!Pass@'
      Registration.registerAsUkasUser(user)
      hasFormError(Registration.errors.passwordAtleastOneDigit)

      user.password = 'password3@'
      Registration.registerAsUkasUser(user)
      hasFormError(Registration.errors.passwordAtleastOneUppercase)

      user.password = 'Password3'
      Registration.registerAsUkasUser(user)
      hasFormError(Registration.errors.passwordAtleastOneNonAlphanum)

      Registration.enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      Registration.submitForm()
      hasFormError(Registration.errors.passwordsDontMatch)
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new UKASUser({email: '12345@ukmcab.gov.sco'})
      Registration.registerAsUkasUser(user)
      hasFieldError('Email', Registration.errors.onlyUkasEmailAllowed)
    })
  })

  context('as an OPSS Admin user', () => {

    beforeEach(() => {
      cy.ensureOn(Registration.registerOpssAdminUserPath())
    })

    it('is successful if all details are supplied correctly', () => {
      Registration.registerAsOpssAdminUser(new OpssAdminUser())
      Registration.hasConfirmYourEmailMessage()
    })

    it('when successful sends verification email to user to verify email ', () => {
      const user = new OpssAdminUser()
      Registration.registerAsOpssAdminUser(user)
      Registration.verifyEmail(user.email)
      Registration.hasPendingApprovalMessage()
    })

    it('displays expected list of legislative areas', () => {
      cy.contains('Legislative areas').next().within(() => {
        cy.get('label').then($labels => {
          const legislativeAreas = Array.from($labels, $label => $label.innerText)
          expect(legislativeAreas).to.deep.equal(['Cableway Installation', 'Construction Products', 'Ecodesign', 'Electromagnetic Compatibility', 'Equipment and protective systems for use in potentially explosive atmospheres', 'Explosives', 'Gas appliances and related', 'Lifts', 'Machinery', 'Marine equipment', 'Measuring instruments', 'Medical devices', 'Noise emissions in the environment by equipment for use outdoors', 'Non-automatic weighing instruments', 'Personal protective equipment', 'Pressure equipment', 'Pyrotechnics', 'Radio equipment', 'Railway interoperability', 'Recreational craft', 'Simple pressure vessels', 'Toys', 'Transportable pressure equipment'])
        })
      })
    })

    it('is unsuccessful if email used is already taken', () => {
      const user = new OpssAdminUser({email: `OpssAdminUser${Date.now()}@ukmcab.gov.uk`})
      Registration.registerAsOpssAdminUser(user)
      Registration.verifyEmail(user.email)
      Registration.registerAsOpssAdminUser(user)
      hasFormError(Registration.errors.emailAlreadyRegistered)
    })


    it('displays error messages if mandatory details are not supplied', () => {
      Registration.submitForm()
      hasFieldError('Email', Registration.errors.emailRequired)
      hasFieldError('Password', Registration.errors.passwordRequired)
      hasFieldError('Confirm password', Registration.errors.confirmPasswordRequired)
      hasFieldError('Legislative area', Registration.errors.selectLegislativeArea)
      hasFieldError('Reason for request', Registration.errors.enterRequestReason)
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new OpssAdminUser()
      user.password = 'Pass!'
      Registration.registerAsOpssAdminUser(user)
      hasFormError(Registration.errors.passwordLength)

      user.password = 'Pass!Pass@'
      Registration.registerAsOpssAdminUser(user)
      hasFormError(Registration.errors.passwordAtleastOneDigit)

      user.password = 'password3@'
      Registration.registerAsOpssAdminUser(user)
      hasFormError(Registration.errors.passwordAtleastOneUppercase)

      user.password = 'Password3'
      Registration.registerAsOpssAdminUser(user)
      hasFormError(Registration.errors.passwordAtleastOneNonAlphanum)

      Registration.enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      Registration.submitForm()
      hasFormError(Registration.errors.passwordsDontMatch)
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new OpssAdminUser({email: '12345@ukmcab.gov.sco'})
      Registration.registerAsOgdOrOpssAdminUser(user)
      hasFieldError('Email', Registration.errors.onlyGovUkEmailAllowedForOPSS)
    })
  })

})