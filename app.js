/* global phantom */

var openProductsPage = require('./lib/openProductsPage');
var getUserProducts = require('./lib/getUserProducts');

var HOST = 'https://es.magiccardmarket.eu/';

var userCards = [];

// TODO: handle recursive calling of this func
openProductsPage(HOST, userCards, 0, getUserProducts, function () {
  console.log(userCards[0].name);
  console.log(userCards[0].href);
  console.log(userCards[0].language);
  console.log(userCards[0].condition);
  console.log(userCards[0].foil);
  console.log(userCards[0].price);
  
  phantom.exit();
});
