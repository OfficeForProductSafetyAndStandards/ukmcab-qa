export const userManagementPath = () => { return '/user-admin/list'}
export const userProfilePath = () => { return '/account/user-profile'}
export const userAdminPath = (user) => { return `/user-admin/${encodeURIComponent(user.id)}`}
export const reviewRequestPath = (request) => { return `/user-admin/review-account-request/${encodeURIComponent(request.id)}`}
import User from '../domain/user'
import UserAccountRequest from '../domain/user-account-request'

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

export const seedAccountRequest = () => { 
  cy.task('upsertItem', {db: 'main', container: 'user-account-requests', item: UserAccountRequest.build()})
}

export const getAccountRequests = () => { 
  const querySpec = "SELECT * FROM c"
  return cy.task('executeQuery', {db: 'main', container: 'user-account-requests', querySpec: querySpec}).then(results => {
    return results.resources.map(item => new UserAccountRequest(item))
  })
}

export const getPendingAccountRequests = () => { 
  return getAccountRequests().then(requests => {
    return requests.filter(request => request.isPending())
                   .sort((a, b) => b.createdUtc - a.createdUtc) // oldest first
  })
}

export const hasUserList = (users) => { 
  cy.wrap(users).each((user, index) => {
    cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
      cy.get('td').eq(0).should('have.text', user.firstname)
      cy.get('td').eq(1).should('have.attr', 'title', user.lastname)
      cy.get('td').eq(2).should('have.attr', 'title', user.contactEmail)
      cy.get('td').eq(3).should('have.text', user.role.toUpperCase())
      cy.get('td').eq(4).should('have.text', user.lastLogon?.format('DD/MM/YYYY HH:mm') ?? 'None')
      cy.get('td').eq(5).contains('a', 'View profile').and('has.attr', 'href', userAdminPath(user))
    })
  })
}

export const hasAccountRequestsList = (requests) => { 
  cy.wrap(requests).each((request, index) => {
    cy.get('tbody > tr.govuk-table__row').eq(index).within(() => {
      cy.get('td').eq(0).should('have.text', request.firstname)
      cy.get('td').eq(1).should('have.attr', 'title', request.lastname)
      cy.get('td').eq(2).should('have.attr', 'title', request.contactEmail)
      cy.get('td').eq(3).should('have.text', request.createdUtc.format('DD/MM/YYYY HH:mm'))
      cy.get('td').eq(4).contains('a', 'Review request').and('has.attr', 'href', reviewRequestPath(request))
    })
  })
}

export const hasAccountRequestDetails = (request) => { 
  cy.contains('h1', 'Account request')
  cy.hasKeyValueDetail('First name', request.firstname)
  cy.hasKeyValueDetail('Last name', request.lastname)
  cy.hasKeyValueDetail('Email address', request.contactEmail)
  cy.hasKeyValueDetail('Organisation', request.organisationName)
  cy.hasKeyValueDetail('Requested on', request.createdUtc.format('DD/MM/YYYY HH:mm'))
  cy.hasKeyValueDetail('Comments', request.comments)
}

export const requestAccount = (user) => { 
  cy.get('#FirstName').type(user.firstname)
  cy.get('#LastName').type(user.lastname)
  cy.get('#ContactEmailAddress').clear().type(user.contactEmail)
  cy.get('#Organisation').type('UKMCAB')
  cy.get('#Comments').type('Test comments')
  cy.contains('a', 'Cancel').should('have.attr', 'href', '/')
  cy.clickSubmit()
}

export const editUserProfileDetails = (user) => { 
  cy.get('#FirstName').invoke('val', user.firstname)
  cy.get('#LastName').invoke('val', user.lastname)
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
  cy.contains('h1', /My details|User profile/)
  cy.hasKeyValueDetail('First name', user.firstname)
  cy.hasKeyValueDetail('Last name', user.lastname)
  cy.hasKeyValueDetail('Email', user.contactEmail)
  cy.hasKeyValueDetail('Organisation', user.organisationName)
  cy.hasKeyValueDetail('User group', user.role.toUpperCase())
  cy.hasKeyValueDetail('Last log in',  /^ \d{2}\/\d{2}\/\d{4} \d{2}:\d{2} $/)
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

export const approveAccountRequest = (request, userGroup) => { 
  cy.ensureOn(reviewRequestPath(request))
  cy.get('#role').select(userGroup)
  cy.contains('button', 'Approve').click()
  cy.contains(`Approve account request Confirm that the account request for ${request.firstname} ${request.lastname} should be approved. If confirmed, they will be added to the ${userGroup} user group and given the permissions associated with this group.`)
  cy.confirm()
}

export const rejectAccountRequest = (request, reason='Test decline reason') => { 
  cy.ensureOn(reviewRequestPath(request))
  cy.contains('button', 'Decline').click()
  cy.contains('h1', 'Decline account request')
  cy.get('#Reason').invoke('val', reason)
  cy.contains('a', 'Cancel').should('have.attr', 'href', reviewRequestPath(request))
  cy.continue()
}
