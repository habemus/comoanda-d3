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
  /**
  * Generators
  */
  var projection = d3.geoMercator()
    // brazil
    .center([-55, -10])
    .scale(300);
    
  var geoPath = d3.geoPath()
    .projection(projection);
  
  /**
   * Draw a group element that wraps all year-arcs
   */
  var mapContainer = app.svg
    .append('g')
    .attr('id', 'map-container')
    .attr('transform', function () {
      return 'translate(-' + (options.windowXCenter - 300) + ', -' + (options.windowYCenter - 200) + ')';
    });
  
  /**
   * Variable that stores the current map filter
   */
  var mapFilter = new DataObj({
    states: BRStateData.map(function (s) { return s.code; }),
  });
  
  d3.json('/src/data/br-states-simplified.json', function (err, geoData) {
    var states = topojson.feature(geoData, geoData.objects.states);
    
    var mapPaths = mapContainer.selectAll('path')
      .data(states.features);
    
    mapFilter.on('change', function () {
      mapContainer
        .selectAll('path')
        .attr('fill', function (d) {
          var stateCode = getStateCode(d.properties.name);
          var active = mapFilter.get('states').indexOf(stateCode) !== -1;
          
          return active ? 'red' : 'transparent';
        });
    });
    
    mapPaths.enter()
      .append('path')
      .attr('d', geoPath)
      .attr('fill', function (d) {
        var stateCode = getStateCode(d.properties.name);
        var active = mapFilter.get('states').indexOf(stateCode) !== -1;
        
        return active ? 'red' : 'transparent';
      })
      .attr('stroke', 'black')
      .on('click', function (d) {
        var stateCode = getStateCode(d.properties.name);
          
        // toggle the selected status of the filter
        var active = mapFilter.get('states').indexOf(stateCode) !== -1;
        
        if (active) {
          mapFilter.arrayRemove('states', stateCode);
        } else {
          mapFilter.arrayPush('states', stateCode);
        }
      })
  });
  
  return {
    filter: mapFilter,
  }
};