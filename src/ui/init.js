const d3 = require('d3');

module.exports = function (app, options) {
  const OUTER_RADIUS = 250;
  const ARC_WIDTH    = 20;
  const INNER_RADIUS = OUTER_RADIUS - ARC_WIDTH;
  const MAX_TEXT_WIDTH = 100;
  
  
  const MIN_HEIGHT = 600;
  const MIN_WIDTH  = 1100;
  
  var HEIGHT = window.innerHeight > MIN_HEIGHT ? window.innerHeight : MIN_HEIGHT;
  var WIDTH = window.innerWidth > MIN_WIDTH ? window.innerWidth : MIN_WIDTH;
  
  const GRAPH_HALF = HEIGHT / 2;
  
  const WINDOW_Y_CENTER = HEIGHT / 2;
  const WINDOW_X_CENTER = WIDTH / 2;
  
  app.svg = d3.select('body').append('svg')
    .attr('id', 'comoanda-viz')
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

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
   * Entity details dialog
   */
  app.ui.entityDetails = require('./entity-details')(app, {
    entities: options.entities,
  });
  
  /**
  * Stats
  */
  app.ui.stats = require('./stats')(app, {
    entities: options.entities,
  });
  // app.ui.stats.update([]);
  
  /**
   * The year brush that controls the year range filter
   */
  app.ui.yearBrush = require('./year-brush')(app, {
    centerX: WINDOW_X_CENTER,
    centerY: WINDOW_Y_CENTER,
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    entities: options.entities,
  });
  
  
  // map
  app.ui.map = require('./map')(app, {
    centerX: WINDOW_X_CENTER,
    centerY: WINDOW_Y_CENTER,
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    // entities: options.entities,
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
  app.ui.questions.update(options.displayQuestions);
  
  app.ui.entities = require('./entities')(app, {
    outerRadius: OUTER_RADIUS,
    arcWidth: ARC_WIDTH,
    innerRadius: INNER_RADIUS,
    maxTextWidth: MAX_TEXT_WIDTH
  });
  app.ui.entities.update(options.entities);
  
  app.ui.years = require('./years')(app, {
    outerRadius: OUTER_RADIUS,
    arcWidth: ARC_WIDTH,
    innerRadius: INNER_RADIUS,
    maxTextWidth: MAX_TEXT_WIDTH
  });
  
  /**
  * Persistent links follow filter
  */
  app.ui.persistentLinks = require('./links')(app, {});
  
  
  app.ACTIVE_LINK_FILTER = null;
  
  //////////
  // QUESTION LINK filter
  function uiApplyQuestionLinkFilter() {
    
    var overallFilter = app.services.filter.data;
    var linkFilter    = app.services.questionLinkFilter.data;
    
    var filter = Object.assign({}, overallFilter, linkFilter);
    
    var entities = app.services.entityDataStore
      .applyFilter(filter);
    
    // links betweeb entities and activeOptions
    var activeOptions = app.ui.questions.getActiveOptions();
    
    var links = app.ui.persistentLinks.computeLinks(entities, activeOptions);
    
    app.ui.stats.update(entities);
    app.ui.persistentLinks.update(links);
  }
  app.services.questionLinkFilter.on('change', function () {
    app.ACTIVE_LINK_FILTER = 'link';
    
    // clear the other filter SILENTLY
    app.services.entityLinkFilter.data = {};
    
    uiApplyQuestionLinkFilter();
  });
  // QUESTION LINK filter
  //////////
  
  ///////////
  // ENTITY LINK filter
  function uiApplyEntityLinkFilter() {
    var overallFilter = app.services.filter.data;
    var linkFilter    = app.services.entityLinkFilter.data;
    
    var filter = Object.assign({}, overallFilter, linkFilter);
    
    var entities = app.services.entityDataStore
      .applyFilter(filter);
    
    // links between entities and open options
    var openQuestions = app.ui.questions.getOpenQuestions();
    
    var openOptions = openQuestions.reduce(function (result, question) {
      
      question.options.forEach(function (opt) {
        result.push(Object.assign({ question: question }, opt));
      });
      
      return result;
      
    }, []);
    var links = app.ui.persistentLinks.computeLinks(entities, openOptions);
    
    app.ui.stats.update(entities);
    app.ui.persistentLinks.update(links);
  }
  app.services.entityLinkFilter.on('change', function () {
    app.ACTIVE_LINK_FILTER = 'entity';
    
    // clear the other filter SILENTLY
    app.services.questionLinkFilter.data = {};
    
    uiApplyEntityLinkFilter();
  });
  // ENTITY LINK filter
  ///////////
  
  ///////
  // OVERALL filter
  function uiOverallApplyFilters() {

    var filteredEntities = 
      app.services.entityDataStore.applyFilter(app.services.filter.data);
    
    /**
     * Years
     */
    var filteredYears = filteredEntities.reduce(function (result, entity) {
      
      var year = parseInt(entity['Quando sua organização surgiu?'], 10);
      
      if (result.indexOf(year) === -1) {
        result.push(year);
      }
      
      return result;
    }, [])
    .map(function (year) {
      return {
        type: 'year',
        year: year,
      };
    });
    
    app.ui.years.update(filteredYears);
    app.ui.entities.update(filteredEntities);
    
    app.ui.persistentLinks.updateLinkPositions();
    
    // apply link filter if any
    if (app.ACTIVE_LINK_FILTER) {
      switch (app.ACTIVE_LINK_FILTER) {
        case 'link':
          uiApplyQuestionLinkFilter();
          break;
        case 'entity':
          uiApplyEntityLinkFilter();
          break;
      }
    }
    
  }
  app.services.filter.on('change', uiOverallApplyFilters);
  // OVERALL filter
  ///////
  
  uiOverallApplyFilters();
  
};
