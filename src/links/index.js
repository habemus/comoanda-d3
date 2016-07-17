const d3 = require('d3');

module.exports = function (app, options) {
  
  /**
   * Computes an item's position.
   * Delegates the actual position computation
   * to the corresponding ui component
   */
  function computeItemPosition(type, item) {
    if (!type) {
      throw new Error('type is required');
    }
    if (!item) {
      throw new Error('item is required');
    }
    
    switch (type) {
      case 'question':
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
    if (!link[0]) {
      throw new Error('from is required');
    }
    if (!link[1]) {
      throw new Error('to is required');
    }
    
    var positions = link.map(function (item) {
      return computeItemPosition(item.type, item);
    });
    
    return positions;
  }
  
  
  // SETUP
  var twoPI = (2 * Math.PI);
  
  /**
  * Generators
  */
  // var drawLinkLine = d3.line()
  //   .x(function (d) {
  //     return Math.sin(d.angle) * d.radius;
  //   })
  //   .y(function (d) {
  //     return -1 * Math.cos(d.angle) * d.radius;
  //   });
  var drawLinkLine = d3.radialLine()
    .angle(function (d) {
      return d.angle;
    })
    .radius(function (d) {
      return d.radius;
    })
    .curve(d3.curveBundle.beta(1))
  
  /**
   * Draw a group element that wraps all link-lines
   */
  var linkLineContainer = app.container
    .append('g')
    .attr('id', 'link-line-container');
  
  
  function update(links) {
    
    var linkLineLayout = links.map(function (link) {
      var lineData = computeLinkPositions(link);
      
      lineData.link = link;
      
      // insert a posistion in the middle
      // in order to cause the tension
      lineData.splice(1, 0, {
        angle: 0,
        radius: 0,
      });
      
      return lineData
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
          d.link[0].type,
          d.link[0].name,
          d.link[1].type,
          d.link[1].name
        ].join('-');
      });
      
    //////////
    // ENTER
    var linkEnter = linkLines
      .enter()
      .append('g')
      .attr('class', 'link-line');
    linkEnter
      .append('path')
      .attr('d', drawLinkLine)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('opacity', 0.2);
      
    //////
    // EXIT
    var linkExit = linkLines
      .exit()
      .remove();
  }
  
  return {
    update: update
  };
};