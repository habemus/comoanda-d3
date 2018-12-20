function _loopObj(obj, fn) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      fn(obj[prop], prop);
    }
  }
}

module.exports = function createTypeformParser(sourceData, displayQuestions) {
  
  if (!sourceData) {
    throw new Error('sourceData is required');
  }

  function getQuestionByFieldId(fieldId) {
    fieldId = (typeof fieldId === 'string') ? parseInt(fieldId, 10) : fieldId;

    return sourceData.questions.find(function (q) {
      return q.field_id === fieldId;
    });
  }

  /**
   * Auxiliary function that retrieves the question's text
   * given the source data and the question field_id
   */
  function getQuestionString(questionFieldId) {
    var question = getQuestionByFieldId(questionFieldId);

    if (!question) {
      console.warn('question not found', questionFieldId);
    }

    return question ? question.question : 'question_not_found_' + questionFieldId;
  }

  /**
   * List of question answer parsers
   * Parsers must be in order of priority!
   * If one parser is executed, the following one's will not.
   *
   * Only one parser should be executed per anser
   * 
   * @type {Array}
   */
  const ANSWER_PARSERS = [
    /**
     * Questions with list options
     */
    // list_19883191_choice_25541330
    // list_19881916_choice
    // list_19881916_other
    {
      name: 'list',
      keyRegExp: /^list_(\d+)_(.+).*$/,
      processFn: function (srcValue, srcKey) {

        var match = srcKey.match(this.keyRegExp);

        if (!match) {
          return false;
        }
        
        var questionString = getQuestionString(match[1]);
        
        var isOther = match[2] === 'other';
        
        if (isOther && srcValue !== '') {
          srcValue = 'Outros';
        }
        
        return {
          type: 'list',
          question: questionString,
          // response: srcValue,
          response: srcValue === '' ? '' : questionString + '--' + srcValue,
        }
      },
    },
    {
      name: 'default',
      keyRegExp: /^\w+_(\d+)$/,
      processFn: function (srcValue, srcKey) {
        var match = srcKey.match(this.keyRegExp);

        if (!match) {
          return false;
        }
        
        return {
          type: 'default',
          question: getQuestionString(match[1]),
          response: srcValue,
        };
      },
    }

  ];
  
  function parseAnswer(srcValue, srcKey) {
    
    var parseRes = false;
    
    ANSWER_PARSERS.some(function (parser) {
      parseRes = parser.processFn(srcValue, srcKey);
      
      return parseRes ? true : false;
    });
    
    return parseRes;
  }
  
  function parse() {
    var parsedAnswers = sourceData.responses.map(function (r) {
      var parsedAnswer = {
        _type: 'entity',
      };

      _loopObj(r.answers, function (srcValue, srcKey) {
        // run through ANSWER_PARSERS until one of them returns truthy
        var parseResult = parseAnswer(srcValue, srcKey);
        
        if (!parseResult) {
          console.warn('could not parse ', srcKey, srcValue);
        } else {
          // set the value onto the parsedAnswer
          // use the correct setter for the type of the response
          
          switch (parseResult.type) {
            case 'list':
              parsedAnswer[parseResult.question] =
                parsedAnswer[parseResult.question] || [];
              
              if (parseResult.response) {
                parsedAnswer[parseResult.question].push(parseResult.response);
              }
              break;
            case 'default':
              parsedAnswer[parseResult.question] = parseResult.response;
              
              // use the 'Qual o nome da organização da qual faz parte?' as _id
              if (parseResult.question === 'Qual o nome da organização da qual faz parte?') {
                parsedAnswer._id = srcValue.replace(/\W+/g, '-').toLowerCase();
              }
              
              // PREVENT 'Quando sua organização surgiu?' from being 0
              // make it use current year
              if (parseResult.question === 'Quando sua organização surgiu?') {
                
                if (parseResult.response === '0') {
                  parsedAnswer[parseResult.question] = 
                    (new Date()).getFullYear();
                }
                
                // make all years INTEGERS
                parsedAnswer[parseResult.question] =
                  parseInt(parsedAnswer[parseResult.question], 10);
              }
              
              // assign default value for 'Estado:'
              if (parseResult.question === 'Estado:') {
                if (parseResult.response === '') {
                  parsedAnswer['Estado:'] = '--';
                }
              }
              
              break;
          }
        }
      });
      
      /**
       * Make sure organizations have a defined year
       * If none is defined, set the year to the current year
       */
      if (!parsedAnswer['Quando sua organização surgiu?']) {
        parsedAnswer['Quando sua organização surgiu?'] =
          (new Date()).getFullYear();
      }
      
      
      // loop through display questions and ensure that
      // questions that have no answers have at least 'Não informado'
      // as an option
      displayQuestions.forEach(function (dq) {
        if (!parsedAnswer[dq.question] ||
            parsedAnswer[dq.question].length === 0) {
          parsedAnswer[dq.question] = [dq.question + '--Não informado'];
        }
      })

      return parsedAnswer;
    });

    return parsedAnswers;
  }

  return {
    parse: parse,
    getQuestionByFieldId: getQuestionByFieldId,
    getQuestionString: getQuestionString,
  };

};
