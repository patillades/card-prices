var webpage = require('webpage');

var getCardPrice = require('./getCardPrice');

/**
 * Open a card page with a function to get its price
 * 
 * @param {object} card - The card whose page has to be opened
 * @param {Function} callback - A function which must be called once the page is read
 */
function openCardPage(card, callback) {
  console.log('Opening card page:', card.name, '\n');
  
  var page = webpage.create();
  
  page.onClosing = function closeCb() {
    callback(null, card);
  };
  
  page.open(
    card.href,
    getCardPrice.bind(null, card, page)
  );
}

module.exports = openCardPage;
