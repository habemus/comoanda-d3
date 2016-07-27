// third-party
const d3 = require('d3');

// data
const data = require('../data/data.json');

// own
const EntityDataStore = require('./entity-data-store');
const DataObj = require('data-obj');

const BRStateData = require('../data/br-state-data');

module.exports = function (app, options) {
  if (!options.entities) {
    throw new Error('entities is required');
  }
  
  app.services = {};
  
  var allYears = data.entities.reduce(function (result, entity) {
    if (typeof entity.ano === 'number' &&
        result.indexOf(entity.ano) === -1) {
      result.push(entity.ano);
    }
    
    return result;
  }, []);
  
  app.services.filter = new DataObj({
    estado: BRStateData.map(function (s) { return s.code; }),
    ano: allYears,
  });
  
  /**
   * Filters to be applied to links via the questions criteria
   */
  app.services.questionLinkFilter = new DataObj({});
  
  /**
   * Filters to be applied to links via the entities criteria
   */
  app.services.entityLinkFilter   = new DataObj({});
  
  app.services.entityDataStore = new EntityDataStore(options.entities);
  
  
};
