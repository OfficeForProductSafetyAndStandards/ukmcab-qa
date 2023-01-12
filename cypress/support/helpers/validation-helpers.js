export const hasFieldError = (fieldLabel,error) => {
  cy.contains('label,legend', fieldLabel).prev().contains(error)
}

export const hasFormError = (error) => {
  cy.get('.govuk-error-summary__list').contains(error)
}

// checks error is presentboth at field level and form level
export const hasError = (fieldLabel,error) => {
  hasFormError(error)
  hasFieldError(fieldLabel,error)
}