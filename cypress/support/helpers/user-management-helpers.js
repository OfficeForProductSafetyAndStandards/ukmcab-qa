export const userManagementPath = () => { return '/user-admin/list'}
export const userProfilePath = () => { return '/account/user-profile'}
export const userAdminPath = (user) => { return `/user-admin/${user.id}`}
import User from '../domain/user'

export const getUsers = () => { 
  return cy.fixture('users').then(users => {
    const userObjects =  Object.entries(users).map(([userType, userData]) => [userType, new User(userData)])
    return Object.fromEntries(userObjects)
  })
}

export const editUserProfileDetails = (user) => { 
  cy.get('#FirstName').invoke('val', user.firstname)
  cy.get('#LastName').invoke('val', user.lastname)
  cy.get('#PhoneNumber').invoke('val', user.phone)
  cy.get('#ContactEmailAddress').invoke('val', user.contactEmail)
  cy.clickSubmit()
}

export const lockUser = (user) => { 
  cy.ensureOn(userAdminPath(user))
  cy.contains('a', 'Lock').click()

  cy.contains('label', 'Reason')
  .next().contains('This will be included in user notifications and the account history viewable by all users')
  .next().type('Test reason for locking')

  cy.contains('label', 'Admin notes')
  .next().contains('The comments will only be viewable by administrators in the account history.')
  .next().type('Test Admin notes for locking')
  cy.contains('a', 'Cancel').should('have.attr', 'href', userAdminPath(user))
  cy.contains('button', 'Lock account').click()
}

export const unlockUser = (user) => { 
  cy.ensureOn(userAdminPath(user))
  cy.contains('a', 'Unlock').click()

  cy.contains('label', 'Reason')
  .next().contains('This will be included in user notifications and the account history viewable by all users')
  .next().type('Test reason for unlocking')

  cy.contains('label', 'Admin notes')
  .next().contains('The comments will only be viewable by administrators in the account history.')
  .next().type('Test Admin notes for unlocking')
  cy.contains('a', 'Cancel').should('have.attr', 'href', userAdminPath(user))
  cy.contains('button', 'Unlock account').click()
}

export const hasUserProfileDetails = (user) => { 
  cy.contains('h1', 'User profile')
  cy.hasKeyValueDetail('First name', user.firstname)
  cy.hasKeyValueDetail('Last name', user.lastname)
  cy.hasKeyValueDetail('Phone number', user.phone)
  cy.hasKeyValueDetail('Email', user.contactEmail)
}

// export const getUserAccounts = () => {
//   const querySpec = "SELECT * FROM c"
//   cy.task('executeQuery', {db: 'main', container: 'user-accounts', querySpec: querySpec})
// }
