export class EmailNotification {
  constructor(email) {
    this.emailAddress = email.email_address;
    this.subject = email.subject;
    this.body = email.body;
    this.sentAt = email.sent_at;
  }

  // checks whether email sent_at timestamp is within last 10 seconds
  get isRecent() {
    return Math.abs(new Date(this.sentAt) - new Date()) < 10000;
  }

  isAccountLockedEmail() {
    return this.subject === "Your UKMCAB account has been locked";
  }

  isAccountUnlockedEmail() {
    return this.subject === "Your UKMCAB account has been unlocked";
  }

  isAccountArchivedEmail() {
    return this.subject === "Your UKMCAB account has been archived";
  }

  isAccountUnarchivedEmail() {
    return this.subject === "Your UKMCAB account has been unarchived";
  }

  isAccountRequestApprovedEmail(userGroup) {
    return (
      this.subject === "Your request for a UKMCAB account has been approved" &&
      this.body.includes(
        `Your request for a UK Market Conformity Assessment Bodies (UKMCAB) account has been approved. You have been added to the ${userGroup} user group.`
      )
    );
  }

  isAccountRequestRejectedEmail() {
    return (
      this.subject ===
        "Your request for a UKMCAB account request has been declined" &&
      this.body.includes(
        "Your request for a UK Market Conformity Assessment Bodies (UKMCAB) account has been declined for the following reason:"
      )
    );
  }

  isContactSubmissionEmail(name, email, subject, message) {
    return (
      this.subject === "Contact form submitted to UKMCAB" &&
      this.body.includes(
        `You have submitted a contact form to UKMCAB. We will respond as soon as possible.\r\n\r\nHere are the details submitted on the form:\r\n\r\nName: ${name}\r\nEmail: ${email}\r\nSubject: ${subject}\r\nMessage:\r\n${message}`
      )
    );
  }

  isContactSubmissionOpssEmail(name, email, subject, message) {
    return (
      this.subject === "Contact Form: " + subject &&
      this.body ===
        `We have received a new information request from a user through the UKMCAB website's contact form. Below are the details.\r\n\r\n# Name\r\n${name}\r\n\r\n# Email\r\n${email}\r\n\r\n# Subject\r\n${subject}\r\n\r\n# Message\r\n${message}`
    );
  }

  get isVerificationEmail() {
    return this.subject === "UKMCAB user registration – confirm your email";
  }

  get isRequestPendingEmail() {
    return this.subject === "Confirmation of UKMCAB registration request";
  }

  get isRequestApprovedEmail() {
    return (
      this.subject === "Your UKMCAB registration request has been approved" &&
      this.body ===
        `Your UKMCAB registration request has been approved. Please use the link below to login:\r\n${
          Cypress.config().baseUrl
        }/account/login`
    );
  }

  get isRequestRejectedEmail() {
    return (
      this.subject === "Your UKMCAB registration request has been rejected"
    );
  }

  get isFeedbackEmail() {
    return (
      this.subject === "UKMCAB user feedback" &&
      this.body.includes("Request details")
    );
  }

  get isSubscriptionAccountVerification() {
    return this.subject === "Confirm your UKMCAB email subscription";
  }

  get isDraftCabDeletionConfirmationEmail() {
    return this.subject === "Draft CAB deleted";
  }

  get isSubscriptionConfirmationEmail() {
    return (
      this.subject === "You’ve subscribed to UKMCAB emails" &&
      this.links.length === 4
    );
  }

  isRequestToUnarchiveConfirmationEmail(cabName) {
    return this.subject === `Request to unarchive CAB ${cabName} from UKAS`;
  }

  isApproveRequestToUnarchiveAndPublishConfirmationEmail(cabName) {
    return (
      this.subject === `Request to publish CAB ${cabName} has been approved`
    );
  }

  isDeclineRequestToPublishConfirmationEmail(cabName) {
    return (
      this.subject === `Request to publish CAB ${cabName} has been declined`
    );
  }

  isApproveRequestToPublishConfirmationEmail() {
    return (
      this.subject === `CAB published`
    );
  }

  isApproveRequestToUnarchiveAndSaveAsDraftConfirmationEmail(cabName) {
    return (
      this.subject === `Request to unarchive CAB ${cabName} has been approved`
    );
  }

  isDeclineRequestToUnarchiveAndPublishConfirmationEmail(cabName) {
    return (
      this.subject === `Request to unarchive CAB ${cabName} has been declined`
    );
  }

  isDeclineRequestToUnarchiveAndSaveAsDraftConfirmationEmail(cabName) {
    return (
      this.subject === `Request to unarchive CAB ${cabName} has been declined`
    );
  }

  isSearchResultsUpdatedEmail(searchTerm) {
    const message = searchTerm
      ? `The UKMCAB search results for '${searchTerm}' have changed.`
      : "The UKMCAB search results have changed.";
    return (
      this.subject === "UKMCAB search results updated" &&
      this.body.includes(message) &&
      this.body.includes("View the [summary page]") &&
      this.links.length === 6
    );
  }

  isCabUpdatedEmail(cab) {
    return (
      /^UKMCAB ‘.*‘ profile has changed$/.test(this.subject) &&
      this.links.length === 5
    );
    // && this.links[0] === Cypress.config('baseUrl') + '/__subscriptions/__inbound/cab/' + cab.cabId
  }

  get link() {
    return this.links[0];
  }

  get links() {
    return this.body.match(/https.+(?=\))/gm);
  }
}

const getSandboxEmails = () => {
  return cy.task("getEmails").then((emails) => {
    return emails.map((email) => new EmailNotification(email));
  });
};

export const getLastUserEmail = (emailAddress) => {
  return getSandboxEmails().then((emails) => {
    return emails.find((email) => email.emailAddress === emailAddress) ?? null;
  });
};
