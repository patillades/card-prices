/* global phantom */

var openProductsPage = require('./lib/openProductsPage');
var getUserProducts = require('./lib/getUserProducts');

var HOST = 'https://es.magiccardmarket.eu/';

var userCards = [];
var pageNum = 0;

/**
 * Keep getting the user's products while there are more pages
 * 
 * @param {WebPage} page - The page instance that has been closed
 */
function productsPageCloseCallback(page) {
  if (page.hasNext) {
    pageNum++;
    
    openProductsPage(HOST, userCards, pageNum, getUserProducts, productsPageCloseCallback);
  } else {
    console.log('cards length', userCards.length, '\n');
    
    for (var i=0; i < userCards.length; i++) {
      console.log(userCards[i].name);
      console.log(userCards[i].href);
      console.log(userCards[i].language);
      console.log(userCards[i].condition);
      console.log(userCards[i].foil);
      console.log(userCards[i].price);
      console.log('---');
    }
    
    phantom.exit();
  }
}

openProductsPage(HOST, userCards, pageNum, getUserProducts, productsPageCloseCallback);
