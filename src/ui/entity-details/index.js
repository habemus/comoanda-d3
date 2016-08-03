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
    aux.renderBindings(dialog, entity, {
      'Facebook da organização:': function (el, value, key) {
        if (value) {
          el.innerHTML = '<a target="_blank" href="' + value + '">facebook</a>';
        } else {
          el.innerHTML = '';
        }
      },
      'Site da organização:': function (el, value, key) {
        if (value) {
          el.innerHTML = '<a target="_blank" href="' + value + '">visitar site</a>';
        } else {
          el.innerHTML = '';
        }
      },
      'Com quais aspectos da mobilidade a pé sua organização trabalha ou como o tema está inserido na sua atuação?': function (el, value, key) {
        
        // remove the question part from the answers
        value = value.map(function (v) {
          var vsplit = v.split('--');
          
          return vsplit[1];
        });
        
        el.innerHTML = value.join(', ');
      }
    });
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
