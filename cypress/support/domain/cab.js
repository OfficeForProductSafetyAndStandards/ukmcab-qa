import { cabProfilePage } from "../helpers/cab-helpers";
import { CabNumberVisibility } from "./cab-number-visibility";
export default class Cab {
  constructor(cabData) {
    this._cabData = cabData;
    this.id = cabData.id;
    this.accreditationSchedules = cabData.accreditationSchedules;
    this.addressLine1 = cabData.AddressLine1;
    this.addressLine2 = cabData.AddressLine2;
    this.auditLog = cabData.AuditLog;
    this.townCity = cabData.TownCity;
    this.county = cabData.County;
    this.postcode = cabData.Postcode;
    this.country = cabData.Country;
    this.appointmentDate =
      cabData.AppointmentDate && Cypress.dayjs(cabData.AppointmentDate);
    this.cabId = cabData.CABId;
    this.cabNumber = cabData.CABNumber;
    this.cabNumberVisibility = cabData.CabNumberVisibility;
    this.bodyTypes = cabData.BodyTypes;
    this.email = cabData.Email;
    this.legislativeAreas = cabData.LegislativeAreas;
    this.documentLegislativeAreas = cabData.DocumentLegislativeAreas;
    this.lastUpdatedDate = new Date(cabData.LastUpdatedDate);
    this._name = cabData.Name;
    this.phone = cabData.Phone;
    this.pointOfContactName = cabData.PointOfContactName;
    this.pointOfContactEmail = cabData.PointOfContactEmail;
    this.pointOfContactPhone = cabData.PointOfContactPhone;
    this.registeredOfficeLocation = cabData.RegisteredOfficeLocation;
    this.reviewDate = cabData.RenewalDate && Cypress.dayjs(cabData.RenewalDate);
    this.testingLocations = cabData.TestingLocations;
    this._schedules = cabData.Schedules;
    this._documents = cabData.Documents;
    this.ukasRef = cabData.UKASReference;
    this.website = cabData.Website;
    this.status = cabData.Status;
    this.isPointOfContactPublicDisplay = cabData.IsPointOfContactPublicDisplay;
    this.urlSlug = cabData.URLSlug;
  }

  get isRecent() {
    return Math.abs(new Date(this.lastUpdatedDate) - new Date()) < 86400000;
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = newName;
    if (newName) {
      this.urlSlug = newName
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
    }
  }

  get publishedDate() {
    return Cypress.dayjs(
      this.auditLog.find((entry) => entry.Action === "Published").DateTime
    );
  }

  get createdDate() {
    return Cypress.dayjs(
      this.auditLog.find((entry) => entry.Action === "Created").DateTime
    );
  }

  get url() {
    return cabProfilePage(this);
  }

  get oldSchemeUrl() {
    return `/search/cab-profile/${this.cabId}`;
  }

  get isDraft() {
    return this.status === "Draft";
  }

  get isArchived() {
    return this.status === "Archived";
  }

  get isPublished() {
    return this.status === "Published";
  }

  get schedules() {
    return this._schedules?.map((schedule) => {
      return {
        label: schedule.Label,
        legislativeArea: schedule.LegislativeArea,
        fileName: schedule.FileName,
        blobName: schedule.BlobName,
        uploadDateTime: schedule.UploadDateTime,
      };
    });
  }

  get documents() {
    return this._documents?.map((document) => {
      return {
        fileName: document.FileName,
        blobName: document.BlobName,
        category: document.Category,
        uploadDateTime: document.UploadDateTime,
      };
    });
  }

  get addressLines() {
    return [
      this.addressLine1,
      this.addressLine2,
      this.townCity,
      this.county,
      this.postcode,
      this.country,
    ].filter(Boolean);
  }

  pointOfContactDetailsDisplayStatus() {
    this.documents;
    return this.isPointOfContactPublicDisplay ? "Public" : "Restricted";
  }

