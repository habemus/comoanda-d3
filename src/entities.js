const d3 = require('d3');

function computeEntitiesLayout(entities, options) {
  
  var startAngle = options.startAngle;
  var endAngle   = options.endAngle;
  var padAngle   = options.padAngle;
  
  if (typeof startAngle !== 'number') {
    throw new Error('startAngle is required');
  }
  if (typeof endAngle !== 'number') {
    throw new Error('endAngle is required');
  }
  if (typeof padAngle !== 'number') {
    throw new Error('padAngle is required');
  }
  
  // we must first group entities by state and sort them by city
  var states = d3.nest()
    .key(function (d) { return d.estado; })
    .entries(entities)
  
  // generate the state arcs
  var statesPieGen = d3.pie()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .padAngle(padAngle)
    .value(function (d) {
      return d.values.length;
    })
    .sortValues(d3.ascending);
  var stateArcs = statesPieGen(states);
  
  // generate the entity arcs
  var entityArcs = stateArcs.reduce(function (arcs, stateArc) {
    
    var entityPieGen = d3.pie()
      .startAngle(stateArc.startAngle + stateArc.padAngle)
      .endAngle(stateArc.endAngle - stateArc.padAngle)
      .value(function (d) {
        return 1;
      });
    var stateEntityArcs = entityPieGen(stateArc.data.values);
    
    return arcs.concat(stateEntityArcs);
    
  }, []);
  
  return {
    stateArcs: stateArcs,
    entityArcs: entityArcs,
  };
}

module.exports = function (container, options) {
  
  // SETUP
  
  // global variables
  var twoPI = (2 * Math.PI);
  var entitiesArcStartAngle = twoPI * 3/5;
  var entitiesArcEndAngle   = twoPI;
  
  /**
   * Generators
   */
  var drawEntityArc = d3.arc()
    .innerRadius(options.innerRadius)
    .outerRadius(options.outerRadius);
  
  /**
   * Draw the full entities arc
   */
  container.append('path')
    .attr('id', 'entities-bg-arc')
    .attr('d', drawEntityArc({
      startAngle: entitiesArcStartAngle,
      endAngle: entitiesArcEndAngle 
    }))
    .attr('fill', 'magenta');
  
  /**
   * Draw a group element that wraps all entity-arcs
   */
  var arcContainer = container
    .append('g')
    .attr('id', 'entity-arc-container');
  
  return function update(entities) {
    
    var entityLayout = computeEntitiesLayout(entities, {
      startAngle: entitiesArcStartAngle,
      endAngle: entitiesArcEndAngle,
      padAngle: twoPI / 600,
    });
    
    // bind data to DOM elements
    // ATTENTION: draw state arcs before entity arcs
    // so that entity arcs always appear over state arcs
    var stateArcs = arcContainer
      .selectAll('g.state-arc')
      .data(entityLayout.stateArcs);
    
    var entityArcs = arcContainer
      .selectAll('g.entity-arc')
      .data(entityLayout.entityArcs);
    
    //////////
    // ENTER
    var stateEnter = stateArcs
      .enter()
      .append('g')
      .attr('class', 'state-arc');
    stateEnter
      .append('path')
      .attr('d', drawEntityArc)
      .attr('fill', 'yellow');
    
    var entityEnter = entityArcs
      .enter()
      .append('g')
      .attr('class', 'entity-arc');
    entityEnter
      .append('path')
      .attr('d', drawEntityArc)
      .attr('fill', 'transparent')
      .attr('stroke', 'darkred');
  }
};