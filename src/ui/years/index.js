const d3 = require('d3');

const computeYearsLayout = require('./layout'); 

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
      })
      .on('click', function (d) {
        
        var year = d.data.year;
        
        var filteredEntities = app.services.entityDataStore.applyFilter({
          'Quando sua organização surgiu?': [year],
        });
        var current = app.services.entityLinkFilter.get('_id') || [];
        
        if (!d.active) {
          /**
           * Flag indicating the year toggle status is active
           */
          d.active = true;
          
          app.services.entityLinkFilter.set(
            '_id',
            current.concat(filteredEntities.map(function (entity) {
              return entity._id;
            }))
          );
        } else {
          
          d.active = false;
          
          app.services.entityLinkFilter.set(
            '_id',
            current.filter(function (_id) {
              // pass only entities not in the filteredEntities array
              var shouldExit = filteredEntities.some(function (e) {
                return e._id === _id;
              });
              
              return !shouldExit;
            })
          );
        }
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
    updateActiveYears: function (activeYears, activeClassName) {
      activeClassName = activeClassName || 'active';
    
      arcContainer.selectAll('g.year-arc').each(function (d) {
        var isActive = activeYears.some(function (year) {
          return parseInt(d.data.year, 10) === parseInt(year.year, 10);
        });
        
        if (isActive) {
          d3.select(this).classed(activeClassName, true);
        } else {
          d3.select(this).classed(activeClassName, false);
        }
      });
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