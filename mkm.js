/**
 * @TODO: store the results on a mongo db instance and show results with an 
 * html table, handlebars and bootstrap could be useful for that
 */
var MkmParser = function () {};

MkmParser.prototype._host = 'https://es.magiccardmarket.eu/';
MkmParser.prototype._userCardListURI = 'index.php?mainPage=browseUserProducts&idCategory=1&idUser=1854330&resultsPage=';
MkmParser.prototype._cards;
MkmParser.prototype._cardLimit;
MkmParser.prototype._start;
MkmParser.prototype._pageNum;
MkmParser.prototype._lastPage;
MkmParser.prototype._jsonFile = 'list_'+ Date.now() +'.json';

MkmParser.prototype.getLastPage = function (div) {
    console.log('***');
    console.log('getting last page');
    console.log('***');
    
    var img = div.querySelector('[src="./img/pagination_lastPage.png"]'),
        href = img.parentNode.href,
        aux = /resultsPage=(\d+)/.exec(href);

    if (img === null || aux === null) {
        console.log('Impossible to find last page');
    }
    else {
        this._lastPage = parseInt(aux[1]);
        
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
            self.getLastPage(div);
        }

        var cardRows = div.querySelectorAll('.MKMTable tbody tr');
        // count the number of cards on this page
        self._cardLimit = cardRows.length;
        
        console.log('***');
        console.log('Cards found: ' + self._cardLimit);
        console.log('***');
        
        self._start = new Date().getTime();
        
        // reset the cards array, since it still contains the cards from the previous read page
        self._cards = [];
        
        for(var i = 0; i < self._cardLimit; i++) {
            var name = cardRows[i].children[2].children[1].children[0].children[0].innerHTML,
                href = self._host + cardRows[i].children[2].children[1].children[0].children[0].href.replace('file://mkm.js/', ''),
                langPattern = /showMsgBox\('[^']+/,
                lang = langPattern.exec(cardRows[i].children[5].innerHTML)[0];
                
            lang = lang.substr("showMsgBox('".length, lang.length - "showMsgBox('".length);

            var condPattern = /showMsgBox\('(.+)'/;
            var condition = condPattern.exec(cardRows[i].children[6].innerHTML)[1];
            
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
                trend: null
            };
            
            // read the card pages with 2 seconds in between them, called with a
            // closure to prevent the data from being lost due to the advance of 
            // the loop
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
        
        self._cards[i].trend = self.getPriceWithoutEur(
            div.querySelector('.availTable .cell_2_1').innerHTML
        );
        
        console.log('got price trend for ' + card.name);
        
        self._cards[i].avg = self.getAverageWithoutFoils(div);
        
        // if this is the last card on the page, print and save results
        if (i === (self._cardLimit - 1)) {
            self.printCards();
            self.addCardsToFile();

            console.log('***');
            
            if(self._pageNum < self._lastPage) {
                self._pageNum++;
                
                console.log('ON TO PAGE ' + self._pageNum + '!');
                console.log('***');
                
                self.readPageNum(self._pageNum);
            }
            else{
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

/**
 * remove the € symbol
 * 
 * @param {string} html
 * @returns {string}
 */
MkmParser.prototype.getPriceWithoutEur = function(html) {
    // check if there's PPU (price per unit), used on playsets
    var ppu = html.match(/PPU: (\d+,\d{2})/);
    
    if (ppu !== null) {
        html = ppu[1];
    }
    
    return html.substr(0, html.length - 2);
};

/**
 * 
 * @param {string} num
 * @returns {number}
 */
MkmParser.prototype.changeCommaForDot = function(num) {
    return Number(num.replace(',', '.'));
};

/**
 * 
 * @param {Node} row
 * @returns {Number}
 */
MkmParser.prototype.getSellerAmount = function(row) {
    var isPlayset = row.children[5].innerHTML !== '',
        amount = parseInt(row.children[10].innerHTML);
    
    return isPlayset ? 4*amount : amount;
};

MkmParser.prototype.getAverageWithoutFoils = function(div) {
    var table = div.querySelector('form[name^=itemView] tbody');
    
    // remove the foil rows
    var foilRows = table.querySelectorAll('[alt="foil"]');
    
    for (var i = 0, len = foilRows.length; i < len; i++) {
        var row = foilRows[i].parentNode.parentNode.parentNode;
        
        row.parentNode.removeChild(row);
    }
    
    var rows = table.querySelectorAll('tr'),
        total = 0,
        amount = 0;
    
    for (var i = 0, len = rows.length; i < len; i++) {
        var sellerAmount = this.getSellerAmount(rows[i]);
        
        total += sellerAmount * this.changeCommaForDot(
            this.getPriceWithoutEur(rows[i].children[9].innerHTML)
        );

        amount += sellerAmount;
    }
    
    return total / amount;
};

MkmParser.prototype.printCards = function () {
    console.log('# | CARD | HREF | LANG | CONDITION | FOIL | MY PRICE | PRICE TREND | AVG W/O FOILS');
    
    for(var i in this._cards) {
        console.log(i + ': ' +
            this._cards[i].name + ' - ' +
            this._cards[i].href + ' - ' +
            this._cards[i].language + ' - '  +
            this._cards[i].condition + ' - ' +
            this._cards[i].foil + ' - ' +
            this._cards[i].price + ' - ' +
            this._cards[i].trend + ' - ' +
            this._cards[i].avg
            );
    }
};

MkmParser.prototype.addCardsToFile = function () {
    console.log('---');
    console.log('add cards to file; page ' + this._pageNum + ' of ' + this._lastPage);
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
        // replace last comma to close the json array
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
        trend;
    
    for (var i = 0, length = data.length; i < length; i++) {
        if (data[i].price === null || data[i].trend === null) {
            console.log('null on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ') :O');
        }
        else {
            price = this.changeCommaForDot(data[i].price);
            trend = this.changeCommaForDot(data[i].trend);

            // cheap
            if (price < trend 
                && (trend > 1 || ((price * 2) < trend))
            ) {
                console.log('price: ' + price + ', trend: ' + trend + ' on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ')  :/');
            }
        }
    }
    
    console.log('***');
    console.log('***');
    
    for (var i = 0, length = data.length; i < length; i++) {
        if (data[i].price === null || data[i].trend === null) {
            console.log('null on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ') :O');
        }
        else {
            price = this.changeCommaForDot(data[i].price);
            trend = this.changeCommaForDot(data[i].trend);

            // expensive
            if (trend > 0.5 && price > (1.1 * trend)) {
                console.log('CAR! price: ' + price + ', trend: ' + trend + ' on ' + data[i].name + ' (' + data[i].language + ', ' + data[i].condition + ')');
            }
        }
    }
    
    phantom.exit();
};

var arguments = require('system').args,
    mkm = new MkmParser();

if (arguments.length === 1) {
    console.log('***');
    console.log('starting parser');
    console.log('***');

    mkm.readPageNum(0);
}
else if (arguments.length === 2 
    && arguments[1] === '--analyse'
) {
    // troba l'arxiu json més recent
    var fs = require('fs'),
        list = fs.list(fs.workingDirectory),
        jsonFiles = [];

    // filter the file list with only the json lists
    for (var i = 0; i < list.length; i++) {
        if (list[i].match(/^list_\d+\.json$/) !== null) {
            jsonFiles.push(list[i]);
        }
    }

    // sort array to make sure you pop the most recent filename out of it
    jsonFiles.sort();
    
    mkm._jsonFile = jsonFiles.pop();
    
    mkm.analyseData();
}
else if (arguments.length === 3 
    && arguments[1] === '--single'
    && arguments[2].match(/^--uri=.+$/) !== null
) {
    var cardUri = arguments[2].replace('--uri=', '');
            
    console.log('URI: ' + cardUri);

    mkm._start = new Date().getTime();
    mkm._cards = [{
        href: cardUri
    }];
    mkm._cardLimit = 1;
    mkm._pageNum = 1;
    mkm._lastPage = 1;
    
    mkm.readCardPage(mkm._cards[0], 0);
}
else {
    console.log('What!?');
    
    phantom.exit();
}
