var MkmParser = function () {};

MkmParser.prototype._host = 'https://es.magiccardmarket.eu/';
MkmParser.prototype._cards = {};
MkmParser.prototype._cardsDone = 0;
MkmParser.prototype._cardLimit;
MkmParser.prototype._start;

MkmParser.prototype.readFirstPage = function () {
    var page = require('webpage').create();
    var self = this;
    
    page.open(self._host + 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=103227', function () {
//    page.open(this._host + 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=1854330', function () {
        // dummy div
        var div = document.createElement('div');
        div.innerHTML = page.content;

        var cardRows = div.querySelectorAll('.MKMTable tbody tr');
        self._cardLimit = cardRows.length;
        
        self._start = new Date().getTime();
        
        for(var i = 0; i < self._cardLimit; i++) {
            var name = cardRows[i].children[2].children[0].innerHTML;
            var href = self._host + cardRows[i].children[2].children[0].href;
            console.log(cardRows[i].children[2].children[0].href);
            console.log(href);
            var langPattern = /showMsgBox\('[^']+/;
            var lang = langPattern.exec(cardRows[i].children[6].innerHTML)[0];
            lang = lang.substr("showMsgBox('".length, lang.length - "showMsgBox('".length);
            
            var condPattern = /cardstateicons\/\w{2}/;
            var condition = condPattern.exec(cardRows[i].children[6].innerHTML)[0];
            condition = condition.substr(condition.length - 2, 2);

            var foil = cardRows[i].children[7].innerHTML === '' ? false : true;
            
            var priceText = cardRows[i].children[9].innerHTML;
            priceText = priceText.substr(0, priceText.length - 2);
            
            self._cards[i] = {
                name: name,
                href: href,
                language: lang,
                condition: condition,
                foil: foil,
                price: priceText,
                avg: null
            };
            
            (function (obj) {
                setTimeout(function () {
                    obj.self.readCardPage(obj.card, obj.i);

                }, 1000*obj.i);
            })({card: self._cards[i], i: i, self: self});
        }
    });
};

MkmParser.prototype.readCardPage = function (card, i) {
    var page = require('webpage').create();
    var self = this;
    console.log(new Date().getTime() - self._start + ': ' + 
        'launch: ' + i + '-' + card.href);
    
    page.open(card.href, function () {
        // dummy div
        var div = document.createElement('div');
        div.innerHTML = page.content;
        
        self._cards[i].avg = div.querySelector('.availTable .cell_2_1').innerHTML;
        self._cards[i].avg = self._cards[i].avg.substr(0, self._cards[i].avg.length - 2);
        
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
        console.log(i + ': ' 
            + this._cards[i].name + ' - ' 
            + this._cards[i].href + ' - ' 
            + this._cards[i].language + ' - ' 
            + this._cards[i].condition + ' - '
            + this._cards[i].foil + ' - '
            + this._cards[i].price + ' - ' 
            + this._cards[i].avg);
    }
};

var mkm = new MkmParser();
mkm.readFirstPage();
