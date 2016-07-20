const d3 = require('d3');

module.exports = function (app, options) {
  
  /**
   * Computes an item's position.
   * Delegates the actual position computation
   * to the corresponding ui component
   */
  function computeItemPosition(item) {
    switch (item.type) {
      case 'question-option':
        return app.ui.questions.computeItemPosition(item);
        break;
      case 'entity':
        return app.ui.entities.computeItemPosition(item);
        break;
      case 'year':
        return app.ui.years.computeItemPosition(item);
        break;
    }
  }
  
  /**
   * transforms the link into mathematical data
   */
  function computeLinkPositions(link) {
    var positions = [
      computeItemPosition(link.from),
      computeItemPosition(link.to)
    ];
    
    return positions;
  }
  
  
  // SETUP
  var twoPI = (2 * Math.PI);
  
  /**
  * Generators
  */
  var drawLinkLine = d3.radialLine()
    .angle(function (d) {
      return d.angle;
    })
    .radius(function (d) {
      return d.radius;
    })
    .curve(d3.curveBundle.beta(.7))
  
  /**
   * Draw a group element that wraps all link-lines
   */
  var linkLineContainer = app.container
    .append('g');
    
  /**
   * Stores currently used layout
   */
  var uiCurrentLinks;
  
  function update(links) {
    
    // let it use the previous link data if no links are passed
    links = links || uiCurrentLinks || [];
    
    uiCurrentLinks = links;
    
    var linkLineLayout = links.map(function (link) {
      /**
       * Enforce link structure
       */
      if (!link.from) {
        throw new TypeError('link.from is required');
      }
      
      if (!link.to) {
        throw new TypeError('link.to is required');
      }
      
      var lineData = computeLinkPositions(link);
      
      lineData.link = link;
      
      // insert a posistion in the middle
      // in order to cause the tension
      lineData.splice(1, 0, {
        angle: 0,
        radius: 0,
      });
      
      return lineData;
    })
    .filter(function (lineData) {
      // filter out incomplete links
      if (!lineData[0]) {
        console.warn('from anchor missing', lineData);
        return false;
      }
      
      if (!lineData[lineData.length - 1]) {
        console.warn('to anchor missing', lineData);
        return false;
      }
      
      return true;
    });
    
    console.log(linkLineLayout)
    
    // before binding new data, save the old data onto DOM Elements
    // so that we may access them later for tweening
    linkLineContainer.selectAll('g.link-line path')
      .each(function (d, i) {
        this.__previousData = d;
      });
    
    // bind data to DOM elements
    var linkLines = linkLineContainer
      .selectAll('g.link-line')
      .data(linkLineLayout, function getLineKey(d) {
        return [
          d.link.from.type,
          d.link.from.name,
          d.link.to.type,
          d.link.to.name
        ].join('-');
      });
    
    //////////
    // UPDATE
    linkLineContainer.selectAll('g.link-line')
      .select('path')
      .transition()
      .duration(400)
      .attrTween('d', function (d, i) {
        var previous = this.__previousData;
        
        // OUR LINES HAVE 3 POINTS:
        // FROM
        // MIDDLE
        // TO
        
        var interpolateFromAngle = d3.interpolate(
          previous[0].angle,
          d[0].angle
        );
        
        var interpolateToAngle = d3.interpolate(
          previous[2].angle,
          d[2].angle
        );
        
        return function (t) {
          
          var lineData = [
            {
              radius: d[0].radius,
              angle: interpolateFromAngle(t)
            },
            {
              radius: d[1].radius,
              angle: d[1].radius,
            },
            {
              radius: d[2].radius,
              angle: interpolateToAngle(t)
            }
          ];
          
          return drawLinkLine(lineData);
        };
      });
    
    //////////
    // ENTER
    var linkEnter = linkLines
      .enter()
      .append('g')
      .attr('class', 'link-line')
      .each(function activateTarget(d) {
        var target = d.link.to;
        
        if (target.type === 'entity') {
          app.ui.entities.activate(target);
        } else if (target.type === 'year') {
          app.ui.years.activate(target);
        } else if (target.type === 'question-option') {
          app.ui.questions.activate(target);
        }
      });
    linkEnter
      .append('path')
      .attr('d', drawLinkLine)
      .attr('fill', 'none')
      .attr('stroke', '#A9CE90')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);
      
    //////
    // EXIT
    var linkExit = linkLines
      .exit()
      .each(function deactivateTarget(d) {
        var target = d.link.to;
        
        if (target.type === 'entity') {
          app.ui.entities.deactivate(target);
        } else if (target.type === 'year') {
          app.ui.years.deactivate(target);
        } else if (target.type === 'question-option') {
          app.ui.questions.deactivate(target);
        }
      })
      .remove();
  }
  
  return {
    update: update,
    
    computeLinks: function (entities, questionOptions) {
      // build links
      var links = entities.reduce(function (acc, entity) {
        
        // get the entity links among
        // the questionOptions
        entityActiveOptions = questionOptions.filter(function (option) {
          var entityValue = entity[option.question._id];
          
          if (!entityValue) {
            return false;
          }
          
          return entityValue.some(function (v) {
            return v._id === option._id;
          });
        });
        
        return acc.concat(entityActiveOptions.map(function (option) {
          return {
            from: Object.assign({ type: 'question-option' }, option),
            to: Object.assign({ type: 'entity' }, entity),
          }
        }));
      }, []);
      
      return links;
    }
  };
};