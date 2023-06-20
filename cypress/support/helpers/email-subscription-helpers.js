import { basicAuthCreds } from "./common-helpers"
import { getLastUserEmail } from "./email-helpers"
import * as CabHelpers from '../helpers/cab-helpers'
import { searchPath } from "./search-helpers"

export const diagnosticsPath = '/subscriptions/diagnostics'
export const unsubscribePath = '/subscriptions/unsubscribe-all?s=1'

export const Frequency = {
  Daily: "Once a day",
  Weekly: "Once a week",
  Instantly: "Each time we add or update a page (you may get more than one email a day)"
}

export const subscribe = (frequency, email, subscriptionType = "") => {
  cy.contains('a', 'Get emails').click()
  cy.continue()
  cy.contains('label', frequency).click()
  cy.continue()
  cy.get('#email-address-input').invoke('val', email)
  cy.continue()
  cy.contains('Check your email')
}

export const updateCabToTriggerSubscription = (cab) => {
  let uniqueId = Date.now()
  cy.loginAsOpssUser()
  let cloneCab = Cypress._.cloneDeep(cab)
  cy.ensureOn(CabHelpers.cabProfilePage(cab))
  CabHelpers.editCabButton().click()
  CabHelpers.editCabDetail('About')
  cloneCab.name = cab.name.replace(/Ltd.*/,`Ltd Edited ${uniqueId}`)
  CabHelpers.enterCabDetails(cloneCab)
  CabHelpers.clickPublish()
  CabHelpers.hasCabPublishedConfirmation(cloneCab)
}

export const clearSubscriptions = () => {
  cy.ensureOn('/subscriptions/diagnostics')
  cy.contains('a,button', 'Clear all data').click()
  cy.contains('All subscriptions data cleared successfully')
}

export const turnOffBackgroundService = () => {
  cy.request({
    method: 'POST',
    url: '/__api/subscriptions/service/off',
    ...basicAuthCreds()
  })
}

export const turnOnBackgroundService = () => {
  cy.request({
    method: 'POST',
    url: '/__api/subscriptions/service/on',
    ...basicAuthCreds()
  })
}

// user is sent a subscription confirmation email once email address is verified
// this email is sent as part of scheduler that runs every 10 mins at present
// processing subscriptions makes it send instantly
export const processSubscriptionConfirmationEmail = () => {
  processSubscriptions()
}

// subscription emails are currently scheduled to run every 10 mins
// this function makes it send it instantly
export const processSubscriptions = () => {
  cy.request({
    method: 'POST',
    url: '/__api/subscriptions/process-subs',
    ...basicAuthCreds()
  })
}

// sets fake date time in the subscription diagnostics tool to fastrack daily/weekly subscriptions
// value Must be in the exact format: dd/MM/yyyy HH:mm:ss, e.g., 01/01/2024 23:00:00 (UTC timezone)
export const setFakeDateTime = (value) => {
  cy.ensureOn(diagnosticsPath)
  cy.get('#when').type(value)
  cy.contains('a,button', 'Save').click()
  cy.contains('Fake date/time has been set')
}

export const clearFakeDateTime = () => {
  cy.ensureOn(diagnosticsPath)
  cy.contains('a,button', 'Clear fake date/time').click()
  cy.contains('Fake date/time has been cleared')
}

export const assertVerificationEmailIsSentAndVerifyEmail = (email, verificationMessage = "You've subscribed to emails about UKMCAB search results") => {
  getLastUserEmail(email).then(_email => {
    expect(_email.isRecent).to.be.true
    expect(_email.isSubscriptionAccountVerification).to.be.true
    cy.ensureOn(_email.link)
    cy.contains(verificationMessage)
  })
}

export const assertSubscriptionConfirmationEmailIsSent = (email) => {
  getLastUserEmail(email).then(_email => {
    expect(_email.isRecent).to.be.true
    expect(_email.isSubscriptionConfirmationEmail).to.be.true
  })
}

export const assertSearchUpdateSubscriptionEmailIsSent = (email, searchTerm) => {
  getLastUserEmail(email).then(_email => {
    expect(_email.isRecent).to.be.true
    expect(_email.isSearchResultsUpdatedEmail).to.be.true
    if(searchTerm) {
      expect(_email.body).includes(`Your UKMCAB search results for '${searchTerm}' have been updated.`)
    } else {
      expect(_email.body).includes(`Your UKMCAB search results have been updated.`)
    }
  })
}

export const assertCabUpdateSubscriptionEmailIsSent = (email, cab) => {
  getLastUserEmail(email).then(_email => {
    expect(_email.isRecent).to.be.true
    expect(_email.isCabUpdatedEmail(cab)).to.be.true
  })
}

export const assertSubscriptionEmailIsNotSent = (email) => {
  // check that last email is subscription confirmation and not a subscription email
  getLastUserEmail(email).then(_email => {
    expect(_email.isSubscriptionConfirmationEmail).to.be.true
  })
}

export const assertSearchSubscriptionChangesAreDisplayed = (numAdditions, numRemoved, numModified) => {
  cy.contains('Search results changes')
  cy.contains('Search results have changed')
  cy.contains('Summary of changes')
  cy.get('tr').eq(0).within(() => {
    cy.get('th').contains('Additions')
    cy.get('td').eq(0).contains(numAdditions)
    if(numAdditions > 0) { cy.get('td').eq(1).contains('a', 'View') }
  })
  cy.get('tr').eq(1).within(() => {
    cy.get('th').contains('Removed')
    cy.get('td').eq(0).contains(numRemoved)
    if(numRemoved > 0) { cy.get('td').eq(1).contains('a', 'View') }
  })
  cy.get('tr').eq(2).within(() => {
    cy.get('th').contains('Modified')
    cy.get('td').eq(0).contains(numModified)
    if(numModified > 0) { cy.get('td').eq(1).contains('a', 'View') }
  })
  cy.get('a').contains('View search results').should('have.attr', 'href', searchPath())
  cy.get('a').contains('Manage subscription').invoke('attr', 'href').should('match', /\/subscriptions\/manage/)
}