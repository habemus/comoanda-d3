const d3 = require('d3');

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
    .attr('fill', 'transparent');
  
  /**
   * Draw group element that wraps all state arcs
   */
  var stateArcContainer = app.container
    .append('g')
    .attr('id', 'state-arc-container');
  
  /**
   * Draw a group element that wraps all entity-arcs
   */
  var entityArcContainer = app.container
    .append('g')
    .attr('id', 'entity-arc-container');
  
  var uiCurrentLayout;
  
  function update(entities) {
    
    var entityLayout = computeEntitiesLayout(entities, {
      startAngle: entitiesArcStartAngle,
      endAngle: entitiesArcEndAngle,
      padAngle: twoPI / 600,
    });
    
    uiCurrentLayout = entityLayout;
    
    // bind data to DOM elements
    // ATTENTION: draw state arcs before entity arcs
    // so that entity arcs always appear over state arcs
    var stateArcs = stateArcContainer
      .selectAll('g.state-arc')
      .data(entityLayout.stateArcs, function stateId(d) {
        return d.data.key;
      });
    
    var entityArcs = entityArcContainer
      .selectAll('g.entity-arc')
      .data(entityLayout.entityArcs, function entityId(d) {
        return d.data._id;
      });
    
    ///////////
    // UPDATE
    stateArcs
      .select('path')
      .attr('d', drawEntityArc);
    stateArcs
      .select('text')
      .style('text-anchor', function(d) {
        var midAngle = ((d.startAngle + d.endAngle) / 2) - d.padAngle;
        return midAngle > Math.PI ? 'end' : null;
      })
      .attr('transform', function(d) {
        
        var midAngle = ((d.startAngle + d.endAngle) / 2) - d.padAngle;
        
        return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
            + 'translate(' + (options.innerRadius + 26) + ')'
            + (midAngle > Math.PI ? 'rotate(180)' : '');
      });
    
    entityArcs
      .select('path')
      .attr('d', drawEntityArc);
    entityArcs
      .select('text')
      .style('text-anchor', function(d) {
        var midAngle = ((d.startAngle + d.endAngle) / 2) - d.padAngle;
        return midAngle > Math.PI ? 'end' : null;
      })
      .attr('transform', function(d) {
        
        var midAngle = ((d.startAngle + d.endAngle) / 2) - d.padAngle;
        
        return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
            + 'translate(' + (options.innerRadius + 26) + ')'
            + (midAngle > Math.PI ? 'rotate(180)' : '');
      })
    
    //////////
    // ENTER
    var stateEnter = stateArcs
      .enter()
      .append('g')
      .attr('class', 'state-arc');
    stateEnter
      .append('path')
      .attr('d', drawEntityArc);
    stateEnter
      .append('text')
      .text(function (d) {
        return d.data.key;
      })
      .style('font-size', 10)
      .style('text-anchor', function(d) {
        var midAngle = ((d.startAngle + d.endAngle) / 2) - d.padAngle;
        return midAngle > Math.PI ? 'end' : null;
      })
      .attr('transform', function(d) {
        
        var midAngle = ((d.startAngle + d.endAngle) / 2) - d.padAngle;
        
        return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
            + 'translate(' + (options.innerRadius + 26) + ')'
            + (midAngle > Math.PI ? 'rotate(180)' : '');
      });
    
    var entityEnter = entityArcs
      .enter()
      .append('g')
      .attr('class', 'entity-arc')
      .attr('id', function (d) {
        return 'entity-' + d.data._id;
      })
      .on('mouseenter', function (d) {
        
        var entity = d.data;
        
        var openQuestions = app.ui.questions.getOpenQuestions();
        
        var links = [];
        
        openQuestions.forEach(function (question) {
          var options = entity[question._id];
          
          if (!options) {
            return;
          }
          
          options.forEach(function (opt) {
            links.push({
              from: Object.assign({ type: 'entity' }, entity),
              to: Object.assign({ type: 'question-option'}, opt)
            });
          });
        });
        
        // add year link
        links.push({
          from: Object.assign({ type: 'entity' }, entity),
          to: { type: 'year', year: entity.ano }
        });
        
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
      .attr('fill', 'transparent');
    entityEnter
      .append('text')
      .text(function (d) {
        return d.data.label;
      })
      .style('font-size', 8)
      .style('text-anchor', function(d) {
        var midAngle = (d.startAngle + d.endAngle) / 2;
        return midAngle > Math.PI ? 'end' : null;
      })
      .attr('transform', function(d) {
        
        var midAngle = (d.startAngle + d.endAngle) / 2;
        
        return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
            + 'translate(' + (options.innerRadius + 40) + ')'
            + (midAngle > Math.PI ? 'rotate(180)' : '');
      });
    
    ////////////
    // EXIT
    var stateExit = stateArcs.exit();
    
    // animate arc path
    stateExit
      .select('path')
      .transition()
      .duration(400)
      .style('opacity', 0)
      .attrTween('d', function (d, i) {
        
        var midAngle = (d.startAngle + d.endAngle) / 2
        
        var interpolateStart = d3.interpolate(d.startAngle, midAngle);
        var interpolateEnd   = d3.interpolate(d.endAngle, midAngle);
        
        return function (t) {
          var arcPath = drawEntityArc({
            startAngle: interpolateStart(t),
            endAngle: interpolateEnd(t),
          });
          return arcPath;
        };
      });
    
    // animate arc text
    stateExit
      .select('text')
      .transition()
      .duration(400)
      .style('opacity', 0);
    
    // wait for animation to end before removing the arc group element
    stateExit
      .transition()
      .delay(400)
      .remove();
  }
  
  return {
    update: update,
    updateActiveEntities: function (activeEntities, activeClassName) {
      activeClassName = activeClassName || 'active';
      
      entityArcContainer.selectAll('g.entity-arc').each(function (d) {
        var isActive = activeEntities.some(function (entity) {
          return d.data._type === 'entity' && entity._id === d.data._id;
        });
        
        if (isActive) {
          d3.select(this).classed(activeClassName, true);
        } else {
          d3.select(this).classed(activeClassName, false);
        }
      });
    },
    computeItemPosition: function (requestedItem) {
      var item;
      
      if (requestedItem.type === 'entity') {
        item = uiCurrentLayout.entityArcs.find(function (arc) {
          return arc.data._id === requestedItem._id;
        });
      }
      
      return {
        angle: (item.startAngle + item.endAngle) / 2,
        radius: options.innerRadius
      };
    },
    
    activate: function (requestedItem) {
      entityArcContainer
        .select('#entity-' + requestedItem._id)
        .classed('active', true);
    },
    
    deactivate: function (requestedItem) {
      entityArcContainer
        .select('#entity-' + requestedItem._id)
        .classed('active', false);
    }
  };
};