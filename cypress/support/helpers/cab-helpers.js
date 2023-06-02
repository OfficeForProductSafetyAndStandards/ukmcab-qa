import Cab from '../domain/cab'
import { date, valueOrNotProvided } from './formatters'
export const workQueuePath = () => { return '/admin/cab-management'}
export const cabProfilePage = (id) => { return `/search/cab-profile/${id}`}
export const cabSummaryPage = (id) => { return `/admin/cab/summary/${id}`}
export const addCabPath = () => { return '/admin/cab/about/create'}

export const createCab = (cab) => {
  enterCabDetails(cab)
  enterContactDetails(cab)
  enterBodyDetails(cab)
  uploadSchedules(cab)
  uploadDocuments(cab)
  hasDetailsConfirmation(cab)
  clickPublish()
}

export const draftCab = (cab) => {
  enterCabDetails(cab)
  enterContactDetails(cab)
  enterBodyDetails(cab)
  uploadSchedules(cab)
  uploadDocuments(cab)
  hasDetailsConfirmation(cab)
  saveAsDraft()
}

export const enterCabDetails = (cab) => {
  cy.get('#Name').invoke('val', cab.name)
  cy.get('#CABNumber').invoke('val', cab.cabNumber)
  if(cab.appointmentDate) {
    cy.get('#AppointmentDateDay').invoke('val', date(cab.appointmentDate).DD)
    cy.get('#AppointmentDateMonth').invoke('val', date(cab.appointmentDate).MM)
    cy.get('#AppointmentDateYear').invoke('val', date(cab.appointmentDate).YYYY)
  }
  if(cab.renewalDate) {
    cy.get('#RenewalDateDay').invoke('val', date(cab.renewalDate).DD)
    cy.get('#RenewalDateMonth').invoke('val', date(cab.renewalDate).MM)
    cy.get('#RenewalDateYear').invoke('val', date(cab.renewalDate).YYYY)
  }
  if (cab.ukasRef) {
    cy.get('#UKASReference').invoke('val', cab.ukasRef)
  }
  cy.continue()
}

export const enterContactDetails = (cab) => {
  cy.get('#AddressLine1').invoke('val', cab.addressLine1)
  cy.get('#AddressLine2').invoke('val', cab.addressLine2)
  cy.get('#TownCity').invoke('val', cab.townCity)
  cy.get('#Postcode').invoke('val', cab.postcode)
  cy.get('#County').invoke('val', cab.county)
  cy.get('#Country').invoke('val', cab.country)
  cy.get('#Website').invoke('val', cab.website)
  cy.get('#Email').invoke('val', cab.email)
  cy.get('#Phone').invoke('val', cab.phone)
  cy.get('#PointOfContactName').invoke('val', cab.pointOfContactName)
  cy.get('#PointOfContactEmail').invoke('val', cab.pointOfContactEmail)
  cy.get('#PointOfContactPhone').invoke('val', cab.pointOfContactPhone)
  if(cab.isPointOfContactPublicDisplay) {
    cy.get('#PublicDisplay').check()
  }
  cy.get('#RegisteredOfficeLocation').select(cab.registeredOfficeLocation)
  cy.continue()
}

export const enterBodyDetails = (cab) => {
  cy.wrap(cab.testingLocations).its('length').then(count => {
    Cypress._.times(count - 1, cy.contains('a', 'Add another registered test location').click())
    cab.testingLocations.forEach((location, index) => {
      cy.get('.test-location select').eq(index).select(location)
    })
  })
  cab.bodyTypes.forEach(bodyType => {
    cy.get(`input[value='${bodyType}']`).check()
  })
  cab.legislativeAreas.forEach(area => {
    cy.get(`input[value='${area}']`).check()
  })
  cy.continue()
}

export const uploadSchedules = (cab) => {
  uploadFiles(cab.schedules)
  cy.continue()
}

export const uploadDocuments = (cab) => {
  uploadFiles(cab.documents)
  cy.continue()
}

export const clickPublish = () => {
  cy.get('button,a').contains('Publish').click()
}

