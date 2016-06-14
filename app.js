/* global phantom */

var async = require('async');

var openProductsPage = require('./lib/openProductsPage');
var openCardPage = require('./lib/openCardPage');
var writeCardsToFile = require('./lib/writeCardsToFile');
var analyse = require('./lib/analyse');

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
  allProductsGotten
);

/**
 * Once all the product list pages are read, get the products' price trends
 */
function allProductsGotten() {
  console.info('The user has', userCards.length, 'cards\n');
  
  async.forEachOfSeries(userCards, openCardPage.bind(null, userCards.length), function mapCb(err) {
    if (err) {
      console.error('mapSeries err', err);
      
      return phantom.exit();
    }
    
    console.info('All prices read\n\n');
    
    writeCardsToFile(userCards);
    
    // reduce the userCards array to an object where the cards to check are grouped by its price status
    var cardsToCheck = userCards.reduce(
      /**
       * 
       * @param {{low: Card[], high: Card[]}} result
       * @param {Card} card
       * @returns {{low: Card[], high: Card[]}}
       */
      function filterByStatus(result, card) {
        var status = analyse(card);

        if (status !== null) {
          result[status].push(card);
        }

        return result;
      }, {
        low: [],
        high: []
      }
    );
    
    // print the list of cards to be checked
    Object.keys(cardsToCheck).forEach(function printCardsByStatus(key) {
      console.info('Cards with status', key.toUpperCase(), '\n');
      
      cardsToCheck[key].forEach(function printCardData(card) {
        console.info('price: ', card.price, ', trend: ', card.trend, ' on ', card.name, 
          ' (', card.language, ', ', card.condition, (card.foil ? ', FOIL' : ''), ')'
        );
      });
      
      console.info('\n');
    });

    phantom.exit();
  });
}
