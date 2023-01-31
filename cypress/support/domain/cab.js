export default class Cab {

  constructor({
    name = `Test Cab ${Date.now()}`,
    address = '1 Victoria St, London SW1H 0NE',
    website = 'https://testcab.com',
    email = 'email@testcab.com',
    phone = '0123456789',
    location = 'United Kingdom',
    bodyTypes = ['Approved body', 'NI Notified body'],
    regulations = ['Cableway Installation', 'Ecodesign'],
    ukasRefNo = 'REF/UKAS123',
    accreditationSchedules = ['dummy.pdf'],
    supportingDocs = ['dummy.pdf', 'dummy.doc', 'dummy.docx', 'dummy.xls', 'dummy.xlsx']
  } = {}) {
    this.name = name
    this.address = address
    this.website = website
    this.email = email
    this.phone = phone
    this.location = location
    this.bodyTypes = bodyTypes
    this.regulations = regulations
    this.ukasRefNo = ukasRefNo
    this.accreditationSchedules = accreditationSchedules
    this.supportingDocs = supportingDocs
  }
}