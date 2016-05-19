/* global phantom */

var webpage = require('webpage');

var runRegex = require('./runRegex');

// the price cell contains the number followed by a space and the euro symbol
var PRICE_PATTERN = /(.*)\s€/;

/**
 * Get the price trend or the minimum foil price depending on whether the card
 * is foil
 * 
 * @param {boolean} isFoil
 * @param {HTMLElement} html - The HTML Element with the page content
 * @returns {string} - The text containing the price
 */
function getPriceText(isFoil, html) {
  var priceEl;
  
  if (isFoil) {
    priceEl = html.querySelector('.availTable .cell_4_1');
  }
  
  // certain promotional cards (like duel decks stuff) can be set as foil but 
  // no foil price is shown since all of them are so; in that case we fall back to the trend
  if (!isFoil || priceEl === null) {
    priceEl = html.querySelector('.availTable .cell_2_1');
  }
  
  if (priceEl === null) {
    console.error('No price element could be found!');
    
    phantom.exit();
  }
  
  return priceEl.innerHTML;
}

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

  var price = runRegex(
    PRICE_PATTERN, 
    getPriceText(card.foil, html)
  );

  // replace commas with dots so the string can be cast to a number
  var dottedPrice = Number(price.replace(',', '.'));

  card.trend = dottedPrice;
  
  page.close();
}

/**
 * Open a card page with a function to get its price
 * 
 * @param {Number} totalCards - The number of cards on the userCards array
 * @param {object} card - The card whose page has to be opened
 * @param {Number} index - The position of the card on the userCards array
 * @param {Function} callback - A function which must be called once the page is read 
 * (as explained on https://github.com/caolan/async#eachcoll-iteratee-callback),
 * with an error (which can be null) parameter
 */
function openCardPage(totalCards, card, index, callback) {
  console.info('Opening card page:', card.name, '(' + (index + 1) + '/' + totalCards + ')\n');
  
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
