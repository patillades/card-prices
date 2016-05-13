// TODO: those two are the same
var LANG_PATTERN = /showMsgBox\('[^']+/;
var COND_PATTERN = /showMsgBox\('(.+)'/;

function getProductData(host, productRow) {
  var name = productRow.children[2].children[1].children[0].children[0].innerHTML;
  
  var href = host + productRow.children[2].children[1].children[0].children[0].href.replace('file://mkm.js/', '');
  
  var lang = LANG_PATTERN.exec(productRow.children[5].innerHTML)[0];
  lang = lang.substr("showMsgBox('".length, lang.length - "showMsgBox('".length);

  var condition = COND_PATTERN.exec(productRow.children[6].innerHTML)[1];

  var foil = productRow.children[7].innerHTML === '' ? false : true;
  var priceText = productRow.children[13].innerHTML;

  priceText = priceText.substr(0, priceText.length - 2);

  return {
    name: name,
    href: href,
    language: lang,
    condition: condition,
    foil: foil,
    price: priceText,
    trend: null
  };
}

module.exports = getProductData;
