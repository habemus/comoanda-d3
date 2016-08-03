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
        _value: sourceQuestion.question,
        _id: sourceQuestion.question,
        _type: 'question',
      };
      
      var options = sourceQuestion.options.map(function (sourceOption) {
        return {
          _question: questionObj,
          _value: sourceOption,
          _id: sourceQuestion.question + '--' + sourceOption,
          _type: 'question-option',
        }
      });
      
      // sort alphabetically
      // and ensure 'Outros is the last one';
      options.sort(function (opt1, opt2) {
        if (opt1._value < opt2._value) {
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