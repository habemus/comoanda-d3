const data = require('../data/data.json');

const entities         = data.entities;

const complexQuestions = data.questions;
const complexQuestionNames = complexQuestions.map(function (q) {
  return q._id;
});

const simpleQuestions = data.simpleQuestions.concat([{
  // make _id filterable
  _id: '_id',
}]);
/**
 * Array containing the simple question names
 */
const simpleQuestionNames = simpleQuestions.map(function (q) {
  return q._id;
});

function _questionType(filterName) {
  var isSimple = simpleQuestionNames.indexOf(filterName) !== -1;
  
  if (isSimple) {
    return 'simple';
  } else {
    var isComplex = complexQuestionNames.indexOf(filterName) !== -1;
    
    if (isComplex) {
      return 'complex';
    } else {
      return 'other';
    }
  }
}

function EntityDataStore(entitiesData) {
  this.data = entitiesData;
}

EntityDataStore.prototype.applyFilter = function (filter) {
  
  var filterNames = Object.keys(filter);
  
  console.log(filterNames);
  
  var results = this.data.filter(function (item) {
    
    // loop through filter properties
    var itemMatches = filterNames.every(function (filterName) {
      
      var filterType  = _questionType(filterName);
      
      // filterValue is always an array of possible values
      // to be checked against
      var filterValue = filter[filterName];
      var itemValue   = item[filterName];
      
      if (filterType === 'simple') {
        return filterValue.indexOf(itemValue) !== -1;
      } else if (filterType === 'complex') {
        
        if (!itemValue) {
          return false;
        } else {
          
          if (filterValue.length === 0) {
            // if filter is set to [] (empty array)
            // it means to select everything
            return true;
          } else {
            // check if itemValue contain ANY of the query's values
            return itemValue.some(function (value) {
              return filterValue.indexOf(value._id) !== -1;
            });
          }
        }
      }
    });
    
    return itemMatches;
  });
  
  return results;
};

// EntityDataStore.prototype.query = function (query) {
//   var filtered = this.data.filter(function (item) {
    
//     var res = Object.keys(query).every(function (filterName) {
      
//       var filterValue = query[filterName];
      
//       if (Array.isArray(filterValue)) {
        
//         var itemValues = item[filterName];
        
//         if (!itemValues) {
//           return false;
//         } else {
//           // check if itemValues contain ANY of the query's values
//           return itemValues.some(function (itemV) {
//             return filterValue.indexOf(itemV._id) !== -1;
//           });
//         }
//       } else {
//         // check if the item's value is equal to the query's value
//         return item[filterName]._id === query[filterName];
//       }
//     });
    
//     return res;
    
//   });
  
//   return filtered;
// };

module.exports = EntityDataStore;
