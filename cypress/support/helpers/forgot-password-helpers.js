export const path = () => { return '/identity/account/forgotpassword' }
export const resetPasswordPath = () => { return '/Identity/Account/ResetPassword' }

export const enterEmail = (email) => { 
  cy.get('#Input_Email').invoke('val', email)
}

export const clickPasswordReset = () => { 
  cy.contains('button', 'Password reset').click()
}

export const requestPasswordReset = (email) => {
  cy.ensureOn(path())
  enterEmail(email)
  clickPasswordReset()
}

export const resetPassword = (email, password, confirmPassword=null) => {
  enterEmail(email)
  cy.get('#Input_Password').invoke('val', password)
  const confirmPasswordValue = confirmPassword ? confirmPassword : password
  cy.get('#Input_ConfirmPassword').invoke('val', confirmPasswordValue)
  cy.contains('button', 'Reset password').click()
}

export const getPasswordResetEmail = (email) => {
  return cy.task('getLastEmail', email)
}

export const getPasswordResetLink = (email) => {
  return getPasswordResetEmail(email).then(email => {
    return email.body.match(/^https(.*)$/gm)[0]
  })
}