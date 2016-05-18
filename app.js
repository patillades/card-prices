/* global phantom */

var async = require('async');

var openProductsPage = require('./lib/openProductsPage');
var openCardPage = require('./lib/openCardPage');

/** @type Card[] */
var userCards = [];
var pageNum = 0;

// Keep getting the user's products while there are more pages
async.doWhilst(
  /**
   * Get the products from a user's page
   * 
   * @param {Function} callback - A function which must be called once openProductsPage has completed
   */
  function getProducts(callback) {
    openProductsPage(userCards, callback, pageNum);
  },
  /**
   * Check for a "next page" link to know whether to keep paginating 
   * 
   * @param {WebPage} page - The page instance that has been closed
   * @returns {Boolean}
   */
  function hasNext(page) {
    // indexOf is faster than turning into DOM and querying for the <a> element
    if (page.content.indexOf('rel="next"') !== -1) {
      pageNum++;

      return true;
    }

    return false;
  },
  allProductsGotten
);

/**
 * Once all the product list pages are read, get the products' price trends
 */
function allProductsGotten() {
  console.info('The user has', userCards.length, 'cards\n');
  
  async.eachSeries(userCards, openCardPage, function mapCb(err) {
    if (err) {
      console.error('mapSeries err', err);
      
      return phantom.exit();
    }
    
    console.info('All prices read\n');
    
    for (var i=0; i < userCards.length; i++) {
      console.log(userCards[i].name);
      console.log(userCards[i].href);
      console.log(userCards[i].language);
      console.log(userCards[i].condition);
      console.log(userCards[i].foil);
      console.log(userCards[i].price);
      console.log(userCards[i].trend);
      console.log('---');
    }

    phantom.exit();
  });
}
