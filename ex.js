var MkmParser = function () {};

MkmParser.prototype._host = 'https://es.magiccardmarket.eu/';
MkmParser.prototype._cards = {};
MkmParser.prototype._cardsDone = 0;
MkmParser.prototype._cardLimit;
MkmParser.prototype._start;

MkmParser.prototype.readFirstPage = function () {
    var page = require('webpage').create();
    var self = this;
    
    page.open(this._host + 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=103227', function () {
//    page.open(this._host + 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=1854330', function () {
        // dummy div
        var div = document.createElement('div');
        div.innerHTML = page.content;

        var cardRows = div.querySelectorAll('.MKMTable tbody tr');
//        self._cardLimit = cardRows.length;
        self._cardLimit = 10;
        
        console.log('limit: ' + self._cardLimit);
        
        self._start = new Date().getTime();
        
        for(var i = 0; i < self._cardLimit; i++) {
            var href = cardRows[i].children[2].children[0].href;
            var name = cardRows[i].children[2].children[0].innerHTML;
            var priceText = cardRows[i].children[9].innerHTML;
            
            self._cards[name] = {
                name: name,
                href: href,
                price: priceText,
                avg: null
            };
            
            console.log(i + ' ' + name);
            
            // l'error es produeix en la crida del timeout per als elements repetits
            // ups, per als senars!?
            
            // que estrany, si faig el timeout esgraonat fallen els senars, si els llenço tots alhora després de X segons no falla cap
            
            (function (obj) {
                // AIXO HO LLEGEIX SEMPRE
                console.log(new Date().getTime() - obj.self._start + ': ' + 
                    'pretimeout('+obj.i+'): ' + obj.card.name + '-' + obj.card.href + '-' + obj.card.price);
            
                setTimeout(function () {
                    console.log(new Date().getTime() - obj.self._start + ': ' + 
                        'timeout in: ' + obj.i);
                    
                    obj.self.readCardPage(obj.card, obj.i);

                }, 2000*obj.i);
            })({card: self._cards[name], i: i, self: self});
        }
        
        console.log('---');
        
    });
};

MkmParser.prototype.readCardPage = function (card, i) {
    var page = require('webpage').create();
    var self = this;
    console.log(new Date().getTime() - self._start + ': ' + 
        'launch: ' + i + '-' + card.href);
    
    page.open(this._host + card.href, function () {
        // dummy div
        var div = document.createElement('div');
        div.innerHTML = page.content;
        
        self._cards[card.name].avg = div.querySelector('.availTable .cell_2_1').innerHTML;
        console.log(new Date().getTime() - self._start + ': ' + self._cards[card.name].avg);
//        var avgPrice = avgPrice.substr(0, avgPrice.length - 2);
        
        if(i === (self._cardLimit - 1)) {
            self.printCards();

            phantom.exit();
        }
        
        console.log(new Date().getTime() - self._start + ': ' + 
            'closing: ' + i + '-' + card.href);
        console.log('---');
        
        page.close();
    });
};

MkmParser.prototype.printCards = function () {
    console.log('CARD | MY PRICE | AVG');
    
    for(var i in this._cards) {
        console.log(i + ' ' + this._cards[i].price + ' ' + this._cards[i].avg);
    }
};

var mkm = new MkmParser();
mkm.readFirstPage();

//var txt = fs.read('patilladesList.html');
//
////var parser=new DOMParser();
////var DOM = parser.parseFromString(txt, "text/xml");
////
////console.log(DOM);
//
//var div = document.createElement('div');
//div.innerHTML = txt;
//var cardRows = div.querySelectorAll('.MKMTable tbody tr');
//    console.log(cardRows.length);
//    
//    
//    phantom.exit();