/* global phantom */

var should = require('should');

var openProductsPage = require('./../lib/openProductsPage');

var userCards = [];

/**
 * 
 * @param {WebPage} page - The page instance that has been closed
 */
function testProductsPage(page) {
  try {
    userCards.should.have.length(30, 'mkm paginates on counts of 30 items');
    
    var card = userCards[0];
    
    card.should.be.Object();
    
    card.name.should.be.String();
    card.href.should.be.String();
    card.language.should.be.String();
    card.condition.should.be.String();
    card.foil.should.be.Boolean();
    card.price.should.be.Number();
    
    console.log('assertion passed');
  } catch (e) {
    console.error(e);
  } finally {
    phantom.exit();
  }
}

openProductsPage(userCards, testProductsPage, 0);
