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
  
  /**
   * Brush width varies according to the centerX
   */
  const BRUSH_WIDTH  = options.centerX * 0.7;
  const BRUSH_HEIGHT = 2;
  
  /**
   * Create a `g` node for the brush
   */
  var brushG = app.svg
    .append('g')
    .attr('id', 'year-brush')
    .attr('transform', function () {
      
      var brushLeft = options.centerX - (BRUSH_WIDTH / 2);
      var brushTop  = options.centerY + options.outerRadius + 50;
      
      return 'translate(' + brushLeft + ',' + brushTop + ')';
    });
  
  /**
   * All years that are selectable.
   * They are the initial value of the filter.
   */
  var years = d3.range(
    app.services.filter.data.yearRange[0],
    app.services.filter.data.yearRange[1] + 1
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
    .on('brush', function (e) {
      var brushSelection = d3.brushSelection(this);
      
      if (!brushSelection) {
        return;
      }
      
      var yearInterval = brushSelection.map(function (v) {
        return yearBrushScale(v);
      });
      
      app.services.filter.set('yearRange', [
        yearInterval[0],
        yearInterval[1]
      ]);
    });
  
  /**
   * Draw the brush using brushG as the element
   */
  brushG.call(yearBrush);
  
  /**
   * Modify handle styels
   */
  // brushG.selectAll('.handle')
  //   .each(function (d) )
  //   .attr('height', 20)
  //   .attr('width', 10);
  
  // make brush select initial value
  yearBrush.move(brushG, [
    yearBrushScale.invertExtent(years[0])[0],
    yearBrushScale.invertExtent(years[years.length - 1])[1],
  ]);
  
  return {
    
  }
};
