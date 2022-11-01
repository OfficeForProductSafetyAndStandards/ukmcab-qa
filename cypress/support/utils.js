export const basicAuthCreds = () => {
  return {
    auth: {
      username: Cypress.env('BASIC_AUTH_USER'),
      password: Cypress.env('BASIC_AUTH_PASS')
    }
  }
}