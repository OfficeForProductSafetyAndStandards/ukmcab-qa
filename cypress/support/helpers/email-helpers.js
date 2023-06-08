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

  isContactSubmissionEmail(name, email, subject, message) {
    return this.subject === "Contact Form: " + subject
    && this.body === `Your message has been submitted with the following information. We'll get back to you as soon as possible.\r\n\r\n# Name\r\n${name}\r\n\r\n# Email\r\n${email}\r\n\r\n# Subject\r\n${subject}\r\n\r\n# Message\r\n${message}`
  }

  isContactSubmissionOpssEmail(name, email, subject, message) {
    return this.subject === "Contact Form: " + subject
    && this.body === `We have received a new information request from a user through the UKMCAB website's contact form. Below are the details.\r\n\r\n# Name\r\n${name}\r\n\r\n# Email\r\n${email}\r\n\r\n# Subject\r\n${subject}\r\n\r\n# Message\r\n${message}`
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

  get isSubscriptionAccountVerification() {
    return this.subject === "Confirm your subscription"
    && this.body.includes("Click the link to confirm that you want to get emails from GOV.UK")
  }
  
  get isSubscriptionConfirmationEmail() {
    return this.subject === "You’ve subscribed to GOV.UK emails"
    && this.links.length === 3
  }
  
  get isSearchResultsUpdatedEmail() {
    return this.subject === "UKMCAB search results updated"
    && this.links.length === 5
  }
  
  isCabUpdatedEmail(cab) {
    return this.subject === `UKMCAB profile for ‘${cab.name}’ updated`
    && this.links.length === 4
    && this.links[0] === cab.oldSchemeUrl
  }

  get link() {
    return this.body.match(/^https(.*)$/gm)[0]
  }

  get links() {
    return this.body.match(/^https(.*)$/gm)
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