  static build() {
    const uniqueId = Date.now();
    const name = `Test Cab ${uniqueId}`;
    return new this({
      Name: name,
      AddressLine1: "Cannon House",
      AddressLine2: "The Priory Queensway",
      TownCity: "Birmingham",
      Postcode: "B4 7LR",
      County: "West Midlands",
      Country: "United Kingdom",
      Website: "https://www.gov.uk",
      Email: "email@gov.uk",
      Phone: "+44 (0) 121 345 1200",
      PointOfContactName: "John Smith",
      PointOfContactEmail: "email@gov.uk",
      PointOfContactPhone: "+44 (0) 121 345 1200",
      IsPointOfContactPublicDisplay: true,
      CabNumberVisibility: CabNumberVisibility.Public,
      RegisteredOfficeLocation: "United Kingdom",
      TestingLocations: ["United Kingdom", "Belgium"],
      BodyTypes: ["Approved body", "NI Notified body"],
      LegislativeAreas: ["Cableway installation", "Ecodesign"],
      DocumentLegislativeAreas: [
        {
          Name: "Machinery",
          Id: "cdbed358-8536-11ee-b9d1-0242ac120002",
          IsProvisional: false,
          AppointmentDate: Cypress.dayjs().subtract(5, "days"),
          ReviewDate: Cypress.dayjs().add(10, "days"),
          Reason: "My reason",
          ScopeOfAppointments: [
            {
              PurposeOfAppointment: {
                Id: "e20c0935-0c7e-4342-8483-e0b43c0d6a3e",
                Name: "Categories of machine specified in Schedule 2, Part 4 of the regulation",
              },
              Category: {
                Id: "34237c6c-8856-11ee-b9d1-0242ac120002",
                Name: "Machinery for underground working",
              },
              Subcategory: null, 
              ProductAndProcedures: [
                {
                  Product: {
                    Id: "fbaf9cfc-885b-11ee-b9d1-0242ac120002",
                    Name: "Locomotives and brake-vans",
                  },
                  Procedures: [
                    {
                      Id: "c7b7a13e-848b-11ee-b962-0242ac120002",
                      Name: "Part 9 - Type examination",
                    },
                    {
                      Id: "c7b778da-848b-11ee-b962-0242ac120002",
                      Name: "Part 10 - Full quality assurance",
                    }
                  ]
                },
                {
                  Product: {
                    Id: "fbafa454-885b-11ee-b9d1-0242ac120002",
                    Name: "Hydraulic-powered roof supports",
                  },
                  Procedures: [
                    {
                      Id: "c7b7a13e-848b-11ee-b962-0242ac120002",
                      Name: "Part 9 - Type examination",
                    },
                    {
                      Id: "c7b778da-848b-11ee-b962-0242ac120002",
                      Name: "Part 10 - Full quality assurance",
                    }
                  ]
                },
              ]
            },
            //{
            //  PurposeOfAppointment: {
            //    Id: "e20c0935-0c7e-4342-8483-e0b43c0d6a3e",
            //    Name: "Categories of machine specified in Schedule 2, Part 4 of the regulation",
            //  },
            //  Category: {
            //    Id: "34237582-8856-11ee-b9d1-0242ac120002",
            //    Name: "Hand-fed surface planing machinery for woodworking",
            //  },
            //  Subcategory: null,
            //  ProductAndProcedures: [
            //    {
            //      Product: null,
            //      Procedures: [
            //        {
            //          Id: "c7b7a13e-848b-11ee-b962-0242ac120002",
            //          Name: "Part 9 - Type examination",
            //        }
            //      ]
            //    },
            //  ]
            //}
          ]
        },
        {
          Name: "Measuring instruments",
          Id: "92728722-d721-4da0-8d9a-f22f3829a551",
          IsProvisional: true,
          AppointmentDate: null,
          ReviewDate: null,
          Reason: null,
          ScopeOfAppointments: [
            {
              PurposeOfAppointment: null,
              Category: {
                Id: "3aad4982-6876-4820-ad1f-90110eb3800f",
                Name: "MI-006 Automatic weighing machines",
              },
              Subcategory: {
                Id: "93075630-4824-4ce7-950e-b48e2346fbae",
                Name: "Mechanical systems",
              },
              ProductAndProcedures: [
                {
                  Product: {
                    Id: "c08f56b4-f4fc-4125-8e0d-cd58b2f1f08b",
                    Name: "Automatic catch weighers",
                  },
                  Procedures: [
                    {
                      Id: "e22ac592-5836-4085-b167-bf6bfe5683c0",
                      Name: "Module B Type examination",
                    },
                  ]
                },
                {
                  Product: {
                    Id: "30f75726-1712-47e2-af17-af14601ae87d",
                    Name: "Automatic rail weigh-bridges",
                  },
                  Procedures: [
                    {
                      Id: "1768deda-37f5-40de-b01d-0fca8d175e95",
                      Name: "Module D Conformity to type based on quality assurance of the production process",
                    },
                  ]
                },
              ]
            },
          ]
        }
      ],
      Schedules: [
        {
          FileName: "dummy.pdf",
          Label: "MyCustomLabel",
          LegislativeArea: "Lifts",
        },
      ],
      Documents: [{ FileName: "dummy2.pdf", Category: "Appointment" }],
      CABNumber: uniqueId,
      AppointmentDate: Cypress.dayjs().subtract(5, "days"),
      RenewalDate: Cypress.dayjs().add(10, "days"),
      UKASReference: uniqueId,
      URLSlug: name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase(),
    });
  }

  static buildWithoutDocuments() {
    const uniqueId = Date.now();
    const name = `Test Cab ${uniqueId}`;
    return new this({
      Name: name,
      AddressLine1: "Cannon House",
      AddressLine2: "The Priory Queensway",
      TownCity: "Birmingham",
      Postcode: "B4 7LR",
      County: "West Midlands",
      Country: "United Kingdom",
      Website: "https://www.gov.uk",
      Email: "email@gov.uk",
      Phone: "+44 (0) 121 345 1200",
      PointOfContactName: "John Smith",
      PointOfContactEmail: "email@gov.uk",
      PointOfContactPhone: "+44 (0) 121 345 1200",
      IsPointOfContactPublicDisplay: true,
      CabNumberVisibility: CabNumberVisibility.Public,
      RegisteredOfficeLocation: "United Kingdom",
      TestingLocations: ["United Kingdom", "Belgium"],
      BodyTypes: ["Approved body", "NI Notified body"],
      LegislativeAreas: ["Cableway installation", "Ecodesign"],
      Schedules: [],
      Documents: [],
      CABNumber: uniqueId,
      AppointmentDate: Cypress.dayjs().subtract(5, "days"),
      RenewalDate: Cypress.dayjs().add(10, "days"),
      UKASReference: uniqueId,
      URLSlug: name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase(),
    });
  }
}
