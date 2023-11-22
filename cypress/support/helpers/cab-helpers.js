import Cab from '../domain/cab'
import { CabNumberVisibility } from '../domain/cab-number-visibility'
import { date, valueOrNotProvided } from './formatters'
export const cabManagementPath = () => { return '/admin/cab-management' }
export const cabProfilePage = (cab) => { return `/search/cab-profile/${cab.urlSlug}` }
export const cabSummaryPage = (id) => { return `/admin/cab/summary/${id}` }
export const addCabPath = () => { return `/admin/cab/create` }

export const createCab = (cab) => {
  cy.ensureOn(addCabPath())
  enterCabDetails(cab)
  enterContactDetails(cab)
  enterBodyDetails(cab)
  uploadSchedules(cab.schedules)
  cy.saveAndContinue()
  uploadDocuments(cab.documents)
  cy.saveAndContinue()
  hasDetailsConfirmation(cab)
  clickPublish()
}

export const createCabWithoutDocuments = (cab) => {
  cy.ensureOn(addCabPath())
  enterCabDetails(cab)
  enterContactDetails(cab)
  enterBodyDetails(cab)
  skipSchedules()
  skipDocuments()
  clickPublish()
}

export const draftCab = (cab) => {
  enterCabDetails(cab)
  enterContactDetails(cab)
  enterBodyDetails(cab)
  uploadSchedules(cab.schedules)
  cy.saveAndContinue()
  uploadDocuments(cab)
  hasDetailsConfirmation(cab)
  saveAsDraft()
}

export const setAppointmentDate = (day, month, year) => {
  cy.get('#AppointmentDateDay').invoke('val', day)
  cy.get('#AppointmentDateMonth').invoke('val', month)
  cy.get('#AppointmentDateYear').invoke('val', year)
}

export const setReviewDate = (day, month, year) => {
  cy.get('#ReviewDateDay').invoke('val', day)
  cy.get('#ReviewDateMonth').invoke('val', month)
  cy.get('#ReviewDateYear').invoke('val', year)
}

export const autoFillReviewDate = () => {
  cy.contains('button', 'Add suggested review date').click()
}
export const isSummaryPage = () => {
  cy.get('h1').contains('Check details before publishing')
}

export const hasReviewDate = (date) => {
  cy.get('#ReviewDateDay').invoke('val').should('eq', date.date().toString())
  cy.get('#ReviewDateMonth').invoke('val').should('eq', (date.month() + 1).toString())
  cy.get('#ReviewDateYear').invoke('val').should('eq', date.year().toString())
}

