const d3 = require('d3');

// load question source data
const data = require('../data/data.json');
var questions = data.questions;
var entities  = data.entities;

module.exports = function (app, options) {
  const OUTER_RADIUS = 250;
  const ARC_WIDTH    = 20;
  const INNER_RADIUS = OUTER_RADIUS - ARC_WIDTH;
  const MAX_TEXT_WIDTH = 100;
  
  const GRAPH_HALF = OUTER_RADIUS + MAX_TEXT_WIDTH;
  
  const WINDOW_X_CENTER = window.innerWidth / 2;
  const WINDOW_Y_CENTER = window.innerHeight / 2;

  app.svg = d3.select('body').append('svg')
    // .attr('width', GRAPH_HALF * 2)
    .attr('width', window.innerWidth)
    .attr('height', GRAPH_HALF * 2)

  /**
   * The container of the graph.
   * It is centralized in the SVG
   */
  app.container = app.svg
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
  
  /**
   * The year brush that controls the year range filter
   */
  app.ui.yearBrush = require('./year-brush')(app, {
    centerX: WINDOW_X_CENTER,
    centerY: WINDOW_Y_CENTER,
  });
  
  
  // map
  app.ui.map = require('./map')(app, {
    windowXCenter: WINDOW_X_CENTER,
    windowYCenter: WINDOW_Y_CENTER,
  });
  
  // listen to map filter changes
  // app.ui.map.filter.on('change', function (changeData) {
  //   console.log('changed map', app.ui.map.filter.get('states'));
    
  //   var selectedStates = app.ui.map.filter.get('states');
    
  //   var filteredEntities = entities.filter(function (e) {
  //     return selectedStates.indexOf(e.estado) !== -1;
  //   });
    
  //   app.ui.entities.update(filteredEntities);
  // });
  
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
  
  /**
  * Persistent links follow filter
  */
  app.ui.persistentLinks = require('./links')(app, {});
  
  app.ui.questions.filter.on('change', function (changeData) {
    
    var selectedStates = app.services.filter.get('estado');
    
    var entities = app.services.entityDataStore
      .query(app.ui.questions.filter.data)
      .filter(function filterBySelectedStates(entity) {
        return selectedStates.indexOf(entity.estado) !== -1;
      });
    
    var activeOptions = app.ui.questions.getActiveOptions();
    
    var links = app.ui.persistentLinks.computeLinks(entities, activeOptions);
    
    app.ui.persistentLinks.update(links);
  });
  
  
  
  function uiApplyFilters() {

    var filteredEntities = 
      app.services.entityDataStore.applyFilter(app.services.filter.data);
    
    /**
     * Years
     */
    var arcYears = filteredEntities.reduce(function (result, entity) {
      
      if (result.indexOf(entity.ano) === -1) {
        result.push(entity.ano);
      }
      
      return result;
    }, [])
    .map(function (year) {
      return {
        type: 'year',
        year: year,
      };
    });
    
    app.ui.years.update(arcYears);
    app.ui.entities.update(filteredEntities);
  }
  app.services.filter.on('change', uiApplyFilters);
  
  uiApplyFilters();
  
};