export const hasDetailsConfirmation = (cab) => {
  cy.hasKeyValueDetail('CAB name', cab.name)
  cy.hasKeyValueDetail('CAB number', cab.cabNumber)
  cy.hasKeyValueDetail('Appointment date (optional)', valueOrNotProvided(date(cab.appointmentDate)?.DDMMYYYY))
  cy.hasKeyValueDetail('Renewal date (optional)', valueOrNotProvided(date(cab.renewalDate)?.DDMMYYYY))
  cy.hasKeyValueDetail('UKAS reference number', valueOrNotProvided(cab.ukasRef))
  cy.hasKeyValueDetail('Address', valueOrNotProvided(cab.addressLines.join('')))
  cy.hasKeyValueDetail('Website', valueOrNotProvided(cab.website))
  cy.hasKeyValueDetail('Email', valueOrNotProvided(cab.email))
  cy.hasKeyValueDetail('Phone', valueOrNotProvided(cab.phone))
  cy.hasKeyValueDetail('Point of contact name (optional)',valueOrNotProvided(cab.pointOfContactName))
  cy.hasKeyValueDetail('Point of contact email (optional)', valueOrNotProvided(cab.pointOfContactEmail))
  cy.hasKeyValueDetail('Point of contact phone (optional)', valueOrNotProvided(cab.pointOfContactPhone))
  cy.hasKeyValueDetail('Display of point of contact details', cab.pointOfContactDetailsDisplayStatus())
  cy.hasKeyValueDetail('Registered office location', cab.registeredOfficeLocation)

  cy.hasKeyValueDetail('Registered test location', valueOrNotProvided(cab.testingLocations?.join('')))
  cy.hasKeyValueDetail('Body Type', cab.bodyTypes.join(''))
  cy.hasKeyValueDetail('Legislative area', cab.legislativeAreas.join(''))

  filenames(cab.schedules).forEach(filename => {
    cy.contains('Schedule').next().contains(filename)
  })
  filenames(cab.documents).forEach(filename => {
    cy.contains('Document').next().contains(filename)
  })

  cy.contains('Once published this record will be visible to the public.')
}

export const hasCabPublishedConfirmation = (cab) => {
  cy.get('.govuk-panel--confirmation')
  cy.get('.govuk-panel--confirmation').contains(cab.name + ' published ' + 'CAB number' + cab.cabNumber)
  cy.contains(`What happens next CAB ${cab.cabNumber} is now publicly available.`).find('a', cab.cabNumber)
  cy.contains('a', `View CAB ${cab.cabNumber} - ${cab.name}`)
  cy.contains('a', 'Go to CAB management').should('have.attr', 'href', workQueuePath())
}

// expects files in fixtures folder
export const uploadFiles = (files) => {
  files.forEach((file, index, files) => {
    cy.get('input[type=file]').selectFile(`cypress/fixtures/${file.fileName}`)
    upload()
    if(index < files.length - 1) { cy.contains('Upload another file').click() }
  })
}

export const filenames = (files) => {
  return files.map(f => { return f.fileName})
}

export const hasUploadedFileNames = (files) => {
  cy.get('tbody tr').each(($row, index) => {
    cy.wrap($row).find('td').eq(0).should('contain', `${index+1}.`)
    cy.wrap($row).find('td').eq(1).should('contain', files[index].fileName)
    cy.wrap($row).find('td').eq(2).contains('button', 'Remove').and('has.attr', 'value', files[index].fileName)
  })
}

export const archiveCab = (cab, reason='Archive reason') => {
  cy.ensureOn(cabProfilePage(cab.cabId))
  archiveCabButton().click()
  cy.get('#ArchiveReason').type(reason)
  cy.continue()
  cy.get('h2').contains('Archive')
  cy.contains(`Archived on ${date(new Date()).DMMMYYYY} by OPSS Admin User`)
  cy.contains(reason)
}

export const getTestCab = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs[0]
  })
}

export const getTestCabForEditing = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs.find(cab => cab.name.startsWith('4ward Testing'))
  })
}

