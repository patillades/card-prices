var getProductData = require('./getProductData');

function getUserProducts(host, userCards, page) {
  // dummy div
  var html = document.createElement('div');
  html.innerHTML = page.content;

  var productRows = html.querySelectorAll('.MKMTable tbody tr');
  
  var prods = Array.prototype.map.call(
    productRows, 
    getProductData.bind(null, host)
  );
  
  Array.prototype.push.apply(userCards, prods);
  
  page.close();
}

module.exports = getUserProducts;
