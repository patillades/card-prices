/* global phantom */

/**
 * A card object with its relevant information
 * 
 * @typedef {object} Card
 * @property {string} name
 * @property {string} href
 * @property {string} language
 * @property {string} condition
 * @property {boolean} condition
 * @property {Number} price
 */

// regex to get the text on the showMsgBox function
var MSG_BOX_PATTERN = /showMsgBox\('(.+)'/;

// the price cell contains the number followed by a space and the euro symbol
var PRICE_PATTERN = /(.*)\s€/;

/**
 * Match the provided text and regular expression, which must contain one capturing parenthesis
 * 
 * @param {RegExp} regex
 * @param {string} text
 * @returns {string|void} The captured text
 */
function runRegex(regex, text) {
  var result = regex.exec(text);
  
  if (result === null) {
    console.error('No result matching regex', regex, 'against the text', text);
    
    return phantom.exit();
  }
  
  return result[1];
}

/**
 * Get the data of the product on the provided row
 * 
 * @param {string} host
 * @param {HTMLTableRowElement} productRow
 * @returns {Card}
 */
function getProductData(host, productRow) {
  var name = productRow.children[2].children[1].children[0].children[0].innerHTML;

  var href = host + productRow.children[2].children[1].children[0].children[0].href.replace('file://app.js/', '');
  
  var lang = runRegex(MSG_BOX_PATTERN, productRow.children[5].innerHTML);

  var condition = runRegex(MSG_BOX_PATTERN, productRow.children[6].innerHTML);

  // on non-foil cards, this cell is empty
  var foil = productRow.children[7].innerHTML !== '';
  
  var price = runRegex(PRICE_PATTERN, productRow.children[13].innerHTML);
  // replace commas with dots so the string can be cast to a number
  var dottedPrice = Number(price.replace(',', '.'));

  return {
    name: name,
    href: href,
    language: lang,
    condition: condition,
    foil: foil,
    price: dottedPrice
  };
}

module.exports = getProductData;