export const enterCabDetails = (cab) => {
  // const currentDate = new Date(); // Get the current date and time
  // currentDate.setDate(currentDate.getDate()); // Add 3 days to the current date
  // const futureDate = currentDate.getTime(); // Get the timestamp of the future date in milliseconds
  cy.get('#Name').invoke('val', cab.name)
  cy.get('#CABNumber').invoke('val', cab.cabNumber)
  cy.get('#CabNumberVisibility option').then($options => {
    const options = Cypress._.map($options, 'innerText')
    expect(options).to.eql(['Display for all users', 'Display for internal users', 'Display for internal users excluding UKAS'])
  })
  if (cab.cabNumberVisibility === CabNumberVisibility.Internal) {
    cy.get('#CabNumberVisibility').select('Display for internal users')
  } else if (cab.cabNumberVisibility === CabNumberVisibility.Private) {
    cy.get('#CabNumberVisibility').select('Display for internal users excluding UKAS')
  }
  if (cab.appointmentDate) {
    setAppointmentDate(date(cab.appointmentDate).DD, date(cab.appointmentDate).MM, date(cab.appointmentDate).YYYY)
  }
  if (cab.reviewDate) {
    // cab.reviewDate = futureDate
    setReviewDate(date(cab.reviewDate).DD, date(cab.reviewDate).MM, date(cab.reviewDate).YYYY)
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
  if (cab.isPointOfContactPublicDisplay) {
    cy.get('#PublicDisplay').check()
  }
  cy.get('#RegisteredOfficeLocation').select(cab.registeredOfficeLocation)
  cy.continue()
}

export const enterBodyDetails = (cab) => {
  cy.wrap(cab.testingLocations).each((location, index, locations) => {
    Cypress._.times(locations - 1, cy.contains('a', 'Add another registered test location').click())
    cy.get('.test-location select').eq(index).select(location)
  })
  cab.bodyTypes.forEach(bodyType => {
    cy.get(`input[value='${bodyType}']`).check()
  })
  cab.legislativeAreas?.forEach(area => {
    cy.get(`input[value='${area}']`).check()
  })
  cy.continue()
}

export const uploadSchedules = (schedules) => {
  uploadFiles(schedules)
  cy.wrap(schedules).each((schedule) => {
    if (schedule.label) {
      setFileLabel(schedule.fileName, schedule.label)
    }
    if (schedule.legislativeArea) {
      setLegislativeArea(schedule.fileName, schedule.legislativeArea)
    }
  })
}

export const skipSchedules = () => {
  cy.contains('Skip this step').click()
}

export const skipDocuments = () => {
  cy.contains('Skip this step').click()
}

export const uploadDocuments = (documents) => {
  cy.wrap(documents).each((document, index) => {
    cy.get('input[type=file]').selectFile(`cypress/fixtures/${document.fileName}`)
    upload()
    if (document.category) {
      setCategory(document.fileName, document.category)
    }
    if (index < documents.length - 1) { cy.contains('Save and upload another file').click() }
  })
}

export const clickPublish = () => {
  cy.get('button,a').contains('Publish').click()
}

export const hasDetailsConfirmation = (cab) => {
  //disabling to check for other unrelated regressions
  // cy.get('.govuk-caption-m').contains('Create a CAB')
  cy.hasKeyValueDetail('CAB name', cab.name)
  cy.hasKeyValueDetail('CAB number', cab.cabNumber)
  cy.hasKeyValueDetail('Appointment date (optional)', valueOrNotProvided(date(cab.appointmentDate)?.DMMMYYYY))
  cy.hasKeyValueDetail('Review date (optional)', valueOrNotProvided(date(cab.reviewDate)?.DMMMYYYY))
  cy.hasKeyValueDetail('UKAS reference number (optional)', valueOrNotProvided(cab.ukasRef))
  // cy.hasKeyValueDetail('Address', valueOrNotProvided(cab.addressLines.join('\n')))
  cy.hasKeyValueDetail('Website (optional)', valueOrNotProvided(cab.website))
  cy.hasKeyValueDetail('Email (optional)', valueOrNotProvided(cab.email))
  cy.hasKeyValueDetail('Telephone', valueOrNotProvided(cab.phone))
  cy.hasKeyValueDetail('Point of contact name (optional)', valueOrNotProvided(cab.pointOfContactName))
  cy.hasKeyValueDetail('Point of contact email (optional)', valueOrNotProvided(cab.pointOfContactEmail))
  cy.hasKeyValueDetail('Point of contact telephone (optional)', valueOrNotProvided(cab.pointOfContactPhone))
  cy.hasKeyValueDetail('Display of point of contact details', cab.pointOfContactDetailsDisplayStatus())
  cy.hasKeyValueDetail('Registered office location', cab.registeredOfficeLocation)

  cy.hasKeyValueDetail('Registered test location', valueOrNotProvided(cab.testingLocations?.join('')))
  cy.hasKeyValueDetail('Body type', cab.bodyTypes.join(''))
  cy.hasKeyValueDetail('Legislative area', valueOrNotProvided(cab.legislativeAreas?.join('')))

  if (cab.schedules) {
    cab.schedules.forEach((schedule) => {
      cy.contains('Schedule').next().contains('a', schedule.label ?? schedule.fileName)
      cy.contains('Schedule').next().contains(schedule.legislativeArea)
    })
  } else {
    cy.hasKeyValueDetail('Schedule', 'Not provided')
  }

  if (cab.documents) {
    filenames(cab.documents).forEach(filename => {
      cy.contains('Document').next().contains(filename)
    })
  } else {
    cy.hasKeyValueDetail('Document', 'Not provided')
  }

  cy.contains('Once published this record will be visible to the public.')
}

export const hasCabPublishedConfirmation = (cab) => {
  cy.get('.govuk-panel--confirmation')
  cy.get('.govuk-panel--confirmation').contains(cab.name + ' published ' + 'CAB number' + cab.cabNumber)
  cy.contains(`What happens next CAB is now publicly available.`)
  cy.contains('a', 'View CAB').should('have.attr', 'href', cabProfilePage(cab) + '?returnURL=confirmation')
  cy.contains('a', 'Go to CAB management').should('have.attr', 'href', cabManagementPath())
}

// expects files in fixtures folder
export const uploadFile = (file) => {
  cy.get('input[type=file]').selectFile(`cypress/fixtures/${file.fileName}`)
  upload()
}

// expects files in fixtures folder
export const uploadFiles = (files) => {
  const filePaths = Cypress._.map(files, file => `cypress/fixtures/${file.fileName}`)
  cy.get('input[type=file]').selectFile(filePaths)
  upload()
}

export const filenames = (files) => {
  return files.map(f => { return f.fileName })
}

export const hasUploadedSchedules = (files) => {
  cy.wrap(files).each((file, index) => {
    cy.get('tbody td#uploaded-file-name-td').eq(index).should('contain', `${index + 1}. ${file.fileName}`)
    cy.get('tbody tr.govuk-table__row').eq(index).find('td').eq(0).find('input').should('have.value', file.label)
    cy.get('tbody tr.govuk-table__row').eq(index).find('td').eq(1).find('select').find(':selected').should('have.text', file.legislativeArea)
    cy.get('tbody tr.govuk-table__row').eq(index).find('td').eq(2).contains('button', 'Remove')
  })
}

export const hasUploadedFileNames = (files) => {
  cy.get('tbody tr').each(($row, index) => {
    cy.wrap($row).find('td').eq(0).should('contain', `${index + 1}.`)
    cy.wrap($row).find('td').eq(1).should('contain', files[index].fileName)
    cy.wrap($row).find('td').eq(2).contains('button', 'Remove').and('has.attr', 'value', files[index].fileName)
  })
}

export const uploadedFile = (filename) => {
  return cy.get(`input[value='${filename}']:visible`).closest('tr')
}

export const uploadedDocument = (filename) => {
  return cy.contains('a', `${filename}`).parents('#uploaded-file-name-tr').next('tr')
}

export const setFileLabel = (filename, newFileName) => {
  uploadedFile(filename).find('input:visible').clear().type(newFileName)
}

export const setLegislativeArea = (filename, value) => {
  uploadedFile(filename).find('select').select(value)
}

export const setCategory = (filename, value) => {
  uploadedDocument(filename).find('select').select(value)
}

export const archiveModal = () => {
  return cy.get('#archive-modal .modal-content')
}

export const unarchiveModal = () => {
  return cy.get('#unarchive-modal .modal-content')
}

export const archiveCab = (cab, options) => {
  options = { reason: 'Test archive reason', hasAssociatedDraft: false, ...options }
  const draftDeletionWarningText = 'This CAB has a draft profile connected to it. If you archive this CAB, the draft will be deleted'
  cy.ensureOn(cabProfilePage(cab))
  archiveCabButton().click()
  archiveModal().within(() => {
    cy.contains('h2', `Archive ${cab.name}`)
    cy.contains('Enter the reason for archiving this CAB.')
    options.hasAssociatedDraft ? cy.contains(draftDeletionWarningText) : cy.contains(draftDeletionWarningText).should('not.exist')
    cy.contains('Archived CAB profiles cannot be edited and users cannot view them in the search results.')
    cy.get('#archive-reason').type(options.reason)
    archiveCabButton().click()
  })
  cy.get('.govuk-notification-banner__content').contains(`Archived on ${date(new Date()).DDMMMYYYY}`)
}

export const unarchiveCab = (cab, reason = 'Test Unarchive reason') => {
  cy.ensureOn(cabProfilePage(cab))
  unarchiveCabButton().click()
  unarchiveModal().within(() => {
    cy.contains('h2', `Unarchive ${cab.name}`)
    cy.contains('Enter the reason for unarchiving this CAB profile.')
    cy.contains('Unarchived CAB profiles will be saved as draft.')
    cy.get('#unarchive-reason').type(reason)
    cy.contains('a', 'Cancel').should('have.attr', 'href', '#')
    unarchiveCabButton().click()
  })
  cy.contains('Check details before publishing')
}

export const viewSchedules = () => {
  cy.contains('#tab_product-schedules', 'Product schedules').click()
}

export const viewHistory = () => {
  cy.contains('#tab_history', 'History').click()
}

export const getTestCab = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs[0]
  })
}

