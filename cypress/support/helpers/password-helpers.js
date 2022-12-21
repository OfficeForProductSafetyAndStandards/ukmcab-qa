export const forgotPasswordPath = () => { return '/account/forgot-password' }
export const requestPasswordResetPath = () => { return forgotPasswordPath() + '/reset-password' }
export const passwordResetPath = () => { return forgotPasswordPath() + '/reset' }
export const changePasswordPath = () => { return '/account/manage/change-password' }

export const errors = {
  currentPasswordRequired: 'The Current password field is required.',
  newPasswordRequired: 'The New password field is required.',
  confirmNewPasswordRequired: 'The Confirm new password field is required.',
  passwordLength: 'The New password must be at least 8 and at max 100 characters long.',
  passwordAtleastOneDigit: "Passwords must have at least one digit ('0'-'9').",
  passwordAtleastOneUppercase: "Passwords must have at least one uppercase ('A'-'Z').",
  passwordAtleastOneNonAlphanum: "Passwords must have at least one non alphanumeric character.",
  passwordsDontMatch: "The new password and confirmation password do not match.",
  invalidLoginAttempt: "Invalid login attempt.",
}
export const enterEmail = (email) => { 
  cy.get('#Email').invoke('val', email)
}

export const clickPasswordReset = () => { 
  cy.contains('button', 'Password reset').click()
}

export const requestPasswordReset = (email) => {
  cy.ensureOn(forgotPasswordPath())
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

export const changePassword = (currentPassword, newPassword, confirmNewPassword=null) => {
  cy.get('#CurrentPassword').invoke('val', currentPassword)
  cy.get('#NewPassword').invoke('val', newPassword)
  const confirmNewPasswordValue = confirmNewPassword ? confirmNewPassword : newPassword
  cy.get('#ConfirmPassword').invoke('val', confirmNewPasswordValue)
  cy.contains('button', 'Update password').click()
}

export const hasPasswordResetRequestedConfirmation = () => {
  cy.contains('Forgot password confirmation Please check your email to reset your password.')
}

export const hasPasswordChangeConfirmation = () => {
  cy.contains('Password changed You password has been successfully changed.')
}