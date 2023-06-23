import { basicAuthCreds } from '../support/helpers/common-helpers'
import { cabProfilePage } from '../support/helpers/cab-helpers'
import * as SearchHelpers from '../support/helpers/search-helpers'
import X2JS from  'x2js'

xdescribe('UKMCAB RSS Feed', function() {

  let searchInput = 'british'

  it('works', function() {
    SearchHelpers.azureSearchResults(searchInput, {orderby: 'LastUpdatedDate desc'}).then(results => {
      cy.request({
        method: 'GET',
        url: `/search-feed?Keywords=${searchInput}`,
        headers: {
          'Content-Type': 'text/xml'
        },
        ...basicAuthCreds()
      }).then(resp => {
        const x2js = new X2JS({
          arrayAccessFormPaths: ['feed.entry'] // force entries to be returned as array always
        });
        const feed  = x2js.xml2js(resp.body).feed
        expect(feed.title.toString()).to.eq('UK Market Conformity Assessment Bodies')
        expect(feed.author.name).to.eq('HM Government')
        feed.entry.forEach((entry, index) => {
          expect(entry.id).to.eq(`tag:${new URL(Cypress.config('baseUrl')).host}:${cabProfilePage(results[index])}`)
          expect(entry.title.toString()).to.eq(results[index].name)
          expect(entry.summary.toString()).to.eq(results[index].addressLines.join(', '))
          expect(entry.updated).to.eq(results[index].lastUpdatedDate.toISOString().replace(/.\d+Z$/g, "Z"))
          expect(entry.link._href).to.eq(Cypress.config().baseUrl + cabProfilePage(results[index]) + `?returnUrl=%2Fsearch%3FKeywords%3D${searchInput}`)
        })
      })
    })
  })
})