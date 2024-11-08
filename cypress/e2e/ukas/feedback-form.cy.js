import * as EmailHelpers from '../../support/helpers/email-helpers'
describe('Feedback form', () => {
  
  beforeEach(() => {
    cy.ensureOn('/')
  })
  
  const feedbackForm = () => {
    return cy.get('#feedback-form-details')
  }
  
  const submitFeedback = (doing, wrong, email) => {
    feedbackForm().within(() => {
      cy.get('#WhatWereYouDoing').invoke('text', doing)
      cy.get('#WhatWentWrong').invoke('text', wrong)
      cy.get('#Email').invoke('val', email)
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
      feedbackForm().contains('Help us improve this service')
      feedbackForm().contains("We use your feedback to make our service easier to use.")
      feedbackForm().contains('h3', 'What were you doing?').next().contains('Explain, step by step, what you did. If we can reproduce a problem, we can try and fix it.')
      feedbackForm().contains('h3', 'What went wrong?').next().contains('Explain what you expected to happen, and what actually happened. A clear explanation will help us fix the problem.')
      feedbackForm().contains('label', 'Email address (optional)').next().contains('We may contact you to ask you some questions about your feedback')

    })

    it('displays error if required details are not provided', () => {
      // all fields blank
      submitFeedback('', '', '')
      cy.contains('#feedback-form-error-message', 'Enter information about what you were doing and what went wrong')
      cy.get('#WhatWereYouDoing').should('have.class', 'feedback-form-error')
      cy.get('#WhatWentWrong').should('have.class', 'feedback-form-error')

      // first and last field blank
      submitFeedback('', 'Something went wrong', '')
      cy.contains('button', 'Send').click()
      cy.get('#WhatWereYouDoing').should('have.class', 'feedback-form-error')
      cy.get('#WhatWentWrong').should('not.have.class', 'feedback-form-error')
      cy.get('#Email').should('not.have.class', 'feedback-form-error')
      cy.contains('#feedback-form-error-message', 'Enter information about what you were doing')

      // second and last field blank
      submitFeedback('Was doing something', '', '')
      cy.get('#WhatWereYouDoing').should('not.have.class', 'feedback-form-error')
      cy.get('#WhatWentWrong').should('have.class', 'feedback-form-error')
      cy.get('#Email').should('not.have.class', 'feedback-form-error')
      cy.contains('#feedback-form-error-message', 'Enter details of what went wrong')
    })

    it('collapses when Cancel is clicked', () => {
      feedbackForm().contains('a,button', 'Cancel').click()
      feedbackForm().should('not.have.attr', 'open')
    })

    it('displays success message upon successful submission with option to submit new feedback', () => {
      submitFeedback('Doing something', 'Something wrong', 'test@example.test')
      feedbackForm().contains('Thank you for your feedback')
      feedbackForm().contains('a', 'Provide more feedback about this page').click()
      feedbackForm().should('have.attr', 'open')
      EmailHelpers.getLastUserEmail('test.feedback@test.gov.uk').then(email => {
        expect(email.isRecent).to.be.true
        expect(email.isFeedbackEmail).to.be.true
      })
    })
  })

})
