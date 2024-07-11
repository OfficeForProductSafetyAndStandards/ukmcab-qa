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
  header().contains('a', 'Sign out')
}

export const shouldBeLoggedOut = () => {
  header().contains('a', 'Sign in')
}

export const helpPath = () => {
  return "/help";
};

export const aboutPath = () => {
  return "/about";
};

export const updatesPath = () => {
  return "/updates";
};


