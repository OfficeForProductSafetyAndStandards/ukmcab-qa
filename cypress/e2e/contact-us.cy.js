import { contactUsUrl, privacyUrl, termsUrl, searchUrl } from "../support/helpers/url-helpers";
import { getLastUserEmail } from "../support/helpers/email-helpers";
import { footer } from '../support/helpers/common-helpers'

describe('Contact us page', function() {

  beforeEach(() => {
    cy.ensureOn(contactUsUrl())
  })

  function submitForm(name, email, subject, message) {
    cy.get('#Name').invoke('val', name)
    cy.get('#Email').invoke('val', email)
    cy.get('#Subject').invoke('val', subject)
    cy.get('#Message').invoke('val', message)
    cy.get('a,button').contains('Submit').click()
  }

  it('displays error if submitted without mandatory data', function() {
    cy.get('a,button').contains('Submit').click()
    cy.hasError('Name', 'Enter a name')
    cy.hasError('Email address', 'Enter an email address')
    cy.hasError('Subject', 'Enter a subject')
    cy.hasError('Message', 'Enter a message')
  })
  
  it('returns user to last visited page on clicking - Cancel', function() {
    cy.ensureOn(searchUrl())
    footer().contains('a', 'Contact').click()
    cy.contains('a', 'Cancel').click()
    cy.location('pathname').should('equal', searchUrl())
  })

  it('enforces defined max length for all fields', function() {
    cy.get('#Name').should('have.attr', 'maxlength', 50)
    cy.get('#Email').should('have.attr', 'maxlength', 50)
    cy.get('#Subject').should('have.attr', 'maxlength', 100)
    submitForm('Test user', 'testuser@gov.uk', 'Test subject', 'X'.repeat(1001))
    cy.hasError('Message', 'Maximum message length is 1000 characters')
    cy.contains('You have 1 character too many')
  })

  it('displays privacy and terms acceptance', function() {
    cy.get('text').contains('By sending this message, you confirm you have read and agreed to privacy policy and terms of service').within($el => {
      cy.wrap($el).find('a').contains('privacy policy').and('has.attr', 'href', privacyUrl())
      cy.wrap($el).find('a').contains('terms of service').and('has.attr', 'href', termsUrl())
    })
  })

  it('displays confirmation message for valid submission with emails sent to user and OPSS designated email address', function() {
    let name = 'Test user'
    let email = 'testuser@gov.uk'
    let subject = 'Test subject'
    let message = 'Test message'
    submitForm(name, email, subject, message)
    cy.contains('Your message has been submitted')
    cy.contains("We'll get back to you as soon as possible.")
    cy.get('a').contains('Submit another message').and('has.attr', 'href', contactUsUrl() + '?returnUrl=%252F')
    getLastUserEmail(email).then(_email => {
      expect(_email.isRecent).to.be.true
      expect(_email.isContactSubmissionEmail(name, email, subject, message)).to.be.true
    })
    getLastUserEmail('opss.enquiries@bies.gov.uk').then(_email => {
      expect(_email.isRecent).to.be.true
      expect(_email.isContactSubmissionOpssEmail(name, email, subject, message)).to.be.true
    })
  })

})