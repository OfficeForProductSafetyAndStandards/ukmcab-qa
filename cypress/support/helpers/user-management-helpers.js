export const userManagementPath = () => { return '/user-admin/list'}
export const userProfilePath = () => { return '/account/user-profile'}
export const userAdminPath = (user) => { return `/user-admin/${encodeURIComponent(user.id)}`}
import User from '../domain/user'

export const getTestUsers = () => { 
  return cy.fixture('users').then(users => {
    const userObjects =  Object.entries(users).map(([userType, userData]) => [userType, new User(userData)])
    return Object.fromEntries(userObjects)
  })
}

export const getUsers = () => { 
  const querySpec = "SELECT * FROM c"
  return cy.task('executeQuery', {db: 'main', container: 'user-accounts', querySpec: querySpec}).then(results => {
    return results.resources.map(userRecord => new User(userRecord))
  })
}

export const hasUserList = (users) => { 
  cy.wrap(users).each((user, index) => {
    cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
      cy.get('td').eq(0).should('have.text', user.firstname)
      cy.get('td').eq(1).should('have.text', user.lastname)
      cy.get('td').eq(2).should('have.text', user.contactEmail)
      cy.get('td').eq(3).should('have.text', user.lastLogon ? Cypress.dayjs(user.lastLogon).utc().format('DD/MM/YY HH:mm'): '')
      cy.get('td').eq(4).contains('a', 'View details').and('has.attr', 'href', userAdminPath(user))
    })
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
  cy.contains('This account is locked')
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

export const archiveUser = (user) => { 
  cy.ensureOn(userAdminPath(user))
  cy.contains('a', 'Archive').click()
  cy.contains('h1', 'Archive user account')

  cy.contains('label', 'Reason')
  .next().contains('This will be included in user notifications and the account history viewable by all users')
  .next().type('Test reason for archiving')

  cy.contains('label', 'Admin notes')
  .next().contains('The comments will only be viewable by administrators in the account history.')
  .next().type('Test Admin notes for archiving')
  cy.contains('a', 'Cancel').should('have.attr', 'href', userAdminPath(user))
  cy.contains('button', 'Archive account').click()
}

export const unarchiveUser = (user) => { 
  cy.ensureOn(userAdminPath(user))
  cy.contains('This account is archived')
  cy.contains('a', 'Unarchive').click()
  cy.contains('h1', 'Unarchive user account')

  cy.contains('label', 'Reason')
  .next().contains('This will be included in user notifications and the account history viewable by all users')
  .next().type('Test reason for unarchiving')

  cy.contains('label', 'Admin notes')
  .next().contains('The comments will only be viewable by administrators in the account history.')
  .next().type('Test Admin notes for unarchiving')
  cy.contains('a', 'Cancel').should('have.attr', 'href', userAdminPath(user))
  cy.contains('button', 'Unarchive account').click()
}
