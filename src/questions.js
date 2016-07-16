const d3 = require('d3');


var questions = require('./data/questions');

function computeQuestionsLayout(questionsData, options) {
  /**
   * Start and End angles for the
   * full questionsData arc.
   */
  var startAngle = options.startAngle;
  var endAngle   = options.endAngle;
  
  if (typeof startAngle !== 'number') {
    throw new Error('startAngle is required');
  }
  if (typeof endAngle !== 'number') {
    throw new Error('endAngle is required');
  }
  
  // check for targetAngleSpans
  if (!options.targetAngleSpans) {
    throw new Error('targetAngleSpans is required');
  }
  
  if (!options.targetAngleSpans.closed) {
    throw new Error('targetAngleSpans.closed is required');
  }
  if (!options.targetAngleSpans.open) {
    throw new Error('targetAngleSpans.open is required');
  }
  if (!options.targetAngleSpans.option) {
    throw new Error('targetAngleSpans.option is required');
  }
  
  // target angleSpans
  var targetAngleSpans = options.targetAngleSpans;
  
  /**
   * Array to hold the final list of items
   * to be rendered
   */
  var layoutItems = [];
  
  // loop through questions and build an array
  // of items to be displayed (both questions and question-options)
  questionsData.forEach(function (question, index) {
    
    if (!question.isOpen) {
      layoutItems.push(Object.assign({
        type: 'closed-question',
      }, question));
    } else {
      
      layoutItems.push(Object.assign({
        type: 'open-question',
      }, question));
      
      // loop through responses and add them to the layout
      question.options.forEach(function (opt) {
        
        layoutItems.push(Object.assign({
          type: 'question-option',
        }, opt));
        
      });
    }
  });
  
  /**
   * How much space all items aim to occupy
   */
  var targetTotalAngleSpan = layoutItems.reduce(function (res, item) {
    var itemAngleSpan;
    
    switch (item.type) {
      case 'closed-question':
        return res + targetAngleSpans.closed;
        break;
      case 'open-question':
        return res + targetAngleSpans.open;
        break;
      case 'question-option':
        return res + targetAngleSpans.option;
        break;
    }
    
  }, 0);
  
  // compute multiplier that adapts the target angle spans
  // to the available angleSpan
  // should work in both target > available and target < available
  var availableTotalAngleSpan = options.endAngle - options.startAngle;
  var angleSpanMultiplier = availableTotalAngleSpan / targetTotalAngleSpan;
  
  
  // holds the last end angle used
  // starts at the global startAngle
  var _lastAngle = startAngle;
  
  // loop through layoutItems and calculate their positions
  // and angles
  layoutItems.forEach(function (item, index) {
    var isFirst = (index === 0);
    var isLast = (index === layoutItems.length - 1);
    
    var itemStartAngle = _lastAngle;
    var itemEndAngle;
    
    switch (item.type) {
      case 'closed-question':
        itemEndAngle =
          itemStartAngle + (targetAngleSpans.closed * angleSpanMultiplier);
        break;
      case 'open-question':
        itemEndAngle =
          itemStartAngle + (targetAngleSpans.open * angleSpanMultiplier);
        break;
      case 'question-option':
        itemEndAngle =
          itemStartAngle + (targetAngleSpans.option * angleSpanMultiplier);
        break;
    }
    
    item.startAngle = itemStartAngle;
    item.endAngle   = itemEndAngle;
    
    // auxiliary
    item.midAngle   = (itemStartAngle + itemEndAngle) / 2;
    
    // update _lastAngle
    _lastAngle = itemEndAngle;
  });

  return layoutItems;
}

module.exports = function (container, options) {
  
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
  container.append('path')
    .attr('id', 'questions-bg-arc')
    .attr('d', drawQuestionArc({
      startAngle: 0,
      endAngle: questionsFullAngleSpan 
    }))
    .attr('fill', 'skyblue');
  
  /**
  * Draw a group element that wraps all question-arcs
  */
  var questionArcContainer = container
    .append('g')
    .attr('id', 'question-arc-container');
  
  function update(questionsSourceData) {
    
    var layoutItems = computeQuestionsLayout(questionsSourceData, {
      startAngle: questionsStartAngle,
      endAngle: questionsFullAngleSpan,
      
      targetAngleSpans: {
        closed: twoPI / 9,
        open: twoPI / 50,
        option: twoPI / 100,
      }
    });
    
    console.log(layoutItems);
    
    // the data join pattern
    // https://bl.ocks.org/mbostock/3808218
  
    // bind the container's g.question-arc elements
    // to the data
    var questionArcs = questionArcContainer
      .selectAll('g.question-arc')
      .data(layoutItems, function (d) {
        return d.type + d.name;
      });
    
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
          var clickedQuestion = questions.find(function (q) {
            return q.name === d.name;
          });
          
          clickedQuestion.isOpen = true;
          update(questions);
          
        } else if (d.type === 'open-question') {
          // toggle the clicked question's `isOpen` value
          var clickedQuestion = questions.find(function (q) {
            return q.name === d.name;
          });
          
          console.log('oepn question')
          
          clickedQuestion.isOpen = false;
          update(questions);
          
        } else {
          console.log('clicked on option')
        }
      });
      
    // enter path behavior
    arcEnter.append('path')
      .attr('d', drawQuestionArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'darkred');
    
    // enter text behavior
    arcEnter.append('text')
      .text(function (d) {
        return d.name;
      })
      .style("text-anchor", function(d) {
        return d.angle > Math.PI ? "end" : null;
      })
      .style('font-size', '14px')
      .attr('fill', function (d) {
        if (d.type === 'closed-question') {
          return 'lightgrey';
        } else if (d.type === 'open-question') {
          return 'red';
        } else if (d.type === 'question-option') {
          return 'blue';
        }
      })
      .attr("transform", function(d) {
        return "rotate(" + (d.midAngle * 180 / Math.PI - 90) + ")"
            + "translate(" + (options.innerRadius + 26) + ")"
            + (d.midAngle > Math.PI ? "rotate(180)" : "");
      });
    
    // EXIT BEHAVIOR
    // Exit transition:
    // http://bl.ocks.org/mbostock/5779690
    // ARC Tween
    // https://bl.ocks.org/mbostock/5100636

    var arcExit = questionArcs.exit()
      .transition()
      // .attrTween('d', function (d, i) {
      //   // draw an empty arc at the startAngle
      //   return drawQuestionArc({
      //     startAngle: d.startAngle,
      //     endAngle: d.endAngle
      //   });
      // })
      .attr('d', function (d, i) {
        // draw an empty arc at the startAngle
        return drawQuestionArc({
          startAngle: d.startAngle,
          endAngle: d.endAngle
        });
      })
      .remove();
    
    // update existing arcs
    questionArcContainer
      .selectAll('g')
      .select('path')
      .attr('d', drawQuestionArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'darkred');
  }
  
  return update;
}
