const d3 = require('d3');

// load question source data
var questions = require('./data/questions.json');

window.addEventListener('DOMContentLoaded', function () {
  
  var options = {};
  
  /**
   * Defines the full radius of the circle, with the arc width accounted
   */
  options.outerRadius  = 250;
  /**
   * Width of the arc
   */
  options.arcWidth     = 20;
  /**
   * Radius of the inner circle
   */
  options.innerRadius  = options.outerRadius - options.arcWidth;
  /**
   * Max length in pixels of the text labels
   */
  options.maxTextWidth = 100;
  
  var _graphHalf = options.outerRadius + options.maxTextWidth;
  
  /**
   * The container of the graph.
   * It is centralized in the SVG
   */
  var container = d3.select('body').append('svg')
    .attr('width', _graphHalf * 2)
    .attr('height', _graphHalf * 2)
    // centralize the graph
    .append('g')
      .attr('transform', 'translate(' + _graphHalf + ',' + _graphHalf + ')');
  
  var updateQuestions = require('./questions')(container, options);
  updateQuestions(questions);
});