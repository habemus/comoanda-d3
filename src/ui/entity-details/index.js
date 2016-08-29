const d3 = require('d3');
const dialogPolyfill = require('dialog-polyfill');

const aux = require('../auxiliary');

const orgFbWebsites = require('../../data/org-fb-websites.json');

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
        
        var orgName = entity['Qual o nome da organização da qual faz parte?'];
        
        value = value || orgFbWebsites[orgName].fb;

        if (value) {
          el.innerHTML = '<a target="_blank" href="' + value + '">facebook</a>';
        } else {
          el.innerHTML = '';
        }
      },
      'Site da organização:': function (el, value, key) {
        
        var orgName = entity['Qual o nome da organização da qual faz parte?'];
      
        value = value || orgFbWebsites[orgName].website;
        
        if (value) {
          el.innerHTML = '<a target="_blank" href="' + value + '">visitar site</a>';
        } else {
          el.innerHTML = '';
        }
      },
      'Com quais aspectos da mobilidade a pé sua organização trabalha ou como o tema está inserido na sua atuação?': function (el, value, key) {
        
        var bracketsRegExp = /\s*\[.+\]/;
        
        // remove the question part from the answers
        value = value.map(function (v) {
          var vsplit = v.split('--');
          
          return vsplit[1].replace(bracketsRegExp, '');
        });
        
        el.innerHTML = value.join(', ');
      },
      'Mobilidade a pé é o foco principal da sua organização?': function (el, value, key) {
        
        var questionRegExp = /^.+--/;
        
        // remove the question from the response
        var response = value = value[0].replace(questionRegExp, '');
        
        var texts = {
          'Não, mas uma das principais iniciativas da organização trata do tema': 'A mobilidade a pé não é o foco principal da organização, mas uma das principais iniciativas da organização trata do tema.',
          'Sim': 'Mobilidade a pé é o foco principal da organização.',
          'Não, a mobilidade a pé é apenas um dos temas abordados, mas aparece sempre em um contexto mais amplo': 'A mobilidade a pé não é o foco principal da organização. É apenas um dos temas abordados, mas aparece sempre em um contexto mais amplo.'
        };
        
        var displayValue = texts[response];
        
        el.innerHTML = texts[value];
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
