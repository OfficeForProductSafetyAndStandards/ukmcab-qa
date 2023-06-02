export const date = (date) => {
  return date ? {
    DD: Cypress.dayjs(date).format('DD'),
    MM: Cypress.dayjs(date).format('MM'),
    YYYY: Cypress.dayjs(date).format('YYYY'),
    DDMMYYYY: Cypress.dayjs(date).format('DD/MM/YYYY'),
    DMMMYYYY: Cypress.dayjs(date).format('D MMM YYYY'),
    DDMMMYYYY: Cypress.dayjs(date).format('DD MMM YYYY'),
  } : null
}

export const valueOrNotProvided = (value) => {
  return !value ? 'Not provided' : value
}