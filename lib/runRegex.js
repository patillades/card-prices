/* global phantom */

/**
 * Match the provided text and regular expression, which must contain one capturing parenthesis
 * 
 * @param {RegExp} regex
 * @param {string} text
 * @returns {string|void} The captured text, or halt the phantom process if no match
 */
function runRegex(regex, text) {
  var result = regex.exec(text);
  
  if (result === null) {
    console.error('No result matching regex', regex, 'against the text', text);
    
    return phantom.exit();
  }
  
  return result[1];
}

module.exports = runRegex;
