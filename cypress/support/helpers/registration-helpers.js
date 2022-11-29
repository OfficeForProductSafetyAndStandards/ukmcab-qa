export const register = (user) => {
  cy.ensureOn('/Identity/Account/RegisterOGDUser')
  cy.get('#Input_Email').invoke('val', user.email)
  enterPasswords(user.password)
  user.legislativeAreas.forEach(area => {
    cy.get(`input[value='${area}']`).check()
  })
  cy.get('#Input_RequestReason').invoke('val', user.requestReason)
  submitForm()
}

export const enterPasswords = (password, confirmPassword=null) => {
  cy.get('#Input_Password').invoke('val', password)
  const confirmPasswordValue = confirmPassword ? confirmPassword : password
  cy.get('#Input_ConfirmPassword').invoke('val', confirmPasswordValue)
}

export const submitForm = () => {
  cy.contains('button', 'Request account').click()
}

export const verifyEmail = () => {
  cy.get('#confirm-link').contains('Click here to confirm your account').click()
}