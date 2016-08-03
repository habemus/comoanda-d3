const sourceData = require('../src/data/typeform-data.json');

const parser = require('../src/lib/typeform-data-parser');

var p = parser(sourceData);

function loopObj(obj, fn) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      fn(obj[prop], prop);
    }
  }
}

function logAnswers() {
  // output answers
  console.log(JSON.stringify(p.parse(), null, '\t'));
}

function logQuestions() {
  // output questions
  var answers = p.parse();
  var questions = require('./filter-questions-template.json');
  
  function findQuestionByString(str) {
    return questions.find(function (q) {
      return q.question === str;
    });
  }
  
  
  
  answers.forEach(function (answer) {
    
    
    loopObj(answer, function (value, questionString) {
      
      var question = findQuestionByString(questionString);
      
      if (!question) {
        // skip the question, it is not meant for filtering
        return;
      }
      
      // force value into array format
      value = Array.isArray(value) ? value : [value];
      
      question.options = question.options || [];
      
      value.forEach(function (v) {
        if (question.options.indexOf(v) === -1) {
          question.options.push(v);
        }
      });
      
    });
    
  });
  
  console.log(JSON.stringify(questions, null, '\t'));
}

logQuestions();
