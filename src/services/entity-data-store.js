
function EntityDataStore(entitiesData) {
  this.data = entitiesData;
}

EntityDataStore.prototype.query = function (query) {
  var filtered = this.data.filter(function (item) {
    
    var res = Object.keys(query).every(function (filterName) {
      
      var filterValue = query[filterName];
      
      if (Array.isArray(filterValue)) {
        
        var itemValues = item[filterName];
        
        if (!itemValues) {
          return false;
        } else {
          // check if itemValues contain ANY of the query's values
          return itemValues.some(function (itemV) {
            return filterValue.indexOf(itemV._id) !== -1;
          });
        }
      } else {
        // check if the item's value is equal to the query's value
        return item[filterName]._id === query[filterName];
      }
    });
    
    return res;
    
  });
  
  return filtered;
};

module.exports = EntityDataStore;
