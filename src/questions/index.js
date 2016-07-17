const d3 = require('d3');

const computeQuestionsLayout = require('./layout');

const entities = require('../data/entities');

module.exports = function (app, options) {
  
  var questionsStartAngle = 0;
  var questionsFullAngleSpan = (2 * Math.PI) * 2/5;
  
  var twoPI = (2 * Math.PI);
  
  
  /**
  * Generators
  */
  var drawQuestionArc = d3.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius);
  
  /**
  * Draw the full question arc
  */
  app.container.append('path')
    .attr('id', 'questions-bg-arc')
    .attr('d', drawQuestionArc({
      startAngle: 0,
      endAngle: questionsFullAngleSpan 
    }))
    .attr('fill', 'skyblue');
  
  /**
  * Draw a group element that wraps all question-arcs
  */
  var questionArcContainer = app.container
    .append('g')
    .attr('id', 'question-arc-container');
    
  var _currentLayout;
  
  function update(questionsSourceData) {
    
    var layoutItems = computeQuestionsLayout(questionsSourceData, {
      startAngle: questionsStartAngle,
      endAngle: questionsFullAngleSpan,
      
      targetAngleSpans: {
        closed: twoPI / 9,
        open: twoPI / 25,
        option: twoPI / 50,
      }
    });
    
    // save currentLayout
    _currentLayout = layoutItems;
    
    // before binding new data, save the old data onto DOM Elements
    // so that we may access them later
    questionArcContainer.selectAll('g.question-arc path')
      .each(function (d, i) {
        this.__previousData = d;
      });
    questionArcContainer.selectAll('g.question-arc text')
      .each(function (d, i) {
        this.__previousData = d;
      });
    
    // the data join pattern
    // https://bl.ocks.org/mbostock/3808218
  
    // bind the container's g.question-arc elements
    // to the data
    var questionArcs = questionArcContainer
      .selectAll('g.question-arc')
      .data(layoutItems, function (d) {
        return d.type + d.name + d.value;
      });
    
    // UPDATE
    // update existing arcs before running enter and exit
    // so that transitions do not interfere with one another
    questionArcContainer
      .selectAll('g.question-arc')
      .select('path')
      .transition()
      .duration(400)
      .attrTween('d', function (d, i) {
        
        var previous = this.__previousData;
        
        var interpolateStart = d3.interpolate(
          previous.startAngle,
          d.startAngle
        );
        
        var interpolateEnd = d3.interpolate(
          previous.endAngle,
          d.endAngle
        );
        
        return function (t) {
          return drawQuestionArc({
            startAngle: interpolateStart(t),
            endAngle: interpolateEnd(t)
          });
        };
      })
      // .attr('d', drawQuestionArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'darkred');
    
    // update text position
    questionArcContainer
      .selectAll('g.question-arc')
      .select('text')
      .transition()
      .duration(400)
      .attrTween('transform', function(d) {
        
        var previous = this.__previousData;
        
        var interpolate = d3.interpolate(previous.midAngle, d.midAngle);
        
        return function (t) {
          var midAngle = interpolate(t);
          
          return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
              + 'translate(' + (options.innerRadius + 26) + ')'
              + (midAngle > Math.PI ? 'rotate(180)' : '');
        }
      })
      .style('text-anchor', function(d) {
        return d.midAngle > Math.PI ? 'end' : null;
      })
      .style('font-size', function (d) {
        
        // console.log((d.endAngle - d.startAngle));
        
        var angleSpan = d.endAngle - d.startAngle;
        var circumference = twoPI * options.outerRadius;
        
        var size = (angleSpan / twoPI) * circumference * 1.2;
        size = size > 14 ? 14 : size;
        
        return size + 'px';
      });
    
    // ENTER
    // define ENTER behavior
    var arcEnter = questionArcs
      .enter()
      .append('g')
      .attr('class', function (d) {
        
        var arcClasses = ['question-arc'];
        
        if (d.type === 'closed-question') {
          arcClasses.push('question');
          arcClasses.push('closed-question');
        } else if (d.type === 'open-question') {
          arcClasses.push('question')
          arcClasses.push('open-question');
        } else if (d.type === 'question-option') {
          arcClasses.push('question-option');
        }
        
        return arcClasses.join(' ');
      })
      .on('click', function (d, i) {
        // TODO improve event handling
        
        if (d.type === 'closed-question') {
          // toggle the clicked question's `isOpen` value
          var clickedQuestion = questionsSourceData.find(function (q) {
            return q.name === d.name;
          });
          
          clickedQuestion.isOpen = true;
          update(questionsSourceData);
          
        } else if (d.type === 'open-question') {
          // toggle the clicked question's `isOpen` value
          var clickedQuestion = questionsSourceData.find(function (q) {
            return q.name === d.name;
          });
          
          console.log('oepn question')
          
          clickedQuestion.isOpen = false;
          update(questionsSourceData);
          
        } else {
          console.log('clicked on option')
        }
      })
      .on('mouseover', function (d, i) {
        if (d.type === 'question-option') {
          
          var hoveredOption = d;
          
          // TODO: move query logic to service
          
          var entitiesWithOption = entities.filter(function (entity) {
            if (!entity[hoveredOption.question.name]) {
              return false;
            } else {
              return entity[hoveredOption.question.name].some(function (opt) {
                return opt.name === hoveredOption.name;
              });
            }
          });
          
          // build links with THIS OPTION
          var links = [];
          entitiesWithOption.forEach(function (entity) {
            links.push([
              Object.assign({ type: 'question-option' }, hoveredOption),
              Object.assign({ type: 'entity' }, entity)
            ]);
            
            // year link
            links.push([
              Object.assign({ type: 'entity' }, entity),
              { type: 'year', year: entity.ano }
            ]);
          });
          
          // build links with all other open dimensions
          // TODO: this must go elsewhere!!!!
          var otherOpenQuestions = _currentLayout.filter(function (layoutItem) {
            return (layoutItem.type === 'open-question' &&
                    layoutItem.name !== hoveredOption.question.name);
          });
          
          otherOpenQuestions.forEach(function (question) {
            entitiesWithOption.forEach(function (entity) {
              if (entity[question.name]) {
                entity[question.name].forEach(function (opt) {
                  links.push([
                    Object.assign({ type: 'entity' }, entity),
                    Object.assign({ type: 'question-option' }, opt),
                  ]);
                });
              }
            });
          });
          
          // link
          app.ui.links.update(links);
        }
      })
      .on('mouseout', function (d) {
        app.ui.links.update([]);
      });
    
    // ENTER path
    // enter path behavior
    arcEnter
      .append('path')
      .style('opacity', 0)
      .transition()
      .duration(400)
      .style('opacity', 1)
      .attrTween('d', function (d, i) {
        
        var interpolateStart = d3.interpolate(d.midAngle, d.startAngle);
        var interpolateEnd   = d3.interpolate(d.midAngle, d.endAngle);
        
        return function (t) {
          return drawQuestionArc({
            startAngle: interpolateStart(t),
            endAngle: interpolateEnd(t)
          });
        };
      })
      // .attr('d', drawQuestionArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'darkred');
    
    // ENTER text
    // enter text behavior
    arcEnter.append('text')
      .text(function (d) {
        return d.name;
      })
      .style('text-anchor', function(d) {
        return d.midAngle > Math.PI ? 'end' : null;
      })
      .style('font-size', function (d) {
        
        // console.log((d.endAngle - d.startAngle));
        
        var angleSpan = d.endAngle - d.startAngle;
        var circumference = twoPI * options.outerRadius;
        
        var size = (angleSpan / twoPI) * circumference * 1.2;
        size = size > 14 ? 14 : size;
        
        return size + 'px';
      })
      .style('opacity', 0)
      .attr('fill', function (d) {
        if (d.type === 'closed-question') {
          return 'lightgrey';
        } else if (d.type === 'open-question') {
          return 'red';
        } else if (d.type === 'question-option') {
          return 'blue';
        }
      })
      .attr('transform', function(d) {
        return 'rotate(' + (d.midAngle * 180 / Math.PI - 90) + ')'
            + 'translate(' + (options.innerRadius + 26) + ')'
            + (d.midAngle > Math.PI ? 'rotate(180)' : '');
      })
      .transition()
      .delay(200)
      .duration(600)
      .style('opacity', 1);
    
    // EXIT BEHAVIOR
    // Exit transition:
    // http://bl.ocks.org/mbostock/5779690
    // ARC Tween
    // https://bl.ocks.org/mbostock/5100636
    var arcExit = questionArcs.exit();
    
    // animate arc path
    arcExit
      .select('path')
      .transition()
      .duration(400)
      .style('opacity', 0)
      .attrTween('d', function (d, i) {
        
        var interpolateStart = d3.interpolate(d.startAngle, d.midAngle);
        var interpolateEnd   = d3.interpolate(d.endAngle, d.midAngle);
        
        return function (t) {
          var arcPath = drawQuestionArc({
            startAngle: interpolateStart(t),
            endAngle: interpolateEnd(t),
          });
          return arcPath;
        };
      });
    
    // animate arc text
    arcExit
      .select('text')
      .transition()
      .duration(400)
      .style('opacity', 0);
    
    // wait for animation to end before removing the arc group element
    arcExit
      .transition()
      .delay(400)
      .remove();
  }
  
  return {
    update: update,
    computeItemPosition: function (requestedItem) {
      var item;
      
      if (requestedItem.type === 'question-option') {
        item = _currentLayout.find(function (arc) {
          return arc.name === requestedItem.name;
        });
      } else {
        throw new Error('unsupported');
      }
      
      if (!item) {
        return false;
      } else {
        return {
          angle: (item.startAngle + item.endAngle) / 2,
          radius: options.innerRadius
        };
      }
    },
    
    getOpenQuestions: function () {
      // build links with all other open dimensions
      // TODO: this must go elsewhere!!!!
      return _currentLayout.filter(function (layoutItem) {
        return (layoutItem.type === 'open-question');
      });
    },
  };
}
