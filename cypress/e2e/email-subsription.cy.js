import { searchUrl } from '../support/helpers/url-helpers'
import { searchCab } from '../support/helpers/search-helpers'
import { getLastUserEmail } from "../support/helpers/email-helpers"
import { basicAuthCreds } from '../support/helpers/common-helpers'
import * as CabHelpers from '../support/helpers/cab-helpers'

describe('Email subscription', function() {

  const Frequency = {
    Daily: "Once a day",
    Weekly: "Once a week",
    Instantly: "Each time we add or update a page (you may get more than one email a day)"
  }

  const diagnosticsPath = '/subscriptions/diagnostics'
  const unsubscribePath = '/subscriptions/unsubscribe-all'
  const fakeDateTimeDaily = Cypress.dayjs(new Date()).add(3, 'hours').add(1, 'day').format('DD/MM/YYYY HH:mm:ss')
  const fakeDateTimeWeekly = Cypress.dayjs(new Date()).add(3, 'hours').add(7, 'days').format('DD/MM/YYYY HH:mm:ss')

  const subscribe = (frequency, email, subscriptionType = "") => {
    cy.contains('a', 'Get emails').click()
    cy.continue()
    cy.contains('label', frequency).click()
    cy.continue()
    cy.get('#email-address-input').invoke('val', email)
    cy.continue()
    cy.contains('Check your email')
  }

  const updateCabToTriggerSubscription = (cab) => {
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

  const clearSubscriptions = () => {
    cy.ensureOn('/subscriptions/diagnostics')
    cy.contains('a,button', 'Clear all data').click()
    cy.contains('All subscriptions data cleared successfully')
  }

  const turnOffBackgroundService = () => {
    cy.request({
      method: 'POST',
      url: '/__api/subscriptions/service/off',
      ...basicAuthCreds()
    })
  }

  const turnOnBackgroundService = () => {
    cy.request({
      method: 'POST',
      url: '/__api/subscriptions/service/on',
      ...basicAuthCreds()
    })
  }

  // user is sent a subscription confirmation email once email address is verified
  // this email is sent as part of scheduler that runs every 10 mins at present
  // processing subscriptions makes it send instantly
  const processSubscriptionConfirmationEmail = () => {
    processSubscriptions()
  }

  // subscription emails are currently scheduled to run every 10 mins
  // this function makes it send it instantly
  const processSubscriptions = () => {
    cy.request({
      method: 'POST',
      url: '/__api/subscriptions/process-subs',
      ...basicAuthCreds()
    })
  }

  // sets fake date time in the subscription diagnostics tool to fastrack daily/weekly subscriptions
  // value Must be in the exact format: dd/MM/yyyy HH:mm:ss, e.g., 01/01/2024 23:00:00 (UTC timezone)
  const setFakeDateTime = (value) => {
    cy.ensureOn(diagnosticsPath)
    cy.get('#when').type(value)
    cy.contains('a,button', 'Save').click()
    cy.contains('Fake date/time has been set')
  }

  const clearFakeDateTime = () => {
    cy.ensureOn(diagnosticsPath)
    cy.contains('a,button', 'Clear fake date/time').click()
    cy.contains('Fake date/time has been cleared')
  }

  const assertVerificationEmailIsSentAndVerifyEmail = (email, verificationMessage = "You've subscribed to emails about UKMCAB search results") => {
    getLastUserEmail(email).then(_email => {
      expect(_email.isRecent).to.be.true
      expect(_email.isSubscriptionAccountVerification).to.be.true
      cy.ensureOn(_email.link)
      cy.contains(verificationMessage)
    })
  }

  const assertSubscriptionConfirmationEmailIsSent = (email) => {
    getLastUserEmail(email).then(_email => {
      expect(_email.isRecent).to.be.true
      expect(_email.isSubscriptionConfirmationEmail).to.be.true
    })
  }

  const assertSearchUpdateSubscriptionEmailIsSent = (email) => {
    getLastUserEmail(email).then(_email => {
      expect(_email.isRecent).to.be.true
      expect(_email.isSearchResultsUpdatedEmail).to.be.true
    })
  }

  const assertCabUpdateSubscriptionEmailIsSent = (email, cab) => {
    getLastUserEmail(email).then(_email => {
      expect(_email.isRecent).to.be.true
      expect(_email.isCabUpdatedEmail(cab)).to.be.true
    })
  }

  const assertSubscriptionEmailIsNotSent = (email) => {
    // check that last email is subscription confirmation and not a subscription email
    getLastUserEmail(email).then(_email => {
      expect(_email.isSubscriptionConfirmationEmail).to.be.true
    })
  }

  beforeEach(function() {
    clearSubscriptions()
    clearFakeDateTime()
    turnOffBackgroundService()
    cy.wrap(`testing${Date.now()}@dummy.gov.uk`).as('email')
    CabHelpers.getTestCabForEditing().then(cab => {
      cy.wrap(cab).as('testCab')
    })
  })

  afterEach(function() {
    turnOnBackgroundService()
  })

  context('when subscribing to all search results', function() {

    beforeEach(function() {
      cy.ensureOn(searchUrl())
    })

    it('all pages and any errors are displayed as expected', function() {
      cy.contains('a', 'Get emails').click()
      cy.get('h1').contains('Get emails from GOV.UK')
      cy.get('form').contains("You’ll get emails when we add or update pages about: UKMCAB search results")
      cy.continue()
      cy.get('h1').contains('How often do you want to get emails?')
      cy.contains("Do you need to unsubscribe from UKMCAB emails?").find('a', 'unsubscribe from UKMCAB emails?').should('have.attr', 'href', unsubscribePath)
      cy.continue()
      cy.hasError('Select one', 'Choose how often you want to get emails')
      cy.contains('label', Frequency.Daily).click()
      cy.continue()
      cy.continue()
      cy.hasError('Email address', 'Enter an email address')
      cy.get('#email-address-input').invoke('val', this.email)
      cy.continue()
      cy.get('h1').contains('Check your email')
      cy.contains(`We’ve sent an email to ${this.email} Click the link in the email to confirm you want emails from UKMCAB about: UKMCAB search results The link will stop working after 7 days.` )
      cy.contains("details", "Not received an email? Emails sometimes take a few minutes to arrive. If you do not receive an email soon, check your spam or junk folder. If this does not work, contact GOV.UK for help.")
      .find('a', "contact GOV.UK").should('have.attr', 'href', "https://www.gov.uk/contact/govuk")
    })
    
    it('Correct emails are delivered for daily subscriptions', function() {
      subscribe(Frequency.Daily, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      setFakeDateTime(fakeDateTimeDaily)
      processSubscriptions()
      assertSearchUpdateSubscriptionEmailIsSent(this.email)
    })

    it('Correct emails are delivered for weekly subscriptions', function() {
      subscribe(Frequency.Weekly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      setFakeDateTime(fakeDateTimeWeekly)
      processSubscriptions()
      assertSearchUpdateSubscriptionEmailIsSent(this.email)
    })

    it('Correct emails are delivered for instant subscriptions', function() {
      subscribe(Frequency.Instantly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      processSubscriptions()
      assertSearchUpdateSubscriptionEmailIsSent(this.email)
    })
  })

  context('when subscribing to filtered search results', function() {
    
    it('Emails are NOT delivered for any changes outside of the subscribed results', function() {
      searchCab('WillNotYieldAnySearchResults')
      subscribe(Frequency.Instantly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      processSubscriptions()
      assertSubscriptionEmailIsNotSent(this.email)
    })

    it('Correct emails are delivered for daily subscriptions', function() {
      searchCab(this.testCab.name)
      subscribe(Frequency.Daily, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      setFakeDateTime(fakeDateTimeDaily)
      processSubscriptions()
      assertSearchUpdateSubscriptionEmailIsSent(this.email)
    })

    it('Correct emails are delivered for weekly subscriptions', function() {
      searchCab(this.testCab.name)
      subscribe(Frequency.Weekly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      setFakeDateTime(fakeDateTimeWeekly)
      processSubscriptions()
      assertSearchUpdateSubscriptionEmailIsSent(this.email)
    })

    it('Correct emails are delivered for instant subscriptions', function() {
      searchCab(this.testCab.name)
      subscribe(Frequency.Instantly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      processSubscriptions()
      assertSearchUpdateSubscriptionEmailIsSent(this.email)
    })
  })

  context('when subscribing to Cab profile changes', function() {
    beforeEach(function() {
      cy.ensureOn(CabHelpers.cabProfilePage(this.testCab))
    })

    it('all pages and any errors are displayed as expected', function() {
      cy.contains('a', 'Get emails').click()
      cy.get('h1').contains('Get emails from GOV.UK')
      cy.get('form').contains(`You’ll get emails when we add or update pages about: UKMCAB profile for '${this.testCab.name}'`)
      cy.continue()
      cy.get('h1').contains('How often do you want to get emails?')
      cy.contains("Do you need to unsubscribe from UKMCAB emails?").find('a', 'unsubscribe from UKMCAB emails?').should('have.attr', 'href', unsubscribePath)
      cy.continue()
      cy.hasError('Select one', 'Choose how often you want to get emails')
      cy.contains('label', Frequency.Daily).click()
      cy.continue()
      cy.continue()
      cy.hasError('Email address', 'Enter an email address')
      cy.get('#email-address-input').invoke('val', this.email)
      cy.continue()
      cy.get('h1').contains('Check your email')
      cy.contains(`We’ve sent an email to ${this.email} Click the link in the email to confirm you want emails from UKMCAB about: UKMCAB profile for '${this.testCab.name}' The link will stop working after 7 days.` )
      cy.contains("details", "Not received an email? Emails sometimes take a few minutes to arrive. If you do not receive an email soon, check your spam or junk folder. If this does not work, contact GOV.UK for help.")
      .find('a', "contact GOV.UK").should('have.attr', 'href', "https://www.gov.uk/contact/govuk")
    })

    it('Correct emails are delivered for daily subscriptions', function() {
      subscribe(Frequency.Daily, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email, `You've subscribed to emails about UKMCAB profile for '${this.testCab.name}'`)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      setFakeDateTime(fakeDateTimeDaily)
      processSubscriptions()
      assertCabUpdateSubscriptionEmailIsSent(this.email, this.testCab)
    })

    it('Correct emails are delivered for weekly subscriptions', function() {
      subscribe(Frequency.Weekly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email, `You've subscribed to emails about UKMCAB profile for '${this.testCab.name}'`)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      setFakeDateTime(fakeDateTimeWeekly)
      processSubscriptions()
      assertCabUpdateSubscriptionEmailIsSent(this.email, this.testCab)
    }) 

    it('Correct emails are delivered for instant subscriptions', function() {
      subscribe(Frequency.Instantly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email, `You've subscribed to emails about UKMCAB profile for '${this.testCab.name}'`)
      processSubscriptionConfirmationEmail()
      assertSubscriptionConfirmationEmailIsSent(this.email)
      updateCabToTriggerSubscription(this.testCab)
      processSubscriptions()
      assertCabUpdateSubscriptionEmailIsSent(this.email, this.testCab)
    })
  })

  context('when user confirms email and subscription is registered', function() {

    beforeEach(function() {
      cy.ensureOn(searchUrl())
      subscribe(Frequency.Instantly, this.email)
      assertVerificationEmailIsSentAndVerifyEmail(this.email)
      processSubscriptions()
      assertSubscriptionConfirmationEmailIsSent(this.email)
    })
    
    it('displays Manage subscription page', function() {
      cy.contains('h1', 'Manage your UKMCAB subscription')
      cy.contains(`Subscription for ${this.email} Change email address Topic UKMCAB search results You subscribed to get updates as they happen. Change how often you get emails Unsubscribe`)
      cy.contains('a', 'Change email address')
      cy.contains('a', 'Change how often you get emails')
      cy.contains('a', 'Unsubscribe')
    })
    
    it('User can unscubscribe and emails are no longer delivered', function() {
      cy.contains('a', 'Unsubscribe').click()
      cy.contains('a,button', 'Unsubscribe').click()
      cy.contains('You have successfully unsubscribed from UKMCAB search results.')
      updateCabToTriggerSubscription(this.testCab)
      processSubscriptionConfirmationEmail()
      assertSubscriptionEmailIsNotSent(this.email)
    })
    
    it('User can manage subscription frequency', function() {
      // change email frequency
      cy.contains('a', 'Change how often you get emails').click()
      cy.contains('a,button', 'Save').click()
      cy.contains('You have successfully updated the email frequency.')
      // change email address
      cy.contains('a', 'Change email address').click()
      cy.contains(`Your current email address is ${this.email}`)
      cy.contains("What's your new email address?").next('input').type(`testing${Date.now()}@dummy.gov.uk`)
      cy.continue()
      cy.contains('h1', 'Check your email')
    })

    it('subscription confirmation links are correct', function() {
      getLastUserEmail(this.email).then(_email => {
        cy.ensureOn(_email.links[0])
        cy.contains('h1', 'Manage your UKMCAB subscription')
        cy.ensureOn(_email.links[1])
        cy.contains('h1', 'Unsubscribe')
        cy.ensureOn(_email.links[2])
        cy.contains('h1', 'Are you sure you want to unsubscribe from everything?')
        cy.contains('a,button', 'Unsubscribe').click()
        cy.contains(`Unsubscribed from all`)
      })
    })

  })

})