/* global phantom */

var should = require('should');

var openProductsPage = require('./../lib/openProductsPage');
var getUserProducts = require('./../lib/getUserProducts');

var HOST = 'https://es.magiccardmarket.eu/';

var userCards = [];

function testProductsPage() {
  try {
    userCards.should.have.length(30, 'mkm paginates on counts of 30 items');
    
    var card = userCards[0];
    
    card.should.be.Object();
    
    card.name.should.be.String();
    card.href.should.be.String();
    card.language.should.be.String();
    card.condition.should.be.String();
    card.foil.should.be.Boolean();
    card.price.should.be.String();
    
    console.log('assertion passed');
  } catch (e) {
    console.error(e);
  } finally {
    phantom.exit();
  }
}

openProductsPage(HOST, userCards, 0, getUserProducts, testProductsPage);
