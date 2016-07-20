// own
const EntityDataStore = require('./entity-data-store');
const entities = require('../data/entities.json');
const questions = require('../data/questions.json');

module.exports = function (app, options) {
  app.services = {};
  
  app.services.entityDataStore = new EntityDataStore(entities);
  
  
};
