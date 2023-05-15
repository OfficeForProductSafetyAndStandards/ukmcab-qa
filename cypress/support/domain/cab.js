import { cabProfilePage } from "../helpers/cab-helpers"
export default class Cab {

  constructor(cabData) {
    this.id = cabData.id
    this.accreditationSchedules = cabData.accreditationSchedules
    this.addressLine1 = cabData.AddressLine1
    this.addressLine2 = cabData.AddressLine2
    this.townCity = cabData.TownCity
    this.postcode = cabData.Postcode
    this.country = cabData.Country
    this.appointmentDate = new Date(cabData.AppointmentDate)
    this.cabId = cabData.CABId
    this.cabNumber = cabData.CABNumber
    this.bodyTypes = cabData.BodyTypes
    this.createdDate = new Date(cabData.CreatedDate)
    this.email = cabData.Email
    this.legislativeAreas = cabData.LegislativeAreas
    this.lastUpdatedDate = new Date(cabData.LastUpdatedDate)
    this.name = cabData.Name
    this.phone = cabData.Phone
    this.publishedDate = cabData.PublishedDate
    this.pointOfContactName = cabData.PointOfContactName
    this.pointOfContactEmail = cabData.PointOfContactEmail
    this.pointOfContactPhone = cabData.PointOfContactPhone
    this.registeredOfficeLocation = cabData.RegisteredOfficeLocation
    this.renewalDate = cabData.RenewalDate
    this.testingLocations = cabData.TestingLocations
    this._schedules = cabData.Schedules
    this._documents = cabData.Documents
    this.ukasRef = cabData.UKASReference
    this.website = cabData.Website
    this.status = cabData.Status
    this.isPointOfContactPublicDisplay = cabData.IsPointOfContactPublicDisplay
  }

  get url() {
    return Cypress.config('baseUrl') + cabProfilePage(this.cabId)
  }

  get schedules() {
    return this._schedules.map(schedule => {
      return {
        fileName: schedule.FileName,
        blobName: schedule.BlobName,
        uploadDateTime: schedule.UploadDateTime
      }
    })
  }

  get documents() {
    return this._documents.map(document => {
      return {
        fileName: document.FileName,
        blobName: document.BlobName,
        uploadDateTime: document.UploadDateTime
      }
    })
  }

  get addressLines() {
    return [this.addressLine1, this.addressLine2, this.townCity, this.postcode, this.country].filter(Boolean)
  }

  pointOfContactDetailsDisplayStatus() {
    return this.isPointOfContactPublicDisplay ? 'Public' : 'Restricted'
  }

  static build() {
    const uniqueId = Date.now()
    return new this({
      Name: `Test Cab ${uniqueId}`,
      AddressLine1: 'Cannon House',
      AddressLine2: 'The Priory Queensway',
      TownCity: 'Birmingham',
      Postcode: 'B4 7LR',
      Country: 'United Kingdom',
      Website: 'www.gov.uk',
      Email: 'email@gov.uk',
      Phone: '+44 (0) 121 345 1200',
      PointOfContactName: 'John Smith',
      PointOfContactEmail: 'email@gov.uk',
      PointOfContactPhone: '+44 (0) 121 345 1200',
      IsPointOfContactPublicDisplay: false,
      RegisteredOfficeLocation: 'United Kingdom',
      TestingLocations: ['United Kingdom', 'Belgium'],
      BodyTypes: ['Approved body', 'NI Notified body'],
      LegislativeAreas: ['Cableway installation', 'Ecodesign'],
      Schedules: [{ FileName: 'dummy.pdf' }, { FileName: 'dummy1.pdf' }],
      Documents: [{ FileName: 'dummy2.pdf' }, { FileName: 'dummy.docx' }, { FileName: 'dummy.xlsx' }],
      CABNumber: uniqueId,
      AppointmentDate: new Date(),
      RenewalDate: new Date(),
      UKASReference: uniqueId,
    })
  }
}