export const path = () => { return '/account/Register?returnUrl=%2F' }
export const registerOgdUserPath = () => { return '/account/Register/request/OGDUser' }
export const registerUkasUserPath = () => { return '/account/Register/request/UKASUser' }
export const registerOpssAdminUserPath = () => { return '/account/Register/request/OPSSAdmin' }

export const registerAsOgdUser = (user) => {
  cy.ensureOn(registerOgdUserPath())
  cy.get('#Email').invoke('val', user.email)
  enterPasswords(user.password)
  user.legislativeAreas.forEach(area => {
    cy.get(`input[value='${area}']`).check()
  })
  cy.get('#RequestReason').invoke('val', user.requestReason)
  submitForm()
}

export const registerAsUkasUser = (user) => {
  cy.ensureOn(registerUkasUserPath())
  cy.get('#Email').invoke('val', user.email)
  enterPasswords(user.password)
  submitForm()
}

export const enterPasswords = (password, confirmPassword=null) => {
  cy.get('#Password').invoke('val', password)
  const confirmPasswordValue = confirmPassword ? confirmPassword : password
  cy.get('#ConfirmPassword').invoke('val', confirmPasswordValue)
}

export const submitForm = () => {
  cy.contains('button', 'Request account').click()
}

export const verifyEmail = (email) => {
  cy.task('getLastEmail', email).then(email => {
    const verificationLink = email.body.match(/^https(.*)$/gm)[0]
    cy.ensureOn(verificationLink)
    cy.contains('Registration confirmation')
  })
}