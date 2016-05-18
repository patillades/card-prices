/* global phantom */

var webpage = require('webpage');

var getProductData = require('./getProductData');

var HOST = 'https://es.magiccardmarket.eu/';
var USER_CARDS_URI = 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=667386&resultsPage=';

/**
 * Get all the user products on a given page and close it after that
 * 
 * @param {Card[]} userCards
 * @param {WebPage} page - a WebPage element provided by Phantom
 * @param {string} status - provided by phantom, 'success' or 'fail'
 */
function getUserProducts(userCards, page, status) {
  if (status === 'fail') {
    console.error('Failure opening page!');
    
    return phantom.exit();
  }
  
  // dummy div so the content of the page can be treated as the DOM
  var html = document.createElement('div');
  html.innerHTML = page.content;

  var productRows = html.querySelectorAll('.MKMTable tbody tr');
  
  var prods = Array.prototype.map.call(
    productRows, 
    getProductData.bind(null, HOST)
  );
  
  // add the new products to the userCards array
  Array.prototype.push.apply(userCards, prods);
  
  page.close();
}

/**
 * Open a page containing a list of products, and handle its result on the opening callback
 * 
 * @param {Card[]} userCards - array where the user's products will be stored
 * @param {Function} closeCb - function to be executed once the page is closed
 * @param {Number} pageNum - number of the page to be opened
 */
function openProductsPage(userCards, closeCb, pageNum) {
  console.log('Opening page num:', pageNum, '\n');
  
  var page = webpage.create();
  
  page.onClosing = closeCb;
  
  page.open(
    HOST + USER_CARDS_URI + pageNum, 
    getUserProducts.bind(null, userCards, page)
  );
}

module.exports = openProductsPage;
