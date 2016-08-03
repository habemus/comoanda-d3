const d3 = require('d3');

exports.arcTextFontSize = function (options) {
  
  if (!options.radius) {
    throw new Error('radius is required');
  }
  
  var twoPI = 2 * Math.PI;
  
  return function calcFontSize(d) {
    var angleSpan = d.endAngle - d.startAngle;
    var circumference = twoPI * options.radius;
    
    var size = (angleSpan / twoPI) * circumference * 1.2;
    
    if (options.min) {
      size = d3.max([options.min, size]);
    }
    
    if (options.max) {
      size = d3.min([options.max, size]);
    }
    
    return size + 'px';
  };
};

exports.arcTextAnchor = function (options) {
  return function calcTextAnchor(d) {
    var midAngle = (d.startAngle + d.endAngle) / 2;
    return midAngle > Math.PI ? 'end' : null;
  }
};

exports.arcTextTransform = function (options) {
  if (!options.radius) {
    throw new Error('radius is required');
  }
  
  return function(d) {
    
    var midAngle = (d.startAngle + d.endAngle) / 2;
    
    return 'rotate(' + (midAngle * 180 / Math.PI - 90) + ')'
        + 'translate(' + (options.radius) + ')'
        + (midAngle > Math.PI ? 'rotate(180)' : '');
  }
}

exports.renderBindings = function (wrapperElement, data, bindFns) {
  var boundElements = wrapperElement.querySelectorAll('[data-bind]');
  var bindFns = bindFns || {};
  
  Array.prototype.forEach.call(boundElements, function (el) {
    var key = el.getAttribute('data-bind');
    
    var value = data[key];
    
    if (bindFns[key]) {
      bindFns[key](el, value, key);
    } else {
      // use default binding fn
      value = Array.isArray(value) ? value.join(', ') : value;
      el.innerHTML = value;
    }
    
  });
};
