export default class AzureCabResult {

  constructor(result) {
    const _doc = result.document
    this.document = _doc
    this.id = _doc.id
    this.cabId = _doc.CABId
    this.name = _doc.Name
    this.addressLine1 = _doc.AddressLine1
    this.addressLine2 = _doc.AddressLine2
    this.townCity = _doc.TownCity
    this.postcode = _doc.Postcode
    this.country = _doc.Country
    this.bodyTypes = _doc.BodyTypes
    this.registeredOfficeLocation = _doc.RegisteredOfficeLocation
    this.testingLocations = _doc.TestingLocations
    this.legislativeAreas = _doc.LegislativeAreas
  }

  get address() {
    return [this.addressLine1, this.addressLine2, this.townCity, this.postcode, this.country].filter(Boolean).join('')
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
      const suffix = values.length === 2 ? '1 other' : `${values.length - 1} others`
      return values[0] + ' and ' + suffix
    } else {
      return values[0] ?? ''
    }
  }
}