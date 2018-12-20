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
      
      // helps debugging
      // console.log(filteredEntities.length);
      // console.log(options.entities.length);
      
      
      // var out = options.entities.filter(function (ent) {
      //   return !filteredEntities.some(function (fent) {
      //     return ent['Qual o nome da organização da qual faz parte?'] === fent['Qual o nome da organização da qual faz parte?']
      //   });
      // });
      
      // out.forEach(function (e) {
      //   console.log(e['Quando sua organização surgiu?']);
      // });
      
      var percentage = (filteredEntities.length / options.entities.length) * 100;
      
      var stats = {
        percentage: percentage.toFixed(0),
        totalCount: options.entities.length,
        filteredCount: filteredEntities.length,
      };
      
      renderStats(stats);
    },
    
    hide: function () {
      statsEl.classList.toggle('hidden', true);
    },
    
    show: function () {
      statsEl.classList.toggle('hidden', false);
    }
  }
};
