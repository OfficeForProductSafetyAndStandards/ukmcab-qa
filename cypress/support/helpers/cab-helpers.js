export const findCabPath = () => { return '/find-a-cab'}
export const addCabPath = () => { return '/Admin/create'}
export const editCabPath = (cabId) => { return '/Admin/edit'}

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