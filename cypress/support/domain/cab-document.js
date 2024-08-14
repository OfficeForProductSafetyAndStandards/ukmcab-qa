export default class CabDocument {

  constructor(sourceData) {
    this._sourceData = sourceData;
    this.status = sourceData.Status;
    this.name = sourceData.Name;
    this.lastUpdatedDate = sourceData.LastUpdatedDate;
    this.cabNumber = sourceData.CABNumber;
    this.cabId = sourceData.CABID;
  }

}
