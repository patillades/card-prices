/* global phantom */

var async = require('async');

var openCardPage = require('./openCardPage');
var writeCardsToFile = require('./writeCardsToFile');
var analysePrices = require('./analysePrices');

/**
 * Once all the product list pages are read, get the products' price trends,
 * print the analysis and exit the script
 * 
 * @param {Card[]} userCards - array where the user's products are stored
 */
function getUserCardsPrices(userCards) {
  console.info('The user has', userCards.length, 'cards\n');
  
  async.forEachOfSeries(userCards, openCardPage.bind(null, userCards.length), function mapCb(err) {
    if (err) {
      console.error('mapSeries err', err);
      
      return phantom.exit();
    }
    
    console.info('All prices read\n\n');
    
    writeCardsToFile(userCards);
    
    analysePrices(userCards);

    phantom.exit();
  });
}

module.exports = getUserCardsPrices;
