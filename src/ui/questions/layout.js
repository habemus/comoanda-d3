module.exports = function computeQuestionsLayout(questionsData, options) {
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
          question: question,
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
};
