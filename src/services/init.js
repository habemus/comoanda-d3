// own
const EntityDataStore = require('./entity-data-store');

module.exports = function (app, options) {
  if (!options.entities) {
    throw new Error('entities is required');
  }
  
  app.services = {};
  
  app.services.entityDataStore = new EntityDataStore(options.entities);
  
  
};
