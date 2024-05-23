import { basicAuthCreds } from '../../support/helpers/common-helpers'
import { cabProfilePage } from '../../support/helpers/cab-helpers'
import * as SearchHelpers from '../../support/helpers/search-helpers'
import * as CabHelpers from '../../support/helpers/cab-helpers'
import X2JS from  'x2js'

describe('UKMCAB RSS Feed', function() {

  let searchInput = 'amtri'

  it('works for search results', function() {
    SearchHelpers.publishedSearchResults(searchInput, {orderby: 'LastUpdatedDate desc'}).then(results => {
      cy.request({
        method: 'GET',
        url: `/search/search-feed?Keywords=${searchInput}`,
        headers: {
          'Content-Type': 'text/xml'
        },
        ...basicAuthCreds()
      }).then(resp => {
        const x2js = new X2JS({
          arrayAccessFormPaths: ['feed.entry'] // force entries to be returned as array always
        });
        const feed  = x2js.xml2js(resp.body).feed
        expect(feed.title.toString()).to.eq(`UKMCAB search results for "${searchInput}"`)
        expect(feed.id).to.eq(`tag:www.gov.uk,2005:/uk-market-conformity-assessment-bodies`)
        expect(feed.author.name).to.eq('HM Government')
        feed.entry.forEach((entry, index) => {
          expect(entry.id).to.eq(`tag:www.gov.uk,2005:${cabProfilePage(results[index])}`)
          expect(entry.title.toString()).to.eq(results[index].name)
          expect(entry.summary.toString()).to.include('Address:') // TODO expand checks once agreement is reached about formatting
          expect(entry.updated).to.eq(results[index].lastUpdatedDate.toISOString().replace(/.\d+Z$/g, "Z"))
          expect(entry.link._href).to.eq(Cypress.config().baseUrl + cabProfilePage(results[index]) + `?returnUrl=%2Fsearch%2F%3FKeywords%3D${searchInput}`)
        })
      })
    })
  })

  it('works for Cab page', function() {
    CabHelpers.getTestCab().then(cab => {
      const feedPath = `/search/cab-profile-feed/${cab.cabId}`
      cy.ensureOn(CabHelpers.cabProfilePage(cab))
      cy.contains('a', 'Subscribe to feed').should('have.attr', 'href', feedPath)
      cy.request({
        method: 'GET',
        url: feedPath,
        headers: {
          'Content-Type': 'text/xml'
        },
        ...basicAuthCreds()
      }).then(resp => {
        const x2js = new X2JS();
        const feed  = x2js.xml2js(resp.body).feed
        expect(feed.title.toString()).to.eq(cab.name)
        expect(feed.id).to.eq(`tag:www.gov.uk,2005:/uk-market-conformity-assessment-bodies`)
        expect(feed.updated).to.eq(cab.lastUpdatedDate.toISOString().replace(/.\d+Z$/g, "Z"))
        expect(feed.author.name).to.eq('HM Government')
        
        expect(feed.link[0]._rel).to.eq('self')
        expect(feed.link[0]._type).to.eq('application/atom+xml')
        expect(feed.link[0]._href).to.eq(Cypress.config('baseUrl') + feedPath)
        expect(feed.link[1]._rel).to.eq('alternate')
        expect(feed.link[1]._type).to.eq('text/html')
        expect(feed.link[1]._href).to.eq(Cypress.config('baseUrl') + cab.oldSchemeUrl)
        expect(feed.entry.id).to.eq(`tag:www.gov.uk,2005:${cab.url}`)
        expect(feed.entry.title.toString()).to.eq(cab.name)
        expect(feed.entry.summary.toString()).to.include('Address:') // TODO expand checks once agreement is reached about formatting
        expect(feed.entry.updated).to.eq(cab.lastUpdatedDate.toISOString().replace(/.\d+Z$/g, "Z"))

        expect(feed.entry.link._rel).to.eq('alternate')
        expect(feed.entry.link._type).to.eq('text/html')
        expect(feed.entry.link._href).to.eq(Cypress.config('baseUrl') + cab.url)
      })
    })
  })
})