export const getAllCabs = () => {
  return cy.task('getItems').then(items => {
    return items.map(item => new Cab(item))
  })
}

export const getAllPublishedCabs = () => {
  return getAllCabs().then(cabs => {
    return cabs.filter(cab => cab.status === "Published")
  })
}

export const getAllDraftCabs = () => {
  return getAllCabs().then(cabs => {
    return cabs.filter(cab => cab.status === "Draft")
  })
}

export const getAllDraftOrArchivedCabs = () => {
  return getAllCabs().then(cabs => {
    // return cabs.filter(cab => cab.status === "Draft" || cab.status === "Archived")
    return cabs.filter(cab => cab.isDraft || cab.isArchived)
  })
}

export const getDistinctBodyTypes = () => {
  const querySpec = "SELECT DISTINCT c.BodyTypes FROM c WHERE c.Status = 'Published'"
  return cy.task('executeQuery', {db: 'main', container: 'cab-documents', querySpec: querySpec}).then(results => {
    const bodyTypes = results.resources.flatMap(r => r.BodyTypes)
    return Cypress._.uniq(bodyTypes).sort()
  })
}

export const getDistinctRegisteredOfficeLocations = () => {
  const querySpec = "SELECT DISTINCT c.RegisteredOfficeLocation FROM c WHERE c.Status = 'Published'"
  return cy.task('executeQuery', {db: 'main', container: 'cab-documents', querySpec: querySpec}).then(results => {
    const _locations = Cypress._.uniq(results.resources.map(r => r.RegisteredOfficeLocation))
    const locations = Cypress._.without(_locations, "United Kingdom").sort() // Move UK to top
    locations.sort().unshift("United Kingdom")
    return locations
  })
}

export const getDistinctTestingLocations = () => {
  const querySpec = "SELECT DISTINCT c.TestingLocations FROM c WHERE c.Status = 'Published'"
  return cy.task('executeQuery', {db: 'main', container: 'cab-documents', querySpec: querySpec}).then(results => {
    const _locations = results.resources.flatMap(r => r.TestingLocations).filter(Boolean)
    const locations = Cypress._.without(_locations, "United Kingdom").sort() // Move UK to top
    locations.unshift("United Kingdom")
    return locations
  })
}

export const getDistinctLegislativeAreas = () => {
  const querySpec = "SELECT DISTINCT c.LegislativeAreas FROM c WHERE c.Status = 'Published'"
  return cy.task('executeQuery', {db: 'main', container: 'cab-documents', querySpec: querySpec}).then(results => {
    const areas =  results.resources.flatMap(r => r.LegislativeAreas)
    return Cypress._.uniq(areas).sort()
  })
}

export const addACabButton = () => {
  return cy.contains('a', 'Add a new CAB')
}

export const editCabButton = () => {
  return cy.get('a,button').contains('Edit')
}

export const archiveCabButton = () => {
  return cy.get('a,button').contains('Archive')
}

export const editCabDetail = (heading) => {
  cy.get('.cab-summary-header').contains(heading).next('a').click()
}

export const upload = () => {
  cy.contains('button', 'Upload').click()
}

export const saveAsDraft = () => {
  cy.contains('button,a', 'Save as draft').click()
}

export const submitForApproval = () => {
  cy.contains('button', 'Submit for approval').click()
}

export const onUploadSchedulePage = (cab) => {
  enterCommonCabDetails(cab)
  saveAndContinue()
}

export const onUploadSupportingDocsPage = (cab) => {
  enterCommonCabDetails(cab)
  saveAndContinue()
  uploadFiles(cab.accreditationSchedules)
  saveAndContinue()
}

export const hasAddCabPermission = () => {
  addACabButton().should('exist').and('have.attr', 'href', addCabPath())
}

export const hasNoAddCabPermission = () => {
  addACabButton().should('not.exist')
}

export const editACabButton = () => {
  return cy.contains('a', 'Edit CAB')
}

export const hasEditCabPermission = () => {
  editACabButton().should('exist')
}

export const hasNoEditCabPermission = () => {
  editACabButton().should('not.exist')
}