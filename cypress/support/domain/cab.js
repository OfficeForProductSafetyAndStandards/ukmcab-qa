export default class Cab {

  constructor(cabData) {
    this.id = cabData.id
    this.address = cabData.Address
    this.accreditationSchedules = cabData.accreditationSchedules
    this.bodyNumber = cabData.BodyNumber
    this.bodyTypes = cabData.BodyTypes
    this.email = cabData.Email
    this.legislativeAreas = cabData.LegislativeAreas
    this.lastUpdatedDate = cabData.LastUpdatedDate
    this.name = cabData.Name
    this.phone = cabData.Phone
    this.publishedDate = cabData.PublishedDate
    this.registeredOfficeLocation = cabData.RegisteredOfficeLocation
    this.testingLocations = cabData.TestingLocations
    this._pdfs = cabData.PDFs
    this.ukasRefNo = cabData.ukasRefNo
    this.website = cabData.Website
  }

  get pdfs() {
    return this._pdfs.map(pdf => {
      return {
        blobName: pdf.BlobName,
        name: pdf.Label,
        fileName: pdf.ClientFileName
      }
    })
  }

  // constructor({
  //   id = 'SSFDFGDVXCVXBCVCB',
  //   name = `Test Cab ${Date.now()}`,
  //   address = '1 Victoria St, London SW1H 0NE',
  //   website = 'https://testcab.com',
  //   email = 'email@testcab.com',
  //   phone = '0123456789',
  //   location = 'United Kingdom',
  //   bodyTypes = ['Approved body', 'NI Notified body'],
  //   regulations = ['Cableway Installation', 'Ecodesign'],
  //   ukasRefNo = 'REF/UKAS123',
  //   accreditationSchedules = ['dummy.pdf'],
  //   supportingDocs = ['dummy.pdf', 'dummy.doc', 'dummy.docx', 'dummy.xls', 'dummy.xlsx']
  // } = {}) {
  //   this.id = id
  //   this.name = name
  //   this.address = address
  //   this.website = website
  //   this.email = email
  //   this.phone = phone
  //   this.location = location
  //   this.bodyTypes = bodyTypes
  //   this.regulations = regulations
  //   this.ukasRefNo = ukasRefNo
  //   this.accreditationSchedules = accreditationSchedules
  //   this.supportingDocs = supportingDocs
  // }
}