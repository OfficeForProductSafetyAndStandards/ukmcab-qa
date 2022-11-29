export const viewAccountRequests = () => {
  cy.ensureOn('/Identity/Account/PendingAccountRequests')
}

export const accountRequest = (user) => {
  cy.ensureOn('/Identity/Account/PendingAccountRequests')
  return cy.contains('.govuk-summary-list__row', user.email)
}

export const reviewRequest = (user) => {
  accountRequest(user).contains('Review').click()
}

export const approveRequest = () => {
  processRequest('approve')
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