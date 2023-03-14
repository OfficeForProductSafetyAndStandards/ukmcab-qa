export const loginPath = () => { return '/account/login'}
export const adminPath = () => { return loginPath() + '?ReturnUrl=%2Fadmin'}

export const login = (username, password) => { 
  cy.get('#Email').invoke('val', username)
  cy.get('#Password').invoke('val', password)
  cy.contains('button', 'Sign in').click()
}

export const loginAsOpssUser = () => { 
  cy.ensureOn(loginPath())
  login(Cypress.env('OPSS_USER'), Cypress.env('OPSS_PASS'))
}

export const loginAsOgdUser = () => { 
  cy.ensureOn(loginPath())
  login(Cypress.env('OGD_USER'), Cypress.env('OGD_PASS'))
}

export const loginAsUkasUser = () => { 
  cy.ensureOn(loginPath())
  login(Cypress.env('UKAS_USER'), Cypress.env('UKAS_PASS'))
}