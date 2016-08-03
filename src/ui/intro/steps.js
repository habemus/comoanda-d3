const d3       = require('d3');
const Bluebird = require('bluebird');

function _each(nodes, fn) {
  Array.prototype.forEach.call(nodes, fn);
}

function wait(ms) {
  return new Bluebird(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

module.exports = function (app, options) {
  
  var elements = app.intro.elements;
  
  return [
    {
      name: 'initial',
      enter: function () {
        // hide all graph elements
        app.ui.stats.hide();
        app.ui.map.hide();
        
        // reset the controls
        app.ui.yearBrush.moveBrush([1936, 1937]);
        
        // select all entities and use 'byEntity' criteria for link filter
        app.services.entityLinkFilter.set(
          '_id',
          options.entities.map(function (e) {
            return e._id;
          })
        );
      },
      leave: function () {
        
        var illustrations = elements.imageContainer.querySelectorAll('img');
        
        _each(illustrations, function (illus, index) {
          var enterIn = index * 300;
          var leaveIn = (index + 1) * 400;
          
          setTimeout(function () {
            illus.classList.add('active');
          }, enterIn);
          
          setTimeout(function () {
            illus.classList.remove('active');
          }, leaveIn);
        });
        
        elements.imageContainer.querySelector('.floor').classList.add('walkable');
        
        return wait(2000);
      },
    },
    {
      name: 'little-was-done',
      enter: function () {
        
      },
      leave: function () {
        elements.overlay
          .classList.add('fade-away');
        
        elements.imageContainer.classList.add('fade-away');
        
        return wait(1000);
      },
    },
    {
      name: 'movement-starts',
      enter: function () {
        // remove the overlay
        elements.overlay.setAttribute('hidden', 'true');
        elements.imageContainer.style.display = 'none';
      },
      leave: function () {
        
      },
    },
    
    {
      name: '2013',
      enter: function () {
        var timePerYear = 5000 / (2013 - 1936);
        
        var startYear = 1937;
        var endYear   = 2013;
        
        var current = startYear;
        
        while (current < endYear) {
          
          setTimeout(
            app.ui.yearBrush.moveBrush.bind(
              app.ui.yearBrush,
              [1936, current]
            ),
            (current - startYear) * timePerYear
          );
          
          current += 1;
        }
        
      },
      leave: function () {
        
      },
    },
    {
      name: 'falta-de-visao-integrada',
      enter: function () {
        var startYear = 2013;
        var endYear   = 2016;
        
        var timePerYear = 2000 / (endYear - startYear);
        
        var current = startYear;
        
        while (current < endYear) {
          
          console.log((current - startYear) * timePerYear);
          
          setTimeout(
            app.ui.yearBrush.moveBrush.bind(
              app.ui.yearBrush,
              [1936, current]
            ),
            (current - startYear) * timePerYear
          );
          
          current += 1;
        }
      },
      leave: function () {
        
      }
    },
    {
      name: 'surge-o-comoanda',
      enter: function () {
        
        return wait(0)
          .then(function () {
            
            app.ui.questions.openQuestion(
              'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?');
            
            return wait(2000);
          })
          .then(function () {
            
            app.ui.questions.openQuestion(
              'Qual é a área de atuação da sua organização?');
              
            return wait(500);
          });
      },
      leave: function () {
        
      }
    },
    {
      name: 'o-que-e-o-comoanda',
      enter: function () {
        return wait(0)
          .then(function () {
            app.services.questionLinkFilter.set(
              'Qual é a área de atuação da sua organização?',
              [
                'Qual é a área de atuação da sua organização?--Arquitetura e urbanismo',
                'Qual é a área de atuação da sua organização?--Comunicação',
                'Qual é a área de atuação da sua organização?--Políticas públicas'
              ]
            );
            
            return wait(2000);
          })
          .then(function () {
            app.services.questionLinkFilter.set(
              'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?',
              [
                'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?--Educação e Cultura [disseminação, capacitação, intervenção artística, sensibilização]',
                'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?--Legislação e Políticas Públicas [produção e revisão de leis, planos e programas relacionados à mobilidade a pé]'
              ]
            );
          })
          
      },
      leave: function () {
        
      },
    },
    {
      name: '130',
      enter: function () {
        
        // show stats and map
        app.ui.stats.show();
        app.ui.map.show();
        
        // select all entities and use 'byEntity' criteria for link filter
        app.services.entityLinkFilter.set(
          '_id',
          options.entities.map(function (e) {
            return e._id;
          })
        );
      },
      leave: function () {},
    },
    {
      name: '',
      enter: function () {},
      leave: function () {},
    },
    {
      name: '',
      enter: function () {},
      leave: function () {},
    },
    {
      name: '',
      enter: function () {},
      leave: function () {},
    },
    {
      name: '',
      enter: function () {},
      leave: function () {},
    },
  ]
}