export const loginPath = () => { return '/account/login'}
export const adminPath = () => { return loginPath() + '?ReturnUrl=%2Fadmin'}

export const login = (username, password) => { 
  cy.get('#Email').invoke('val', username)
  cy.get('#Password').invoke('val', password)
  cy.contains('button', 'Sign in').click()
}