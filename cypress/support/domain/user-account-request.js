export default class UserAccountRequest {

  constructor(sourceData) {
    this._sourceData = sourceData
    this.id = sourceData.id
    this.firstname = sourceData.firstName
    this.lastname = sourceData.surname
    this.email = sourceData.emailAddress
    this.contactEmail = sourceData.contactEmailAddress
    this.comments = sourceData.comments
    this.status = sourceData.status
    this.createdUtc =  Cypress.dayjs(sourceData.createdUtc).utc()
    this.lastUpdatedUtc = sourceData.lastUpdatedUtc
  }
 
  isPending() {
    return this.status === 0
  }
  
}