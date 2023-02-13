export class EmailNotification {

  constructor(email) {
    this.emailAddress = email.email_address
    this.subject = email.subject
    this.body = email.body
    this.sentAt = email.sent_at
  }

  // checks whether email sent_at timestamp is within last 10 seconds
  get isRecent() {
    return Math.abs(new Date(this.sentAt) - new Date()) < 10000
  }

  get isVerificationEmail() {
    return this.subject === "UKMCAB user registration – confirm your email"
  }

  get isRequestPendingEmail() {
    return this.subject === "Confirmation of UKMCAB registration request"
  }

  get isRequestApprovedEmail() {
    return this.subject === "Your UKMCAB registration request has been approved"
    && this.body === `Your UKMCAB registration request has been approved. Please use the link below to login:\r\n${Cypress.config().baseUrl}/account/login`
  }
  
  get isRequestRejectedEmail() {
    return this.subject === "Your UKMCAB registration request has been rejected"
  }

  get isResetPasswordEmail() {
    return this.subject === "Reset password"
    && this.body.includes("#Reset password\r\n\r\nPlease reset you password by clicking on the link below:")
  }
  
  get isPasswordChangedConfirmationEmail() {
    return this.subject === "UKMCAB password changed"
    && this.body === "Your password has been successfully changed.\r\nIf you did not request this please contact an administrator."
  }

  get isFeedbackEmail() {
    return this.subject === "UKMCAB user feedback"
    && this.body.includes("Request details")
  }

  get link() {
    return this.body.match(/^https(.*)$/gm)[0]
  }

}

const getSandboxEmails = () => {
  return cy.task('getEmails').then(emails => {
    return emails.map(email => new EmailNotification(email))
  })
}

export const getLastUserEmail = (emailAddress) => {
  return getSandboxEmails().then(emails => {
    return emails.find(email => email.emailAddress === emailAddress) ?? null
  })
}
