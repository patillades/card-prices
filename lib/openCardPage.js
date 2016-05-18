/* global phantom */

var webpage = require('webpage');

var runRegex = require('./runRegex');

// the price cell contains the number followed by a space and the euro symbol
var PRICE_PATTERN = /(.*)\s€/;

/**
 * Get the price trend of a card page
 * 
 * @param {Card} card - The card whose price we are getting
 * @param {WebPage} page - a WebPage element provided by Phantom
 * @param {string} status - provided by phantom, 'success' or 'fail'
 */
function getCardPrice(card, page, status) {
  if (status === 'fail') {
    console.error('Failure opening page!');
    
    return phantom.exit();
  }
  
  // dummy div so the content of the page can be treated as the DOM
  var html = document.createElement('div');
  html.innerHTML = page.content;
  
  var trend = runRegex(
    PRICE_PATTERN, 
    html.querySelector('.availTable .cell_2_1').innerHTML
  );

  // replace commas with dots so the string can be cast to a number
  var dottedTrend = Number(trend.replace(',', '.'));

  card.trend = dottedTrend;
  
  page.close();
}

/**
 * Open a card page with a function to get its price
 * 
 * @param {object} card - The card whose page has to be opened
 * @param {Function} callback - A function which must be called once the page is read 
 * (as explained on https://github.com/caolan/async#eachcoll-iteratee-callback),
 * with an error (which can be null) parameter
 */
function openCardPage(card, callback) {
  console.log('Opening card page:', card.name, '\n');
  
  var page = webpage.create();
  
  page.onClosing = function close() {
    callback(null);
  };
  
  page.open(
    card.href,
    getCardPrice.bind(null, card, page)
  );
}

module.exports = openCardPage;
