const d3 = require('d3');

const computeYearsLayout = require('./layout'); 
const entities = require('../../data/data.json').entities;

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
      .style('font-size', function (d) {
        var angleSpan = d.endAngle - d.startAngle;
        var circumference = twoPI * options.outerRadius;
        
        var size = (angleSpan / twoPI) * circumference * 1.2;
        size = size > 14 ? 14 : size;
        
        return size + 'px';
      })
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
    
    //////////
    // ENTER
    var yearEnter = yearArcs
      .enter()
      .append('g')
      .attr('class', 'year-arc')
      .attr('id', function (d) {
        return 'year-' + d.data.year;
      });
      // .on('mouseenter', function (d) {
      //   var yearEntities = entities.filter(function (entity) {
      //     return parseInt(entity.ano, 10) === d.data.year;
      //   });
        
      //   var links = yearEntities.map(function (entity) {
      //     return {
      //       from: {
      //         type: 'year',
      //         year: d.data.year
      //       },
      //       to: Object.assign({ type: 'entity' }, entity),
      //     };
      //   });
        
      //   app.ui.links.update(links);
        
      //   d3.select(this).classed('active', true)
      // })
      // .on('mouseout', function (d) {
      //   app.ui.links.update([]);
        
      //   d3.select(this).classed('active', false);
      // });
      
    yearEnter
      .append('path')
      .attr('d', drawYearArc);

    yearEnter
      .append('text')
      .text(function (d) {
        return d.data.year;
      })
      .style('font-size', function (d) {
        var angleSpan = d.endAngle - d.startAngle;
        var circumference = twoPI * options.outerRadius;
        
        var size = (angleSpan / twoPI) * circumference * 1.2;
        size = size > 14 ? 14 : size;
        
        return size + 'px';
      })
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