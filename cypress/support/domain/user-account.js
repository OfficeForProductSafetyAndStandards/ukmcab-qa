export default class UserAccount {

  constructor(sourceData) {
    this._sourceData = sourceData
    this.id = sourceData.id
    this.history = sourceData.auditLog
    this.firstname = sourceData.firstName
    this.lockedstatus = sourceData.isLocked
    this.lastname = sourceData.surname
    this.email = sourceData.emailAddress
    this.contactEmail = sourceData.contactEmailAddress
    this.status = sourceData.status
    this.organisationName = sourceData.organisationName
    this.createdUtc =  Cypress.dayjs(sourceData.createdUtc).utc()
    this.lastUpdatedUtc = sourceData.lastUpdatedUtc
  }
  
}