export const path = () => { return '/account/login'}
export const adminPath = () => { return path() + '?ReturnUrl=%2Fadmin'}

export const login = (username, password) => { 
  cy.get('#Email').invoke('val', username)
  cy.get('#Password').invoke('val', password)
  cy.contains('Log in').click()
}