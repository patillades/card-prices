var getProductData = require('./getProductData');

/**
 * Get all the user products on a given page, check whether there's a next page
 * with user products, and close it after that
 * 
 * @param {string} host
 * @param {Array} userCards
 * @param {WebPage} page - a WebPage element provided by Phantom
 */
function getUserProducts(host, userCards, page) {
  // dummy div so the content of the page can be treated as the DOM
  var html = document.createElement('div');
  html.innerHTML = page.content;

  var productRows = html.querySelectorAll('.MKMTable tbody tr');
  
  var prods = Array.prototype.map.call(
    productRows, 
    getProductData.bind(null, host)
  );
  
  // add the new products to the userCards array
  Array.prototype.push.apply(userCards, prods);
  
  // add a property so the script knows whether to keep paginating
  page.hasNext = html.querySelectorAll('a[rel="next"]').length !== 0;
  
  page.close();
}

module.exports = getUserProducts;
