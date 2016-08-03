const d3 = require('d3');

module.exports = function computeEntitiesLayout(entities, options) {
  
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
    .key(function (d) { return d['Estado:']; })
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
      })
      .sort(function (e1, e2) {
        var name1 = e1['Qual o nome da organização da qual faz parte?'];
        var name2 = e2['Qual o nome da organização da qual faz parte?'];
        
        // return descending results, as it will be rendered on
        // the left side of the circular chart
        return name1 < name2 ? 1 : -1;
      });
    var stateEntityArcs = entityPieGen(stateArc.data.values);
    
    return arcs.concat(stateEntityArcs);
    
  }, []);
  
  return {
    stateArcs: stateArcs,
    entityArcs: entityArcs,
  };
};
