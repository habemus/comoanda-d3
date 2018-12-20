const d3 = require('d3');

const displayQuestions = require('./data/display-questions');
const tfParseData = require('./lib/tf-parse-data-v2');
const questionsParser = require('./lib/questions-parser');

window.addEventListener('DOMContentLoaded', function () {
  
  var app     = window.app = {};
  var options = {};
  
  // load data
  d3.json(window.TYPEFORM_DATA_JSON_URL, function (err, TF_DATA) {
    
    // parse the data
    options.displayQuestions = questionsParser(displayQuestions).parse();
    options.entities = tfParseData(TF_DATA);

    // options.entities = require('../scripts/data/internal-data-structure-v2.v0.json')
    
    console.log('options', options);
    /**
     * Initialize services
     */
    require('./services/init')(app, options);
    
    /**
     * Initialize the ui
     */
    require('./ui/init')(app, options);

    setTimeout(function () {
      app.ui.questions.openQuestion('Qual é a área de atuação da sua organização?');
    }, 1000)
    
    /**
     * Initialize intro
     */
    // require('./ui/intro')(app, options);
  })
  
});