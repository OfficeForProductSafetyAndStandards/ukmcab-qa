import * as EmailHelpers from '../support/helpers/email-helpers'
describe('Feedback form', () => {
  
  beforeEach(() => {
    cy.ensureOn('/')
  })
  
  const feedbackForm = () => {
    return cy.get('#feedback-form-details')
  }
  
  const submitFeedback = (doing, wrong) => {
    feedbackForm().within(() => {
      cy.get('#WhatWereYouDoing').invoke('text', doing)
      cy.get('#WhatWentWrong').invoke('text', wrong)
      cy.contains('button', 'Send').click()
    })
  }

  it('is collapsed by default', () => {
    feedbackForm().should('not.have.attr', 'open')
  })
  
  context('when submitting feedback', () => {

    beforeEach(() => {
      cy.contains('Is there anything wrong with this page?').click()
    })

    it('displays as expected', () => {
      feedbackForm().contains('Help us improve GOV.UK')
      feedbackForm().contains("Don't include personal or financial information like your National Insurance number or credit card details.")
      feedbackForm().contains('h3', 'What you were doing').next().contains('Please explain, step by step, what you did. If we can reproduce a problem, we can try and fix it.')
      feedbackForm().contains('h3', 'What went wrong').next().contains('Please explain what you expected to happen, and what actually happened. A clear explanation will help us fix the problem.')
    })

    it('displays error if required details are not provided', () => {
      // both fields blank
      submitFeedback('', '')
      cy.contains('#feedback-form-error-message', 'Please enter details of what you were doing and what went wrong.')
      cy.get('#WhatWereYouDoing').should('have.class', 'feedback-form-error')
      cy.get('#WhatWentWrong').should('have.class', 'feedback-form-error')

      // first field blank
      submitFeedback('', 'Something went wrong')
      cy.contains('button', 'Send').click()
      cy.get('#WhatWereYouDoing').should('have.class', 'feedback-form-error')
      cy.get('#WhatWentWrong').should('not.have.class', 'feedback-form-error')
      cy.contains('#feedback-form-error-message', 'Please enter details of what you were doing.')

      // second field blank
      submitFeedback('Was doing something', '')
      cy.get('#WhatWereYouDoing').should('not.have.class', 'feedback-form-error')
      cy.get('#WhatWentWrong').should('have.class', 'feedback-form-error')
      cy.contains('#feedback-form-error-message', 'Please enter details of what went wrong.')
    })

    it('collapses when Cancel is clicked', () => {
      feedbackForm().contains('a,button', 'Cancel').click()
      feedbackForm().should('not.have.attr', 'open')
    })

    it('displays success message upon successful submission with option to submit new feedback', () => {
      submitFeedback('Doing something', 'Something wrong')
      feedbackForm().contains('Thank you for your help We will look to improve this service based on your feedback.')
      feedbackForm().contains('a', 'Submit further feedback on this page').click()
      feedbackForm().should('have.attr', 'open')
      EmailHelpers.getLastUserEmail('test.feedback@teset.gov.uk').then(email => {
        expect(email.isRecent).to.be.true
        expect(email.isFeedbackEmail).to.be.true
      })
    })
  })

})