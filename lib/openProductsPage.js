/* global phantom */

var webpage = require('webpage');

var USER_CARDS_URI = 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=1854330&resultsPage=';

/**
 * 
 * @param {string} host
 * @param {Array} userCards
 * @param {Function} openCb - function to be executed once the page is opened,
 * it must close the page once its work is done, so closeCb is called
 * @param {Function} closeCb - function to be executed once the page is closed
 * @param {Number} pageNum
 */
function openProductsPage(host, userCards, openCb, closeCb, pageNum) {
  console.log('Opening page num', pageNum, '\n');
  
  var page = webpage.create();
  
  // TODO: call the next page once this one is read
  page.onClosing = closeCb;
  
  page.open(
    host + USER_CARDS_URI + pageNum, 
    openCb.bind(this, host, userCards, page)
  );
}

module.exports = openProductsPage;
