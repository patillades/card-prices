/* global phantom */

var async = require('async');
var system = require('system');

var parameters = require('./lib/parameters');
var openProductsPage = require('./lib/openProductsPage');
var analysePrices = require('./lib/analysePrices');
var latestCards = require('./lib/latestCards');
var getUserCardsPrices = require('./lib/getUserCardsPrices');

var paramsObj = parameters(system.args);

// analyse the most recent JSON file if the script is called with the argument "--analyse=true"
if (paramsObj.analyse === 'true') {
  var userCards = latestCards();

  analysePrices(userCards);
  
  phantom.exit();
}

/** 
 * Store all the cards the user is selling
 * 
 * @type Card[] 
 */
var userCards = [];
/**
 * Keep count of the user's cards result page being checked
 * 
 * @type Number
 */
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
  getUserCardsPrices.bind(null, userCards)
);
