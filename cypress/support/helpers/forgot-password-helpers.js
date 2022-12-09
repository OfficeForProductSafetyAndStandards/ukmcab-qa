export const path = () => { return '/account/forgot-password' }
export const requestPasswordResetPath = () => { return path() + '/reset-password' }
export const passwordResetPath = () => { return path() + '/reset' }

export const enterEmail = (email) => { 
  cy.get('#Email').invoke('val', email)
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
  cy.get('#Password').invoke('val', password)
  const confirmPasswordValue = confirmPassword ? confirmPassword : password
  cy.get('#ConfirmPassword').invoke('val', confirmPasswordValue)
  cy.contains('button', 'Reset password').click()
}

export const hasPasswordResetRequestedConfirmation = () => {
  cy.contains('Forgot password confirmation Please check your email to reset your password.')
}

export const getPasswordResetEmail = (email) => {
  return cy.task('getLastEmail', email)
}

export const getPasswordResetLink = (email) => {
  return getPasswordResetEmail(email).then(email => {
    return email.body.match(/^https(.*)$/gm)[0]
  })
}