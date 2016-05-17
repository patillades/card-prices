/* global phantom */

var async = require('async');

var openProductsPage = require('./lib/openProductsPage');
var getUserProducts = require('./lib/getUserProducts');
var openCardPage = require('./lib/openCardPage');

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
  // (faster than turning into DOM and querying for the <a> element)
  if (page.content.indexOf('rel="next"') !== -1) {
    pageNum++;
    
    return openProductsByPage(pageNum);
  }
  
  console.log('The user has', userCards.length, 'cards\n');

  async.mapSeries(userCards, openCardPage, function mapCb(err, pricedCards) {
    if (err) {
      console.error('mapSeries err', err);
      
      return phantom.exit();
    }
    
    console.log('All prices read\n');
    
    for (var i=0; i < pricedCards.length; i++) {
      console.log(pricedCards[i].name);
      console.log(pricedCards[i].href);
      console.log(pricedCards[i].language);
      console.log(pricedCards[i].condition);
      console.log(pricedCards[i].foil);
      console.log(pricedCards[i].price);
      console.log(pricedCards[i].trend);
      console.log('---');
    }

    phantom.exit();
  });
}

var openProductsByPage = openProductsPage.bind(null, HOST, userCards, getUserProducts, productsPageCloseCallback);

openProductsByPage(pageNum);
