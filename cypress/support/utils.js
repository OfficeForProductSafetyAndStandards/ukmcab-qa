export const basicAuthCreds = () => {
  return {
    auth: {
      username: Cypress.env('basicAuthUser'),
      password: Cypress.env('basicAuthPass')
    }
  }
}