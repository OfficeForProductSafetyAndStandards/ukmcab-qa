export default class OGDUser {

  constructor({
    email = `Unknown${Date.now()}@ukmcab.gov.uk`,
    password = 'Som3P255W0rd!',
    legislativeAreas = ['Cableway Installation', 'Ecodesign'],
    requestReason = 'Some reason'
  } = {}) {
    this.email = email
    this.password = password
    this.legislativeAreas = legislativeAreas
    this.requestReason = requestReason
  }

}