const d3 = require('d3');

/**
 * Parses the display questions json object
 * into an object ready for usage by the ui modules
 */
module.exports = function (sourceQuestions) {
  
  function parse() {
    return sourceQuestions.map(function (sourceQuestion) {
      
      var questionObj = {
        _label: sourceQuestion.label,
        _tooltip: sourceQuestion.tooltip,
        _value: sourceQuestion.question,
        _id: sourceQuestion.question,
        _type: 'question',
      };
      
      var options = sourceQuestion.options.map(function (sourceOption) {
        
        if (typeof sourceOption === 'string') {
          // in simple cases, we'll just use strings in the options
          return {
            _question: questionObj,
            _value: sourceOption,
            _id: sourceQuestion.question + '--' + sourceOption,
            _type: 'question-option',
          };
        } else {
          return {
            _question: questionObj,
            _label: sourceOption.label,
            _tooltip: sourceOption.tooltip,
            _value: sourceOption.option,
            _id: sourceQuestion.question + '--' + sourceOption.option,
            _type: 'question-option'
          }
        }
      });
      
      // sort alphabetically
      // and ensure 'Outros is the last one';
      options.sort(function (opt1, opt2) {
        
        var v1 = (typeof opt1 === 'string') ? opt1 : opt1._value;
        var v2 = (typeof opt2 === 'string') ? opt2 : opt2._value;
        
        if (v1 === 'Outros') {
          return 1;
        }
        
        if (v2 === 'Outros') {
          return -1;
        }
        
        if (v1 < v2) {
          return -1;
        } else {
          return 1;
        }
      });
      
      // add the special option 'Not informed'
      options.push({
        _question: questionObj,
        _value: 'Não informado',
        _id: sourceQuestion.question + '--' + 'Não informado',
        _type: 'question-option'
      })
      
      questionObj.options = options;
      
      return questionObj;
    });
  }
  
  return {
    parse: parse,
  };
}