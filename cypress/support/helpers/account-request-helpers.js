export const accountRequestsPath = () => { return '/account/manage/pending-requests'}

export const viewAccountRequests = () => {
  cy.ensureOn(accountRequestsPath())
}

export const accountRequest = (user) => {
  cy.ensureOn(accountRequestsPath())
  return cy.contains('.govuk-summary-list__row', user.email)
}

export const reviewRequest = (user) => {
  accountRequest(user).contains('Review').should('be.visible').click({timeout: 10000})
}

export const approveRequest = () => {
  processRequest('approve')
}

export const rejectRequest = (rejectReason=null) => {
  processRequest('reject', rejectReason)
}

const processRequest = (decision, rejectReason=null) => {
  if(decision === 'approve') {
    cy.contains('button', 'Approve').should('be.visible').click({timeout: 10000})
  } else if (decision === 'reject') {
    if(rejectReason) cy.get('#Input_RejectionReason').type(rejectReason)
    cy.contains('button', 'Reject').should('be.visible').click({timeout: 10000})
  }
}