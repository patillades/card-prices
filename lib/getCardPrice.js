// the price cell contains the number followed by a space and the euro symbol
var PRICE_PATTERN = /(.*)\s€/;

/**
 * Get the price trend of a card page
 * 
 * @param {object} card - The card whose price we are getting
 * @param {WebPage} page - a WebPage element provided by Phantom
 */
function getCardPrice(card, page) {
  // dummy div so the content of the page can be treated as the DOM
  var html = document.createElement('div');
  html.innerHTML = page.content;
  
  var trend = PRICE_PATTERN.exec(
    html.querySelector('.availTable .cell_2_1').innerHTML
  )[1];

  card.trend = trend;
  
  page.close();
}

module.exports = getCardPrice;
