export default class UserAccountRequest {

  constructor(sourceData) {
    this._sourceData = sourceData
    this.id = sourceData.id
    this.subjectId = sourceData.subjectId
    this.firstname = sourceData.firstName
    this.lastname = sourceData.surname
    this.email = sourceData.emailAddress
    this.contactEmail = sourceData.contactEmailAddress
    this.comments = sourceData.comments
    this.status = sourceData.status
    this.organisationName = sourceData.organisationName
    this.createdUtc =  Cypress.dayjs(sourceData.createdUtc).utc()
    this.lastUpdatedUtc = sourceData.lastUpdatedUtc
  }
 
  isPending() {
    return this.status === 0
  }

  static build() {
    const uniqueId = Date.now().toString()
    return {
      id: uniqueId,
      subjectId: uniqueId,
      firstName: 'Test',
      surname: `User ${uniqueId}` ,
      emailAddress: `Test.User${uniqueId}@example.test`,
      contactEmailAddress: `Test.User${uniqueId}@example.test`,
      comments: 'Test Comments',
      status: 0,
      organisationName: 'TEST',
      createdUtc: Cypress.dayjs().utc().format(),
      lastUpdatedUtc: Cypress.dayjs().utc().format()
    }
  }
  
}