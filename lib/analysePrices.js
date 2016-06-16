/**
 * Check the card's price against its trend to see whether the price is too high or low
 * 
 * @param {Card} card
 * @returns {String|null} 'high', 'low', or null if it's ok
 */
function comparePriceToTrend(card) {
  if (card.price < card.trend) {
    if (card.trend > 0.5 && (card.price * 1.2 < card.trend)) {
      return 'low';
    }
  } else if (card.price > card.trend) {
    if (card.trend > 0.5 && card.price > 1.2 * card.trend) {
      return 'high';
    }
  }
  
  return null;
}

function analysePrices(userCards) {
  // reduce the userCards array to an object where the cards to check are grouped by its price status
  var cardsToCheck = userCards.reduce(
    /**
     * 
     * @param {{low: Card[], high: Card[]}} result
     * @param {Card} card
     * @returns {{low: Card[], high: Card[]}}
     */
    function filterByStatus(result, card) {
      var status = comparePriceToTrend(card);

      if (status !== null) {
        result[status].push(card);
      }

      return result;
    }, {
      low: [],
      high: []
    }
  );

  // print the list of cards to be checked
  Object.keys(cardsToCheck).forEach(function printCardsByStatus(key) {
    console.info('Cards with status', key.toUpperCase(), '\n');

    cardsToCheck[key].forEach(function printCardData(card) {
      console.info('price: ', card.price, ', trend: ', card.trend, ' on ', card.name, 
        ' (', card.language, ', ', card.condition, (card.foil ? ', FOIL' : ''), ')'
      );
    });

    console.info('\n');
  });
}

module.exports = analysePrices;
