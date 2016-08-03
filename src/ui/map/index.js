const d3 = require('d3');
const topojson = require('topojson');
const DataObj = require('data-obj');

const BRStateData = require('../../data/br-state-data.json');

function getStateCode(stateName) {
  var stateData = BRStateData.find(function (state) {
    return state.name === stateName;
  });
  
  if (!stateData) {
    console.log('not found', stateName);
  }
  
  return stateData.code;
}

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
  * Generators
  */
  var projection = d3.geoMercator()
    // brazil
    .center([0, 0])
    .scale(300);
    
  var geoPath = d3.geoPath()
    .projection(projection);
  
  /**
   * Draw a group element that wraps all year-arcs
   */
  var mapContainer = app.svg
    .append('g')
    .attr('id', 'map-container')
    // .attr('transform', function () {
      
      
    //   return 'translate(-' + (options.windowXCenter - 300) + ', -' + (options.windowYCenter - 200) + ')';
    // });
  
  /**
   * Variable that stores the current map filter
   */
  var mapFilter = app.services.filter;
  
  d3.json(window.STATES_GEO_JSON_URL, function (err, geoData) {
    var states = topojson.feature(geoData, geoData.objects.states);
    
    var mapPaths = mapContainer.selectAll('path')
      .data(states.features);
    
    mapFilter.on('change', function () {
      mapContainer
        .selectAll('path')
        .attr('fill', function (d) {
          var stateCode = getStateCode(d.properties.name);
          var active = mapFilter.get('Estado:').indexOf(stateCode) !== -1;
          
          return active ? 'red' : 'transparent';
        });
    });
    
    mapPaths.enter()
      .append('path')
      .attr('class', 'active')
      .attr('d', geoPath)
      .attr('fill', function (d) {
        var stateCode = getStateCode(d.properties.name);
        var active = mapFilter.get('Estado:').indexOf(stateCode) !== -1;
        
        return active ? 'red' : 'transparent';
      })
      .attr('stroke', 'black')
      .on('click', function (d) {
        var stateCode = getStateCode(d.properties.name);
          
        // toggle the selected status of the filter
        var isCurrentlyActive =
          mapFilter.get('Estado:').indexOf(stateCode) !== -1;
        
        if (isCurrentlyActive) {
        
          d3.select(this).classed('active', false);
          mapFilter.arrayRemove('Estado:', stateCode);
        } else {
          
          d3.select(this).classed('active', true);
          mapFilter.arrayPush('Estado:', stateCode);
        }
      });
      
    // once the map has been rendered, put it into the right
    // place
    var mapContainerEl = document.querySelector('#map-container');
    var rect = mapContainerEl.getBoundingClientRect();
    
    mapContainer.attr('transform', function () {
      var targetTop  = (2 * options.centerY) - rect.height - 50;
      var targetLeft = 50;
      
      var dTop  = targetTop - rect.top;
      var dLeft = targetLeft - rect.left;
      
      return 'translate(' + dLeft + ',' + dTop + ')';
    });
  });
  
  return {
    filter: mapFilter,
  }
};