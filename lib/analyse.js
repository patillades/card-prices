/**
 * Check the card's price against its trend to see whether the price is too high or low
 * 
 * @param {Card} card
 * @returns {String|null} 'high', 'low', or null if it's ok
 */
function analyse(card) {
  if (card.price < card.trend) {
    if (card.trend > 1 || (card.price * 2 < card.trend)) {
      return 'low';
    }
  } else if (card.price > card.trend) {
    if (card.trend > 0.5 && card.price > 1.1 * card.trend) {
      return 'high';
    }
  }
  
  return null;
}

module.exports = analyse;
