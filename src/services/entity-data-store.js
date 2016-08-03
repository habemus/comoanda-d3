function EntityDataStore(entities, filterFns) {
  
  if (!entities) {
    throw new Error('entities is required');
  }
  
  this.filterFns = filterFns;
  this.entities  = entities;
}

EntityDataStore.prototype.applyFilter = function (filter) {
  
  var self = this;
 
  var filterProperties = Object.keys(filter);
  
  var results = self.entities.filter(function (item) {
    
    // loop through filter properties
    var itemMatches = filterProperties.every(function (filterProperty) {
      
      var filterFn = self.filterFns.find(function (f) {
        return f.properties.indexOf(filterProperty) !== -1;
      });
      
      if (!filterFn) {
        console.warn('unsupported filter property ', filterProperty);
        return false;
      }
      
      // filterValue is always an array of possible values
      // to be checked against
      var filterValue = filter[filterProperty];
      
      var isIn = filterFn.fn(filterValue, item, filterProperty);
      
      if (isIn === false) {
        // console.log(item['Estado:']);
        // console.log('is out', item);
      }
      
      return isIn;
      
      
      // var filterType  = self.getFilterType(filterProperty);
      
      // // filterValue is always an array of possible values
      // // to be checked against
      // var filterValue = filter[filterProperty];
      // var itemValue   = item[filterProperty];
      
      // if (filterType === 'basic') {
      //   return filterValue.indexOf(itemValue) !== -1;
      // } else if (filterType === 'complex') {
        
      //   if (!itemValue) {
      //     return false;
      //   } else {
      //     // check if itemValue contain ANY of the query's values
      //     return itemValue.some(function (value) {
      //       return filterValue.indexOf(value) !== -1;
      //     });
      //   }
      // } else {
      //   console.warn('unssoported filter type ', filterType);
      // }
    });
    
    return itemMatches;
  });
  
  return results;
};

module.exports = EntityDataStore;
