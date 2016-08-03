const d3 = require('d3');
const dialogPolyfill = require('dialog-polyfill');

const aux = require('../auxiliary');

module.exports = function (app, options) {
  
  if (!options.entities) {
    throw new Error('entities is required');
  }
  
  var statsEl = document.querySelector('#stats');
  
  function renderStats(stats) {
    aux.renderBindings(statsEl, stats);
  }

  return {
    update: function (filteredEntities) {
      
      var percentage = (filteredEntities.length / options.entities.length) * 100;
      
      var stats = {
        percentage: percentage.toFixed(0),
        totalCount: options.entities.length,
        filteredCount: filteredEntities.length,
      };
      
      renderStats(stats);
    },
  }
};
