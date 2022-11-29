import { hasFieldError, hasFormError } from '../support/helpers/validation-helpers'
import { registerOgdUserPath, registerUkasUserPath, registerAsOgdUser, registerAsUkasUser, enterPasswords, submitForm, verifyEmail } from '../support/helpers/registration-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import OGDUser from '../support/domain/ogd-user'
import UKASUser from '../support/domain/ukas-user'

describe('Registration', () => {
  
  const registerPath = () => { return '/Identity/Account/Register'}

  context('as an OGD user', () => {

    beforeEach(() => {
      cy.ensureOn(registerOgdUserPath())
    })

    it('displays OGD registration page', () => {
      cy.ensureOn(registerPath())
      cy.contains('a', 'Register as OGD user').click()
      cy.location('pathname').should('equal', registerOgdUserPath())
    })

    it('is successful if all details are supplied correctly', () => {
      registerAsOgdUser(new OGDUser())
      cy.contains('Register email confirmation')
    })

    it('when successful triggers email confirmation to the user', () => {
      registerAsOgdUser(new OGDUser())
      verifyEmail()
      cy.contains('Thank you for confirming your email. Your registration request will be reviewed and you will receive notification once approved.')
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
      registerAsOgdUser(user)
      cy.contains('Register email confirmation')
      registerAsOgdUser(user)
      cy.contains(`Username '${user.email}' is already taken.`)
    })


    it('displays error messages if mandatory details are not supplied', () => {
      submitForm()
      hasFieldError('Email', 'The Email field is required.')
      hasFieldError('Password', 'The Password field is required.')
      hasFieldError('Legislative area', 'Please select at least one legislative area')
      hasFieldError('Reason for request', 'Please provide a reason for the request')
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new OGDUser()
      user.password = 'Pass!'
      registerAsOgdUser(user)
      hasFormError("The Password must be at least 8 and at max 100 characters long.")

      user.password = 'Pass!Pass@'
      registerAsOgdUser(user)
      hasFormError("Passwords must have at least one digit ('0'-'9').")

      user.password = 'password3@'
      registerAsOgdUser(user)
      hasFormError("Passwords must have at least one uppercase ('A'-'Z').")

      user.password = 'Password3'
      registerAsOgdUser(user)
      hasFormError("Passwords must have at least one non alphanumeric character.")

      enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      submitForm()
      hasFormError("The password and confirmation password do not match.")
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new OGDUser({email: '12345@ukmcab.gov.sco'})
      registerAsOgdUser(user)
      hasFieldError('Email', 'Only GOV UK email addresses can register for and OGD user account')
    })
  })

  context('as a UKAS user', () => {

    beforeEach(() => {
      cy.ensureOn(registerUkasUserPath())
    })

    it('displays OGD registration page', () => {
      cy.ensureOn(registerPath())
      cy.contains('a', 'Register as UKAS user').click()
      cy.location('pathname').should('equal', registerUkasUserPath())
    })

    it('is successful if all details are supplied correctly', () => {
      registerAsUkasUser(new UKASUser())
      cy.contains('Register email confirmation')
    })

    it('when successful triggers email confirmation to the user', () => {
      registerAsUkasUser(new UKASUser())
      verifyEmail()
      cy.contains('Thank you for confirming your email. You will now be able to login to your account.')
    })

    it('when successful and email verified allows user to login', () => {
      const user = new UKASUser()
      registerAsUkasUser(user)
      verifyEmail()
      cy.login(user.email, user.password)
      shouldBeLoggedIn()
    })

    it('when successful but email is not verified blocks user from login', () => {
      const user = new UKASUser()
      registerAsUkasUser(user)
      cy.login(user.email, user.password)
      shouldBeLoggedOut()
      hasFormError('Registration request has not yet been approved.')
    })

    it('is unsuccessful if email used is already taken', () => {
      const user = new UKASUser({email: `UkasUser${Date.now()}@ukas.com`})
      registerAsUkasUser(user)
      cy.contains('Register email confirmation')
      registerAsUkasUser(user)
      cy.contains(`Username '${user.email}' is already taken.`)
    })

    it('displays error messages if mandatory details are not supplied', () => {
      submitForm()
      hasFieldError('Email', 'The Email field is required.')
      hasFieldError('Password', 'The Password field is required.')
    })

    it('displays error if password does not comply with GDS standard', () => {
      const user = new UKASUser()
      user.password = 'Pass!'
      registerAsUkasUser(user)
      hasFormError("The Password must be at least 8 and at max 100 characters long.")

      user.password = 'Pass!Pass@'
      registerAsUkasUser(user)
      hasFormError("Passwords must have at least one digit ('0'-'9').")

      user.password = 'password3@'
      registerAsUkasUser(user)
      hasFormError("Passwords must have at least one uppercase ('A'-'Z').")

      user.password = 'Password3'
      registerAsUkasUser(user)
      hasFormError("Passwords must have at least one non alphanumeric character.")

      enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      submitForm()
      hasFormError("The password and confirmation password do not match.")
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new UKASUser({email: '12345@ukmcab.gov.sco'})
      registerAsUkasUser(user)
      hasFieldError('Email', 'Only ukas.com email addresses can register for and UKAS user account')
    })
  })

})