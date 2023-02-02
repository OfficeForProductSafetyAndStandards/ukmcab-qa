export const path = () => { return '/account/login'}
export const adminPath = () => { return path() + '?ReturnUrl=%2Fadmin'}

export const login = (username, password) => { 
  cy.get('#Email').invoke('val', username)
  cy.get('#Password').invoke('val', password)
  cy.contains('Log in').click()
}

export const loginAsOpssUser = () => { 
  cy.ensureOn(adminPath())
  login(Cypress.env('OPSS_USER'), Cypress.env('OPSS_PASS'))
}

export const loginAsOgdUser = () => { 
  cy.ensureOn(path())
  login(Cypress.env('OGD_USER'), Cypress.env('OGD_PASS'))
}

export const loginAsUkasUser = () => { 
  cy.ensureOn(path())
  login(Cypress.env('UKAS_USER'), Cypress.env('UKAS_PASS'))
}