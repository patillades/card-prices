// regex to get the text on the showMsgBox function
var MSG_BOX_PATTERN = /showMsgBox\('(.+)'/;

// the price cell contains the number followed by a space and the euro symbol
var PRICE_PATTERN = /(.*)\s€/;

/**
 * Get the data of the product on the provided row
 * 
 * @param {string} host
 * @param {HTMLTableRowElement} productRow
 * @returns {object}
 */
function getProductData(host, productRow) {
  var name = productRow.children[2].children[1].children[0].children[0].innerHTML;

  var href = host + productRow.children[2].children[1].children[0].children[0].href.replace('file://app.js/', '');
  
  var lang = MSG_BOX_PATTERN.exec(productRow.children[5].innerHTML)[1];

  var condition = MSG_BOX_PATTERN.exec(productRow.children[6].innerHTML)[1];

  // on non-foil cards, this cell is empty
  var foil = productRow.children[7].innerHTML !== '';
  
  var price = PRICE_PATTERN.exec(productRow.children[13].innerHTML)[1];

  return {
    name: name,
    href: href,
    language: lang,
    condition: condition,
    foil: foil,
    price: price
  };
}

module.exports = getProductData;
