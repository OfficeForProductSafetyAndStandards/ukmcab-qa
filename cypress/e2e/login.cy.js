import { basicAuthCreds } from '../support/utils'

describe('Logging in', () => {
  
  const login = (email,password) => {
    cy.get('#Input_Email').invoke('val', email)
    cy.get('#Input_Password').invoke('val', password)
    cy.contains('Log in').click()
  }

  const hasFieldError = (fieldLabel,error) => {
    cy.contains('label', fieldLabel).prev().contains(error)
  }

  beforeEach(() => {
    cy.visit('/admin', basicAuthCreds())
  })

  context('as an Admin user', () => {

    it('displays error when using unknown credentials', () => {
      login(`Unknown${Date.now()}@ukmcab.gov.uk`, 'Som3P255W0rd!')
      hasFieldError('Email', 'Invalid login attempt.')
    })

    it('displays CAB list upon successful login', () => {
      login('admin@ukmcab.gov.uk', 'adminP@ssw0rd!')
      cy.contains('CAB list')
    })

    it('displays email/password validation errors', () => {
      login('', 'adminP@ssw0rd!')
      hasFieldError('Email', 'The Email field is required.')

      login('admin@ukmcab.gov.uk', '')
      hasFieldError('Password', 'The Password field is required.')

      
      login('', '')
      hasFieldError('Email', 'The Email field is required.')
      hasFieldError('Password', 'The Password field is required.')
    })

    it('displays link to reset password', () => {
      cy.contains('a', 'Forgot your password')
    })

    it('displays link to register as a new user', () => {
      cy.contains('a', 'Register as a new user')
    })

    // TODO: Once behaviour is confirmed. Only existing accounts are locked at present
    // Test will require an account to be created first and then test the locking
    // it.only('locks account after 5 unsuccessful attempts', () => {
    // })
  })

})