const d3 = require('d3');

module.exports = function (app, options) {
  
  if (!options.centerX) {
    throw new Error('centerX is required');
  }
  
  if (!options.centerY) {
    throw new Error('centerY is required');
  }
  
  if (!options.innerRadius) {
    throw new Error('innerRadius is required');
  }
  
  if (!options.outerRadius) {
    throw new Error('outerRadius is required');
  }
  
  if (!options.entities) {
    throw new Error('entities is required');
  }
  
  /**
   * Brush width varies according to the centerX
   */
  const BRUSH_WIDTH  = options.centerX * 0.5;
  const BRUSH_HEIGHT = 2;
  
  const brushExtent = d3.extent(options.entities, function (d) {
    return parseInt(d['Quando sua organização surgiu?'], 10);
  });
  
  const BRUSH_MINIMUM = brushExtent[0];
  const BRUSH_MAXIMUM = brushExtent[1];
  
  /**
   * Create a `g` node for the brush
   */
  var brushG = app.svg
    .append('g')
    .attr('id', 'year-brush')
    .attr('transform', function () {
      
      var brushLeft = options.centerX - (BRUSH_WIDTH / 2);
      // var brushTop  = options.centerY + options.outerRadius + 72;
      var brushTop = options.centerY * 2 - 30; 
      
      return 'translate(' + brushLeft + ',' + brushTop + ')';
    });
  
  // LABELS
  // absolute start label
  brushG.append('text')
    .attr('id', 'brush-minimum-label')
    .attr('class', 'brush-label')
    .attr('dx', -10)
    .attr('dy', 5)
    .attr('text-anchor', 'end')
    .attr('font-size', 12)
    .text(BRUSH_MINIMUM);
  
  // absolute end label
  brushG.append('text')
    .attr('id', 'brush-minimum-label')
    .attr('class', 'brush-label')
    .attr('dx', BRUSH_WIDTH + 10)
    .attr('dy', 5)
    .attr('text-anchor', 'start')
    .attr('font-size', 12)
    .text(BRUSH_MAXIMUM);
  
  // relative brush start label
  var brushStartLabel = brushG.append('text')
    .attr('id', 'brush-start-label')
    .attr('class', 'brush-label')
    .attr('dy', 24)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10);
  
  // relative brush end label
  var brushEndLabel = brushG.append('text')
    .attr('id', 'brush-end-label')
    .attr('class', 'brush-label')
    .attr('dy', 24)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10);
  
  /**
   * All years that are selectable.
   * They are the initial value of the filter.
   */
  var years = d3.range(
    BRUSH_MINIMUM,
    BRUSH_MAXIMUM + 1
  );
  
  /**
   * Scale that converts brush positions to years
   */
  var yearBrushScale = d3.scaleQuantize()
    .domain([0, BRUSH_WIDTH])
    .range(years);
  
  /**
   * The d3.brush object
   */
  var yearBrush = d3.brushX()
    .extent([[0, 0], [BRUSH_WIDTH, BRUSH_HEIGHT]])
    .handleSize(15)
    .on('brush', function (e) {
      var brushSelection = d3.brushSelection(this);
      
      if (!brushSelection) {
        return;
      }
      
      var currentYearInterval = app.services.filter.get('yearRange');
      var yearInterval = brushSelection.map(function (v) {
        return yearBrushScale(v);
      });
      
      if (yearInterval[0] === currentYearInterval[0] && yearInterval[1] === currentYearInterval[1]) {
        console.log('repeated');
        
        return;
      }
      
      brushStartLabel
        .attr('dx', brushSelection[0])
        .text(yearInterval[0]);
      brushEndLabel
        .attr('dx', brushSelection[1])
        .text(yearInterval[1]);
      
      
      app.services.filter.set('yearRange', [
        yearInterval[0],
        yearInterval[1]
      ]);
    })
    .on('end', function (e) {
      var brushSelection = d3.brushSelection(this);
      
      if (!brushSelection) {
        
        // get the current yearRange
        var currentYearRange = app.services.filter.get('yearRange');
        var start = currentYearRange[0];
        var end   = currentYearRange[1];
        
        if (end === BRUSH_MAXIMUM) {
          yearBrush.move(brushG, [
            yearBrushScale.invertExtent(start - 1)[0],
            yearBrushScale.invertExtent(end)[1],
          ]);
        } else {
          // by default move the end handle +1
          yearBrush.move(brushG, [
            yearBrushScale.invertExtent(start)[0],
            yearBrushScale.invertExtent(end + 1)[1],
          ]);
        }
        
        return;
      }
      
      var yearInterval = brushSelection.map(function (v) {
        return yearBrushScale(v);
      });
    });
    
  /**
   * Draw the brush using brushG as the element
   */
  brushG.call(yearBrush);
  
  // make brush select initial value
  yearBrush.move(brushG, [
    yearBrushScale.invertExtent(years[0])[0],
    yearBrushScale.invertExtent(years[years.length - 1])[1],
  ]);
  
  return {
    moveBrush: function (yearRange) {
      
      var brushRange = [
        yearBrushScale.invertExtent(yearRange[0])[0],
        yearBrushScale.invertExtent(yearRange[1])[1],
      ];
      
      yearBrush.move(brushG, brushRange);
    },
  }
};
