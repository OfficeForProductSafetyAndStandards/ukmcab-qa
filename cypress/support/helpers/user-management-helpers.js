export const userManagementPath = () => { return '/user-admin/list'}
export const userProfilePath = () => { return '/account/user-profile'}
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

export const hasUserProfileDetails = (user) => { 
  cy.contains('h1', 'User profile')
  cy.hasKeyValueDetail('First name', user.firstname)
  cy.hasKeyValueDetail('Last name', user.lastname)
  cy.hasKeyValueDetail('Phone number', user.phone)
  cy.hasKeyValueDetail('Email', user.contactEmail)
}

export const getUserAccounts = () => {
  const querySpec = "SELECT * FROM c"
  cy.task('executeQuery', {db: 'main', container: 'user-accounts', querySpec: querySpec})
}
