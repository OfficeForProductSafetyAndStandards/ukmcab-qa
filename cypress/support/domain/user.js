export default class User {

  constructor(userData) {
    this._userData = userData
    this.id = userData.id
    this.role = userData.role
    this.firstname = userData.firstName
    this.lastname = userData.surname
    this.email = userData.emailAddress
    this.contactEmail = userData.contactEmailAddress
    this.phone = userData.phoneNumber
    this.isLocked = userData.isLocked
    this.lockReason = userData.lockReason
    this.lastLogon = userData.lastLogonUtc && Cypress.dayjs(userData.lastLogonUtc).utc()
    this.organisationName = userData.organisationName
  }
  
}