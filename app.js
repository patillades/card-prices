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
  // check for a "next page" link to know whether to keep paginating
  if (page.content.indexOf('rel="next"') !== -1) {
    pageNum++;
    
    openProductsByPage(pageNum);
  } else {
    console.log('cards length', userCards.length, '\n');
    
//    for (var i=0; i < userCards.length; i++) {
//      console.log(userCards[i].name);
//      console.log(userCards[i].href);
//      console.log(userCards[i].language);
//      console.log(userCards[i].condition);
//      console.log(userCards[i].foil);
//      console.log(userCards[i].price);
//      console.log('---');
//    }
    
    phantom.exit();
  }
}

var openProductsByPage = openProductsPage.bind(null, HOST, userCards, getUserProducts, productsPageCloseCallback);

openProductsByPage(pageNum);
