var PARAM_REGEX = /^--(\w+)=(\w+)/;

/**
 * Check if a command line argument matches the expected parameter's regex
 * 
 * @param {String} argument
 * @returns {Boolean}
 */
function isParameter(argument) {
  return PARAM_REGEX.test(argument);
}

/**
 * Decompose a --key=value command line argument into a {key: x, value: y} object
 * 
 * @param {type} param
 * @returns {{key: String, value: String}}
 */
function paramToObj(param) {
  var result = PARAM_REGEX.exec(param);

  return {
    key: result[1],
    value: result[2]
  };
}

/**
 * Get the list of the command line arguments, and return an object containing any of them matching 
 * the --key=value format as key-value pair
 * 
 * @param {String[]} args
 * @returns {Object}
 */
function parameters(args) {
  var params = args.filter(isParameter);

  return params.reduce(function paramsToObj(paramsObj, param) {
    var obj = paramToObj(param);
    
    paramsObj[obj.key] = obj.value;
    
    return paramsObj;
  }, {});
}

module.exports = parameters;
