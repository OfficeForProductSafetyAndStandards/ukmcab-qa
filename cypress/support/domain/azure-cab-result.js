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
    this.testingLocations = result.TestingLocations
    this.legislativeAreas = result.LegislativeAreas
    this.lastUpdatedDate = new Date(result.LastUpdatedDate)
    this.urlSlug = result.URLSlug
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