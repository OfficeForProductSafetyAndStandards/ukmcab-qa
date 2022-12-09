export const path = () => { return '/account/Register?returnUrl=%2F' }
export const registerOgdUserPath = () => { return '/account/Register/request/OGDUser' }
export const registerUkasUserPath = () => { return '/account/Register/request/UKASUser' }
export const registerOpssAdminUserPath = () => { return '/account/Register/request/OPSSAdmin' }

export const errors = {
  emailAlreadyRegistered: 'This email address has already been registered on the system.',
  emailRequired: 'The Email field is required.',
  passwordRequired: 'The Password field is required.',
  confirmPasswordRequired: 'The Confirm password field is required.',
  passwordLength: 'The Password must be at least 8 and at max 100 characters long.',
  passwordAtleastOneDigit: "Passwords must have at least one digit ('0'-'9').",
  passwordAtleastOneUppercase: "Passwords must have at least one uppercase ('A'-'Z').",
  passwordAtleastOneNonAlphanum: "Passwords must have at least one non alphanumeric character.",
  passwordsDontMatch: "The password and confirmation password do not match.",
  onlyUkasEmailAllowed: "Only ukas.com email addresses can register for an UKAS user account",
  onlyGovUkEmailAllowedForOGD: "Only GOV UK email addresses can register for an OGD user account",
  onlyGovUkEmailAllowedForOPSS: "Only GOV UK email addresses can register for an OPSS admin account",
  selectLegislativeArea: "Please select at least one legislative area from the list.",
  enterRequestReason: "Please enter a reason for the request.",
  invalidLoginAttempt: "Invalid login attempt.",
}

export const registerAsOgdOrOpssAdminUser = (user) => {
  cy.get('#Email').invoke('val', user.email)
  enterPasswords(user.password)
  user.legislativeAreas.forEach(area => {
    cy.get(`input[value='${area}']`).check()
  })
  cy.get('#RequestReason').invoke('val', user.requestReason)
  submitForm()
}

export const registerAsOgdUser = (user) => {
  cy.ensureOn(registerOgdUserPath())
  registerAsOgdOrOpssAdminUser(user)
}

export const registerAsOpssAdminUser = (user) => {
  cy.ensureOn(registerOpssAdminUserPath())
  registerAsOgdOrOpssAdminUser(user)
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

export const hasConfirmYourEmailMessage = () => {
  cy.contains('Register email confirmation Please check your email to confirm your account.')
}

export const hasPendingApprovalMessage = () => {
  cy.contains('Registration confirmation Your registration request will be reviewed and you will receive notification once approved.')
}

export const hasConfirmation = () => {
  cy.contains('Registration confirmation You will now be able to login to your account.')
}

export const verifyEmail = (email) => {
  cy.task('getLastEmail', email).then(email => {
    const verificationLink = email.body.match(/^https(.*)$/gm)[0]
    cy.ensureOn(verificationLink)
  })
}