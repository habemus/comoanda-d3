const d3 = require('d3');

const displayQuestions   = require('./data/display-questions');
const typeformDataParser = require('./lib/typeform-data-parser');
const questionsParser    = require('./lib/questions-parser');

window.addEventListener('DOMContentLoaded', function () {
  
  var app     = {};
  var options = {};
  
  // load data
  d3.json('/src/data/typeform-data.json', function (err, rawData) {
    
    // parse the data
    options.displayQuestions = questionsParser(displayQuestions).parse();
    options.entities = typeformDataParser(rawData, displayQuestions).parse();
    
    console.log('options', options);
    /**
     * Initialize services
     */
    require('./services/init')(app, options);
    
    /**
     * Initialize the ui
     */
    require('./ui/init')(app, options);
  })
  
});