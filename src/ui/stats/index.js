const d3 = require('d3');
const dialogPolyfill = require('dialog-polyfill');

const entities = require('../../data/data.json').entities;

const aux = require('../auxiliary');

module.exports = function (app, options) {
  
  var statsEl = document.querySelector('#stats');
  
  function renderStats(stats) {
    aux.renderBindings(statsEl, stats);
  }

  return {
    update: function (filteredEntities) {
      
      var percentage = (filteredEntities.length / entities.length) * 100;
      
      var stats = {
        percentage: percentage.toFixed(0),
        totalCount: entities.length,
        filteredCount: filteredEntities.length,
      };
      
      renderStats(stats);
    },
  }
};
