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
        
        // hide text
        app.ui.entities.hideText();
        app.ui.questions.hideText();
        
        // reset the controls
        app.ui.yearBrush.moveBrush([1936, 1937]);
        
        // select all entities and use 'byEntity' criteria for link filter
        app.services.entityLinkFilter.set(
          '_id',
          options.entities.map(function (e) {
            return e._id;
          })
        );
        
        
        // show only first illustration
        elements.imageContainer.querySelector('img')
          .classList.add('active');
        elements.imageContainer.querySelector('.floor')
          .classList.add('active');
      },
      leave: function () {
        
        var illustrations = elements.imageContainer.querySelectorAll('img');
        
        _each(illustrations, function (illus, index) {
          var enterIn = index * 500;
          var leaveIn = enterIn + 700;
          
          setTimeout(function () {
            illus.classList.add('active');
          }, enterIn);
          
          setTimeout(function () {
            illus.classList.remove('active');
          }, leaveIn);
        });
        
        elements.imageContainer.querySelector('.floor').classList.add('walkable');
        
        return wait(3000);
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
        
        return wait(3000);
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
        
        return wait(7000)
          .then(function () {
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
            
            return wait(5000);
          });
      },
      leave: function () {
        
      },
    },
    {
      name: 'falta-de-visao-integrada',
      enter: function () {
        
        return wait(5000)
          .then(function () {
            
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
            
            return wait(1000);
          })
      },
      leave: function () {
        
      }
    },
    {
      name: 'surge-o-comoanda',
      enter: function () {
        
        return wait(3000)
          .then(function () {
            elements.menu.classList.toggle('is-visible', true);
            
            return wait(500);
          });
      },
      leave: function () {
        
      }
    },
    {
      name: 'quem-sao-e-como-atuam',
      enter: function () {
        
        elements.textContainer.classList.toggle('opaque', true);
        
        return wait(7000)
          .then(function () {
            app.ui.entities.showText();
            return wait(3000);
          })
          .then(function () {
            app.ui.questions.showText();
            
            return wait(1000);
          })
          
      },
      leave: function () {
        
      },
    },
    {
      name: 'x-orgs-em-y-estados-do-brasil',
      enter: function () {
        
        return wait(3000)
          .then(function () {
            app.ui.map.show();
            
            return wait(1000);
          });
      },
      leave: function () {},
    },
    {
      name: 'descubra-a-situacao-das-organizacoes',
      enter: function () {
        
        return wait(8000)
          .then(function () {
            // open criteria
            app.ui.questions.openQuestion(
              'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?');
            
            return wait(2000)
          })
          .then(function () {
            
            app.ui.questions.openQuestion(
              'Qual é a área de atuação da sua organização?');
            
            return wait(3000);
          })
          .then(function () {
            // deselect one by one all options for
            // 'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?'
            
            var question = 'Qual a abordagem da sua organização sobre o tema da mobilidade a pé?';
            
            var current = app.services.questionLinkFilter.get(question);
            
            // invert order of removal
            current = current.concat([]);
            current.reverse();
            
            current.forEach(function (opt, index) {
              
              setTimeout(function () {
                app.services.questionLinkFilter.arrayRemove(question, opt);
              }, index * 500);
              
            });
            
            return wait(current.length * 500 + 2000);
          })
          .then(function () {
            // select only 'Cidade Ativa'
            app.services.entityLinkFilter.set('_id', [
              'Cidade Ativa'.replace(/\W+/g, '-').toLowerCase(),
            ]);
            return wait(2000);
          })
          .then(function () {
            app.services.entityLinkFilter.set('_id', [
              'Cidade Ativa'.replace(/\W+/g, '-').toLowerCase(),
              'Corrida Amiga'.replace(/\W+/g, '-').toLowerCase(),
            ]);
            
            return wait(5000);
          })
          .then(function () {
            app.ui.stats.show();
            
            return wait(3000);
          });
        
      },
      leave: function () {},
    },
    {
      name: 'end',
      enter: function () {},
      leave: function () {},
    },
  ]
}