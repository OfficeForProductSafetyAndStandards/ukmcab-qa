import {cabProfilePage} from "../helpers/cab-helpers";
import {CabNumberVisibility} from "./cab-number-visibility";

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
                createdBy:schedule.CreatedBy,
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
                    IsProvisional: "No",
                    AppointmentDate: Cypress.dayjs().subtract(5, "days"),
                    ReviewDate: Cypress.dayjs().add(10, "days"),
                    Usernotes: "My reason",
                    ScopeOfAppointments: [
                        {
                            PurposeOfAppointment: {
                                Name: "Categories of machine specified in Schedule 2, Part 4 of the regulation",
                            },
                            Category: {
                                Name: "Machinery for underground working",
                            },
                            Subcategory: null,
                            ProductAndProcedures: [
                                {
                                    Product: {
                                        Name: "Locomotives and brake-vans",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Part 9 - Type examination",
                                        },
                                        {
                                            Name: "Part 10 - Full quality assurance",
                                        }
                                    ]
                                },
                                {
                                    Product: {
                                        Name: "Hydraulic-powered roof supports",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Part 9 - Type examination",
                                        },
                                        {
                                            Name: "Part 10 - Full quality assurance",
                                        }
                                    ]
                                },
                            ]
                        },
                        {
                            PurposeOfAppointment: {
                                Name: "Categories of machine specified in Schedule 2, Part 4 of the regulation",
                            },
                            Category: {
                                Name: "Hand-fed surface planing machinery for woodworking",
                            },
                            Subcategory: null,
                            ProductAndProcedures: [
                                {
                                    Product: null,
                                    Procedures: [
                                        {
                                            Name: "Part 9 - Type examination",
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                },
                {
                    Name: "Measuring instruments",
                    IsProvisional: "Yes",
                    AppointmentDate: null,
                    ReviewDate: null,
                    Reason: null,
                    ScopeOfAppointments: [
                        {
                            PurposeOfAppointment: null,
                            Category: {
                                Name: "MI-006 Automatic weighing machines",
                            },
                            Subcategory: {
                                Name: "Mechanical systems",
                            },
                            ProductAndProcedures: [
                                {
                                    Product: {
                                        Name: "Automatic catch weighers",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Module B Type examination",
                                        },
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ],
            Schedules: [
                {
                    FileName: "dummy.pdf",
                    Label: "MyCustomLabel",
                    LegislativeArea: "Machinery",
                    CreatedBy: "OPSS"
                },
            ],
            Documents: [{FileName: "dummy2.pdf", Category: "Appointment"}],
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
            DocumentLegislativeAreas: [
                {
                    Name: "Machinery",
                    Id: "cdbed358-8536-11ee-b9d1-0242ac120002",
                    IsProvisional: "No",
                    AppointmentDate: Cypress.dayjs().subtract(5, "days"),
                    ReviewDate: Cypress.dayjs().add(10, "days"),
                    Usernotes: "My reason",
                    ScopeOfAppointments: [
                        {
                            PurposeOfAppointment: {
                                Name: "Categories of machine specified in Schedule 2, Part 4 of the regulation",
                            },
                            Category: {
                                Name: "Machinery for underground working",
                            },
                            Subcategory: null,
                            ProductAndProcedures: [
                                {
                                    Product: {
                                        Name: "Locomotives and brake-vans",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Part 9 - Type examination",
                                        },
                                        {
                                            Name: "Part 10 - Full quality assurance",
                                        }
                                    ]
                                },
                                {
                                    Product: {
                                        Name: "Hydraulic-powered roof supports",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Part 9 - Type examination",
                                        },
                                        {
                                            Name: "Part 10 - Full quality assurance",
                                        }
                                    ]
                                },
                            ]
                        }

                    ]
                }
            ],
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

    static additionalLegislativeAreas() {
        return new this({
            DocumentLegislativeAreas: [
                {
                    Name: "Lifts",
                    IsProvisional: "No",
                    AppointmentDate: Cypress.dayjs().subtract(5, "days"),
                    ReviewDate: Cypress.dayjs().add(10, "days"),
                    Usernotes: "Additional LA",
                    ScopeOfAppointments: [
                        {
                            Category: {
                                Name: "Safety components for lifts in accordance with regulation 48",
                            },
                            Subcategory: null,
                            ProductAndProcedures: [
                                {
                                    Product: {
                                        Name: "Safety devices fitted to jacks of hydraulic power circuits where these are used to prevent falls",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Schedule 14: Conformity based on full quality assurance for safety components for lifts",
                                        }
                                    ]
                                },
                                {
                                    Product: {
                                        Name: "Devices for locking landing doors",
                                    },
                                    Procedures: [
                                        {
                                            Name: "Schedule 11: Type examination for safety components for lifts",
                                        },
                                        {
                                            Name: "Schedule 14: Conformity based on full quality assurance for safety components for lifts",
                                        }
                                    ]
                                },

                            ]
                        }
                    ]
                }
            ],
        });
    }

}



