export const accountRequestsPath = () => { return '/account/manage/pending-requests'}

export const viewAccountRequests = () => {
  cy.ensureOn(accountRequestsPath())
}

export const accountRequest = (user) => {
  cy.ensureOn(accountRequestsPath())
  return cy.contains('.govuk-summary-list__row', user.email)
}

export const reviewRequest = (user) => {
  accountRequest(user).contains('Review').click()
}

export const approveRequest = () => {
  cy.get('#role').select('opss')
  processRequest('approve')
  cy.confirm()
}

export const rejectRequest = (rejectReason=null) => {
  processRequest('reject', rejectReason)
}

const processRequest = (decision, rejectReason=null) => {
  if(decision === 'approve') {
    cy.contains('button', 'Approve').click()
  } else if (decision === 'reject') {
    if(rejectReason) cy.get('#Input_RejectionReason').type(rejectReason)
    cy.contains('button', 'Reject').click()
  }
}