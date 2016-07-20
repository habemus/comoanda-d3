const d3 = require('d3');

// load question source data
var questions = require('./data/questions.json');
var entities  = require('./data/entities.json');

window.addEventListener('DOMContentLoaded', function () {
  
  var app = {};
  var options = {};
  
  /**
   * Initialize services
   */
  require('./services/init')(app, options);
  
  /**
   * Initialize the ui
   */
  require('./ui/init')(app, options);
  
});