import { registerAsOgdUser, verifyEmail } from '../support/helpers/registration-helpers'
import * as AccountRequests from '../support/helpers/account-request-helpers'
import * as EmailHelpers from '../support/helpers/email-helpers'
import { shouldBeLoggedIn, shouldBeLoggedOut } from '../support/helpers/common-helpers'
import { hasFormError } from '../support/helpers/validation-helpers'
import OGDUser from '../support/domain/ogd-user'

describe('Account requests', () => {

  beforeEach(() => {
    const user = new OGDUser()
    cy.wrap(user).as('user')
    registerAsOgdUser(user)
  })

  context('for users who have not verified their email', function() {
    beforeEach(() => {
      cy.loginAsAdmin()
      AccountRequests.viewAccountRequests()
    })

    it('are not displayed to the admin user', function() {
      AccountRequests.accountRequest(this.user).should('not.exist')
    })
  })

  context('for users with verified email but pending review', function() {
    beforeEach(function() {
      verifyEmail(this.user.email)
      cy.loginAsAdmin()
      AccountRequests.viewAccountRequests()
    })

    it('are displayed to the admin user', function() {
      cy.contains('Pending account requests')
      AccountRequests.accountRequest(this.user).should('exist')
    })

    it('users are informed via email notification that request is pending approval', function() {
      EmailHelpers.getLastUserEmail(this.user.email).then(email => {
        expect(email.isRecent).to.be.true
        expect(email.isRequestPendingEmail).to.be.true
      })
    })

    it('stop users from login with an error', function() {
      cy.logout()
      cy.login(this.user.email, this.user.password)
      shouldBeLoggedOut()
      hasFormError('Registration request has not yet been approved.')
    })
  
    it('display request details upon review', function() {
      AccountRequests.reviewRequest(this.user)
      cy.contains('Pending account review')
      cy.hasKeyValueDetail('Email', this.user.email)
      cy.hasKeyValueDetail('Legislative areas', this.user.legislativeAreas.join(', '))
      cy.hasKeyValueDetail('Reason for request', this.user.requestReason)
    })
  
    it('can be rejected without supplying the optional rejection reason', function() {
      AccountRequests.reviewRequest(this.user)
      AccountRequests.rejectRequest()
      cy.contains('Pending account requests')
      AccountRequests.accountRequest(this.user).should('not.exist')
    })

    context('when approved', function() {
      
      beforeEach(function() {
        AccountRequests.reviewRequest(this.user)
        AccountRequests.approveRequest()
      })

      it('users are informed via email notification that request has been approved', function() {
        EmailHelpers.getLastUserEmail(this.user.email).then(email => {
          expect(email.isRecent).to.be.true
          expect(email.isRequestApprovedEmail).to.be.true
        })
      })

      it('removes request from requests page', function() {
        cy.contains('Pending account requests')
        AccountRequests.accountRequest(this.user).should('not.exist')
      })
      
      it('enables user to login', function() {
        cy.logout()
        cy.login(this.user.email, this.user.password)
        shouldBeLoggedIn()
      })
    })

    context('when rejected', function() {
      
      beforeEach(function() {
        AccountRequests.reviewRequest(this.user)
        AccountRequests.rejectRequest()
      })

      it('users are informed via email notification that request has been rejected', function() {
        EmailHelpers.getLastUserEmail(this.user.email).then(email => {
          expect(email.isRecent).to.be.true
          expect(email.isRequestRejectedEmail).to.be.true
        })
      })
      
      it('removes request from requests page', function() {
        cy.contains('Pending account requests')
        AccountRequests.accountRequest(this.user).should('not.exist')
      })
      
      it('stops user from login with an error', function() {
        cy.logout()
        cy.login(this.user.email, this.user.password)
        shouldBeLoggedOut()
        hasFormError('Invalid login attempt.')
      })
    })
  })


})