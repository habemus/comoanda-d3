const d3 = require('d3');

module.exports = function computeYearsLayout(years, options) {
  /**
   * Start and End angles for the
   * full questionsData arc.
   */
  var startAngle = options.startAngle;
  var endAngle   = options.endAngle;
  
  if (typeof startAngle !== 'number') {
    throw new Error('startAngle is required');
  }
  if (typeof endAngle !== 'number') {
    throw new Error('endAngle is required');
  }
  
  // generate the state arcs
  var yearPieGen = d3.pie()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .value(function (d) {
      return 1;
    })
    .sort(function (a, b) {
      return d3.descending(a.year, b.year);
    });
  
  return yearPieGen(years);
};
