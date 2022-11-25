export const hasFieldError = (fieldLabel,error) => {
  cy.contains('label', fieldLabel).prev().contains(error)
}

export const hasFormError = (error) => {
  cy.get('.govuk-error-summary__list').contains(error)
}