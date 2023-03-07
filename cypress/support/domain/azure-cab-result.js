export default class AzureCabResult {

  constructor(result) {
    const _doc = result.document
    this.document = _doc
    this.id = _doc.id
    this.name = _doc.Name
    this.address = _doc.Address
    this.bodyTypes = _doc.BodyTypes
    this.registeredOfficeLocation = _doc.RegisteredOfficeLocation
    this.testingLocations = _doc.TestingLocations
    this.legislativeAreas = _doc.LegislativeAreas
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