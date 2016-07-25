// own
const EntityDataStore = require('./entity-data-store');
const DataObj = require('data-obj');

const BRStateData = require('../data/br-state-data');

module.exports = function (app, options) {
  if (!options.entities) {
    throw new Error('entities is required');
  }
  
  app.services = {};
  
  app.services.filter = new DataObj({
    states: BRStateData.map(function (s) { return s.code; }),
  });
  
  app.services.entityDataStore = new EntityDataStore(options.entities);
  
  
};
