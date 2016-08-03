const d3 = require('d3');
const dialogPolyfill = require('dialog-polyfill');

const aux = require('../auxiliary');

module.exports = function (app, options) {
  
  if (!options.entities) {
    throw new Error('entities is required');
  }
  
  var dialog = document.querySelector('#entity-details');
  
  dialogPolyfill.registerDialog(dialog);
  
  dialog.addEventListener('close', function clearEntityData() {
    var dataElements = dialog.querySelectorAll('[data-bind]');
    
    Array.prototype.forEach.call(dataElements, function (el) {
      el.innerHTML = '';
    });
  });
  
  function renderEntityData(entity) {
    aux.renderBindings(dialog, entity);
  }
  

  return {
    show: function (entityId) {
      
      var entity = options.entities.find(function (e) {
        return e._id === entityId;
      });
      
      renderEntityData(entity);
      
      // Now dialog acts like a native <dialog>. 
      dialog.showModal();
    }
  }
};
