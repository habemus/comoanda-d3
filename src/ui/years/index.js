const d3 = require('d3');

const computeYearsLayout = require('./layout'); 
const entities = require('../../data/data.json').entities;

const aux = require('../auxiliary');

module.exports = function (app, options) {
  
  var twoPI = (2 * Math.PI);
  
  var pad = twoPI / 200;
  
  var yearsStartAngle = twoPI * 4/9 + pad;
  var yearsEndAngle   = twoPI * 5/9 - pad;
  
  /**
  * Generators
  */
  var drawYearArc = d3.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius);
  
  var yearTextFontSize = aux.arcTextFontSize({
    max: 10,
    min: 0,
    radius: options.outerRadius,
  });
  
  var yearTextAnchor = aux.arcTextAnchor({});
  
  var yearTextTransform = aux.arcTextTransform({
    radius: options.innerRadius + 26,
  });
  
  /**
   * Draw a group element that wraps all year-arcs
   */
  var arcContainer = app.container
    .append('g')
    .attr('id', 'year-arc-container');
    
  var _currentLayout;
  
  function updateYears(years) {
    
    var layout = computeYearsLayout(years, {
      startAngle: yearsStartAngle,
      endAngle: yearsEndAngle
    });
    
    _currentLayout = layout;
    
    // bind data to DOM elements
    var yearArcs = arcContainer
      .selectAll('g.year-arc')
      .data(layout, function genYearId(d) {
        return 'year-' + d.data.year;
      });
    
    ///////////
    // UPDATE
    yearArcs
      .select('path')
      .attr('d', drawYearArc);
    
    yearArcs
      .select('text')
      .style('font-size', yearTextFontSize)
      .style('text-anchor', yearTextAnchor)
      .attr('transform', yearTextTransform);
    
    //////////
    // ENTER
    var yearEnter = yearArcs
      .enter()
      .append('g')
      .attr('class', 'year-arc')
      .attr('id', function (d) {
        return 'year-' + d.data.year;
      });
      
    yearEnter
      .append('path')
      .attr('d', drawYearArc);

    yearEnter
      .append('text')
      .text(function (d) {
        return d.data.year;
      })
      .style('font-size', yearTextFontSize)
      .style('text-anchor', yearTextAnchor)
      .attr('transform', yearTextTransform);
    
    ///////////
    // EXIT
    var yearExit = yearArcs.exit();
    
    yearExit.remove();
  };
  
  return {
    update: updateYears,
    computeItemPosition: function (requestedItem) {
      
      var item = _currentLayout.find(function (i) {
        return parseInt(i.data.year) === parseInt(requestedItem.year);
      });
      
      if (!item) {
        return false;
      } else {
        return {
          angle: (item.endAngle + item.startAngle) / 2,
          radius: options.innerRadius,
        };
      }
    },
    activate: function (requestedItem) {
      arcContainer
        .select('#year-' + requestedItem.year)
        .classed('active', true);
    },
    
    deactivate: function (requestedItem) {
      arcContainer
        .select('#year-' + requestedItem.year)
        .classed('active', false);
    }
  }
};