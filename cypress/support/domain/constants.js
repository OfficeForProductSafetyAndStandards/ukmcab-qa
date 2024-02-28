class Constants {
  static get TestApprovedBodiesEmailAddress() {
    return "test.approved.bodies@test.gov.uk";
  }

  static ApprovedReason_UnarchiveAndPublishCAB(name) {
    return `The request to publish CAB ${name} has been approved.`;
  }

  static ApprovedReason_UnarchiveAndSaveAsDraft(name) {
    return `The request to unarchive CAB ${name} has been approved and it has been saved as a draft.`;
  }

  static ApprovedReason_PublishedCAB(name) {
    return `The request to publish CAB ${name} has been approved.`;
  }

  static DeclinedReason_PublishedCAB(name) {
    return `The request to approve CAB ${name} has been declined for the following reason:`;
  }

  static PublishedReason_UnarchiveAndPublishCAB(name) {
    return `The request to unarchive and publish CAB ${name} has been approved.`;
  }

  static DeclinedReason_UnarchiveAndSaveAsDraft(name) {
    return `The request to unarchive CAB ${name} has been declined.`;
  }
}

export default Constants;
