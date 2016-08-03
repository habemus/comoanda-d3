const Bluebird = require('bluebird');

const aux = require('../auxiliary');

/**
 * Auxiliary function to loop through nodes
 */
function _each(nodes, fn) {
  Array.prototype.forEach.call(nodes, fn);
}

module.exports = function (app, options) {
  
  app.intro = {};
  
  /**
   * Setup elements
   */
  var elements = app.intro.elements = {};
  
  elements.overlay = document.querySelector('#intro-overlay');
  
  elements.container = document.querySelector('#intro-container');
  elements.imageContainer = document.querySelector('#intro-image-container');
  elements.textContainer = document.querySelector('#intro-text-container');
  elements.textScroller = 
    elements.textContainer.querySelector('#intro-text-scroller');
  elements.controls = document.querySelectorAll('.intro-control');
  elements.previous = document.querySelector('.previous');
  elements.next     = document.querySelector('.next');
  
  // render bindings
  aux.renderBindings(elements.container, {
    totalCount: options.entities.length
  });
  
  // event listeners
  elements.previous.addEventListener('click', function () {
    app.intro.gotoPrevious();
  });
  elements.next.addEventListener('click', function () {
    app.intro.gotoNext();
  });
  
  // keyboard arrows
  document.addEventListener('keydown', function (e) {
    // http://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript#5597114
    
    var keyCode = e.keyCode;
    if (keyCode === 37 || keyCode === 38) {
      // previous
      app.intro.gotoPrevious();
      
    } else if (keyCode === 39 || keyCode === 40) {
      // next
      app.intro.gotoNext();
    }
  });
  
  /**
   * Set current step to 0;
   */
  app.intro.currentStep = 0;
  
  /**
   * Flag that indicates whether the intro is 
   * in the middle of a transition.
   */
  app.intro.inTransition = false;
  
  /**
   * Navigates to the specified step
   */
  app.intro.gotoStep = function (step, force) {
    if ((step === app.intro.currentStep || app.intro.inTransition) && !force) {
      return;
    }
    
    var currStep = app.intro.steps[app.intro.currentStep];
    var destStep = app.intro.steps[step];
    
    if (!destStep) {
      throw new Error('step not found', step);
    }
    
    // set into transition
    app.intro.inTransition = true;
    
    // before starting, disable controls
    app.intro.toggleControls(false);
    
    var promise = (step === app.intro.currentStep) ?
      Bluebird.resolve() : Bluebird.resolve(currStep.leave());
    
    return promise.then(function () {
      return destStep.enter();
    })
    .then(function () {
      
      /**
       * Transition text
       */
      var destText = elements.textScroller.children[step];
      
      if (!destText) {
        console.warn('could not finf text for step ', step);
      }
      
      // remove 'current' class from all texts
      // except for the destText
      _each(elements.textScroller.children, function (el, index) {
        if (el === destText) {
          el.classList.add('current');
        } else {
          el.classList.remove('current');
        }
      });
      
      // move scroller
      var destTop    = destText.offsetTop;
      var destHeight     = destText.offsetHeight;
      var viewportHeight = elements.textContainer.offsetHeight;
      var translateY = -1 * (destTop - (viewportHeight - destHeight) /2);
      elements.textScroller.style.transform = 
        'translateY(' + translateY + 'px)';
        
      app.intro.currentStep = step;
      
      // terminate transition
      app.intro.inTransition = false;
      
      // re-enable controls
      app.intro.toggleControls(true);
    });
  };
  
  /**
   * Navigates to the previous step
   */
  app.intro.gotoPrevious = function () {
    
    if (app.intro.currentStep === 0) {
      throw new Error('no previous step')
    }
    
    return app.intro.gotoStep(app.intro.currentStep - 1);
  };
  
  /**
   * Navigates to the next step
   */
  app.intro.gotoNext = function () {
    if (app.intro.currentStep === app.intro.steps.length - 1) {
      // reached end, close intro
      app.intro.close();
      
    } else {
    
      return app.intro.gotoStep(app.intro.currentStep + 1);
      
    }
  };
  
  app.intro.toggleControls = function (enable) {
    
    if (app.intro.currentStep === 0) {
      elements.previous.classList.toggle('active', false);
      elements.next.classList.toggle('active', enable);
    } else {
      _each(elements.controls, function (el) {
        el.classList.toggle('active', enable);
      });
    }
  };
  
  app.intro.close = function () {
    elements.overlay.remove();
    elements.container.remove();
  };
  
  /**
   * Setup steps
   */
  app.intro.steps = require('./steps')(app, options);
  
  
  // bootstrap
  app.intro.gotoStep(0, true)
    .then(function () {
      console.log('done');
    })
    .catch(function (err) {
      console.warn(err);
    });
  
};