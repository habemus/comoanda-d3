// third-party
const d3 = require('d3');

// own
const EntityDataStore = require('./entity-data-store');
const DataObj = require('data-obj');
const BRStateData = require('../data/br-state-data.json');

module.exports = function (app, options) {
  if (!options.entities) {
    throw new Error('entities is required');
  }
  if (!options.displayQuestions) {
    throw new Error('displayQuestions is required');
  }
  
  app.services = {};
  
  app.services.filter = new DataObj({
    'Estado:': BRStateData.map(function (s) { return s.code; }),
    yearRange: d3.extent(options.entities, function (d) {
      return parseInt(d['Quando sua organização surgiu?'], 10);
    }),
  });
  
  /**
   * Filters to be applied to links via the questions criteria
   */
  app.services.questionLinkFilter = new DataObj({});
  
  /**
   * Filters to be applied to links via the entities criteria
   */
  app.services.entityLinkFilter = new DataObj({});
  
  app.services.entityDataStore = new EntityDataStore(options.entities, [
    
    {
      properties: options.displayQuestions.map(function (q) {
        return q._id;
      }),
      fn: function (filterValue, item, prop) {
        
        var itemValue = item[prop];
        
        if (!itemValue) {
          return false;
        } else {
          // check if itemValue contain ANY of the query's values
          return itemValue.some(function (value) {
            return filterValue.indexOf(value) !== -1;
          });
        }
      }
    },
    
    {
      properties: [
        '_id',
        'Estado:',
        'Quando sua organização surgiu?',
      ],
      
      fn: function (filterValue, item, prop) {
        
        var itemValue = item[prop];
        
        if (!itemValue) {
          return true;
        }
        
        return filterValue.indexOf(itemValue) !== -1;
      }
    },
    
    {
      properties: [
        'yearRange',
      ],
      
      fn: function (filterValue, item, prop) {
        
        var itemValue = item['Quando sua organização surgiu?'];
        
        if (!filterValue) {
          return true;
        }
        
        if (!itemValue) {
          return false;
        }
        
        var rangeStart = parseInt(filterValue[0], 10);
        var rangeEnd   = parseInt(filterValue[1], 10);
        itemValue = parseInt(itemValue, 10);
        
        return itemValue >= rangeStart && itemValue <= rangeEnd;
      }
    }
    
  ]);
  
};
