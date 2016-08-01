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
  var years = app.services.filter.data.ano.concat([]);
  
  years.sort(d3.ascending);
  
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
      
      // Convert the year interval into an array containing all
      // years in the interval.
      // That will make it simpler for the filter to be applied
      var selectedYears = d3.range(
        yearInterval[0],
        yearInterval[yearInterval.length - 1] + 1
      );
      
      app.services.filter.set('ano', selectedYears);
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
