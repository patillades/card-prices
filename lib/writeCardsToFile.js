/* global phantom */

var fs = require('fs');

/**
 * JSON encode the provided array and write it on the "/data" folder of the project
 * 
 * @param {Card[]} userCards
 */
function writeCardsToFile(userCards) {
  var file = fs.workingDirectory + '/data/' + Date.now() + '.json';
  
  try {
    fs.write(file, JSON.stringify(userCards), 'w');
  } catch (e) {
    console.error('Error writing data:', e);
    
    phantom.exit();
  }
}

module.exports = writeCardsToFile;
