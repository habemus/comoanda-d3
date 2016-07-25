const d3 = require('d3');

const data   = require('./data/data.json');
var entities = data.entities;

window.addEventListener('DOMContentLoaded', function () {
  
  var app = {};
  var options = {
    entities: entities,
  };
  
  /**
   * Initialize services
   */
  require('./services/init')(app, options);
  
  /**
   * Initialize the ui
   */
  require('./ui/init')(app, options);
  
});