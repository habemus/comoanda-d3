const d3 = require('d3');
const slug = require('slug');

const computeEntitiesLayout = require('./layout');

module.exports = function (app, options) {
  
  // SETUP
  
  // global variables
  var twoPI = (2 * Math.PI);
  var entitiesArcStartAngle = twoPI * 5/9;
  var entitiesArcEndAngle   = twoPI;
  
  /**
   * Generators
   */
  var drawEntityArc = d3.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius);
  
  /**
   * Draw the full entities arc
   */
  app.container.append('path')
    .attr('id', 'entities-bg-arc')
    .attr('d', drawEntityArc({
      startAngle: entitiesArcStartAngle,
      endAngle: entitiesArcEndAngle 
    }))
    .attr('fill', 'magenta');
  
  /**
   * Draw a group element that wraps all entity-arcs
   */
  var arcContainer = app.container
    .append('g')
    .attr('id', 'entity-arc-container');
  
  function update(entities) {
    
    var entityLayout = computeEntitiesLayout(entities, {
      startAngle: entitiesArcStartAngle,
      endAngle: entitiesArcEndAngle,
      padAngle: twoPI / 600,
    });
    
    this._currentEntityLayout = entityLayout;
    
    // bind data to DOM elements
    // ATTENTION: draw state arcs before entity arcs
    // so that entity arcs always appear over state arcs
    var stateArcs = arcContainer
      .selectAll('g.state-arc')
      .data(entityLayout.stateArcs);
    
    var entityArcs = arcContainer
      .selectAll('g.entity-arc')
      .data(entityLayout.entityArcs);
    
    // UPDATE
    
    
    //////////
    // ENTER
    var stateEnter = stateArcs
      .enter()
      .append('g')
      .attr('class', 'state-arc');
    stateEnter
      .append('path')
      .attr('d', drawEntityArc)
      .attr('fill', 'yellow');
    
    var entityEnter = entityArcs
      .enter()
      .append('g')
      .attr('class', 'entity-arc')
      .attr('id', function (d) {
        return 'entity-' + slug(d.data.name, { lower: true });
      })
      .on('mouseenter', function (d) {
        
        var entity = d.data;
        
        var openQuestions = app.ui.questions.getOpenQuestions();
        
        var links = [];
        
        openQuestions.forEach(function (question) {
          var options = entity[question.name];
          
          if (!options) {
            return;
          }
          
          options.forEach(function (opt) {
            links.push([
              Object.assign({ type: 'entity' }, entity),
              Object.assign({ type: 'question-option'}, opt)
            ]);
          });
        });
        
        // add year link
        links.push([
          Object.assign({ type: 'entity' }, entity),
          { type: 'year', year: entity.ano }
        ]);
        
        app.ui.links.update(links);
        
        // console.log(openQuestions);
        d3.select(this).classed('active', true);
      })
      .on('mouseout', function (d) {
        app.ui.links.update([]);
        
        d3.select(this).classed('active', false);
      });
    entityEnter
      .append('path')
      .attr('d', drawEntityArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'darkred');
    entityEnter
      .append('text')
      .text(function (d) {
        return d.data.name;
      })
      .style('font-size', 8)
      .style('text-anchor', function(d) {
        var midAngle = (d.startAngle + d.endAngle) / 2;
        return midAngle > Math.PI ? 'end' : null;
      })
      .attr('transform', function(d) {
        
        var midAngle = (d.startAngle + d.endAngle) / 2;
        
        return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
            + 'translate(' + (options.innerRadius + 26) + ')'
            + (midAngle > Math.PI ? 'rotate(180)' : '');
      });
  }
  
  return {
    update: update,
    computeItemPosition: function (requestedItem) {
      var item;
      
      if (requestedItem.type === 'entity') {
        item = this._currentEntityLayout.entityArcs.find(function (arc) {
          return arc.data.name === requestedItem.name;
        });
      }
      
      return {
        angle: (item.startAngle + item.endAngle) / 2,
        radius: options.innerRadius
      };
    },
    
    activate: function (requestedItem) {
      arcContainer
        .select('#entity-' + slug(requestedItem.name, { lower: true }))
        .classed('active', true);
    },
    
    deactivate: function (requestedItem) {
      arcContainer
        .select('#entity-' + slug(requestedItem.name, { lower: true }))
        .classed('active', false);
    }
  };
};