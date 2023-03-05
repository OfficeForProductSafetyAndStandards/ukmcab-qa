export default class AzureCabResult {

  constructor(result) {
    const _doc = result.document
    this.document = _doc
    this.name = _doc.Name
  }
}