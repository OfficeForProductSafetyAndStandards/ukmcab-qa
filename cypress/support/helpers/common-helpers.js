export const basicAuthCreds = () => {
  return {
    auth: {
      username: Cypress.env('BASIC_AUTH_USER'),
      password: Cypress.env('BASIC_AUTH_PASS')
    }
  }
}

export const header = () => {
  return cy.get('header')
}

export const footer = () => {
  return cy.get('footer')
}

export const shouldBeLoggedIn = () => {
  header().contains('#logoutLink', 'Logout')
}

export const shouldBeLoggedOut = () => {
  header().contains('#login', 'Login')
}