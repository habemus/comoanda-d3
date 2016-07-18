const d3 = require('d3');

// load question source data
var questions = require('./data/questions.json');
var entities  = require('./data/entities.json');

window.addEventListener('DOMContentLoaded', function () {
  
  const OUTER_RADIUS = 250;
  const ARC_WIDTH    = 20;
  const INNER_RADIUS = OUTER_RADIUS - ARC_WIDTH;
  const MAX_TEXT_WIDTH = 100;
  
  const GRAPH_HALF = OUTER_RADIUS + MAX_TEXT_WIDTH;
  
  const WINDOW_X_CENTER = window.innerWidth / 2;
  const WINDOW_Y_CENTER = window.innerHeight / 2;
  
  /**
   * The application singleton
   */
  var app = {};
  
  /**
   * The container of the graph.
   * It is centralized in the SVG
   */
  app.container = d3.select('body').append('svg')
    // .attr('width', GRAPH_HALF * 2)
    .attr('width', window.innerWidth)
    .attr('height', GRAPH_HALF * 2)
    // centralize the graph
    .append('g')
      .attr('transform', 'translate(' + WINDOW_X_CENTER + ',' + GRAPH_HALF + ')');
  
  // draw the initial white inner circle
  app.container.append('circle')
    .attr('id', 'inner-circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', INNER_RADIUS)
    .attr('fill', 'white');
  
  app.ui = {};
  app.ui.questions = require('./questions')(app, {
    outerRadius: OUTER_RADIUS,
    arcWidth: ARC_WIDTH,
    innerRadius: INNER_RADIUS,
    maxTextWidth: MAX_TEXT_WIDTH
  });
  app.ui.questions.update(questions);
  
  app.ui.entities = require('./entities')(app, {
    outerRadius: OUTER_RADIUS,
    arcWidth: ARC_WIDTH,
    innerRadius: INNER_RADIUS,
    maxTextWidth: MAX_TEXT_WIDTH
  });
  app.ui.entities.update(entities);
  
  app.ui.years = require('./years')(app, {
    outerRadius: OUTER_RADIUS,
    arcWidth: ARC_WIDTH,
    innerRadius: INNER_RADIUS,
    maxTextWidth: MAX_TEXT_WIDTH
  });
  // generate years data
  var years = d3.range(1930, 2016 + 1);
  // years.sort(d3.descending);
  app.ui.years.update(years.map(function (y) {
    return {
      year: y
    }
  }));
    
  app.ui.links = require('./links')(app, {});
});