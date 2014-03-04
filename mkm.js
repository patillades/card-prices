var MkmParser = function () {};

MkmParser.prototype._host = 'https://es.magiccardmarket.eu/';
MkmParser.prototype._userCardListURI = 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=1854330&resultsPage=';
MkmParser.prototype._cards = {};
MkmParser.prototype._cardLimit;
MkmParser.prototype._start;
MkmParser.prototype._pageNum;
MkmParser.prototype._lastPage;
MkmParser.prototype._cardsOnPage = 0;
MkmParser.prototype._jsonFile = 'list_'+ Date.now() +'.json';

MkmParser.prototype.getLastPage = function (content) {
    console.log('***');
    console.log('getting last page');
    console.log('***');
    
    var div = document.createElement('div');
    
    div.innerHTML = content;
    
    var img = div.querySelectorAll('[alt="lastResultsPage"]')[0],
        href = img.parentNode.href,
        aux = /resultsPage=(\d+)/.exec(href);

    if (aux === null) {
        console.log('Impossible to find last page');
    }
    else {
        this._lastPage = aux[1];
        
        console.log('Last page is: ' + this._lastPage);
    }
};

MkmParser.prototype.readPageNum = function (pageNum) {
    console.log('***');
    console.log('MkmParser.prototype.readPageNum called for page: ' + pageNum);
    console.log('***');
    
    this._pageNum = pageNum;
    
    var page = require('webpage').create(),
        self = this;
    
    // resultsPage compta des de 0
    page.open(this._host + this._userCardListURI + pageNum, function () {
        console.log('***');
        console.log('Reading page: ' + pageNum);
        console.log('***');
        
        // dummy div
        var div = document.createElement('div');
        div.innerHTML = page.content;
        
        if (pageNum === 0) {
            self.getLastPage(div.innerHTML);
        }

        var cardRows = div.querySelectorAll('.MKMTable tbody tr');
        self._cardLimit = cardRows.length;
        
        console.log('***');
        console.log('Cards found: ' + self._cardLimit);
        console.log('***');
        
        self._start = new Date().getTime();
        
        for(var i = 0; i < self._cardLimit; i++) {
            var name = cardRows[i].children[2].children[1].children[0].children[0].innerHTML,
                href = self._host + cardRows[i].children[2].children[1].children[0].children[0].href.replace('file://mkm.js/', ''),

                langPattern = /showMsgBox\('[^']+/,
                lang = langPattern.exec(cardRows[i].children[5].innerHTML)[0];
                
            lang = lang.substr("showMsgBox('".length, lang.length - "showMsgBox('".length);
            
            var condPattern = /cardstateicons\/\w{2}/,
                condition = condPattern.exec(cardRows[i].children[6].innerHTML)[0];
                
            condition = condition.substr(condition.length - 2, 2);

            var foil = cardRows[i].children[7].innerHTML === '' ? false : true,
            
                priceText = cardRows[i].children[13].innerHTML;
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
                }, 2000*obj.i);
            })({
              card: self._cards[i], 
              i: i, 
              self: self
            });
        }
    });
};

MkmParser.prototype.readCardPage = function (card, i) {
    console.log('***');
    console.log('MkmParser.prototype.readCardPage called for card: ' + card.name);
    console.log('***');
  
    var page = require('webpage').create(),
        self = this;

    console.log(new Date().getTime() - self._start + ': ' + 
        'launch: ' + i + '-' + card.href);
    
    page.open(card.href, function () {
        // dummy div
        var div = document.createElement('div');
        div.innerHTML = page.content;
        
        self._cards[i].avg = div.querySelector('.availTable .cell_2_1').innerHTML;
        self._cards[i].avg = self._cards[i].avg.substr(0, self._cards[i].avg.length - 2);
        console.log('got avg price for ' + card.name);
        
        if (i === (self._cardLimit - 1)) {
            self.printCards();
            self.addCardsToFile();

            if(self._pageNum < self._lastPage) {
                self._pageNum++;
                console.log('***');
                console.log('ON TO PAGE ' + self._pageNum + '!');
                console.log('***');
                
                self.readPageNum(self._pageNum);
            }
            else{
                console.log('***');
                console.log('DONE!');
                console.log('***');
                
                self.analyseData();
            }
        }
        
        console.log(new Date().getTime() - self._start + ': ' + 
            'closing: ' + i + '-' + card.href);
        console.log('---');
        
        page.close();
    });
};

MkmParser.prototype.printCards = function () {
    var j = 0;
    
    console.log('# | CARD | HREF | LANG | CONDITION | FOIL | MY PRICE | AVG');
    
    for(var i in this._cards) {
        console.log(i + ': ' +
            this._cards[i].name + ' - ' +
            this._cards[i].href + ' - ' +
            this._cards[i].language + ' - '  +
            this._cards[i].condition + ' - ' +
            this._cards[i].foil + ' - ' +
            this._cards[i].price + ' - ' +
            this._cards[i].avg);
    
        j++;
    }
    
    this._cardsOnPage = j;
};

MkmParser.prototype.addCardsToFile = function () {
    console.log('---');
    console.log('add cards');
    console.log('---');
    
    var fs = require('fs'),
        data = [];

    if(this._pageNum === 0) {
        data.push('[');
    }
    
    for(var i in this._cards) {
        data.push(JSON.stringify(this._cards[i]), ',');
    }
    
    if(this._pageNum === this._lastPage) {
        // replace last comma with an array closure
        data[data.length - 1] = ']';
    }
    
    fs.write(this._jsonFile, data.join(''), 'a');
};

MkmParser.prototype.analyseData = function () {
    var fs = require('fs'),
    
        data = fs.read(this._jsonFile);
    
    data = JSON.parse(data);
    
    console.log('***');
    console.log('There are ' + data.length + ' cards');
    console.log('***');
    
    var price,
        avg;
    
    for (var i = 0, length = data.length; i < length; i++) {
        if (data[i].price === null || data[i].avg === null) {
            console.log('null on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ') :O');
        }
        else {
            price = Number(data[i].price.replace(',', '.'));
            avg = Number(data[i].avg.replace(',', '.'));

            // cheap
            if (price < avg 
                && (avg > 1 || ((price * 2) < avg))
            ) {
                console.log('price: ' + price + ', avg: ' + avg + ' on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ')  :/');
            }
            // expensive
            else if (price > (1.1 * avg)) {
                console.log('CAR! price: ' + price + ', avg: ' + avg + ' on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ')');
            }
        }
    }
    
    phantom.exit();
};

console.log('***');
console.log('starting parser');
console.log('***');

var mkm = new MkmParser();
mkm.readPageNum(0);
