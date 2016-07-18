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
    .append('g')
    .attr('id', 'link-line-container');
  
  
  function update(links) {
    
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
    update: update
  };
};