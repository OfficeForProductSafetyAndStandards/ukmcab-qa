import { hasFieldError, hasFormError } from '../support/helpers/validation-helpers'
import { register, enterPasswords, submitForm } from '../support/helpers/registration-helpers'
import OGDUser from '../support/domain/ogd-user'

describe('Registration', () => {
  
  context('as an OGD user', () => {

    beforeEach(() => {
      cy.ensureOn('/Identity/Account/RegisterOGDUser')
    })

    it('is successful if all details are supplied correctly', () => {
      register(new OGDUser())
      cy.contains('Register email confirmation')
    })

    it('when successful triggers email confirmation to the user', () => {
      register(new OGDUser())
      cy.get('#confirm-link').contains('Click here to confirm your account').click()
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
      register(user)
      cy.contains('Register email confirmation')
      register(user)
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
      register(user)
      hasFormError("The Password must be at least 8 and at max 100 characters long.")

      user.password = 'Pass!Pass@'
      register(user)
      hasFormError("Passwords must have at least one digit ('0'-'9').")

      user.password = 'password3@'
      register(user)
      hasFormError("Passwords must have at least one uppercase ('A'-'Z').")

      user.password = 'Password3'
      register(user)
      hasFormError("Passwords must have at least one non alphanumeric character.")

      enterPasswords('Som3P255W0rd!', 'Som3OTHERP255W0rd!')
      submitForm()
      hasFormError("The password and confirmation password do not match.")
    })

    it('displays error if non GOV UK email address is used', () => {
      const user = new OGDUser({email: '12345@ukmcab.gov.sco'})
      register(user)
      hasFieldError('Email', 'Only GOV UK email addresses can register for and OGD user account')
    })
  })

})