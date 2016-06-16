/* global phantom */

var DATA_DIR = 'data';

var fs = require('fs');

function latestCards() {
  if (!fs.isDirectory(DATA_DIR)) {
    console.error('Cannot reach the "' + DATA_DIR + '" directory where the JSON files are stored, ' +
      'check that the directory exists and that you are running the script from the project\'s root'
    );
  
    phantom.exit();
  }
  
  var files = fs.list(DATA_DIR).sort();
  
  if (!files.length) {
    console.error('There "' + DATA_DIR + '" directory is empty');
  
    phantom.exit();
  }
  
  var latest = files[files.length - 1];
  
  try {
    var data = fs.read(DATA_DIR + '/' + latest);
  } catch (e) {
    console.error('An error occurred while reading the file:', latest, e);
    
    phantom.exit();
  }
  
  try {
    var cards = JSON.parse(data);
  } catch (e) {
    console.error('An error occurred while parsing the data on the file:', latest, e);
    
    phantom.exit();
  }
  
  return cards;
}

module.exports = latestCards;
