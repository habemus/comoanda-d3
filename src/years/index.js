const d3 = require('d3');

const computeYearsLayout = require('./layout'); 
const entities = require('../data/entities');

module.exports = function (app, options) {
  
  var twoPI = (2 * Math.PI);
  
  var yearsStartAngle = twoPI * 2/5;
  var yearsEndAngle   = twoPI * 3/5;
  
  /**
  * Generators
  */
  var drawYearArc = d3.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius);
  
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
      .data(layout);
    
    //////////
    // ENTER
    var yearEnter = yearArcs
      .enter()
      .append('g')
      .attr('class', 'year-arc')
      .on('mouseenter', function (d) {
        var yearEntities = entities.filter(function (entity) {
          return parseInt(entity.ano, 10) === d.data.year;
        });
        
        var links = yearEntities.map(function (entity) {
          return [
            {
              type: 'year',
              year: d.data.year
            },
            Object.assign({ type: 'entity' }, entity),
          ];
        });
        
        app.ui.links.update(links);
        
        d3.select(this).classed('active', true)
      })
      .on('mouseout', function (d) {
        app.ui.links.update([]);
        
        d3.select(this).classed('active', false);
      });
      
    yearEnter
      .append('path')
      .attr('d', drawYearArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'black');

    yearEnter
      .append('text')
      .text(function (d) {
        return d.data.year;
      })
      .style('font-size', 14)
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
  };
  
  return {
    update: updateYears,
    computeItemPosition: function (requestedItem) {
      
      var item = _currentLayout.find(function (i) {
        return parseInt(i.data.year) === parseInt(requestedItem.year);
      });
      
      return {
        angle: (item.endAngle + item.startAngle) / 2,
        radius: options.innerRadius,
      };
    },
  }
};