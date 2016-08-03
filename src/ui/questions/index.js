const d3 = require('d3');
const DataObj = require('data-obj');

const computeQuestionsLayout = require('./layout');

const aux = require('../auxiliary');

module.exports = function (app, options) {
  
  var twoPI = (2 * Math.PI);
  
  var questionsStartAngle = 0;
  var questionsFullAngleSpan = twoPI * 4/9;
  
  /**
  * Generators
  */
  var drawQuestionArc = d3.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius);
  
  var questionTextFontSize = aux.arcTextFontSize({
    radius: options.outerRadius,
    min: 0,
    max: 14
  });
  
  var questionTextAnchor = aux.arcTextAnchor({});
  
  /**
  * Draw the full question arc
  */
  app.container.append('path')
    .attr('id', 'questions-bg-arc')
    .attr('d', drawQuestionArc({
      startAngle: 0,
      endAngle: questionsFullAngleSpan 
    }))
    .attr('fill', 'transparent');
  
  /**
  * Draw a group element that wraps all question-arcs
  */
  var questionArcContainer = app.container
    .append('g')
    .attr('id', 'question-arc-container');
  
  /**
   * Variable that stores the current layout data
   */
  var uiQuestionLayout;
  var uiQuestionsData;
  
  /**
   * Updates the layout by processing a new set of questions
   */
  function uiUpdate(questionsSourceData) {
    
    // set the questions data variable
    uiQuestionsData = questionsSourceData;
    
    var layoutItems = computeQuestionsLayout(questionsSourceData, {
      startAngle: questionsStartAngle,
      endAngle: questionsFullAngleSpan,
      
      targetAngleSpans: {
        closed: twoPI / 9,
        open: twoPI / 25,
        option: twoPI / 50,
      }
    });
    
    // merge layoutItems with the filter's data
    layoutItems.forEach(function (item) {
      switch (item._type) {
        case 'closed-question':
          break;
        case 'open-question':
          break;
        case 'question-option':
          // check fi the option is selected in the filter
          var appliedFilter = app.services.questionLinkFilter
            .get(item.question._id);
          var isSelected;
          
          if (!appliedFilter) {
            isSelected = false;
          } else {
            isSelected = appliedFilter.indexOf(item._id) !== -1;
          }
          
          item._isSelected = isSelected;
          
          break;
      }
    });
    
    // save currentLayout
    uiQuestionLayout = layoutItems;
    
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
        return d._type + d._id;
      });
    
    // UPDATE
    // update classes
    questionArcContainer
      .selectAll('g.question-arc')
      .each(function (d) {
        d3.select(this).classed('selected', d._isSelected);
      });
    
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
      });
    
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
      .style('text-anchor', questionTextAnchor)
      .style('font-size', questionTextFontSize);
    
    // ENTER
    // define ENTER behavior
    var arcEnter = questionArcs
      .enter()
      .append('g')
      .attr('id', function (d) {
        return 'question-arc-' + d._id;
      })
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
          if (d._isSelected) {
            arcClasses.push('selected');
          }
        }
        
        return arcClasses.join(' ');
      })
      .on('click', function (d, i) {
        
        if (d.type === 'closed-question') {
          
          uiOpenQuestion(d._id);
          
          // // toggle the clicked question's `isOpen` value
          // var clickedQuestion = questionsSourceData.find(function (q) {
          //   return q._id === d._id;
          // });
          
          // // IMPORTANT: first update layout
          // // and only after set the filter,
          // // so that options are found by link functions
          // clickedQuestion.isOpen = true;
          // uiUpdate(questionsSourceData);
          
          // setTimeout(function () {
          //   // set filter to empty array
          //   app.services.questionLinkFilter.set(
          //     d._id,
          //     clickedQuestion.options.map(function (opt) {
          //       return opt._id;
          //     })
          //   );
            
          //   // make links update their positions
          //   app.ui.persistentLinks.updateLinkPositions();
          // }, 0);
          
        } else if (d.type === 'open-question') {
          // toggle the clicked question's `isOpen` value
          var clickedQuestion = questionsSourceData.find(function (q) {
            return q._id === d._id;
          });
          
          // unset filter
          app.services.questionLinkFilter.unset(d._id);
          
          clickedQuestion.isOpen = false;
          uiUpdate(questionsSourceData);
          
          // make links update their positions
          app.ui.persistentLinks.updateLinkPositions();
          
        } else {
          // toggle the selected status of the filter
          var exists;
          var arr = app.services.questionLinkFilter.get(d.question._id);
          if (!arr) {
            exists = false;
          } else {
            exists = arr.indexOf(d._id) !== -1;
          }
          
          if (exists) {
            app.services.questionLinkFilter.arrayRemove(d.question._id, d._id);
            
            uiUpdate(questionsSourceData);
          } else {
            app.services.questionLinkFilter.arrayPush(d.question._id, d._id);
            
            uiUpdate(questionsSourceData);
          }
        }
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
      });
      
    // ENTER text
    // enter text behavior
    arcEnter.append('text')
      .text(function (d) {
        
        // remove data within square brackets
        var text = d._label || d._value;
        
        text = text.replace(/\s*\[.+\]$/, '');
        
        return text;
      })
      // .style('alignment-baseline', 'middle')
      .style('text-anchor', questionTextAnchor)
      .style('font-size', questionTextFontSize)
      .style('opacity', 0)
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
  
  /**
   * Retrieves a list of open questions
   */
  function uiGetOpenQuestions() {
    // build links with all other open dimensions
    // TODO: this must go elsewhere!!!!
    return uiQuestionLayout.filter(function (layoutItem) {
      return (layoutItem.type === 'open-question');
    });
  }
  
  // /**
  // * Activates the requested item
  // */
  // function uiActivate(requestedItem) {
  //   questionArcContainer
  //     .select('#question-arc-' + requestedItem._id)
  //     .classed('active', true);
  // }
  
  // /**
  // * Deactivates the requested item
  // */
  // function uiDeactivate(requestedItem) {
  //   questionArcContainer
  //     .select('#question-arc-' + requestedItem._id)
  //     .classed('active', false);
  // }
  
  
  function uiUpdateActiveOptions(activeOptions, activeClassName) {
    activeClassName = activeClassName || 'active';
    
    questionArcContainer.selectAll('g.question-arc').each(function (d) {
      
      if (!d._type === 'question-option') {
        return;
      }
      
      var isActive = activeOptions.some(function (option) {
        return d._id === option._id;
      });
      
      if (isActive) {
        d3.select(this).classed(activeClassName, true);
      } else {
        d3.select(this).classed(activeClassName, false);
      }
    });
  }
  
  /**
   * Computes the position of the requested item
   */
  function uiComputeItemPosition(requestedItem) {
    var item;
    
    if (requestedItem.type === 'question-option') {
      item = uiQuestionLayout.find(function (arc) {
        return (arc.type === 'question-option' &&
                arc._id === requestedItem._id);
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
  }
  
  function uiGetActiveOptions() {
    return Object.keys(app.services.questionLinkFilter.data).reduce(function (acc, questionId) {
      
      var questionActiveOptions = app.services.questionLinkFilter.get(questionId);
      
      
      
      return acc.concat(questionActiveOptions.map(function (optionId) {
        
        var option = uiQuestionLayout.find(function (item) {
          return item._id === optionId;
        });
        
        return Object.assign({
          question: {
            _id: questionId
          }
        }, option);
      }))
    }, []);
  }
  
  function uiOpenQuestion(questionId) {
    var question = uiQuestionsData.find(function (q) {
      return q._id === questionId;
    });
    
    // IMPORTANT: first update layout
    // and only after set the filter,
    // so that options are found by link functions
    question.isOpen = true;
    uiUpdate(uiQuestionsData);
    
    setTimeout(function () {
      // set filter to empty array
      app.services.questionLinkFilter.set(
        questionId,
        question.options.map(function (opt) {
          return opt._id;
        })
      );
      
      // make links update their positions
      app.ui.persistentLinks.updateLinkPositions();
    }, 0);
  }
  
  /**
   * The API to deal with the questions arc
   */
  return {
    update: uiUpdate,
    computeItemPosition: uiComputeItemPosition,
    getOpenQuestions: uiGetOpenQuestions,
    getActiveOptions: uiGetActiveOptions,
    updateActiveOptions: uiUpdateActiveOptions,
    filter: app.services.questionLinkFilter,
    layout: uiQuestionLayout,
    openQuestion: uiOpenQuestion
  };
}
