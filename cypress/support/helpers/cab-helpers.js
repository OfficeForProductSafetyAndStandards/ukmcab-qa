export const findCabPath = () => { return '/find-a-cab'}
export const addCabPath = () => { return '/admin/cab/create'}
export const editCabPath = (cabId) => { return '/Admin/edit'}
export const cabRequestsPath = () => { return '/admin/review/list'}

export const errors = {
  nameRequired: 'The Name field is required.',
  addressRequired: 'The Address field is required.',
  emailPhoneOrWebsiteRequired: 'At least one of Email, Phone, or Website needs to be completed to create a new CAB.',
  regulationRequired: 'Please select at least one regulation from the list.',
  cabNameExists: 'A CAB with this name already exists.',
}

export const getTestCab = () => {
  return cy.task('getItems').then(cabs => {
    return cabs[0]
  })
}

export const viewCabPage = (cabId) => {
  cy.ensureOn(`/find-a-cab/profile?id=${cabId}`)
}

export const addACabButton = () => {
  return cy.contains('a', 'Add a new CAB')
}

export const enterCommonCabDetails = (cab) => {
  cy.ensureOn(addCabPath())
  cy.get('#Name').invoke('val', cab.name)
  cy.get('#Address').invoke('val', cab.address)
  cy.get('#Website').invoke('val', cab.website)
  cy.get('#Email').invoke('val', cab.email)
  cy.get('#Phone').invoke('val', cab.phone)
  cy.get('#RegisteredOfficeLocation').select(cab.location)
  cab.bodyTypes.forEach(bodyType => {
    cy.get(`input[value='${bodyType}']`).check()
  })
  cab.regulations.forEach(regulation => {
    cy.get(`input[value='${regulation}']`).check()
  })
}

// expects files in fixtures folder
export const uploadFiles = (files) => {
  files.forEach((file, index) => {
    cy.get('input[type=file]').selectFile(`cypress/fixtures/${file}`)
    upload()
    if(index < files.length - 1) { cy.contains('Upload another file').click() }
  })
}

export const hasUploadedFileNames = (files) => {
  files.forEach((file, index) => {
    cy.contains(new RegExp(`${index+1}.\\s+\\d+-${file}`))
  })
}

export const addCabAsOpssUser = (cab) => {
  enterCommonCabDetails(cab)
  saveAndContinue()
  uploadFiles(cab.accreditationSchedules)
  saveAndContinue()
  //TODO assert cab creation
}

export const addCabAsUkasUser = (cab) => {
  enterCommonCabDetails(cab)
  cy.get('#UKASReference').invoke('val', cab.ukasRefNo)
  saveAndContinue()
  uploadFiles(cab.accreditationSchedules)
  saveAndContinue()
  //TODO assert cab creation
}

export const upload = () => {
  cy.contains('button', 'Upload').click()
}

export const saveAndContinue = () => {
  cy.contains('button,a', 'Save and continue').click()
}

export const saveAsDraft = () => {
  cy.contains('button', 'Save as draft').click()
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