var openProductsPage = require('./lib/openProductsPage');
var getUserProducts = require('./lib/getUserProducts');

var HOST = 'https://es.magiccardmarket.eu/';

var userCards = [];

// TODO: handle recursive calling of this func
openProductsPage(HOST, userCards, 0, getUserProducts);