export const getTestCabWithCabNumber = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs.find(c => c.cabNumber !== null)
  })
}

export const getTestCabWithReviewDate = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs.find(c => c.reviewDate !== null)
  })
}

export const getTestCabWithCabNumberAndUkasRef = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs.find(c => c.cabNumber !== null && c.ukasRef !== null)
  })
}

export const getTestCabWithDocuments = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs.find(c => c.documents && c.documents.length > 0 && c.schedules.length > 0)
  })
}

export const getTestCabForEditing = () => {
  return getAllPublishedCabs().then(cabs => {
    return cabs.find(cab => cab.name.startsWith('Test Cab'))
  })
}

export const getAllCabs = () => {
  return cy.task('getItems').then(items => {
    return items.map(item => new Cab(item))
  })
}

export const getAllPublishedCabs = () => {
  return getAllCabs().then(cabs => {
    return cabs.filter(cab => cab.isPublished)
  })
}

export const getAllDraftCabs = () => {
  return getAllCabs().then(cabs => {
    return cabs.filter(cab => cab.isDraft)
  })
}

export const getAllDraftOrArchivedCabs = () => {
  return getAllCabs().then(cabs => {
    return cabs.filter(cab => cab.isDraft || cab.isArchived)
  })
}

export const getArchivedCab = () => {
  return getAllCabs().then(cabs => {
    return cabs.find(cab => cab.isArchived)
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

export const unarchiveCabButton = () => {
  return cy.get('a,button').contains('Unarchive')
}

export const editCabDetail = (heading) => {
  cy.get('.cab-summary-header').contains(heading).parents('.govuk-summary-list__key').next().contains('a', 'Edit').click()
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

export const createDraftVersion = (cab) => {
  cy.ensureOn(cabProfilePage(cab))
  editCabButton().click()
  saveAsDraft()
}