import { hasFieldError, hasFormError } from '../support/helpers/validation-helpers'
import * as Registration from '../support/helpers/registration-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import OGDUser from '../support/domain/ogd-user'
import UKASUser from '../support/domain/ukas-user'

describe('Registration', () => {
  
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
      cy.contains('Register email confirmation')
    })

    it('when successful sends verification email to user to verify email ', () => {
      const user = new OGDUser()
      Registration.registerAsOgdUser(user)
      Registration.verifyEmail(user.email)
      cy.contains('Registration confirmation Your registration request will be reviewed and you will receive notification once approved.')
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
      const user = new OGDUser({email: `Unknown${Date.now()}@ukmcab.gov.uk`})
      Registration.registerAsOgdUser(user)
      Registration.verifyEmail(user.email)
      Registration.registerAsOgdUser(user)
      hasFormError('This email address has already been registered on the system.')
    })


    it('displays error messages if mandatory details are not supplied', () => {
      Registration.submitForm()
      hasFieldError('Email', 'The Email field is required.')
      hasFieldError('Password', 'The Password field is required.')
      hasFieldError('Confirm password', 'The Confirm password field is required.')
      hasFieldError('Legislative area', 'Please select at least one legislative area from the list.')
      hasFieldError('Reason for request', 'Please enter a reason for the request.')
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new OGDUser()
      user.password = 'Pass!'
      Registration.registerAsOgdUser(user)
      hasFormError("The Password must be at least 8 and at max 100 characters long.")

      user.password = 'Pass!Pass@'
      Registration.registerAsOgdUser(user)
      hasFormError("Passwords must have at least one digit ('0'-'9').")

      user.password = 'password3@'
      Registration.registerAsOgdUser(user)
      hasFormError("Passwords must have at least one uppercase ('A'-'Z').")

      user.password = 'Password3'
      Registration.registerAsOgdUser(user)
      hasFormError("Passwords must have at least one non alphanumeric character.")

      Registration.enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      Registration.submitForm()
      hasFormError("The password and confirmation password do not match.")
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new OGDUser({email: '12345@ukmcab.gov.sco'})
      Registration.registerAsOgdUser(user)
      hasFieldError('Email', 'Only GOV UK email addresses can register for an OGD user account')
    })
  })

  context('as a UKAS user', () => {

    beforeEach(() => {
      cy.ensureOn(Registration.registerUkasUserPath())
    })

    it('is successful if all details are supplied correctly', () => {
      Registration.registerAsUkasUser(new UKASUser())
      cy.contains('Register email confirmation')
    })

    it('when successful triggers email confirmation to the user', () => {
      const user = new UKASUser()
      Registration.registerAsUkasUser(user)
      Registration.verifyEmail(user.email)
      cy.contains('Registration confirmation You will now be able to login to your account.')
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
      hasFormError('Invalid login attempt.')
    })

    it('is unsuccessful if email used is already taken', () => {
      const user = new UKASUser({email: `UkasUser${Date.now()}@ukas.com`})
      Registration.registerAsUkasUser(user)
      Registration.verifyEmail(user.email)
      Registration.registerAsUkasUser(user)
      hasFormError('This email address has already been registered on the system.')
    })

    it('displays error messages if mandatory details are not supplied', () => {
      Registration.submitForm()
      hasFieldError('Email', 'The Email field is required.')
      hasFieldError('Password', 'The Password field is required.')
      hasFieldError('Confirm password', 'The Confirm password field is required.')
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new UKASUser()
      user.password = 'Pass!'
      Registration.registerAsUkasUser(user)
      hasFormError("The Password must be at least 8 and at max 100 characters long.")

      user.password = 'Pass!Pass@'
      Registration.registerAsUkasUser(user)
      hasFormError("Passwords must have at least one digit ('0'-'9').")

      user.password = 'password3@'
      Registration.registerAsUkasUser(user)
      hasFormError("Passwords must have at least one uppercase ('A'-'Z').")

      user.password = 'Password3'
      Registration.registerAsUkasUser(user)
      hasFormError("Passwords must have at least one non alphanumeric character.")

      Registration.enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      Registration.submitForm()
      hasFormError("The password and confirmation password do not match.")
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new UKASUser({email: '12345@ukmcab.gov.sco'})
      Registration.registerAsUkasUser(user)
      hasFieldError('Email', 'Only ukas.com email addresses can register for an UKAS user account')
    })
  })

})