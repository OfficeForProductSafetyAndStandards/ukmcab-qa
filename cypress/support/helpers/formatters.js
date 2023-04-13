export const date = (date) => {
  return {
    DD: Cypress.dayjs(date).format('DD'),
    MM: Cypress.dayjs(date).format('MM'),
    YYYY: Cypress.dayjs(date).format('YYYY'),
    DDMMYYYY: Cypress.dayjs(date).format('DD/MM/YYYY'),
  }
}

export const valueOrNotProvided = (value) => {
  return !value ? 'Not provided' : value
}