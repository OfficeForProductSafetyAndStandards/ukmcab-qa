import { cabProfilePage } from "../helpers/cab-helpers"

export default class AzureCabResult {

  constructor(result) {
    this._doc = result
    this.id = result.id
    this.cabId = result.CABId
    this.name = result.Name
    this.addressLine1 = result.AddressLine1
    this.addressLine2 = result.AddressLine2
    this.townCity = result.TownCity
    this.county = result.County
    this.postcode = result.Postcode
    this.country = result.Country
    this.bodyTypes = result.BodyTypes
    this.registeredOfficeLocation = result.RegisteredOfficeLocation
    this.status = result.Status
    this.testingLocations = result.TestingLocations
    this.lastUserGroup = result.LastUserGroup
    this.legislativeAreas = result.LegislativeAreas
    this.lastUpdatedDate = new Date(result.LastUpdatedDate)
    this.urlSlug = result.URLSlug
  }

  get path() {
    if(this.isDraft) {
      return `/admin/cab/summary/${this.cabId}`
    } else {
      return `/search/cab-profile/${this.urlSlug}`
    }
  }

  get isDraft() {
    return this.status === "Draft"
  }

  get addressLines() {
    return [this.addressLine1, this.addressLine2, this.townCity, this.county, this.postcode, this.country].filter(Boolean)
  }

  get bodyTypesFormatted() {
    return this._formatted(this.bodyTypes)
  }

  get testingLocationsFormatted() {
    return this._formatted(this.testingLocations)
  }

  get legislativeAreasFormatted() {
    return this._formatted(this.legislativeAreas)
  }

  _formatted(values) {
    if(values.length > 1) {
      return values.join(', ')
    } else {
      return values[0] ?? 'Not provided'
    }
  }
}