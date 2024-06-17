import {searchUrl} from '../../support/helpers/url-helpers'
import {searchCab} from '../../support/helpers/search-helpers'
import {getLastUserEmail} from "../../support/helpers/email-helpers"
import Cab from '../../support/domain/cab'
import * as CabHelpers from '../../support/helpers/cab-helpers'
import * as EmailSubscriptionHelpers from '../../support/helpers/email-subscription-helpers'

describe('Email subscription', function () {

    const fakeDateTimeDaily = Cypress.dayjs(new Date()).add(3, 'hours').add(1, 'day').format('DD/MM/YYYY HH:mm:ss')
    const fakeDateTimeWeekly = Cypress.dayjs(new Date()).add(3, 'hours').add(7, 'days').format('DD/MM/YYYY HH:mm:ss')


    beforeEach(function () {
        EmailSubscriptionHelpers.clearSubscriptions()
        EmailSubscriptionHelpers.clearFakeDateTime()
        EmailSubscriptionHelpers.turnOffBackgroundService()
        cy.wrap(`testing${Date.now()}@dummy.gov.uk`).as('email')
        cy.loginAsOpssUser()
        cy.ensureOn(CabHelpers.addCabPath())
        cy.wrap(Cab.build()).as('cab')
        // CabHelpers.getTestCabForEditing().then(cab => {
        //   cy.wrap(cab).as('testCab')
        // })
    })

    afterEach(function () {
        EmailSubscriptionHelpers.turnOnBackgroundService()
    })


    context('when subscribing to all search results', function () {

        beforeEach(function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(searchUrl())
        })


        it('all pages and any errors are displayed as expected', function () {
            EmailSubscriptionHelpers.getEmailsLink().click()
            cy.get('h1').contains('Get emails from GOV.UK')
            cy.get('form').contains("You’ll get emails when we add or update pages about: UKMCAB search results")
            cy.continue()
            cy.get('h1').contains('How often do you want to get emails?')
            cy.contains("Do you need to unsubscribe from UKMCAB emails?").find('a', 'unsubscribe from UKMCAB emails?').should('have.attr', 'href', EmailSubscriptionHelpers.unsubscribePath)
            cy.continue()
            cy.hasError('Select one', 'Choose how often you want to get emails')
            cy.contains('label', EmailSubscriptionHelpers.Frequency.Daily).click()
            cy.continue()
            cy.continue()
            cy.hasError('Email address', 'Enter an email address')
            cy.get('#email-address-input').invoke('val', this.email)
            cy.continue()
            cy.get('h1').contains('Check your email')
            cy.contains(`We’ve sent an email to ${this.email} Click the link in the email to confirm you want emails from UKMCAB about: UKMCAB search results The link will stop working after 7 days.`)
            cy.contains("details", "Not received an email? Emails sometimes take a few minutes to arrive. If you do not receive an email soon, check your spam or junk folder. If this does not work, contact GOV.UK for help.")
                .find('a', "contact GOV.UK").should('have.attr', 'href', "https://www.gov.uk/contact/govuk")
            cy.contains('a', 'Go to search').should('have.attr', 'href', Cypress.config('baseUrl') + searchUrl())
        })

        it('Correct emails are delivered for daily subscriptions', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Daily, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.setFakeDateTime(fakeDateTimeDaily)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email)
        })

        it('Correct emails are delivered for weekly subscriptions', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Weekly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.setFakeDateTime(fakeDateTimeWeekly)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email)
        })

        it('Correct emails are delivered for instant subscriptions', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Instantly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email)
        })

        it('displays changes when user clicks link in the email to view changes', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Instantly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email)
            getLastUserEmail(this.email).then(_email => {
                cy.ensureOn(_email.links[1]) // second link is view subscription changes
                EmailSubscriptionHelpers.assertSearchSubscriptionChangesAreDisplayed(0, 0, 1)
            })
            cy.contains('a', 'View').click()
            cy.contains(`1 modifications to search results`)
            cy.contains(this.cab.addressLines.join(', '))

            // add a new cab to trigger notification
            cy.ensureOn(CabHelpers.addCabPath())
            const newCab = Cab.build()
            CabHelpers.createCabWithoutDocuments(newCab)
            CabHelpers.hasCabPublishedConfirmation(newCab)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email)
            getLastUserEmail(this.email).then(_email => {
                cy.ensureOn(_email.links[1]) // second link is view subscription changes
                EmailSubscriptionHelpers.assertSearchSubscriptionChangesAreDisplayed(1, 0, 0)
            })
            cy.contains('a', 'View').click()
            cy.contains(`1 additions to search results`)
            cy.contains(newCab.name)
        })
    })

    context('when subscribing to filtered search results', function () {

        beforeEach(function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
        })

        it('Emails are NOT delivered for any changes outside of the subscribed results', function () {
            searchCab('WillNotYieldAnySearchResults')
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Instantly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSubscriptionEmailIsNotSent(this.email)
        })

        it('Correct emails are delivered for daily subscriptions', function () {
            searchCab(this.cab.name)
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Daily, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.setFakeDateTime(fakeDateTimeDaily)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email, this.cab.name)
        })

        it('Correct emails are delivered for weekly subscriptions', function () {
            searchCab(this.cab.name)
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Weekly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.setFakeDateTime(fakeDateTimeWeekly)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email, this.cab.name)
        })

        it('Correct emails are delivered for instant subscriptions', function () {
            searchCab(this.cab.name)
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Instantly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSearchUpdateSubscriptionEmailIsSent(this.email, this.cab.name)
        })
    })

    context('when subscribing to Cab profile changes', function () {
        beforeEach(function () {
            CabHelpers.createCab(this.cab)
            cy.ensureOn(CabHelpers.cabProfilePage(this.cab))
        })

        it('all pages and any errors are displayed as expected', function () {
            EmailSubscriptionHelpers.getEmailsLink().click()
            cy.get('h1').contains('Get emails from GOV.UK')
            cy.get('form').contains(`You’ll get emails when we add or update pages about: UKMCAB profile for '${this.cab.name}'`)
            cy.continue()
            cy.get('h1').contains('How often do you want to get emails?')
            cy.contains("Do you need to unsubscribe from UKMCAB emails?").find('a', 'unsubscribe from UKMCAB emails?').should('have.attr', 'href', EmailSubscriptionHelpers.unsubscribePath)
            cy.continue()
            cy.hasError('Select one', 'Choose how often you want to get emails')
            cy.contains('label', EmailSubscriptionHelpers.Frequency.Daily).click()
            cy.continue()
            cy.continue()
            cy.hasError('Email address', 'Enter an email address')
            cy.get('#email-address-input').invoke('val', this.email)
            cy.continue()
            cy.get('h1').contains('Check your email')
            cy.contains(`We’ve sent an email to ${this.email} Click the link in the email to confirm you want emails from UKMCAB about: UKMCAB profile for '${this.cab.name}' The link will stop working after 7 days.`)
            cy.contains("details", "Not received an email? Emails sometimes take a few minutes to arrive. If you do not receive an email soon, check your spam or junk folder. If this does not work, contact GOV.UK for help.")
                .find('a', "contact GOV.UK").should('have.attr', 'href', "https://www.gov.uk/contact/govuk")
            // cy.contains('a', `Go to CAB profile for '${this.cab.name}'`).should('have.attr', 'href', this.cab.oldSchemeUrl)
        })

        it('Correct emails are delivered for daily subscriptions', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Daily, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email, `You've subscribed to emails about UKMCAB profile for '${this.cab.name}'`)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.setFakeDateTime(fakeDateTimeDaily)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertCabUpdateSubscriptionEmailIsSent(this.email, this.cab)
        })

        it('Correct emails are delivered for weekly subscriptions', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Weekly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email, `You've subscribed to emails about UKMCAB profile for '${this.cab.name}'`)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.setFakeDateTime(fakeDateTimeWeekly)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertCabUpdateSubscriptionEmailIsSent(this.email, this.cab)
        })

        it('Correct emails are delivered for instant subscriptions', function () {
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Instantly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email, `You've subscribed to emails about UKMCAB profile for '${this.cab.name}'`)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertCabUpdateSubscriptionEmailIsSent(this.email, this.cab)
        })

    })

    context('when user confirms email and subscription is registered', function () {

        beforeEach(function () {
            CabHelpers.createCabWithoutDocuments(this.cab)
            cy.ensureOn(searchUrl())
            EmailSubscriptionHelpers.subscribe(EmailSubscriptionHelpers.Frequency.Instantly, this.email)
            EmailSubscriptionHelpers.assertVerificationEmailIsSentAndVerifyEmail(this.email)
            EmailSubscriptionHelpers.processSubscriptions()
            EmailSubscriptionHelpers.assertSubscriptionConfirmationEmailIsSent(this.email)
        })

        it('displays Manage subscription page', function () {
            cy.contains('h1', 'Manage your UKMCAB subscription')
            cy.contains(`Subscription for ${this.email} Change email address Go to search Topic UKMCAB search results You subscribed to get updates as they happen. Change how often you get emails Unsubscribe`)
            cy.contains('a', 'Change email address')
            cy.contains('a', 'Go to search')
            cy.contains('a', 'Change how often you get emails')
            cy.contains('a', 'Unsubscribe')
        })

        it('User can unscubscribe and emails are no longer delivered', function () {
            cy.contains('a', 'Unsubscribe').click()
            cy.contains('a,button', 'Unsubscribe').click()
            cy.contains('You have successfully unsubscribed from UKMCAB search results.')
            EmailSubscriptionHelpers.updateCabToTriggerSubscription(this.cab)
            EmailSubscriptionHelpers.processSubscriptionConfirmationEmail()
            EmailSubscriptionHelpers.assertSubscriptionEmailIsNotSent(this.email)
        })

        it('User can manage subscription Frequency', function () {
            // change email Frequency
            cy.contains('a', 'Change how often you get emails').click()
            cy.contains('a,button', 'Save').click()
            cy.contains('You have successfully updated the email frequency')
            // change email address
            cy.contains('a', 'Change email address').click()
            cy.contains(`Your current email address is ${this.email}`)
            cy.contains("What's your new email address?").next('input').type(`testing${Date.now()}@dummy.gov.uk`)
            cy.continue()
            cy.contains('h1', 'Check your email')
        })

        it('subscription confirmation links are correct', function () {
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
