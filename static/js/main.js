/*!
 * modernizr v3.3.1
 * Build https://modernizr.com/download?-inlinesvg-oninput-peerconnection-dontmin
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in the
 * current UA and makes the results available to you in two ways: as properties on
 * a global `Modernizr` object, and as classes on the `<html>` element. This
 * information allows you to progressively enhance your pages with a granular level
 * of control over the experience.
*/

;(function(window, document, undefined){
  /**
   * docElement is a convenience wrapper to grab the root element of the document
   *
   * @access private
   * @returns {HTMLElement|SVGElement} The root element of the document
   */

  var docElement = document.documentElement;
  

  var tests = [];
  

  /**
   *
   * ModernizrProto is the constructor for Modernizr
   *
   * @class
   * @access public
   */

  var ModernizrProto = {
    // The current version, dummy
    _version: '3.3.1',

    // Any settings that don't work as separate modules
    // can go in here as configuration.
    _config: {
      'classPrefix': '',
      'enableClasses': true,
      'enableJSClass': true,
      'usePrefixes': true
    },

    // Queue of tests
    _q: [],

    // Stub these for people who are listening
    on: function(test, cb) {
      // I don't really think people should do this, but we can
      // safe guard it a bit.
      // -- NOTE:: this gets WAY overridden in src/addTest for actual async tests.
      // This is in case people listen to synchronous tests. I would leave it out,
      // but the code to *disallow* sync tests in the real version of this
      // function is actually larger than this.
      var self = this;
      setTimeout(function() {
        cb(self[test]);
      }, 0);
    },

    addTest: function(name, fn, options) {
      tests.push({name: name, fn: fn, options: options});
    },

    addAsyncTest: function(fn) {
      tests.push({name: null, fn: fn});
    }
  };

  

  // Fake some of Object.create so we can force non test results to be non "own" properties.
  var Modernizr = function() {};
  Modernizr.prototype = ModernizrProto;

  // Leak modernizr globally when you `require` it rather than force it here.
  // Overwrite name so constructor name is nicer :D
  Modernizr = new Modernizr();

  

  var classes = [];
  

  /**
   * is returns a boolean if the typeof an obj is exactly type.
   *
   * @access private
   * @function is
   * @param {*} obj - A thing we want to check the type of
   * @param {string} type - A string to compare the typeof against
   * @returns {boolean}
   */

  function is(obj, type) {
    return typeof obj === type;
  }
  ;

  /**
   * Run through all tests and detect their support in the current UA.
   *
   * @access private
   */

  function testRunner() {
    var featureNames;
    var feature;
    var aliasIdx;
    var result;
    var nameIdx;
    var featureName;
    var featureNameSplit;

    for (var featureIdx in tests) {
      if (tests.hasOwnProperty(featureIdx)) {
        featureNames = [];
        feature = tests[featureIdx];
        // run the test, throw the return value into the Modernizr,
        // then based on that boolean, define an appropriate className
        // and push it into an array of classes we'll join later.
        //
        // If there is no name, it's an 'async' test that is run,
        // but not directly added to the object. That should
        // be done with a post-run addTest call.
        if (feature.name) {
          featureNames.push(feature.name.toLowerCase());

          if (feature.options && feature.options.aliases && feature.options.aliases.length) {
            // Add all the aliases into the names list
            for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
              featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
            }
          }
        }

        // Run the test, or use the raw value if it's not a function
        result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


        // Set each of the names on the Modernizr object
        for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
          featureName = featureNames[nameIdx];
          // Support dot properties as sub tests. We don't do checking to make sure
          // that the implied parent tests have been added. You must call them in
          // order (either in the test, or make the parent test a dependency).
          //
          // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
          // hashtag famous last words
          featureNameSplit = featureName.split('.');

          if (featureNameSplit.length === 1) {
            Modernizr[featureNameSplit[0]] = result;
          } else {
            // cast to a Boolean, if not one already
            /* jshint -W053 */
            if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
              Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
            }

            Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
          }

          classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
        }
      }
    }
  }
  ;

  /**
   * A convenience helper to check if the document we are running in is an SVG document
   *
   * @access private
   * @returns {boolean}
   */

  var isSVG = docElement.nodeName.toLowerCase() === 'svg';
  

  /**
   * createElement is a convenience wrapper around document.createElement. Since we
   * use createElement all over the place, this allows for (slightly) smaller code
   * as well as abstracting away issues with creating elements in contexts other than
   * HTML documents (e.g. SVG documents).
   *
   * @access private
   * @function createElement
   * @returns {HTMLElement|SVGElement} An HTML or SVG element
   */

  function createElement() {
    if (typeof document.createElement !== 'function') {
      // This is the case in IE7, where the type of createElement is "object".
      // For this reason, we cannot call apply() as Object is not a Function.
      return document.createElement(arguments[0]);
    } else if (isSVG) {
      return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
    } else {
      return document.createElement.apply(document, arguments);
    }
  }

  ;
/*!
{
  "name": "Inline SVG",
  "property": "inlinesvg",
  "caniuse": "svg-html5",
  "tags": ["svg"],
  "notes": [{
    "name": "Test page",
    "href": "https://paulirish.com/demo/inline-svg"
  }, {
    "name": "Test page and results",
    "href": "https://codepen.io/eltonmesquita/full/GgXbvo/"
  }],
  "polyfills": ["inline-svg-polyfill"],
  "knownBugs": ["False negative on some Chromia browsers."]
}
!*/
/* DOC
Detects support for inline SVG in HTML (not within XHTML).
*/

  Modernizr.addTest('inlinesvg', function() {
    var div = createElement('div');
    div.innerHTML = '<svg/>';
    return (typeof SVGRect != 'undefined' && div.firstChild && div.firstChild.namespaceURI) == 'http://www.w3.org/2000/svg';
  });


  /**
   * Modernizr.hasEvent() detects support for a given event
   *
   * @memberof Modernizr
   * @name Modernizr.hasEvent
   * @optionName Modernizr.hasEvent()
   * @optionProp hasEvent
   * @access public
   * @function hasEvent
   * @param  {string|*} eventName - the name of an event to test for (e.g. "resize")
   * @param  {Element|string} [element=HTMLDivElement] - is the element|document|window|tagName to test on
   * @returns {boolean}
   * @example
   *  `Modernizr.hasEvent` lets you determine if the browser supports a supplied event.
   *  By default, it does this detection on a div element
   *
   * ```js
   *  hasEvent('blur') // true;
   * ```
   *
   * However, you are able to give an object as a second argument to hasEvent to
   * detect an event on something other than a div.
   *
   * ```js
   *  hasEvent('devicelight', window) // true;
   * ```
   *
   */

  var hasEvent = (function() {

    // Detect whether event support can be detected via `in`. Test on a DOM element
    // using the "blur" event b/c it should always exist. bit.ly/event-detection
    var needsFallback = !('onblur' in document.documentElement);

    function inner(eventName, element) {

      var isSupported;
      if (!eventName) { return false; }
      if (!element || typeof element === 'string') {
        element = createElement(element || 'div');
      }

      // Testing via the `in` operator is sufficient for modern browsers and IE.
      // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
      // "resize", whereas `in` "catches" those.
      eventName = 'on' + eventName;
      isSupported = eventName in element;

      // Fallback technique for old Firefox - bit.ly/event-detection
      if (!isSupported && needsFallback) {
        if (!element.setAttribute) {
          // Switch to generic element if it lacks `setAttribute`.
          // It could be the `document`, `window`, or something else.
          element = createElement('div');
        }

        element.setAttribute(eventName, '');
        isSupported = typeof element[eventName] === 'function';

        if (element[eventName] !== undefined) {
          // If property was created, "remove it" by setting value to `undefined`.
          element[eventName] = undefined;
        }
        element.removeAttribute(eventName);
      }

      return isSupported;
    }
    return inner;
  })();


  ModernizrProto.hasEvent = hasEvent;
  

  /**
   * getBody returns the body of a document, or an element that can stand in for
   * the body if a real body does not exist
   *
   * @access private
   * @function getBody
   * @returns {HTMLElement|SVGElement} Returns the real body of a document, or an
   * artificially created element that stands in for the body
   */

  function getBody() {
    // After page load injecting a fake body doesn't work so check if body exists
    var body = document.body;

    if (!body) {
      // Can't use the real body create a fake one.
      body = createElement(isSVG ? 'svg' : 'body');
      body.fake = true;
    }

    return body;
  }

  ;

  /**
   * injectElementWithStyles injects an element with style element and some CSS rules
   *
   * @access private
   * @function injectElementWithStyles
   * @param {string} rule - String representing a css rule
   * @param {function} callback - A function that is used to test the injected element
   * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
   * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
   * @returns {boolean}
   */

  function injectElementWithStyles(rule, callback, nodes, testnames) {
    var mod = 'modernizr';
    var style;
    var ret;
    var node;
    var docOverflow;
    var div = createElement('div');
    var body = getBody();

    if (parseInt(nodes, 10)) {
      // In order not to give false positives we create a node for each test
      // This also allows the method to scale for unspecified uses
      while (nodes--) {
        node = createElement('div');
        node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
        div.appendChild(node);
      }
    }

    style = createElement('style');
    style.type = 'text/css';
    style.id = 's' + mod;

    // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
    // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
    (!body.fake ? div : body).appendChild(style);
    body.appendChild(div);

    if (style.styleSheet) {
      style.styleSheet.cssText = rule;
    } else {
      style.appendChild(document.createTextNode(rule));
    }
    div.id = mod;

    if (body.fake) {
      //avoid crashing IE8, if background image is used
      body.style.background = '';
      //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
      body.style.overflow = 'hidden';
      docOverflow = docElement.style.overflow;
      docElement.style.overflow = 'hidden';
      docElement.appendChild(body);
    }

    ret = callback(div, rule);
    // If this is done after page load we don't want to remove the body so check if body exists
    if (body.fake) {
      body.parentNode.removeChild(body);
      docElement.style.overflow = docOverflow;
      // Trigger layout so kinetic scrolling isn't disabled in iOS6+
      docElement.offsetHeight;
    } else {
      div.parentNode.removeChild(div);
    }

    return !!ret;

  }

  ;

  /**
   * testStyles injects an element with style element and some CSS rules
   *
   * @memberof Modernizr
   * @name Modernizr.testStyles
   * @optionName Modernizr.testStyles()
   * @optionProp testStyles
   * @access public
   * @function testStyles
   * @param {string} rule - String representing a css rule
   * @param {function} callback - A function that is used to test the injected element
   * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
   * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
   * @returns {boolean}
   * @example
   *
   * `Modernizr.testStyles` takes a CSS rule and injects it onto the current page
   * along with (possibly multiple) DOM elements. This lets you check for features
   * that can not be detected by simply checking the [IDL](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Interface_development_guide/IDL_interface_rules).
   *
   * ```js
   * Modernizr.testStyles('#modernizr { width: 9px; color: papayawhip; }', function(elem, rule) {
   *   // elem is the first DOM node in the page (by default #modernizr)
   *   // rule is the first argument you supplied - the CSS rule in string form
   *
   *   addTest('widthworks', elem.style.width === '9px')
   * });
   * ```
   *
   * If your test requires multiple nodes, you can include a third argument
   * indicating how many additional div elements to include on the page. The
   * additional nodes are injected as children of the `elem` that is returned as
   * the first argument to the callback.
   *
   * ```js
   * Modernizr.testStyles('#modernizr {width: 1px}; #modernizr2 {width: 2px}', function(elem) {
   *   document.getElementById('modernizr').style.width === '1px'; // true
   *   document.getElementById('modernizr2').style.width === '2px'; // true
   *   elem.firstChild === document.getElementById('modernizr2'); // true
   * }, 1);
   * ```
   *
   * By default, all of the additional elements have an ID of `modernizr[n]`, where
   * `n` is its index (e.g. the first additional, second overall is `#modernizr2`,
   * the second additional is `#modernizr3`, etc.).
   * If you want to have more meaningful IDs for your function, you can provide
   * them as the fourth argument, as an array of strings
   *
   * ```js
   * Modernizr.testStyles('#foo {width: 10px}; #bar {height: 20px}', function(elem) {
   *   elem.firstChild === document.getElementById('foo'); // true
   *   elem.lastChild === document.getElementById('bar'); // true
   * }, 2, ['foo', 'bar']);
   * ```
   *
   */

  var testStyles = ModernizrProto.testStyles = injectElementWithStyles;
  
/*!
{
  "name": "onInput Event",
  "property": "oninput",
  "notes": [{
    "name": "MDN article",
    "href": "https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers.oninput"
  },{
    "name": "WHATWG spec",
    "href": "https://html.spec.whatwg.org/multipage/forms.html#common-input-element-attributes"
  },{
    "name": "Detecting onInput support",
    "href": "http://danielfriesen.name/blog/2010/02/16/html5-browser-maze-oninput-support"
  }],
  "authors": ["Patrick Kettner"],
  "tags": ["event"]
}
!*/
/* DOC
`oninput` tests if the browser is able to detect the input event
*/


  Modernizr.addTest('oninput', function() {
    var input = createElement('input');
    var supportsOnInput;
    input.setAttribute('oninput', 'return');

    if (hasEvent('oninput', docElement) || typeof input.oninput == 'function') {
      return true;
    }

    // IE doesn't support onInput, so we wrap up the non IE APIs
    // (createEvent, addEventListener) in a try catch, rather than test for
    // their trident equivalent.
    try {
      // Older Firefox didn't map oninput attribute to oninput property
      var testEvent  = document.createEvent('KeyboardEvent');
      supportsOnInput = false;
      var handler = function(e) {
        supportsOnInput = true;
        e.preventDefault();
        e.stopPropagation();
      };

      testEvent.initKeyEvent('keypress', true, true, window, false, false, false, false, 0, 'e'.charCodeAt(0));
      docElement.appendChild(input);
      input.addEventListener('input', handler, false);
      input.focus();
      input.dispatchEvent(testEvent);
      input.removeEventListener('input', handler, false);
      docElement.removeChild(input);
    } catch (e) {
      supportsOnInput = false;
    }
      return supportsOnInput;
  });


  /**
   * cssToDOM takes a kebab-case string and converts it to camelCase
   * e.g. box-sizing -> boxSizing
   *
   * @access private
   * @function cssToDOM
   * @param {string} name - String name of kebab-case prop we want to convert
   * @returns {string} The camelCase version of the supplied name
   */

  function cssToDOM(name) {
    return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
      return m1 + m2.toUpperCase();
    }).replace(/^-/, '');
  }
  ;

  /**
   * If the browsers follow the spec, then they would expose vendor-specific style as:
   *   elem.style.WebkitBorderRadius
   * instead of something like the following, which would be technically incorrect:
   *   elem.style.webkitBorderRadius

   * Webkit ghosts their properties in lowercase but Opera & Moz do not.
   * Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
   *   erik.eae.net/archives/2008/03/10/21.48.10/

   * More here: github.com/Modernizr/Modernizr/issues/issue/21
   *
   * @access private
   * @returns {string} The string representing the vendor-specific style properties
   */

  var omPrefixes = 'Moz O ms Webkit';
  

  var cssomPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : []);
  ModernizrProto._cssomPrefixes = cssomPrefixes;
  

  /**
   * atRule returns a given CSS property at-rule (eg @keyframes), possibly in
   * some prefixed form, or false, in the case of an unsupported rule
   *
   * @memberof Modernizr
   * @name Modernizr.atRule
   * @optionName Modernizr.atRule()
   * @optionProp atRule
   * @access public
   * @function atRule
   * @param {string} prop - String name of the @-rule to test for
   * @returns {string|boolean} The string representing the (possibly prefixed)
   * valid version of the @-rule, or `false` when it is unsupported.
   * @example
   * ```js
   *  var keyframes = Modernizr.atRule('@keyframes');
   *
   *  if (keyframes) {
   *    // keyframes are supported
   *    // could be `@-webkit-keyframes` or `@keyframes`
   *  } else {
   *    // keyframes === `false`
   *  }
   * ```
   *
   */

  var atRule = function(prop) {
    var length = prefixes.length;
    var cssrule = window.CSSRule;
    var rule;

    if (typeof cssrule === 'undefined') {
      return undefined;
    }

    if (!prop) {
      return false;
    }

    // remove literal @ from beginning of provided property
    prop = prop.replace(/^@/, '');

    // CSSRules use underscores instead of dashes
    rule = prop.replace(/-/g, '_').toUpperCase() + '_RULE';

    if (rule in cssrule) {
      return '@' + prop;
    }

    for (var i = 0; i < length; i++) {
      // prefixes gives us something like -o-, and we want O_
      var prefix = prefixes[i];
      var thisRule = prefix.toUpperCase() + '_' + rule;

      if (thisRule in cssrule) {
        return '@-' + prefix.toLowerCase() + '-' + prop;
      }
    }

    return false;
  };

  ModernizrProto.atRule = atRule;

  

  /**
   * List of JavaScript DOM values used for tests
   *
   * @memberof Modernizr
   * @name Modernizr._domPrefixes
   * @optionName Modernizr._domPrefixes
   * @optionProp domPrefixes
   * @access public
   * @example
   *
   * Modernizr._domPrefixes is exactly the same as [_prefixes](#modernizr-_prefixes), but rather
   * than kebab-case properties, all properties are their Capitalized variant
   *
   * ```js
   * Modernizr._domPrefixes === [ "Moz", "O", "ms", "Webkit" ];
   * ```
   */

  var domPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.toLowerCase().split(' ') : []);
  ModernizrProto._domPrefixes = domPrefixes;
  


  /**
   * contains checks to see if a string contains another string
   *
   * @access private
   * @function contains
   * @param {string} str - The string we want to check for substrings
   * @param {string} substr - The substring we want to search the first string for
   * @returns {boolean}
   */

  function contains(str, substr) {
    return !!~('' + str).indexOf(substr);
  }

  ;

  /**
   * fnBind is a super small [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) polyfill.
   *
   * @access private
   * @function fnBind
   * @param {function} fn - a function you want to change `this` reference to
   * @param {object} that - the `this` you want to call the function with
   * @returns {function} The wrapped version of the supplied function
   */

  function fnBind(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  }

  ;

  /**
   * testDOMProps is a generic DOM property test; if a browser supports
   *   a certain property, it won't return undefined for it.
   *
   * @access private
   * @function testDOMProps
   * @param {array.<string>} props - An array of properties to test for
   * @param {object} obj - An object or Element you want to use to test the parameters again
   * @param {boolean|object} elem - An Element to bind the property lookup again. Use `false` to prevent the check
   */
  function testDOMProps(props, obj, elem) {
    var item;

    for (var i in props) {
      if (props[i] in obj) {

        // return the property name as a string
        if (elem === false) {
          return props[i];
        }

        item = obj[props[i]];

        // let's bind a function
        if (is(item, 'function')) {
          // bind to obj unless overriden
          return fnBind(item, elem || obj);
        }

        // return the unbound function or obj or value
        return item;
      }
    }
    return false;
  }

  ;

  /**
   * Create our "modernizr" element that we do most feature tests on.
   *
   * @access private
   */

  var modElem = {
    elem: createElement('modernizr')
  };

  // Clean up this element
  Modernizr._q.push(function() {
    delete modElem.elem;
  });

  

  var mStyle = {
    style: modElem.elem.style
  };

  // kill ref for gc, must happen before mod.elem is removed, so we unshift on to
  // the front of the queue.
  Modernizr._q.unshift(function() {
    delete mStyle.style;
  });

  

  /**
   * domToCSS takes a camelCase string and converts it to kebab-case
   * e.g. boxSizing -> box-sizing
   *
   * @access private
   * @function domToCSS
   * @param {string} name - String name of camelCase prop we want to convert
   * @returns {string} The kebab-case version of the supplied name
   */

  function domToCSS(name) {
    return name.replace(/([A-Z])/g, function(str, m1) {
      return '-' + m1.toLowerCase();
    }).replace(/^ms-/, '-ms-');
  }
  ;

  /**
   * nativeTestProps allows for us to use native feature detection functionality if available.
   * some prefixed form, or false, in the case of an unsupported rule
   *
   * @access private
   * @function nativeTestProps
   * @param {array} props - An array of property names
   * @param {string} value - A string representing the value we want to check via @supports
   * @returns {boolean|undefined} A boolean when @supports exists, undefined otherwise
   */

  // Accepts a list of property names and a single value
  // Returns `undefined` if native detection not available
  function nativeTestProps(props, value) {
    var i = props.length;
    // Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
    if ('CSS' in window && 'supports' in window.CSS) {
      // Try every prefixed variant of the property
      while (i--) {
        if (window.CSS.supports(domToCSS(props[i]), value)) {
          return true;
        }
      }
      return false;
    }
    // Otherwise fall back to at-rule (for Opera 12.x)
    else if ('CSSSupportsRule' in window) {
      // Build a condition string for every prefixed variant
      var conditionText = [];
      while (i--) {
        conditionText.push('(' + domToCSS(props[i]) + ':' + value + ')');
      }
      conditionText = conditionText.join(' or ');
      return injectElementWithStyles('@supports (' + conditionText + ') { #modernizr { position: absolute; } }', function(node) {
        return getComputedStyle(node, null).position == 'absolute';
      });
    }
    return undefined;
  }
  ;

  // testProps is a generic CSS / DOM property test.

  // In testing support for a given CSS property, it's legit to test:
  //    `elem.style[styleName] !== undefined`
  // If the property is supported it will return an empty string,
  // if unsupported it will return undefined.

  // We'll take advantage of this quick test and skip setting a style
  // on our modernizr element, but instead just testing undefined vs
  // empty string.

  // Property names can be provided in either camelCase or kebab-case.

  function testProps(props, prefixed, value, skipValueTest) {
    skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

    // Try native detect first
    if (!is(value, 'undefined')) {
      var result = nativeTestProps(props, value);
      if (!is(result, 'undefined')) {
        return result;
      }
    }

    // Otherwise do it properly
    var afterInit, i, propsLength, prop, before;

    // If we don't have a style element, that means we're running async or after
    // the core tests, so we'll need to create our own elements to use

    // inside of an SVG element, in certain browsers, the `style` element is only
    // defined for valid tags. Therefore, if `modernizr` does not have one, we
    // fall back to a less used element and hope for the best.
    // for strict XHTML browsers the hardly used samp element is used
    var elems = ['modernizr', 'tspan', 'samp'];
    while (!mStyle.style && elems.length) {
      afterInit = true;
      mStyle.modElem = createElement(elems.shift());
      mStyle.style = mStyle.modElem.style;
    }

    // Delete the objects if we created them.
    function cleanElems() {
      if (afterInit) {
        delete mStyle.style;
        delete mStyle.modElem;
      }
    }

    propsLength = props.length;
    for (i = 0; i < propsLength; i++) {
      prop = props[i];
      before = mStyle.style[prop];

      if (contains(prop, '-')) {
        prop = cssToDOM(prop);
      }

      if (mStyle.style[prop] !== undefined) {

        // If value to test has been passed in, do a set-and-check test.
        // 0 (integer) is a valid property value, so check that `value` isn't
        // undefined, rather than just checking it's truthy.
        if (!skipValueTest && !is(value, 'undefined')) {

          // Needs a try catch block because of old IE. This is slow, but will
          // be avoided in most cases because `skipValueTest` will be used.
          try {
            mStyle.style[prop] = value;
          } catch (e) {}

          // If the property value has changed, we assume the value used is
          // supported. If `value` is empty string, it'll fail here (because
          // it hasn't changed), which matches how browsers have implemented
          // CSS.supports()
          if (mStyle.style[prop] != before) {
            cleanElems();
            return prefixed == 'pfx' ? prop : true;
          }
        }
        // Otherwise just return true, or the property name if this is a
        // `prefixed()` call
        else {
          cleanElems();
          return prefixed == 'pfx' ? prop : true;
        }
      }
    }
    cleanElems();
    return false;
  }

  ;

  /**
   * testPropsAll tests a list of DOM properties we want to check against.
   * We specify literally ALL possible (known and/or likely) properties on
   * the element including the non-vendor prefixed one, for forward-
   * compatibility.
   *
   * @access private
   * @function testPropsAll
   * @param {string} prop - A string of the property to test for
   * @param {string|object} [prefixed] - An object to check the prefixed properties on. Use a string to skip
   * @param {HTMLElement|SVGElement} [elem] - An element used to test the property and value against
   * @param {string} [value] - A string of a css value
   * @param {boolean} [skipValueTest] - An boolean representing if you want to test if value sticks when set
   */
  function testPropsAll(prop, prefixed, elem, value, skipValueTest) {

    var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
    props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

    // did they call .prefixed('boxSizing') or are we just testing a prop?
    if (is(prefixed, 'string') || is(prefixed, 'undefined')) {
      return testProps(props, prefixed, value, skipValueTest);

      // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
    } else {
      props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
      return testDOMProps(props, prefixed, elem);
    }
  }

  // Modernizr.testAllProps() investigates whether a given style property,
  // or any of its vendor-prefixed variants, is recognized
  //
  // Note that the property names must be provided in the camelCase variant.
  // Modernizr.testAllProps('boxSizing')
  ModernizrProto.testAllProps = testPropsAll;

  

  /**
   * prefixed returns the prefixed or nonprefixed property name variant of your input
   *
   * @memberof Modernizr
   * @name Modernizr.prefixed
   * @optionName Modernizr.prefixed()
   * @optionProp prefixed
   * @access public
   * @function prefixed
   * @param {string} prop - String name of the property to test for
   * @param {object} [obj] - An object to test for the prefixed properties on
   * @param {HTMLElement} [elem] - An element used to test specific properties against
   * @returns {string|false} The string representing the (possibly prefixed) valid
   * version of the property, or `false` when it is unsupported.
   * @example
   *
   * Modernizr.prefixed takes a string css value in the DOM style camelCase (as
   * opposed to the css style kebab-case) form and returns the (possibly prefixed)
   * version of that property that the browser actually supports.
   *
   * For example, in older Firefox...
   * ```js
   * prefixed('boxSizing')
   * ```
   * returns 'MozBoxSizing'
   *
   * In newer Firefox, as well as any other browser that support the unprefixed
   * version would simply return `boxSizing`. Any browser that does not support
   * the property at all, it will return `false`.
   *
   * By default, prefixed is checked against a DOM element. If you want to check
   * for a property on another object, just pass it as a second argument
   *
   * ```js
   * var rAF = prefixed('requestAnimationFrame', window);
   *
   * raf(function() {
   *  renderFunction();
   * })
   * ```
   *
   * Note that this will return _the actual function_ - not the name of the function.
   * If you need the actual name of the property, pass in `false` as a third argument
   *
   * ```js
   * var rAFProp = prefixed('requestAnimationFrame', window, false);
   *
   * rafProp === 'WebkitRequestAnimationFrame' // in older webkit
   * ```
   *
   * One common use case for prefixed is if you're trying to determine which transition
   * end event to bind to, you might do something like...
   * ```js
   * var transEndEventNames = {
   *     'WebkitTransition' : 'webkitTransitionEnd', * Saf 6, Android Browser
   *     'MozTransition'    : 'transitionend',       * only for FF < 15
   *     'transition'       : 'transitionend'        * IE10, Opera, Chrome, FF 15+, Saf 7+
   * };
   *
   * var transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
   * ```
   *
   * If you want a similar lookup, but in kebab-case, you can use [prefixedCSS](#modernizr-prefixedcss).
   */

  var prefixed = ModernizrProto.prefixed = function(prop, obj, elem) {
    if (prop.indexOf('@') === 0) {
      return atRule(prop);
    }

    if (prop.indexOf('-') != -1) {
      // Convert kebab-case to camelCase
      prop = cssToDOM(prop);
    }
    if (!obj) {
      return testPropsAll(prop, 'pfx');
    } else {
      // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
      return testPropsAll(prop, obj, elem);
    }
  };

  
/*!
{
  "name": "RTC Peer Connection",
  "property": "peerconnection",
  "tags": ["webrtc"],
  "authors": ["Ankur Oberoi"],
  "notes": [{
    "name": "W3C Web RTC spec",
    "href": "https://www.w3.org/TR/webrtc/"
  }]
}
!*/

  Modernizr.addTest('peerconnection', !!prefixed('RTCPeerConnection', window));


  // Run each test
  testRunner();

  delete ModernizrProto.addTest;
  delete ModernizrProto.addAsyncTest;

  // Run the things that are supposed to run after the tests
  for (var i = 0; i < Modernizr._q.length; i++) {
    Modernizr._q[i]();
  }

  // Leak Modernizr namespace
  window.Modernizr = Modernizr;


;

})(window, document);
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
	return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
	return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
	return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
	parts = line.substring(12).split(' ');
  } else {
	parts = line.substring(10).split(' ');
  }

  var candidate = {
	foundation: parts[0],
	component: parts[1],
	protocol: parts[2].toLowerCase(),
	priority: parseInt(parts[3], 10),
	ip: parts[4],
	port: parseInt(parts[5], 10),
	// skip parts[6] == 'typ'
	type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
	switch (parts[i]) {
	  case 'raddr':
		candidate.relatedAddress = parts[i + 1];
		break;
	  case 'rport':
		candidate.relatedPort = parseInt(parts[i + 1], 10);
		break;
	  case 'tcptype':
		candidate.tcpType = parts[i + 1];
		break;
	  default: // Unknown extensions are silently ignored.
		break;
	}
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
	  candidate.relatedPort) {
	sdp.push('raddr');
	sdp.push(candidate.relatedAddress); // was: relAddr
	sdp.push('rport');
	sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
	sdp.push('tcptype');
	sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
	payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
	pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
	  (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
	id: parseInt(parts[0], 10),
	uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
	   ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
	kv = parts[j].trim().split('=');
	parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
	pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
	var params = [];
	Object.keys(codec.parameters).forEach(function(param) {
	  params.push(param + '=' + codec.parameters[param]);
	});
	line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
	type: parts.shift(),
	parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
	pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
	// FIXME: special handling for trr-int?
	codec.rtcpFeedback.forEach(function(fb) {
	  lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
	  (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
		  '\r\n';
	});
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
	ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
	parts.attribute = line.substr(sp + 1, colon - sp - 1);
	parts.value = line.substr(colon + 1);
  } else {
	parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var fpLine = lines.filter(function(line) {
	return line.indexOf('a=fingerprint:') === 0;
  })[0].substr(14);
  // Note: a=setup line is ignored since we use the 'auto' role.
  var dtlsParameters = {
	role: 'auto',
	fingerprints: [{
	  algorithm: fpLine.split(' ')[0],
	  value: fpLine.split(' ')[1]
	}]
  };
  return dtlsParameters;
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
	sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
	usernameFragment: lines.filter(function(line) {
	  return line.indexOf('a=ice-ufrag:') === 0;
	})[0].substr(12),
	password: lines.filter(function(line) {
	  return line.indexOf('a=ice-pwd:') === 0;
	})[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
	  'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
	codecs: [],
	headerExtensions: [],
	fecMechanisms: [],
	rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
	var pt = mline[i];
	var rtpmapline = SDPUtils.matchPrefix(
		mediaSection, 'a=rtpmap:' + pt + ' ')[0];
	if (rtpmapline) {
	  var codec = SDPUtils.parseRtpMap(rtpmapline);
	  var fmtps = SDPUtils.matchPrefix(
		  mediaSection, 'a=fmtp:' + pt + ' ');
	  // Only the first a=fmtp:<pt> is considered.
	  codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
	  codec.rtcpFeedback = SDPUtils.matchPrefix(
		  mediaSection, 'a=rtcp-fb:' + pt + ' ')
		.map(SDPUtils.parseRtcpFb);
	  description.codecs.push(codec);
	  // parse FEC mechanisms from rtpmap lines.
	  switch (codec.name.toUpperCase()) {
		case 'RED':
		case 'ULPFEC':
		  description.fecMechanisms.push(codec.name.toUpperCase());
		  break;
		default: // only RED and ULPFEC are recognized as FEC mechanisms.
		  break;
	  }
	}
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
	description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
	if (codec.preferredPayloadType !== undefined) {
	  return codec.preferredPayloadType;
	}
	return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
	sdp += SDPUtils.writeRtpMap(codec);
	sdp += SDPUtils.writeFmtp(codec);
	sdp += SDPUtils.writeRtcpFb(codec);
  });
  // FIXME: add headerExtensions, fecMechanismş and rtcp.
  sdp += 'a=rtcp-mux\r\n';
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
	return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
	return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
	var parts = line.split(' ');
	parts.shift();
	return parts.map(function(part) {
	  return parseInt(part, 10);
	});
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
	secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
	if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
	  var encParam = {
		ssrc: primarySsrc,
		codecPayloadType: parseInt(codec.parameters.apt, 10),
		rtx: {
		  payloadType: codec.payloadType,
		  ssrc: secondarySsrc
		}
	  };
	  encodingParameters.push(encParam);
	  if (hasRed) {
		encParam = JSON.parse(JSON.stringify(encParam));
		encParam.fec = {
		  ssrc: secondarySsrc,
		  mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
		};
		encodingParameters.push(encParam);
	  }
	}
  });
  if (encodingParameters.length === 0 && primarySsrc) {
	encodingParameters.push({
	  ssrc: primarySsrc
	});
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
	if (bandwidth[0].indexOf('b=TIAS:') === 0) {
	  bandwidth = parseInt(bandwidth[0].substr(7), 10);
	} else if (bandwidth[0].indexOf('b=AS:') === 0) {
	  bandwidth = parseInt(bandwidth[0].substr(5), 10);
	}
	encodingParameters.forEach(function(params) {
	  params.maxBitrate = bandwidth;
	});
  }
  return encodingParameters;
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
	  'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
	  's=-\r\n' +
	  't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
	  transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
	  transceiver.dtlsTransport.getLocalParameters(),
	  type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
	sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
	sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
	sdp += 'a=recvonly\r\n';
  } else {
	sdp += 'a=inactive\r\n';
  }

  // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
  if (transceiver.rtpSender) {
	var msid = 'msid:' + stream.id + ' ' +
		transceiver.rtpSender.track.id + '\r\n';
	sdp += 'a=' + msid;
	sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
		' ' + msid;
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
	  ' cname:' + SDPUtils.localCName + '\r\n';
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
	switch (lines[i]) {
	  case 'a=sendrecv':
	  case 'a=sendonly':
	  case 'a=recvonly':
	  case 'a=inactive':
		return lines[i].substr(2);
	  default:
		// FIXME: What should happen here?
	}
  }
  if (sessionpart) {
	return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],2:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
	case 'opera': // fallthrough as it uses chrome shims
	case 'chrome':
	  if (!chromeShim || !chromeShim.shimPeerConnection) {
		logging('Chrome shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming chrome.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = chromeShim;

	  chromeShim.shimGetUserMedia();
	  chromeShim.shimMediaStream();
	  chromeShim.shimSourceObject();
	  chromeShim.shimPeerConnection();
	  chromeShim.shimOnTrack();
	  break;
	case 'firefox':
	  if (!firefoxShim || !firefoxShim.shimPeerConnection) {
		logging('Firefox shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming firefox.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = firefoxShim;

	  firefoxShim.shimGetUserMedia();
	  firefoxShim.shimSourceObject();
	  firefoxShim.shimPeerConnection();
	  firefoxShim.shimOnTrack();
	  break;
	case 'edge':
	  if (!edgeShim || !edgeShim.shimPeerConnection) {
		logging('MS edge shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming edge.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = edgeShim;

	  edgeShim.shimGetUserMedia();
	  edgeShim.shimPeerConnection();
	  break;
	case 'safari':
	  if (!safariShim) {
		logging('Safari shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming safari.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = safariShim;

	  safariShim.shimGetUserMedia();
	  break;
	default:
	  logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":3,"./edge/edge_shim":5,"./firefox/firefox_shim":7,"./safari/safari_shim":9,"./utils":10}],3:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimMediaStream: function() {
	window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function() {
	if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
		window.RTCPeerConnection.prototype)) {
	  Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
		get: function() {
		  return this._ontrack;
		},
		set: function(f) {
		  var self = this;
		  if (this._ontrack) {
			this.removeEventListener('track', this._ontrack);
			this.removeEventListener('addstream', this._ontrackpoly);
		  }
		  this.addEventListener('track', this._ontrack = f);
		  this.addEventListener('addstream', this._ontrackpoly = function(e) {
			// onaddstream does not fire when a track is added to an existing
			// stream. But stream.onaddtrack is implemented so we use that.
			e.stream.addEventListener('addtrack', function(te) {
			  var event = new Event('track');
			  event.track = te.track;
			  event.receiver = {track: te.track};
			  event.streams = [e.stream];
			  self.dispatchEvent(event);
			});
			e.stream.getTracks().forEach(function(track) {
			  var event = new Event('track');
			  event.track = track;
			  event.receiver = {track: track};
			  event.streams = [e.stream];
			  this.dispatchEvent(event);
			}.bind(this));
		  }.bind(this));
		}
	  });
	}
  },

  shimSourceObject: function() {
	if (typeof window === 'object') {
	  if (window.HTMLMediaElement &&
		!('srcObject' in window.HTMLMediaElement.prototype)) {
		// Shim the srcObject property, once, when HTMLMediaElement is found.
		Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
		  get: function() {
			return this._srcObject;
		  },
		  set: function(stream) {
			var self = this;
			// Use _srcObject as a private property for this shim
			this._srcObject = stream;
			if (this.src) {
			  URL.revokeObjectURL(this.src);
			}

			if (!stream) {
			  this.src = '';
			  return;
			}
			this.src = URL.createObjectURL(stream);
			// We need to recreate the blob url when a track is added or
			// removed. Doing it manually since we want to avoid a recursion.
			stream.addEventListener('addtrack', function() {
			  if (self.src) {
				URL.revokeObjectURL(self.src);
			  }
			  self.src = URL.createObjectURL(stream);
			});
			stream.addEventListener('removetrack', function() {
			  if (self.src) {
				URL.revokeObjectURL(self.src);
			  }
			  self.src = URL.createObjectURL(stream);
			});
		  }
		});
	  }
	}
  },

  shimPeerConnection: function() {
	// The RTCPeerConnection object.
	window.RTCPeerConnection = function(pcConfig, pcConstraints) {
	  // Translate iceTransportPolicy to iceTransports,
	  // see https://code.google.com/p/webrtc/issues/detail?id=4869
	  logging('PeerConnection');
	  if (pcConfig && pcConfig.iceTransportPolicy) {
		pcConfig.iceTransports = pcConfig.iceTransportPolicy;
	  }

	  var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
	  var origGetStats = pc.getStats.bind(pc);
	  pc.getStats = function(selector, successCallback, errorCallback) {
		var self = this;
		var args = arguments;

		// If selector is a function then we are in the old style stats so just
		// pass back the original getStats format to avoid breaking old users.
		if (arguments.length > 0 && typeof selector === 'function') {
		  return origGetStats(selector, successCallback);
		}

		var fixChromeStats_ = function(response) {
		  var standardReport = {};
		  var reports = response.result();
		  reports.forEach(function(report) {
			var standardStats = {
			  id: report.id,
			  timestamp: report.timestamp,
			  type: report.type
			};
			report.names().forEach(function(name) {
			  standardStats[name] = report.stat(name);
			});
			standardReport[standardStats.id] = standardStats;
		  });

		  return standardReport;
		};

		// shim getStats with maplike support
		var makeMapStats = function(stats, legacyStats) {
		  var map = new Map(Object.keys(stats).map(function(key) {
			return[key, stats[key]];
		  }));
		  legacyStats = legacyStats || stats;
		  Object.keys(legacyStats).forEach(function(key) {
			map[key] = legacyStats[key];
		  });
		  return map;
		};

		if (arguments.length >= 2) {
		  var successCallbackWrapper_ = function(response) {
			args[1](makeMapStats(fixChromeStats_(response)));
		  };

		  return origGetStats.apply(this, [successCallbackWrapper_,
			  arguments[0]]);
		}

		// promise-support
		return new Promise(function(resolve, reject) {
		  if (args.length === 1 && typeof selector === 'object') {
			origGetStats.apply(self, [
			  function(response) {
				resolve(makeMapStats(fixChromeStats_(response)));
			  }, reject]);
		  } else {
			// Preserve legacy chrome stats only on legacy access of stats obj
			origGetStats.apply(self, [
			  function(response) {
				resolve(makeMapStats(fixChromeStats_(response),
					response.result()));
			  }, reject]);
		  }
		}).then(successCallback, errorCallback);
	  };

	  return pc;
	};
	window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

	// wrap static methods. Currently just generateCertificate.
	if (webkitRTCPeerConnection.generateCertificate) {
	  Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
		get: function() {
		  return webkitRTCPeerConnection.generateCertificate;
		}
	  });
	}

	['createOffer', 'createAnswer'].forEach(function(method) {
	  var nativeMethod = webkitRTCPeerConnection.prototype[method];
	  webkitRTCPeerConnection.prototype[method] = function() {
		var self = this;
		if (arguments.length < 1 || (arguments.length === 1 &&
			typeof arguments[0] === 'object')) {
		  var opts = arguments.length === 1 ? arguments[0] : undefined;
		  return new Promise(function(resolve, reject) {
			nativeMethod.apply(self, [resolve, reject, opts]);
		  });
		}
		return nativeMethod.apply(this, arguments);
	  };
	});

	// add promise support -- natively available in Chrome 51
	if (browserDetails.version < 51) {
	  ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
		  .forEach(function(method) {
			var nativeMethod = webkitRTCPeerConnection.prototype[method];
			webkitRTCPeerConnection.prototype[method] = function() {
			  var args = arguments;
			  var self = this;
			  var promise = new Promise(function(resolve, reject) {
				nativeMethod.apply(self, [args[0], resolve, reject]);
			  });
			  if (args.length < 2) {
				return promise;
			  }
			  return promise.then(function() {
				args[1].apply(null, []);
			  },
			  function(err) {
				if (args.length >= 3) {
				  args[2].apply(null, [err]);
				}
			  });
			};
		  });
	}

	// shim implicit creation of RTCSessionDescription/RTCIceCandidate
	['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
		.forEach(function(method) {
		  var nativeMethod = webkitRTCPeerConnection.prototype[method];
		  webkitRTCPeerConnection.prototype[method] = function() {
			arguments[0] = new ((method === 'addIceCandidate') ?
				RTCIceCandidate : RTCSessionDescription)(arguments[0]);
			return nativeMethod.apply(this, arguments);
		  };
		});

	// support for addIceCandidate(null)
	var nativeAddIceCandidate =
		RTCPeerConnection.prototype.addIceCandidate;
	RTCPeerConnection.prototype.addIceCandidate = function() {
	  if (arguments[0] === null) {
		if (arguments[1]) {
		  arguments[1].apply(null);
		}
		return Promise.resolve();
	  }
	  return nativeAddIceCandidate.apply(this, arguments);
	};
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":10,"./getusermedia":4}],4:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
	if (typeof c !== 'object' || c.mandatory || c.optional) {
	  return c;
	}
	var cc = {};
	Object.keys(c).forEach(function(key) {
	  if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
		return;
	  }
	  var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
	  if (r.exact !== undefined && typeof r.exact === 'number') {
		r.min = r.max = r.exact;
	  }
	  var oldname_ = function(prefix, name) {
		if (prefix) {
		  return prefix + name.charAt(0).toUpperCase() + name.slice(1);
		}
		return (name === 'deviceId') ? 'sourceId' : name;
	  };
	  if (r.ideal !== undefined) {
		cc.optional = cc.optional || [];
		var oc = {};
		if (typeof r.ideal === 'number') {
		  oc[oldname_('min', key)] = r.ideal;
		  cc.optional.push(oc);
		  oc = {};
		  oc[oldname_('max', key)] = r.ideal;
		  cc.optional.push(oc);
		} else {
		  oc[oldname_('', key)] = r.ideal;
		  cc.optional.push(oc);
		}
	  }
	  if (r.exact !== undefined && typeof r.exact !== 'number') {
		cc.mandatory = cc.mandatory || {};
		cc.mandatory[oldname_('', key)] = r.exact;
	  } else {
		['min', 'max'].forEach(function(mix) {
		  if (r[mix] !== undefined) {
			cc.mandatory = cc.mandatory || {};
			cc.mandatory[oldname_(mix, key)] = r[mix];
		  }
		});
	  }
	});
	if (c.advanced) {
	  cc.optional = (cc.optional || []).concat(c.advanced);
	}
	return cc;
  };

  var shimConstraints_ = function(constraints, func) {
	constraints = JSON.parse(JSON.stringify(constraints));
	if (constraints && constraints.audio) {
	  constraints.audio = constraintsToChrome_(constraints.audio);
	}
	if (constraints && typeof constraints.video === 'object') {
	  // Shim facingMode for mobile, where it defaults to "user".
	  var face = constraints.video.facingMode;
	  face = face && ((typeof face === 'object') ? face : {ideal: face});

	  if ((face && (face.exact === 'user' || face.exact === 'environment' ||
					face.ideal === 'user' || face.ideal === 'environment')) &&
		  !(navigator.mediaDevices.getSupportedConstraints &&
			navigator.mediaDevices.getSupportedConstraints().facingMode)) {
		delete constraints.video.facingMode;
		if (face.exact === 'environment' || face.ideal === 'environment') {
		  // Look for "back" in label, or use last cam (typically back cam).
		  return navigator.mediaDevices.enumerateDevices()
		  .then(function(devices) {
			devices = devices.filter(function(d) {
			  return d.kind === 'videoinput';
			});
			var back = devices.find(function(d) {
			  return d.label.toLowerCase().indexOf('back') !== -1;
			}) || (devices.length && devices[devices.length - 1]);
			if (back) {
			  constraints.video.deviceId = face.exact ? {exact: back.deviceId} :
														{ideal: back.deviceId};
			}
			constraints.video = constraintsToChrome_(constraints.video);
			logging('chrome: ' + JSON.stringify(constraints));
			return func(constraints);
		  });
		}
	  }
	  constraints.video = constraintsToChrome_(constraints.video);
	}
	logging('chrome: ' + JSON.stringify(constraints));
	return func(constraints);
  };

  var shimError_ = function(e) {
	return {
	  name: {
		PermissionDeniedError: 'NotAllowedError',
		ConstraintNotSatisfiedError: 'OverconstrainedError'
	  }[e.name] || e.name,
	  message: e.message,
	  constraint: e.constraintName,
	  toString: function() {
		return this.name + (this.message && ': ') + this.message;
	  }
	};
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
	shimConstraints_(constraints, function(c) {
	  navigator.webkitGetUserMedia(c, onSuccess, function(e) {
		onError(shimError_(e));
	  });
	});
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
	return new Promise(function(resolve, reject) {
	  navigator.getUserMedia(constraints, resolve, reject);
	});
  };

  if (!navigator.mediaDevices) {
	navigator.mediaDevices = {
	  getUserMedia: getUserMediaPromise_,
	  enumerateDevices: function() {
		return new Promise(function(resolve) {
		  var kinds = {audio: 'audioinput', video: 'videoinput'};
		  return MediaStreamTrack.getSources(function(devices) {
			resolve(devices.map(function(device) {
			  return {label: device.label,
					  kind: kinds[device.kind],
					  deviceId: device.id,
					  groupId: ''};
			}));
		  });
		});
	  }
	};
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia = function(constraints) {
	  return getUserMediaPromise_(constraints);
	};
  } else {
	// Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
	// function which returns a Promise, it does not accept spec-style
	// constraints.
	var origGetUserMedia = navigator.mediaDevices.getUserMedia.
		bind(navigator.mediaDevices);
	navigator.mediaDevices.getUserMedia = function(cs) {
	  return shimConstraints_(cs, function(c) {
		return origGetUserMedia(c).then(function(stream) {
		  if (c.audio && !stream.getAudioTracks().length ||
			  c.video && !stream.getVideoTracks().length) {
			stream.getTracks().forEach(function(track) {
			  track.stop();
			});
			throw new DOMException('', 'NotFoundError');
		  }
		  return stream;
		}, function(e) {
		  return Promise.reject(shimError_(e));
		});
	  });
	};
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
	navigator.mediaDevices.addEventListener = function() {
	  logging('Dummy mediaDevices.addEventListener called.');
	};
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
	navigator.mediaDevices.removeEventListener = function() {
	  logging('Dummy mediaDevices.removeEventListener called.');
	};
  }
};

},{"../utils.js":10}],5:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var browserDetails = require('../utils').browserDetails;

var edgeShim = {
  shimPeerConnection: function() {
	if (window.RTCIceGatherer) {
	  // ORTC defines an RTCIceCandidate object but no constructor.
	  // Not implemented in Edge.
	  if (!window.RTCIceCandidate) {
		window.RTCIceCandidate = function(args) {
		  return args;
		};
	  }
	  // ORTC does not have a session description object but
	  // other browsers (i.e. Chrome) that will support both PC and ORTC
	  // in the future might have this defined already.
	  if (!window.RTCSessionDescription) {
		window.RTCSessionDescription = function(args) {
		  return args;
		};
	  }
	}

	window.RTCPeerConnection = function(config) {
	  var self = this;

	  var _eventTarget = document.createDocumentFragment();
	  ['addEventListener', 'removeEventListener', 'dispatchEvent']
		  .forEach(function(method) {
			self[method] = _eventTarget[method].bind(_eventTarget);
		  });

	  this.onicecandidate = null;
	  this.onaddstream = null;
	  this.ontrack = null;
	  this.onremovestream = null;
	  this.onsignalingstatechange = null;
	  this.oniceconnectionstatechange = null;
	  this.onnegotiationneeded = null;
	  this.ondatachannel = null;

	  this.localStreams = [];
	  this.remoteStreams = [];
	  this.getLocalStreams = function() {
		return self.localStreams;
	  };
	  this.getRemoteStreams = function() {
		return self.remoteStreams;
	  };

	  this.localDescription = new RTCSessionDescription({
		type: '',
		sdp: ''
	  });
	  this.remoteDescription = new RTCSessionDescription({
		type: '',
		sdp: ''
	  });
	  this.signalingState = 'stable';
	  this.iceConnectionState = 'new';
	  this.iceGatheringState = 'new';

	  this.iceOptions = {
		gatherPolicy: 'all',
		iceServers: []
	  };
	  if (config && config.iceTransportPolicy) {
		switch (config.iceTransportPolicy) {
		  case 'all':
		  case 'relay':
			this.iceOptions.gatherPolicy = config.iceTransportPolicy;
			break;
		  case 'none':
			// FIXME: remove once implementation and spec have added this.
			throw new TypeError('iceTransportPolicy "none" not supported');
		  default:
			// don't set iceTransportPolicy.
			break;
		}
	  }
	  this.usingBundle = config && config.bundlePolicy === 'max-bundle';

	  if (config && config.iceServers) {
		// Edge does not like
		// 1) stun:
		// 2) turn: that does not have all of turn:host:port?transport=udp
		// 3) turn: with ipv6 addresses
		var iceServers = JSON.parse(JSON.stringify(config.iceServers));
		this.iceOptions.iceServers = iceServers.filter(function(server) {
		  if (server && server.urls) {
			var urls = server.urls;
			if (typeof urls === 'string') {
			  urls = [urls];
			}
			urls = urls.filter(function(url) {
			  return (url.indexOf('turn:') === 0 &&
				  url.indexOf('transport=udp') !== -1 &&
				  url.indexOf('turn:[') === -1) ||
				  (url.indexOf('stun:') === 0 &&
					browserDetails.version >= 14393);
			})[0];
			return !!urls;
		  }
		  return false;
		});
	  }
	  this._config = config;

	  // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
	  // everything that is needed to describe a SDP m-line.
	  this.transceivers = [];

	  // since the iceGatherer is currently created in createOffer but we
	  // must not emit candidates until after setLocalDescription we buffer
	  // them in this array.
	  this._localIceCandidatesBuffer = [];
	};

	window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
	  var self = this;
	  var sections = SDPUtils.splitSections(self.localDescription.sdp);
	  // FIXME: need to apply ice candidates in a way which is async but
	  // in-order
	  this._localIceCandidatesBuffer.forEach(function(event) {
		var end = !event.candidate || Object.keys(event.candidate).length === 0;
		if (end) {
		  for (var j = 1; j < sections.length; j++) {
			if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
			  sections[j] += 'a=end-of-candidates\r\n';
			}
		  }
		} else if (event.candidate.candidate.indexOf('typ endOfCandidates')
			=== -1) {
		  sections[event.candidate.sdpMLineIndex + 1] +=
			  'a=' + event.candidate.candidate + '\r\n';
		}
		self.localDescription.sdp = sections.join('');
		self.dispatchEvent(event);
		if (self.onicecandidate !== null) {
		  self.onicecandidate(event);
		}
		if (!event.candidate && self.iceGatheringState !== 'complete') {
		  var complete = self.transceivers.every(function(transceiver) {
			return transceiver.iceGatherer &&
				transceiver.iceGatherer.state === 'completed';
		  });
		  if (complete) {
			self.iceGatheringState = 'complete';
		  }
		}
	  });
	  this._localIceCandidatesBuffer = [];
	};

	window.RTCPeerConnection.prototype.getConfiguration = function() {
	  return this._config;
	};

	window.RTCPeerConnection.prototype.addStream = function(stream) {
	  // Clone is necessary for local demos mostly, attaching directly
	  // to two different senders does not work (build 10547).
	  this.localStreams.push(stream.clone());
	  this._maybeFireNegotiationNeeded();
	};

	window.RTCPeerConnection.prototype.removeStream = function(stream) {
	  var idx = this.localStreams.indexOf(stream);
	  if (idx > -1) {
		this.localStreams.splice(idx, 1);
		this._maybeFireNegotiationNeeded();
	  }
	};

	window.RTCPeerConnection.prototype.getSenders = function() {
	  return this.transceivers.filter(function(transceiver) {
		return !!transceiver.rtpSender;
	  })
	  .map(function(transceiver) {
		return transceiver.rtpSender;
	  });
	};

	window.RTCPeerConnection.prototype.getReceivers = function() {
	  return this.transceivers.filter(function(transceiver) {
		return !!transceiver.rtpReceiver;
	  })
	  .map(function(transceiver) {
		return transceiver.rtpReceiver;
	  });
	};

	// Determines the intersection of local and remote capabilities.
	window.RTCPeerConnection.prototype._getCommonCapabilities =
		function(localCapabilities, remoteCapabilities) {
		  var commonCapabilities = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: []
		  };
		  localCapabilities.codecs.forEach(function(lCodec) {
			for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
			  var rCodec = remoteCapabilities.codecs[i];
			  if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
				  lCodec.clockRate === rCodec.clockRate &&
				  lCodec.numChannels === rCodec.numChannels) {
				// push rCodec so we reply with offerer payload type
				commonCapabilities.codecs.push(rCodec);

				// determine common feedback mechanisms
				rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
				  for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
					if (lCodec.rtcpFeedback[j].type === fb.type &&
						lCodec.rtcpFeedback[j].parameter === fb.parameter) {
					  return true;
					}
				  }
				  return false;
				});
				// FIXME: also need to determine .parameters
				//  see https://github.com/openpeer/ortc/issues/569
				break;
			  }
			}
		  });

		  localCapabilities.headerExtensions
			  .forEach(function(lHeaderExtension) {
				for (var i = 0; i < remoteCapabilities.headerExtensions.length;
					 i++) {
				  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
				  if (lHeaderExtension.uri === rHeaderExtension.uri) {
					commonCapabilities.headerExtensions.push(rHeaderExtension);
					break;
				  }
				}
			  });

		  // FIXME: fecMechanisms
		  return commonCapabilities;
		};

	// Create ICE gatherer, ICE transport and DTLS transport.
	window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
		function(mid, sdpMLineIndex) {
		  var self = this;
		  var iceGatherer = new RTCIceGatherer(self.iceOptions);
		  var iceTransport = new RTCIceTransport(iceGatherer);
		  iceGatherer.onlocalcandidate = function(evt) {
			var event = new Event('icecandidate');
			event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

			var cand = evt.candidate;
			var end = !cand || Object.keys(cand).length === 0;
			// Edge emits an empty object for RTCIceCandidateComplete‥
			if (end) {
			  // polyfill since RTCIceGatherer.state is not implemented in
			  // Edge 10547 yet.
			  if (iceGatherer.state === undefined) {
				iceGatherer.state = 'completed';
			  }

			  // Emit a candidate with type endOfCandidates to make the samples
			  // work. Edge requires addIceCandidate with this empty candidate
			  // to start checking. The real solution is to signal
			  // end-of-candidates to the other side when getting the null
			  // candidate but some apps (like the samples) don't do that.
			  event.candidate.candidate =
				  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
			} else {
			  // RTCIceCandidate doesn't have a component, needs to be added
			  cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
			  event.candidate.candidate = SDPUtils.writeCandidate(cand);
			}

			// update local description.
			var sections = SDPUtils.splitSections(self.localDescription.sdp);
			if (event.candidate.candidate.indexOf('typ endOfCandidates')
				=== -1) {
			  sections[event.candidate.sdpMLineIndex + 1] +=
				  'a=' + event.candidate.candidate + '\r\n';
			} else {
			  sections[event.candidate.sdpMLineIndex + 1] +=
				  'a=end-of-candidates\r\n';
			}
			self.localDescription.sdp = sections.join('');

			var complete = self.transceivers.every(function(transceiver) {
			  return transceiver.iceGatherer &&
				  transceiver.iceGatherer.state === 'completed';
			});

			// Emit candidate if localDescription is set.
			// Also emits null candidate when all gatherers are complete.
			switch (self.iceGatheringState) {
			  case 'new':
				self._localIceCandidatesBuffer.push(event);
				if (end && complete) {
				  self._localIceCandidatesBuffer.push(
					  new Event('icecandidate'));
				}
				break;
			  case 'gathering':
				self._emitBufferedCandidates();
				self.dispatchEvent(event);
				if (self.onicecandidate !== null) {
				  self.onicecandidate(event);
				}
				if (complete) {
				  self.dispatchEvent(new Event('icecandidate'));
				  if (self.onicecandidate !== null) {
					self.onicecandidate(new Event('icecandidate'));
				  }
				  self.iceGatheringState = 'complete';
				}
				break;
			  case 'complete':
				// should not happen... currently!
				break;
			  default: // no-op.
				break;
			}
		  };
		  iceTransport.onicestatechange = function() {
			self._updateConnectionState();
		  };

		  var dtlsTransport = new RTCDtlsTransport(iceTransport);
		  dtlsTransport.ondtlsstatechange = function() {
			self._updateConnectionState();
		  };
		  dtlsTransport.onerror = function() {
			// onerror does not set state to failed by itself.
			dtlsTransport.state = 'failed';
			self._updateConnectionState();
		  };

		  return {
			iceGatherer: iceGatherer,
			iceTransport: iceTransport,
			dtlsTransport: dtlsTransport
		  };
		};

	// Start the RTP Sender and Receiver for a transceiver.
	window.RTCPeerConnection.prototype._transceive = function(transceiver,
		send, recv) {
	  var params = this._getCommonCapabilities(transceiver.localCapabilities,
		  transceiver.remoteCapabilities);
	  if (send && transceiver.rtpSender) {
		params.encodings = transceiver.sendEncodingParameters;
		params.rtcp = {
		  cname: SDPUtils.localCName
		};
		if (transceiver.recvEncodingParameters.length) {
		  params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
		}
		transceiver.rtpSender.send(params);
	  }
	  if (recv && transceiver.rtpReceiver) {
		// remove RTX field in Edge 14942
		if (transceiver.kind === 'video'
			&& transceiver.recvEncodingParameters) {
		  transceiver.recvEncodingParameters.forEach(function(p) {
			delete p.rtx;
		  });
		}
		params.encodings = transceiver.recvEncodingParameters;
		params.rtcp = {
		  cname: transceiver.cname
		};
		if (transceiver.sendEncodingParameters.length) {
		  params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
		}
		transceiver.rtpReceiver.receive(params);
	  }
	};

	window.RTCPeerConnection.prototype.setLocalDescription =
		function(description) {
		  var self = this;
		  var sections;
		  var sessionpart;
		  if (description.type === 'offer') {
			// FIXME: What was the purpose of this empty if statement?
			// if (!this._pendingOffer) {
			// } else {
			if (this._pendingOffer) {
			  // VERY limited support for SDP munging. Limited to:
			  // * changing the order of codecs
			  sections = SDPUtils.splitSections(description.sdp);
			  sessionpart = sections.shift();
			  sections.forEach(function(mediaSection, sdpMLineIndex) {
				var caps = SDPUtils.parseRtpParameters(mediaSection);
				self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
			  });
			  this.transceivers = this._pendingOffer;
			  delete this._pendingOffer;
			}
		  } else if (description.type === 'answer') {
			sections = SDPUtils.splitSections(self.remoteDescription.sdp);
			sessionpart = sections.shift();
			var isIceLite = SDPUtils.matchPrefix(sessionpart,
				'a=ice-lite').length > 0;
			sections.forEach(function(mediaSection, sdpMLineIndex) {
			  var transceiver = self.transceivers[sdpMLineIndex];
			  var iceGatherer = transceiver.iceGatherer;
			  var iceTransport = transceiver.iceTransport;
			  var dtlsTransport = transceiver.dtlsTransport;
			  var localCapabilities = transceiver.localCapabilities;
			  var remoteCapabilities = transceiver.remoteCapabilities;

			  var rejected = mediaSection.split('\n', 1)[0]
				  .split(' ', 2)[1] === '0';

			  if (!rejected && !transceiver.isDatachannel) {
				var remoteIceParameters = SDPUtils.getIceParameters(
					mediaSection, sessionpart);
				if (isIceLite) {
				  var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
				  .map(function(cand) {
					return SDPUtils.parseCandidate(cand);
				  })
				  .filter(function(cand) {
					return cand.component === '1';
				  });
				  // ice-lite only includes host candidates in the SDP so we can
				  // use setRemoteCandidates (which implies an
				  // RTCIceCandidateComplete)
				  if (cands.length) {
					iceTransport.setRemoteCandidates(cands);
				  }
				}
				var remoteDtlsParameters = SDPUtils.getDtlsParameters(
					mediaSection, sessionpart);
				if (isIceLite) {
				  remoteDtlsParameters.role = 'server';
				}

				if (!self.usingBundle || sdpMLineIndex === 0) {
				  iceTransport.start(iceGatherer, remoteIceParameters,
					  isIceLite ? 'controlling' : 'controlled');
				  dtlsTransport.start(remoteDtlsParameters);
				}

				// Calculate intersection of capabilities.
				var params = self._getCommonCapabilities(localCapabilities,
					remoteCapabilities);

				// Start the RTCRtpSender. The RTCRtpReceiver for this
				// transceiver has already been started in setRemoteDescription.
				self._transceive(transceiver,
					params.codecs.length > 0,
					false);
			  }
			});
		  }

		  this.localDescription = {
			type: description.type,
			sdp: description.sdp
		  };
		  switch (description.type) {
			case 'offer':
			  this._updateSignalingState('have-local-offer');
			  break;
			case 'answer':
			  this._updateSignalingState('stable');
			  break;
			default:
			  throw new TypeError('unsupported type "' + description.type +
				  '"');
		  }

		  // If a success callback was provided, emit ICE candidates after it
		  // has been executed. Otherwise, emit callback after the Promise is
		  // resolved.
		  var hasCallback = arguments.length > 1 &&
			typeof arguments[1] === 'function';
		  if (hasCallback) {
			var cb = arguments[1];
			window.setTimeout(function() {
			  cb();
			  if (self.iceGatheringState === 'new') {
				self.iceGatheringState = 'gathering';
			  }
			  self._emitBufferedCandidates();
			}, 0);
		  }
		  var p = Promise.resolve();
		  p.then(function() {
			if (!hasCallback) {
			  if (self.iceGatheringState === 'new') {
				self.iceGatheringState = 'gathering';
			  }
			  // Usually candidates will be emitted earlier.
			  window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
			}
		  });
		  return p;
		};

	window.RTCPeerConnection.prototype.setRemoteDescription =
		function(description) {
		  var self = this;
		  var stream = new MediaStream();
		  var receiverList = [];
		  var sections = SDPUtils.splitSections(description.sdp);
		  var sessionpart = sections.shift();
		  var isIceLite = SDPUtils.matchPrefix(sessionpart,
			  'a=ice-lite').length > 0;
		  this.usingBundle = SDPUtils.matchPrefix(sessionpart,
			  'a=group:BUNDLE ').length > 0;
		  sections.forEach(function(mediaSection, sdpMLineIndex) {
			var lines = SDPUtils.splitLines(mediaSection);
			var mline = lines[0].substr(2).split(' ');
			var kind = mline[0];
			var rejected = mline[1] === '0';
			var direction = SDPUtils.getDirection(mediaSection, sessionpart);

			var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
			if (mid.length) {
			  mid = mid[0].substr(6);
			} else {
			  mid = SDPUtils.generateIdentifier();
			}

			// Reject datachannels which are not implemented yet.
			if (kind === 'application' && mline[2] === 'DTLS/SCTP') {
			  self.transceivers[sdpMLineIndex] = {
				mid: mid,
				isDatachannel: true
			  };
			  return;
			}

			var transceiver;
			var iceGatherer;
			var iceTransport;
			var dtlsTransport;
			var rtpSender;
			var rtpReceiver;
			var sendEncodingParameters;
			var recvEncodingParameters;
			var localCapabilities;

			var track;
			// FIXME: ensure the mediaSection has rtcp-mux set.
			var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
			var remoteIceParameters;
			var remoteDtlsParameters;
			if (!rejected) {
			  remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
				  sessionpart);
			  remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
				  sessionpart);
			  remoteDtlsParameters.role = 'client';
			}
			recvEncodingParameters =
				SDPUtils.parseRtpEncodingParameters(mediaSection);

			var cname;
			// Gets the first SSRC. Note that with RTX there might be multiple
			// SSRCs.
			var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
				.map(function(line) {
				  return SDPUtils.parseSsrcMedia(line);
				})
				.filter(function(obj) {
				  return obj.attribute === 'cname';
				})[0];
			if (remoteSsrc) {
			  cname = remoteSsrc.value;
			}

			var isComplete = SDPUtils.matchPrefix(mediaSection,
				'a=end-of-candidates', sessionpart).length > 0;
			var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
				.map(function(cand) {
				  return SDPUtils.parseCandidate(cand);
				})
				.filter(function(cand) {
				  return cand.component === '1';
				});
			if (description.type === 'offer' && !rejected) {
			  var transports = self.usingBundle && sdpMLineIndex > 0 ? {
				iceGatherer: self.transceivers[0].iceGatherer,
				iceTransport: self.transceivers[0].iceTransport,
				dtlsTransport: self.transceivers[0].dtlsTransport
			  } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

			  if (isComplete) {
				transports.iceTransport.setRemoteCandidates(cands);
			  }

			  localCapabilities = RTCRtpReceiver.getCapabilities(kind);

			  // filter RTX until additional stuff needed for RTX is implemented
			  // in adapter.js
			  localCapabilities.codecs = localCapabilities.codecs.filter(
				  function(codec) {
					return codec.name !== 'rtx';
				  });

			  sendEncodingParameters = [{
				ssrc: (2 * sdpMLineIndex + 2) * 1001
			  }];

			  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

			  track = rtpReceiver.track;
			  receiverList.push([track, rtpReceiver]);
			  // FIXME: not correct when there are multiple streams but that is
			  // not currently supported in this shim.
			  stream.addTrack(track);

			  // FIXME: look at direction.
			  if (self.localStreams.length > 0 &&
				  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
				var localTrack;
				if (kind === 'audio') {
				  localTrack = self.localStreams[0].getAudioTracks()[0];
				} else if (kind === 'video') {
				  localTrack = self.localStreams[0].getVideoTracks()[0];
				}
				if (localTrack) {
				  rtpSender = new RTCRtpSender(localTrack,
					  transports.dtlsTransport);
				}
			  }

			  self.transceivers[sdpMLineIndex] = {
				iceGatherer: transports.iceGatherer,
				iceTransport: transports.iceTransport,
				dtlsTransport: transports.dtlsTransport,
				localCapabilities: localCapabilities,
				remoteCapabilities: remoteCapabilities,
				rtpSender: rtpSender,
				rtpReceiver: rtpReceiver,
				kind: kind,
				mid: mid,
				cname: cname,
				sendEncodingParameters: sendEncodingParameters,
				recvEncodingParameters: recvEncodingParameters
			  };
			  // Start the RTCRtpReceiver now. The RTPSender is started in
			  // setLocalDescription.
			  self._transceive(self.transceivers[sdpMLineIndex],
				  false,
				  direction === 'sendrecv' || direction === 'sendonly');
			} else if (description.type === 'answer' && !rejected) {
			  transceiver = self.transceivers[sdpMLineIndex];
			  iceGatherer = transceiver.iceGatherer;
			  iceTransport = transceiver.iceTransport;
			  dtlsTransport = transceiver.dtlsTransport;
			  rtpSender = transceiver.rtpSender;
			  rtpReceiver = transceiver.rtpReceiver;
			  sendEncodingParameters = transceiver.sendEncodingParameters;
			  localCapabilities = transceiver.localCapabilities;

			  self.transceivers[sdpMLineIndex].recvEncodingParameters =
				  recvEncodingParameters;
			  self.transceivers[sdpMLineIndex].remoteCapabilities =
				  remoteCapabilities;
			  self.transceivers[sdpMLineIndex].cname = cname;

			  if ((isIceLite || isComplete) && cands.length) {
				iceTransport.setRemoteCandidates(cands);
			  }
			  if (!self.usingBundle || sdpMLineIndex === 0) {
				iceTransport.start(iceGatherer, remoteIceParameters,
					'controlling');
				dtlsTransport.start(remoteDtlsParameters);
			  }

			  self._transceive(transceiver,
				  direction === 'sendrecv' || direction === 'recvonly',
				  direction === 'sendrecv' || direction === 'sendonly');

			  if (rtpReceiver &&
				  (direction === 'sendrecv' || direction === 'sendonly')) {
				track = rtpReceiver.track;
				receiverList.push([track, rtpReceiver]);
				stream.addTrack(track);
			  } else {
				// FIXME: actually the receiver should be created later.
				delete transceiver.rtpReceiver;
			  }
			}
		  });

		  this.remoteDescription = {
			type: description.type,
			sdp: description.sdp
		  };
		  switch (description.type) {
			case 'offer':
			  this._updateSignalingState('have-remote-offer');
			  break;
			case 'answer':
			  this._updateSignalingState('stable');
			  break;
			default:
			  throw new TypeError('unsupported type "' + description.type +
				  '"');
		  }
		  if (stream.getTracks().length) {
			self.remoteStreams.push(stream);
			window.setTimeout(function() {
			  var event = new Event('addstream');
			  event.stream = stream;
			  self.dispatchEvent(event);
			  if (self.onaddstream !== null) {
				window.setTimeout(function() {
				  self.onaddstream(event);
				}, 0);
			  }

			  receiverList.forEach(function(item) {
				var track = item[0];
				var receiver = item[1];
				var trackEvent = new Event('track');
				trackEvent.track = track;
				trackEvent.receiver = receiver;
				trackEvent.streams = [stream];
				self.dispatchEvent(event);
				if (self.ontrack !== null) {
				  window.setTimeout(function() {
					self.ontrack(trackEvent);
				  }, 0);
				}
			  });
			}, 0);
		  }
		  if (arguments.length > 1 && typeof arguments[1] === 'function') {
			window.setTimeout(arguments[1], 0);
		  }
		  return Promise.resolve();
		};

	window.RTCPeerConnection.prototype.close = function() {
	  this.transceivers.forEach(function(transceiver) {
		/* not yet
		if (transceiver.iceGatherer) {
		  transceiver.iceGatherer.close();
		}
		*/
		if (transceiver.iceTransport) {
		  transceiver.iceTransport.stop();
		}
		if (transceiver.dtlsTransport) {
		  transceiver.dtlsTransport.stop();
		}
		if (transceiver.rtpSender) {
		  transceiver.rtpSender.stop();
		}
		if (transceiver.rtpReceiver) {
		  transceiver.rtpReceiver.stop();
		}
	  });
	  // FIXME: clean up tracks, local streams, remote streams, etc
	  this._updateSignalingState('closed');
	};

	// Update the signaling state.
	window.RTCPeerConnection.prototype._updateSignalingState =
		function(newState) {
		  this.signalingState = newState;
		  var event = new Event('signalingstatechange');
		  this.dispatchEvent(event);
		  if (this.onsignalingstatechange !== null) {
			this.onsignalingstatechange(event);
		  }
		};

	// Determine whether to fire the negotiationneeded event.
	window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
		function() {
		  // Fire away (for now).
		  var event = new Event('negotiationneeded');
		  this.dispatchEvent(event);
		  if (this.onnegotiationneeded !== null) {
			this.onnegotiationneeded(event);
		  }
		};

	// Update the connection state.
	window.RTCPeerConnection.prototype._updateConnectionState = function() {
	  var self = this;
	  var newState;
	  var states = {
		'new': 0,
		closed: 0,
		connecting: 0,
		checking: 0,
		connected: 0,
		completed: 0,
		failed: 0
	  };
	  this.transceivers.forEach(function(transceiver) {
		states[transceiver.iceTransport.state]++;
		states[transceiver.dtlsTransport.state]++;
	  });
	  // ICETransport.completed and connected are the same for this purpose.
	  states.connected += states.completed;

	  newState = 'new';
	  if (states.failed > 0) {
		newState = 'failed';
	  } else if (states.connecting > 0 || states.checking > 0) {
		newState = 'connecting';
	  } else if (states.disconnected > 0) {
		newState = 'disconnected';
	  } else if (states['new'] > 0) {		/* fix for ie8 */
		newState = 'new';
	  } else if (states.connected > 0 || states.completed > 0) {
		newState = 'connected';
	  }

	  if (newState !== self.iceConnectionState) {
		self.iceConnectionState = newState;
		var event = new Event('iceconnectionstatechange');
		this.dispatchEvent(event);
		if (this.oniceconnectionstatechange !== null) {
		  this.oniceconnectionstatechange(event);
		}
	  }
	};

	window.RTCPeerConnection.prototype.createOffer = function() {
	  var self = this;
	  if (this._pendingOffer) {
		throw new Error('createOffer called while there is a pending offer.');
	  }
	  var offerOptions;
	  if (arguments.length === 1 && typeof arguments[0] !== 'function') {
		offerOptions = arguments[0];
	  } else if (arguments.length === 3) {
		offerOptions = arguments[2];
	  }

	  var tracks = [];
	  var numAudioTracks = 0;
	  var numVideoTracks = 0;
	  // Default to sendrecv.
	  if (this.localStreams.length) {
		numAudioTracks = this.localStreams[0].getAudioTracks().length;
		numVideoTracks = this.localStreams[0].getVideoTracks().length;
	  }
	  // Determine number of audio and video tracks we need to send/recv.
	  if (offerOptions) {
		// Reject Chrome legacy constraints.
		if (offerOptions.mandatory || offerOptions.optional) {
		  throw new TypeError(
			  'Legacy mandatory/optional constraints not supported.');
		}
		if (offerOptions.offerToReceiveAudio !== undefined) {
		  numAudioTracks = offerOptions.offerToReceiveAudio;
		}
		if (offerOptions.offerToReceiveVideo !== undefined) {
		  numVideoTracks = offerOptions.offerToReceiveVideo;
		}
	  }
	  if (this.localStreams.length) {
		// Push local streams.
		this.localStreams[0].getTracks().forEach(function(track) {
		  tracks.push({
			kind: track.kind,
			track: track,
			wantReceive: track.kind === 'audio' ?
				numAudioTracks > 0 : numVideoTracks > 0
		  });
		  if (track.kind === 'audio') {
			numAudioTracks--;
		  } else if (track.kind === 'video') {
			numVideoTracks--;
		  }
		});
	  }
	  // Create M-lines for recvonly streams.
	  while (numAudioTracks > 0 || numVideoTracks > 0) {
		if (numAudioTracks > 0) {
		  tracks.push({
			kind: 'audio',
			wantReceive: true
		  });
		  numAudioTracks--;
		}
		if (numVideoTracks > 0) {
		  tracks.push({
			kind: 'video',
			wantReceive: true
		  });
		  numVideoTracks--;
		}
	  }

	  var sdp = SDPUtils.writeSessionBoilerplate();
	  var transceivers = [];
	  tracks.forEach(function(mline, sdpMLineIndex) {
		// For each track, create an ice gatherer, ice transport,
		// dtls transport, potentially rtpsender and rtpreceiver.
		var track = mline.track;
		var kind = mline.kind;
		var mid = SDPUtils.generateIdentifier();

		var transports = self.usingBundle && sdpMLineIndex > 0 ? {
		  iceGatherer: transceivers[0].iceGatherer,
		  iceTransport: transceivers[0].iceTransport,
		  dtlsTransport: transceivers[0].dtlsTransport
		} : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

		var localCapabilities = RTCRtpSender.getCapabilities(kind);
		// filter RTX until additional stuff needed for RTX is implemented
		// in adapter.js
		localCapabilities.codecs = localCapabilities.codecs.filter(
			function(codec) {
			  return codec.name !== 'rtx';
			});
		localCapabilities.codecs.forEach(function(codec) {
		  // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
		  // by adding level-asymmetry-allowed=1
		  if (codec.name === 'H264' &&
			  codec.parameters['level-asymmetry-allowed'] === undefined) {
			codec.parameters['level-asymmetry-allowed'] = '1';
		  }
		});

		var rtpSender;
		var rtpReceiver;

		// generate an ssrc now, to be used later in rtpSender.send
		var sendEncodingParameters = [{
		  ssrc: (2 * sdpMLineIndex + 1) * 1001
		}];
		if (track) {
		  rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
		}

		if (mline.wantReceive) {
		  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
		}

		transceivers[sdpMLineIndex] = {
		  iceGatherer: transports.iceGatherer,
		  iceTransport: transports.iceTransport,
		  dtlsTransport: transports.dtlsTransport,
		  localCapabilities: localCapabilities,
		  remoteCapabilities: null,
		  rtpSender: rtpSender,
		  rtpReceiver: rtpReceiver,
		  kind: kind,
		  mid: mid,
		  sendEncodingParameters: sendEncodingParameters,
		  recvEncodingParameters: null
		};
	  });
	  if (this.usingBundle) {
		sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
		  return t.mid;
		}).join(' ') + '\r\n';
	  }
	  tracks.forEach(function(mline, sdpMLineIndex) {
		var transceiver = transceivers[sdpMLineIndex];
		sdp += SDPUtils.writeMediaSection(transceiver,
			transceiver.localCapabilities, 'offer', self.localStreams[0]);
	  });

	  this._pendingOffer = transceivers;
	  var desc = new RTCSessionDescription({
		type: 'offer',
		sdp: sdp
	  });
	  if (arguments.length && typeof arguments[0] === 'function') {
		window.setTimeout(arguments[0], 0, desc);
	  }
	  return Promise.resolve(desc);
	};

	window.RTCPeerConnection.prototype.createAnswer = function() {
	  var self = this;

	  var sdp = SDPUtils.writeSessionBoilerplate();
	  if (this.usingBundle) {
		sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
		  return t.mid;
		}).join(' ') + '\r\n';
	  }
	  this.transceivers.forEach(function(transceiver) {
		if (transceiver.isDatachannel) {
		  sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
			  'c=IN IP4 0.0.0.0\r\n' +
			  'a=mid:' + transceiver.mid + '\r\n';
		  return;
		}
		// Calculate intersection of capabilities.
		var commonCapabilities = self._getCommonCapabilities(
			transceiver.localCapabilities,
			transceiver.remoteCapabilities);

		sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
			'answer', self.localStreams[0]);
	  });

	  var desc = new RTCSessionDescription({
		type: 'answer',
		sdp: sdp
	  });
	  if (arguments.length && typeof arguments[0] === 'function') {
		window.setTimeout(arguments[0], 0, desc);
	  }
	  return Promise.resolve(desc);
	};

	window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
	  if (candidate === null) {
		this.transceivers.forEach(function(transceiver) {
		  transceiver.iceTransport.addRemoteCandidate({});
		});
	  } else {
		var mLineIndex = candidate.sdpMLineIndex;
		if (candidate.sdpMid) {
		  for (var i = 0; i < this.transceivers.length; i++) {
			if (this.transceivers[i].mid === candidate.sdpMid) {
			  mLineIndex = i;
			  break;
			}
		  }
		}
		var transceiver = this.transceivers[mLineIndex];
		if (transceiver) {
		  var cand = Object.keys(candidate.candidate).length > 0 ?
			  SDPUtils.parseCandidate(candidate.candidate) : {};
		  // Ignore Chrome's invalid candidates since Edge does not like them.
		  if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
			return;
		  }
		  // Ignore RTCP candidates, we assume RTCP-MUX.
		  if (cand.component !== '1') {
			return;
		  }
		  // A dirty hack to make samples work.
		  if (cand.type === 'endOfCandidates') {
			cand = {};
		  }
		  transceiver.iceTransport.addRemoteCandidate(cand);

		  // update the remoteDescription.
		  var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
		  sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
			  : 'a=end-of-candidates') + '\r\n';
		  this.remoteDescription.sdp = sections.join('');
		}
	  }
	  if (arguments.length > 1 && typeof arguments[1] === 'function') {
		window.setTimeout(arguments[1], 0);
	  }
	  return Promise.resolve();
	};

	window.RTCPeerConnection.prototype.getStats = function() {
	  var promises = [];
	  this.transceivers.forEach(function(transceiver) {
		['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
			'dtlsTransport'].forEach(function(method) {
			  if (transceiver[method]) {
				promises.push(transceiver[method].getStats());
			  }
			});
	  });
	  var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
		  arguments[1];
	  return new Promise(function(resolve) {
		// shim getStats with maplike support
		var results = new Map();
		Promise.all(promises).then(function(res) {
		  res.forEach(function(result) {
			Object.keys(result).forEach(function(id) {
			  results.set(id, result[id]);
			  results[id] = result[id];
			});
		  });
		  if (cb) {
			window.setTimeout(cb, 0, results);
		  }
		  resolve(results);
		});
	  });
	};
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":10,"./getusermedia":6,"sdp":1}],6:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
	return {
	  name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
	  message: e.message,
	  constraint: e.constraint,
	  toString: function() {
		return this.name;
	  }
	};
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
	  bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
	return origGetUserMedia(c)['catch'](function(e) {		/* fix for ie8 */
	  return Promise.reject(shimError_(e));
	});
  };
};

},{}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
	if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
		window.RTCPeerConnection.prototype)) {
	  Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
		get: function() {
		  return this._ontrack;
		},
		set: function(f) {
		  if (this._ontrack) {
			this.removeEventListener('track', this._ontrack);
			this.removeEventListener('addstream', this._ontrackpoly);
		  }
		  this.addEventListener('track', this._ontrack = f);
		  this.addEventListener('addstream', this._ontrackpoly = function(e) {
			e.stream.getTracks().forEach(function(track) {
			  var event = new Event('track');
			  event.track = track;
			  event.receiver = {track: track};
			  event.streams = [e.stream];
			  this.dispatchEvent(event);
			}.bind(this));
		  }.bind(this));
		}
	  });
	}
  },

  shimSourceObject: function() {
	// Firefox has supported mozSrcObject since FF22, unprefixed in 42.
	if (typeof window === 'object') {
	  if (window.HTMLMediaElement &&
		!('srcObject' in window.HTMLMediaElement.prototype)) {
		// Shim the srcObject property, once, when HTMLMediaElement is found.
		Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
		  get: function() {
			return this.mozSrcObject;
		  },
		  set: function(stream) {
			this.mozSrcObject = stream;
		  }
		});
	  }
	}
  },

  shimPeerConnection: function() {
	if (typeof window !== 'object' || !(window.RTCPeerConnection ||
		window.mozRTCPeerConnection)) {
	  return; // probably media.peerconnection.enabled=false in about:config
	}
	// The RTCPeerConnection object.
	if (!window.RTCPeerConnection) {
	  window.RTCPeerConnection = function(pcConfig, pcConstraints) {
		if (browserDetails.version < 38) {
		  // .urls is not supported in FF < 38.
		  // create RTCIceServers with a single url.
		  if (pcConfig && pcConfig.iceServers) {
			var newIceServers = [];
			for (var i = 0; i < pcConfig.iceServers.length; i++) {
			  var server = pcConfig.iceServers[i];
			  if (server.hasOwnProperty('urls')) {
				for (var j = 0; j < server.urls.length; j++) {
				  var newServer = {
					url: server.urls[j]
				  };
				  if (server.urls[j].indexOf('turn') === 0) {
					newServer.username = server.username;
					newServer.credential = server.credential;
				  }
				  newIceServers.push(newServer);
				}
			  } else {
				newIceServers.push(pcConfig.iceServers[i]);
			  }
			}
			pcConfig.iceServers = newIceServers;
		  }
		}
		return new mozRTCPeerConnection(pcConfig, pcConstraints);
	  };
	  window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

	  // wrap static methods. Currently just generateCertificate.
	  if (mozRTCPeerConnection.generateCertificate) {
		Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
		  get: function() {
			return mozRTCPeerConnection.generateCertificate;
		  }
		});
	  }

	  window.RTCSessionDescription = mozRTCSessionDescription;
	  window.RTCIceCandidate = mozRTCIceCandidate;
	}

	// shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
	['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
		.forEach(function(method) {
		  var nativeMethod = RTCPeerConnection.prototype[method];
		  RTCPeerConnection.prototype[method] = function() {
			arguments[0] = new ((method === 'addIceCandidate') ?
				RTCIceCandidate : RTCSessionDescription)(arguments[0]);
			return nativeMethod.apply(this, arguments);
		  };
		});

	// support for addIceCandidate(null)
	var nativeAddIceCandidate =
		RTCPeerConnection.prototype.addIceCandidate;
	RTCPeerConnection.prototype.addIceCandidate = function() {
	  if (arguments[0] === null) {
		if (arguments[1]) {
		  arguments[1].apply(null);
		}
		return Promise.resolve();
	  }
	  return nativeAddIceCandidate.apply(this, arguments);
	};

	// shim getStats with maplike support
	var makeMapStats = function(stats) {
	  var map = new Map();
	  Object.keys(stats).forEach(function(key) {
		map.set(key, stats[key]);
		map[key] = stats[key];
	  });
	  return map;
	};

	var nativeGetStats = RTCPeerConnection.prototype.getStats;
	RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
	  return nativeGetStats.apply(this, [selector || null])
		.then(function(stats) {
		  return makeMapStats(stats);
		})
		.then(onSucc, onErr);
	};
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":10,"./getusermedia":8}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
	return {
	  name: {
		SecurityError: 'NotAllowedError',
		PermissionDeniedError: 'NotAllowedError'
	  }[e.name] || e.name,
	  message: {
		'The operation is insecure.': 'The request is not allowed by the ' +
		'user agent or the platform in the current context.'
	  }[e.message] || e.message,
	  constraint: e.constraint,
	  toString: function() {
		return this.name + (this.message && ': ') + this.message;
	  }
	};
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
	var constraintsToFF37_ = function(c) {
	  if (typeof c !== 'object' || c.require) {
		return c;
	  }
	  var require = [];
	  Object.keys(c).forEach(function(key) {
		if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
		  return;
		}
		var r = c[key] = (typeof c[key] === 'object') ?
			c[key] : {ideal: c[key]};
		if (r.min !== undefined ||
			r.max !== undefined || r.exact !== undefined) {
		  require.push(key);
		}
		if (r.exact !== undefined) {
		  if (typeof r.exact === 'number') {
			r. min = r.max = r.exact;
		  } else {
			c[key] = r.exact;
		  }
		  delete r.exact;
		}
		if (r.ideal !== undefined) {
		  c.advanced = c.advanced || [];
		  var oc = {};
		  if (typeof r.ideal === 'number') {
			oc[key] = {min: r.ideal, max: r.ideal};
		  } else {
			oc[key] = r.ideal;
		  }
		  c.advanced.push(oc);
		  delete r.ideal;
		  if (!Object.keys(r).length) {
			delete c[key];
		  }
		}
	  });
	  if (require.length) {
		c.require = require;
	  }
	  return c;
	};
	constraints = JSON.parse(JSON.stringify(constraints));
	if (browserDetails.version < 38) {
	  logging('spec: ' + JSON.stringify(constraints));
	  if (constraints.audio) {
		constraints.audio = constraintsToFF37_(constraints.audio);
	  }
	  if (constraints.video) {
		constraints.video = constraintsToFF37_(constraints.video);
	  }
	  logging('ff37: ' + JSON.stringify(constraints));
	}
	return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
	  onError(shimError_(e));
	});
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
	return new Promise(function(resolve, reject) {
	  getUserMedia_(constraints, resolve, reject);
	});
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
	navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
	  addEventListener: function() { },
	  removeEventListener: function() { }
	};
  }
  navigator.mediaDevices.enumerateDevices =
	  navigator.mediaDevices.enumerateDevices || function() {
		return new Promise(function(resolve) {
		  var infos = [
			{kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
			{kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
		  ];
		  resolve(infos);
		});
	  };

  if (browserDetails.version < 41) {
	// Work around http://bugzil.la/1169665
	var orgEnumerateDevices =
		navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
	navigator.mediaDevices.enumerateDevices = function() {
	  return orgEnumerateDevices().then(undefined, function(e) {
		if (e.name === 'NotFoundError') {
		  return [];
		}
		throw e;
	  });
	};
  }
  if (browserDetails.version < 49) {
	var origGetUserMedia = navigator.mediaDevices.getUserMedia.
		bind(navigator.mediaDevices);
	navigator.mediaDevices.getUserMedia = function(c) {
	  return origGetUserMedia(c).then(function(stream) {
		// Work around https://bugzil.la/802326
		if (c.audio && !stream.getAudioTracks().length ||
			c.video && !stream.getVideoTracks().length) {
		  stream.getTracks().forEach(function(track) {
			track.stop();
		  });
		  throw new DOMException('The object can not be found here.',
								 'NotFoundError');
		}
		return stream;
	  }, function(e) {
		return Promise.reject(shimError_(e));
	  });
	};
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
	if (browserDetails.version < 44) {
	  return getUserMedia_(constraints, onSuccess, onError);
	}
	// Replace Firefox 44+'s deprecation warning with unprefixed version.
	console.warn('navigator.getUserMedia has been replaced by ' +
				 'navigator.mediaDevices.getUserMedia');
	navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":10}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
	navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
	if (typeof bool !== 'boolean') {
	  return new Error('Argument type: ' + typeof bool +
		  '. Please use a boolean.');
	}
	logDisabled_ = bool;
	return (bool) ? 'adapter.js logging disabled' :
		'adapter.js logging enabled';
  },

  log: function() {
	if (typeof window === 'object') {
	  if (logDisabled_) {
		return;
	  }
	  if (typeof console !== 'undefined' && typeof console.log === 'function') {
		console.log.apply(console, arguments);
	  }
	}
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
	var match = uastring.match(expr);
	return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *	 properties.
   */
  detectBrowser: function() {
	// Returned result object.
	var result = {};
	result.browser = null;
	result.version = null;

	// Fail early if it's not a browser
	if (typeof window === 'undefined' || !window.navigator) {
	  result.browser = 'Not a browser.';
	  return result;
	}

	// Firefox.
	if (navigator.mozGetUserMedia) {
	  result.browser = 'firefox';
	  result.version = this.extractVersion(navigator.userAgent,
		  /Firefox\/([0-9]+)\./, 1);

	// all webkit-based browsers
	} else if (navigator.webkitGetUserMedia) {
	  // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
	  if (window.webkitRTCPeerConnection) {
		result.browser = 'chrome';
		result.version = this.extractVersion(navigator.userAgent,
		  /Chrom(e|ium)\/([0-9]+)\./, 2);

	  // Safari or unknown webkit-based
	  // for the time being Safari has support for MediaStreams but not webRTC
	  } else {
		// Safari UA substrings of interest for reference:
		// - webkit version:		   AppleWebKit/602.1.25 (also used in Op,Cr)
		// - safari UI version:		Version/9.0.3 (unique to Safari)
		// - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
		//
		// if the webkit version and safari UI webkit versions are equals,
		// ... this is a stable version.
		//
		// only the internal webkit version is important today to know if
		// media streams are supported
		//
		if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
		  result.browser = 'safari';
		  result.version = this.extractVersion(navigator.userAgent,
			/AppleWebKit\/([0-9]+)\./, 1);

		// unknown webkit-based browser
		} else {
		  result.browser = 'Unsupported webkit-based browser ' +
			  'with GUM support but no WebRTC support.';
		  return result;
		}
	  }

	// Edge.
	} else if (navigator.mediaDevices &&
		navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
	  result.browser = 'edge';
	  result.version = this.extractVersion(navigator.userAgent,
		  /Edge\/(\d+).(\d+)$/, 2);

	// Default fallthrough: not supported.
	} else {
	  result.browser = 'Not a supported browser.';
	  return result;
	}

	return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}]},{},[2])(2)
});
/**
 * git do not control webim.config.js
 * everyone should copy webim.config.js.demo to webim.config.js
 * and have their own configs.
 * In this way , others won't be influenced by this config while git pull.
 *
 */
var WebIM = {};

// 表情包
WebIM.Emoji = {
	path: 'static/img/faces/',
	map: {
		'[):]': 'ee_1.png',
		'[:D]': 'ee_2.png',
		'[;)]': 'ee_3.png',
		'[:-o]': 'ee_4.png',
		'[:p]': 'ee_5.png',
		'[(H)]': 'ee_6.png',
		'[:@]': 'ee_7.png',
		'[:s]': 'ee_8.png',
		'[:$]': 'ee_9.png',
		'[:(]': 'ee_10.png',
		'[:\'(]': 'ee_11.png',
		'[:|]': 'ee_12.png',
		'[(a)]': 'ee_13.png',
		'[8o|]': 'ee_14.png',
		'[8-|]': 'ee_15.png',
		'[+o(]': 'ee_16.png',
		'[<o)]': 'ee_17.png',
		'[|-)]': 'ee_18.png',
		'[*-)]': 'ee_19.png',
		'[:-#]': 'ee_20.png',
		'[:-*]': 'ee_21.png',
		'[^o)]': 'ee_22.png',
		'[8-)]': 'ee_23.png',
		'[(|)]': 'ee_24.png',
		'[(u)]': 'ee_25.png',
		'[(S)]': 'ee_26.png',
		'[(*)]': 'ee_27.png',
		'[(#)]': 'ee_28.png',
		'[(R)]': 'ee_29.png',
		'[({)]': 'ee_30.png',
		'[(})]': 'ee_31.png',
		'[(k)]': 'ee_32.png',
		'[(F)]': 'ee_33.png',
		'[(W)]': 'ee_34.png',
		'[(D)]': 'ee_35.png'
	}
};

WebIM.config = {
	/*
	 * XMPP server
	 */
	// xmppURL: 'im-api.easemob.com',
	/*
	 * Backend REST API URL
	 */
	// apiURL: (location.protocol === 'https:' ? 'https:' : 'http:') + '//a1.easemob.com',
	/*
	 * Application AppKey
	 */
	// appkey: 'easemob-demo#chatdemoui',
	/*
	 * Whether to use wss
	 * @parameter {Boolean} true or false
	 */
	// https: false,
	/*
	 * isMultiLoginSessions
	 * true: A visitor can sign in to multiple webpages and receive messages at all the webpages.
	 * false: A visitor can sign in to only one webpage and receive messages at the webpage.
	 */
	// isMultiLoginSessions: false,
	/*
	 * Set to auto sign-in
	 */
	isAutoLogin: true,
	/**
	 * Whether to use window.doQuery()
	 * @parameter {Boolean} true or false
	 */
	isWindowSDK: false,
	/**
	 * isSandBox=true:  xmppURL: 'im-api.sandbox.easemob.com',  apiURL: '//a1.sdb.easemob.com',
	 * isSandBox=false: xmppURL: 'im-api.easemob.com',          apiURL: '//a1.easemob.com',
	 * @parameter {Boolean} true or false
	 */
	isSandBox: false,
	/**
	 * Whether to console.log in strophe.log()
	 * @parameter {Boolean} true or false
	 */
	isDebug: false,
	/**
	 * will auto connect the xmpp server autoReconnectNumMax times in background when client is offline.
	 * won't auto connect if autoReconnectNumMax=0.
	 */
	autoReconnectNumMax: 2,
	/**
	 * the interval secons between each atuo reconnectting.
	 * works only if autoReconnectMaxNum >= 2.
	 */
	autoReconnectInterval: 2,
	/**
	 * webrtc supports WebKit and https only
	 */
	isWebRTC: /WebKit/.test(navigator.userAgent) && /^https\:$/.test(window.location.protocol),
	/**
	 * while http access,use ip directly,instead of ServerName,avoiding DNS problem.
	 */
	isHttpDNS: false
};

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(230);


/***/ },

/***/ 223:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	;
	(function () {

	    var EMPTYFN = function EMPTYFN() {};
	    var _code = __webpack_require__(224).code;
	    var WEBIM_FILESIZE_LIMIT = 10485760;

	    var _createStandardXHR = function _createStandardXHR() {
	        try {
	            return new window.XMLHttpRequest();
	        } catch (e) {
	            return false;
	        }
	    };

	    var _createActiveXHR = function _createActiveXHR() {
	        try {
	            return new window.ActiveXObject('Microsoft.XMLHTTP');
	        } catch (e) {
	            return false;
	        }
	    };

	    var _xmlrequest = function _xmlrequest(crossDomain) {
	        crossDomain = crossDomain || true;
	        var temp = _createStandardXHR() || _createActiveXHR();

	        if ('withCredentials' in temp) {
	            return temp;
	        }
	        if (!crossDomain) {
	            return temp;
	        }
	        if (typeof window.XDomainRequest === 'undefined') {
	            return temp;
	        }
	        var xhr = new XDomainRequest();
	        xhr.readyState = 0;
	        xhr.status = 100;
	        xhr.onreadystatechange = EMPTYFN;
	        xhr.onload = function () {
	            xhr.readyState = 4;
	            xhr.status = 200;

	            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
	            xmlDoc.async = 'false';
	            xmlDoc.loadXML(xhr.responseText);
	            xhr.responseXML = xmlDoc;
	            xhr.response = xhr.responseText;
	            xhr.onreadystatechange();
	        };
	        xhr.ontimeout = xhr.onerror = function () {
	            xhr.readyState = 4;
	            xhr.status = 500;
	            xhr.onreadystatechange();
	        };
	        return xhr;
	    };

	    var _hasFlash = function () {
	        if ('ActiveXObject' in window) {
	            try {
	                return new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	            } catch (ex) {
	                return 0;
	            }
	        } else {
	            if (navigator.plugins && navigator.plugins.length > 0) {
	                return navigator.plugins['Shockwave Flash'];
	            }
	        }
	        return 0;
	    }();

	    var _tmpUtilXHR = _xmlrequest(),
	        _hasFormData = typeof FormData !== 'undefined',
	        _hasBlob = typeof Blob !== 'undefined',
	        _isCanSetRequestHeader = _tmpUtilXHR.setRequestHeader || false,
	        _hasOverrideMimeType = _tmpUtilXHR.overrideMimeType || false,
	        _isCanUploadFileAsync = _isCanSetRequestHeader && _hasFormData,
	        _isCanUploadFile = _isCanUploadFileAsync || _hasFlash,
	        _isCanDownLoadFile = _isCanSetRequestHeader && (_hasBlob || _hasOverrideMimeType);

	    if (!Object.keys) {
	        Object.keys = function () {
	            'use strict';

	            var hasOwnProperty = Object.prototype.hasOwnProperty,
	                hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
	                dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
	                dontEnumsLength = dontEnums.length;

	            return function (obj) {
	                if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' && (typeof obj !== 'function' || obj === null)) {
	                    throw new TypeError('Object.keys called on non-object');
	                }

	                var result = [],
	                    prop,
	                    i;

	                for (prop in obj) {
	                    if (hasOwnProperty.call(obj, prop)) {
	                        result.push(prop);
	                    }
	                }

	                if (hasDontEnumBug) {
	                    for (i = 0; i < dontEnumsLength; i++) {
	                        if (hasOwnProperty.call(obj, dontEnums[i])) {
	                            result.push(dontEnums[i]);
	                        }
	                    }
	                }
	                return result;
	            };
	        }();
	    }

	    var utils = {
	        hasFormData: _hasFormData,

	        hasBlob: _hasBlob,

	        emptyfn: EMPTYFN,

	        isCanSetRequestHeader: _isCanSetRequestHeader,

	        hasOverrideMimeType: _hasOverrideMimeType,

	        isCanUploadFileAsync: _isCanUploadFileAsync,

	        isCanUploadFile: _isCanUploadFile,

	        isCanDownLoadFile: _isCanDownLoadFile,

	        isSupportWss: function () {
	            var notSupportList = [
	            //1: QQ browser X5 core
	            /MQQBrowser[\/]5([.]\d+)?\sTBS/

	            //2: etc.
	            //...
	            ];

	            if (!window.WebSocket) {
	                return false;
	            }

	            var ua = window.navigator.userAgent;
	            for (var i = 0, l = notSupportList.length; i < l; i++) {
	                if (notSupportList[i].test(ua)) {
	                    return false;
	                }
	            }
	            return true;
	        }(),

	        getIEVersion: function () {
	            var ua = navigator.userAgent,
	                matches,
	                tridentMap = { '4': 8, '5': 9, '6': 10, '7': 11 };

	            matches = ua.match(/MSIE (\d+)/i);

	            if (matches && matches[1]) {
	                return +matches[1];
	            }
	            matches = ua.match(/Trident\/(\d+)/i);
	            if (matches && matches[1]) {
	                return tridentMap[matches[1]] || null;
	            }
	            return null;
	        }(),

	        stringify: function stringify(json) {
	            if (typeof JSON !== 'undefined' && JSON.stringify) {
	                return JSON.stringify(json);
	            } else {
	                var s = '',
	                    arr = [];

	                var iterate = function iterate(json) {
	                    var isArr = false;

	                    if (Object.prototype.toString.call(json) === '[object Array]') {
	                        arr.push(']', '[');
	                        isArr = true;
	                    } else if (Object.prototype.toString.call(json) === '[object Object]') {
	                        arr.push('}', '{');
	                    }

	                    for (var o in json) {
	                        if (Object.prototype.toString.call(json[o]) === '[object Null]') {
	                            json[o] = 'null';
	                        } else if (Object.prototype.toString.call(json[o]) === '[object Undefined]') {
	                            json[o] = 'undefined';
	                        }

	                        if (json[o] && _typeof(json[o]) === 'object') {
	                            s += ',' + (isArr ? '' : '"' + o + '":' + (isArr ? '"' : '')) + iterate(json[o]) + '';
	                        } else {
	                            s += ',"' + (isArr ? '' : o + '":"') + json[o] + '"';
	                        }
	                    }

	                    if (s != '') {
	                        s = s.slice(1);
	                    }

	                    return arr.pop() + s + arr.pop();
	                };
	                return iterate(json);
	            }
	        },
	        login: function login(options) {
	            var options = options || {};
	            var suc = options.success || EMPTYFN;
	            var err = options.error || EMPTYFN;

	            var appKey = options.appKey || '';
	            var devInfos = appKey.split('#');
	            if (devInfos.length !== 2) {
	                err({
	                    type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	                });
	                return false;
	            }

	            var orgName = devInfos[0];
	            var appName = devInfos[1];
	            var https = https || options.https;
	            var user = options.user || '';
	            var pwd = options.pwd || '';

	            var apiUrl = options.apiUrl;

	            var loginJson = {
	                grant_type: 'password',
	                username: user,
	                password: pwd,
	                timestamp: +new Date()
	            };
	            var loginfo = utils.stringify(loginJson);

	            var options = {
	                url: apiUrl + '/' + orgName + '/' + appName + '/token',
	                dataType: 'json',
	                data: loginfo,
	                success: suc,
	                error: err
	            };
	            return utils.ajax(options);
	        },

	        getFileUrl: function getFileUrl(fileInputId) {
	            var uri = {
	                url: '',
	                filename: '',
	                filetype: '',
	                data: ''
	            };

	            var fileObj = typeof fileInputId === 'string' ? document.getElementById(fileInputId) : fileInputId;

	            if (!utils.isCanUploadFileAsync || !fileObj) {
	                return uri;
	            }
	            try {
	                if (window.URL.createObjectURL) {
	                    var fileItems = fileObj.files;
	                    if (fileItems.length > 0) {
	                        var u = fileItems.item(0);
	                        uri.data = u;
	                        uri.url = window.URL.createObjectURL(u);
	                        uri.filename = u.name || '';
	                    }
	                } else {
	                    // IE
	                    var u = document.getElementById(fileInputId).value;
	                    uri.url = u;
	                    var pos1 = u.lastIndexOf('/');
	                    var pos2 = u.lastIndexOf('\\');
	                    var pos = Math.max(pos1, pos2);
	                    if (pos < 0) uri.filename = u;else uri.filename = u.substring(pos + 1);
	                }
	                var index = uri.filename.lastIndexOf('.');
	                if (index != -1) {
	                    uri.filetype = uri.filename.substring(index + 1).toLowerCase();
	                }
	                return uri;
	            } catch (e) {
	                throw e;
	            }
	        },

	        getFileSize: function getFileSize(file) {
	            var fileSize = 0;
	            if (file) {
	                if (file.files) {
	                    if (file.files.length > 0) {
	                        fileSize = file.files[0].size;
	                    }
	                } else if (file.select && 'ActiveXObject' in window) {
	                    file.select();
	                    var fileobject = new ActiveXObject('Scripting.FileSystemObject');
	                    var file = fileobject.GetFile(file.value);
	                    fileSize = file.Size;
	                }
	            }
	            console.log('fileSize: ', fileSize);
	            if (fileSize > 10000000) {
	                return false;
	            }
	            var kb = Math.round(fileSize / 1000);
	            if (kb < 1000) {
	                fileSize = kb + ' KB';
	            } else if (kb >= 1000) {
	                var mb = kb / 1000;
	                if (mb < 1000) {
	                    fileSize = mb.toFixed(1) + ' MB';
	                } else {
	                    var gb = mb / 1000;
	                    fileSize = gb.toFixed(1) + ' GB';
	                }
	            }
	            return fileSize;
	        },

	        hasFlash: _hasFlash,

	        trim: function trim(str) {

	            str = typeof str === 'string' ? str : '';

	            return str.trim ? str.trim() : str.replace(/^\s|\s$/g, '');
	        },

	        parseEmoji: function parseEmoji(msg) {
	            if (typeof WebIM.Emoji === 'undefined' || typeof WebIM.Emoji.map === 'undefined') {
	                return msg;
	            } else {
	                var emoji = WebIM.Emoji,
	                    reg = null;

	                for (var face in emoji.map) {
	                    if (emoji.map.hasOwnProperty(face)) {
	                        while (msg.indexOf(face) > -1) {
	                            msg = msg.replace(face, '<img class="emoji" src="' + emoji.path + emoji.map[face] + '" />');
	                        }
	                    }
	                }
	                return msg;
	            }
	        },

	        parseLink: function parseLink(msg) {

	            var reg = /(https?\:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(\:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/gm;

	            msg = msg.replace(reg, function (v) {

	                var prefix = /^https?/gm.test(v);

	                return "<a href='" + (prefix ? v : '//' + v) + "' target='_blank'>" + v + "</a>";
	            });

	            return msg;
	        },

	        parseJSON: function parseJSON(data) {

	            if (window.JSON && window.JSON.parse) {
	                return window.JSON.parse(data + '');
	            }

	            var requireNonComma,
	                depth = null,
	                str = utils.trim(data + '');

	            return str && !utils.trim(str.replace(/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g, function (token, comma, open, close) {

	                if (requireNonComma && comma) {
	                    depth = 0;
	                }

	                if (depth === 0) {
	                    return token;
	                }

	                requireNonComma = open || comma;
	                depth += !close - !open;
	                return '';
	            })) ? Function('return ' + str)() : Function('Invalid JSON: ' + data)();
	        },

	        parseUploadResponse: function parseUploadResponse(response) {
	            return response.indexOf('callback') > -1 ? //lte ie9
	            response.slice(9, -1) : response;
	        },

	        parseDownloadResponse: function parseDownloadResponse(response) {
	            return response && response.type && response.type === 'application/json' || 0 > Object.prototype.toString.call(response).indexOf('Blob') ? this.url + '?token=' : window.URL.createObjectURL(response);
	        },

	        uploadFile: function uploadFile(options) {
	            var options = options || {};
	            options.onFileUploadProgress = options.onFileUploadProgress || EMPTYFN;
	            options.onFileUploadComplete = options.onFileUploadComplete || EMPTYFN;
	            options.onFileUploadError = options.onFileUploadError || EMPTYFN;
	            options.onFileUploadCanceled = options.onFileUploadCanceled || EMPTYFN;

	            var acc = options.accessToken || this.context.accessToken;
	            if (!acc) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_NO_LOGIN,
	                    id: options.id
	                });
	                return;
	            }

	            var orgName, appName, devInfos;
	            var appKey = options.appKey || this.context.appKey || '';

	            if (appKey) {
	                devInfos = appKey.split('#');
	                orgName = devInfos[0];
	                appName = devInfos[1];
	            }

	            if (!orgName && !appName) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id
	                });
	                return;
	            }

	            var apiUrl = options.apiUrl;
	            var uploadUrl = apiUrl + '/' + orgName + '/' + appName + '/chatfiles';

	            if (!utils.isCanUploadFileAsync) {
	                if (utils.hasFlash && typeof options.flashUpload === 'function') {
	                    options.flashUpload && options.flashUpload(uploadUrl, options);
	                } else {
	                    options.onFileUploadError({
	                        type: _code.WEBIM_UPLOADFILE_BROWSER_ERROR,
	                        id: options.id
	                    });
	                }
	                return;
	            }

	            var fileSize = options.file.data ? options.file.data.size : undefined;
	            if (fileSize > WEBIM_FILESIZE_LIMIT) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id
	                });
	                return;
	            } else if (fileSize <= 0) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id
	                });
	                return;
	            }

	            var xhr = utils.xmlrequest();
	            var onError = function onError(e) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id,
	                    xhr: xhr
	                });
	            };
	            if (xhr.upload) {
	                xhr.upload.addEventListener('progress', options.onFileUploadProgress, false);
	            }
	            if (xhr.addEventListener) {
	                xhr.addEventListener('abort', options.onFileUploadCanceled, false);
	                xhr.addEventListener('load', function (e) {
	                    try {
	                        var json = utils.parseJSON(xhr.responseText);
	                        try {
	                            options.onFileUploadComplete(json);
	                        } catch (e) {
	                            options.onFileUploadError({
	                                type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	                                data: e
	                            });
	                        }
	                    } catch (e) {
	                        options.onFileUploadError({
	                            type: _code.WEBIM_UPLOADFILE_ERROR,
	                            data: xhr.responseText,
	                            id: options.id,
	                            xhr: xhr
	                        });
	                    }
	                }, false);
	                xhr.addEventListener('error', onError, false);
	            } else if (xhr.onreadystatechange) {
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (ajax.status === 200) {
	                            try {
	                                var json = utils.parseJSON(xhr.responseText);
	                                options.onFileUploadComplete(json);
	                            } catch (e) {
	                                options.onFileUploadError({
	                                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                                    data: xhr.responseText,
	                                    id: options.id,
	                                    xhr: xhr
	                                });
	                            }
	                        } else {
	                            options.onFileUploadError({
	                                type: _code.WEBIM_UPLOADFILE_ERROR,
	                                data: xhr.responseText,
	                                id: options.id,
	                                xhr: xhr
	                            });
	                        }
	                    } else {
	                        xhr.abort();
	                        options.onFileUploadCanceled();
	                    }
	                };
	            }

	            xhr.open('POST', uploadUrl);

	            xhr.setRequestHeader('restrict-access', 'true');
	            xhr.setRequestHeader('Accept', '*/*'); // Android QQ browser has some problem with this attribute.
	            xhr.setRequestHeader('Authorization', 'Bearer ' + acc);

	            var formData = new FormData();
	            formData.append('file', options.file.data);
	            xhr.send(formData);
	        },

	        download: function download(options) {
	            options.onFileDownloadComplete = options.onFileDownloadComplete || EMPTYFN;
	            options.onFileDownloadError = options.onFileDownloadError || EMPTYFN;

	            var accessToken = options.accessToken || this.context.accessToken;
	            if (!accessToken) {
	                options.onFileDownloadError({
	                    type: _code.WEBIM_DOWNLOADFILE_NO_LOGIN,
	                    id: options.id
	                });
	                return;
	            }

	            var onError = function onError(e) {
	                options.onFileDownloadError({
	                    type: _code.WEBIM_DOWNLOADFILE_ERROR,
	                    id: options.id,
	                    xhr: xhr
	                });
	            };

	            if (!utils.isCanDownLoadFile) {
	                options.onFileDownloadComplete();
	                return;
	            }
	            var xhr = utils.xmlrequest();
	            if ('addEventListener' in xhr) {
	                xhr.addEventListener('load', function (e) {
	                    options.onFileDownloadComplete(xhr.response, xhr);
	                }, false);
	                xhr.addEventListener('error', onError, false);
	            } else if ('onreadystatechange' in xhr) {
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (ajax.status === 200) {
	                            options.onFileDownloadComplete(xhr.response, xhr);
	                        } else {
	                            options.onFileDownloadError({
	                                type: _code.WEBIM_DOWNLOADFILE_ERROR,
	                                id: options.id,
	                                xhr: xhr
	                            });
	                        }
	                    } else {
	                        xhr.abort();
	                        options.onFileDownloadError({
	                            type: _code.WEBIM_DOWNLOADFILE_ERROR,
	                            id: options.id,
	                            xhr: xhr
	                        });
	                    }
	                };
	            }

	            var method = options.method || 'GET';
	            var resType = options.responseType || 'blob';
	            var mimeType = options.mimeType || 'text/plain; charset=x-user-defined';
	            xhr.open(method, options.url);
	            if (typeof Blob !== 'undefined') {
	                xhr.responseType = resType;
	            } else {
	                xhr.overrideMimeType(mimeType);
	            }

	            var innerHeaer = {
	                'X-Requested-With': 'XMLHttpRequest',
	                'Accept': 'application/octet-stream',
	                'share-secret': options.secret,
	                'Authorization': 'Bearer ' + accessToken
	            };
	            var headers = options.headers || {};
	            for (var key in headers) {
	                innerHeaer[key] = headers[key];
	            }
	            for (var key in innerHeaer) {
	                if (innerHeaer[key]) {
	                    xhr.setRequestHeader(key, innerHeaer[key]);
	                }
	            }
	            xhr.send(null);
	        },

	        parseTextMessage: function parseTextMessage(message, faces) {
	            if (typeof message !== 'string') {
	                return;
	            }

	            if (Object.prototype.toString.call(faces) !== '[object Object]') {
	                return {
	                    isemoji: false,
	                    body: [{
	                        type: 'txt',
	                        data: message
	                    }]
	                };
	            }

	            var receiveMsg = message;
	            var emessage = [];
	            var expr = /\[[^[\]]{2,3}\]/mg;
	            var emoji = receiveMsg.match(expr);

	            if (!emoji || emoji.length < 1) {
	                return {
	                    isemoji: false,
	                    body: [{
	                        type: 'txt',
	                        data: message
	                    }]
	                };
	            }
	            var isemoji = false;
	            for (var i = 0; i < emoji.length; i++) {
	                var tmsg = receiveMsg.substring(0, receiveMsg.indexOf(emoji[i])),
	                    existEmoji = WebIM.Emoji.map[emoji[i]];

	                if (tmsg) {
	                    emessage.push({
	                        type: 'txt',
	                        data: tmsg
	                    });
	                }
	                if (!existEmoji) {
	                    emessage.push({
	                        type: 'txt',
	                        data: emoji[i]
	                    });
	                    continue;
	                }
	                var emojiStr = WebIM.Emoji.map ? WebIM.Emoji.path + existEmoji : null;

	                if (emojiStr) {
	                    isemoji = true;
	                    emessage.push({
	                        type: 'emoji',
	                        data: emojiStr
	                    });
	                } else {
	                    emessage.push({
	                        type: 'txt',
	                        data: emoji[i]
	                    });
	                }
	                var restMsgIndex = receiveMsg.indexOf(emoji[i]) + emoji[i].length;
	                receiveMsg = receiveMsg.substring(restMsgIndex);
	            }
	            if (receiveMsg) {
	                emessage.push({
	                    type: 'txt',
	                    data: receiveMsg
	                });
	            }
	            if (isemoji) {
	                return {
	                    isemoji: isemoji,
	                    body: emessage
	                };
	            }
	            return {
	                isemoji: false,
	                body: [{
	                    type: 'txt',
	                    data: message
	                }]
	            };
	        },

	        xmlrequest: _xmlrequest,

	        getXmlFirstChild: function getXmlFirstChild(data, tagName) {
	            var children = data.getElementsByTagName(tagName);
	            if (children.length == 0) {
	                return null;
	            } else {
	                return children[0];
	            }
	        },
	        ajax: function ajax(options) {
	            var dataType = options.dataType || 'text';
	            var suc = options.success || EMPTYFN;
	            var error = options.error || EMPTYFN;
	            var xhr = utils.xmlrequest();

	            xhr.onreadystatechange = function () {
	                if (xhr.readyState === 4) {
	                    var status = xhr.status || 0;
	                    if (status === 200) {
	                        try {
	                            switch (dataType) {
	                                case 'text':
	                                    suc(xhr.responseText);
	                                    return;
	                                case 'json':
	                                    var json = utils.parseJSON(xhr.responseText);
	                                    suc(json, xhr);
	                                    return;
	                                case 'xml':
	                                    if (xhr.responseXML && xhr.responseXML.documentElement) {
	                                        suc(xhr.responseXML.documentElement, xhr);
	                                    } else {
	                                        error({
	                                            type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                                            data: xhr.responseText
	                                        });
	                                    }
	                                    return;
	                            }
	                            suc(xhr.response || xhr.responseText, xhr);
	                        } catch (e) {
	                            error({
	                                type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                                data: e
	                            });
	                        }
	                        return;
	                    } else {
	                        error({
	                            type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                            data: xhr.responseText
	                        });
	                        return;
	                    }
	                }
	                if (xhr.readyState === 0) {
	                    error({
	                        type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                        data: xhr.responseText
	                    });
	                }
	            };

	            if (options.responseType) {
	                if (xhr.responseType) {
	                    xhr.responseType = options.responseType;
	                }
	            }
	            if (options.mimeType) {
	                if (utils.hasOverrideMimeType) {
	                    xhr.overrideMimeType(options.mimeType);
	                }
	            }

	            var type = options.type || 'POST',
	                data = options.data || null,
	                tempData = '';

	            if (type.toLowerCase() === 'get' && data) {
	                for (var o in data) {
	                    if (data.hasOwnProperty(o)) {
	                        tempData += o + '=' + data[o] + '&';
	                    }
	                }
	                tempData = tempData ? tempData.slice(0, -1) : tempData;
	                options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
	                data = null;
	                tempData = null;
	            }
	            xhr.open(type, options.url);

	            if (utils.isCanSetRequestHeader) {
	                var headers = options.headers || {};
	                for (var key in headers) {
	                    if (headers.hasOwnProperty(key)) {
	                        xhr.setRequestHeader(key, headers[key]);
	                    }
	                }
	            }

	            xhr.send(data);
	            return xhr;
	        },
	        ts: function ts() {
	            var d = new Date();
	            var Hours = d.getHours(); //获取当前小时数(0-23)
	            var Minutes = d.getMinutes(); //获取当前分钟数(0-59)
	            var Seconds = d.getSeconds(); //获取当前秒数(0-59)
	            var Milliseconds = d.getMilliseconds(); //获取当前毫秒
	            return (Hours < 10 ? "0" + Hours : Hours) + ':' + (Minutes < 10 ? "0" + Minutes : Minutes) + ':' + (Seconds < 10 ? "0" + Seconds : Seconds) + ':' + Milliseconds + ' ';
	        },

	        getObjectKey: function getObjectKey(obj, val) {
	            for (var key in obj) {
	                if (obj[key] == val) {
	                    return key;
	                }
	            }
	            return '';
	        }

	    };

	    exports.utils = utils;
	})();

/***/ },

/***/ 224:
/***/ function(module, exports) {

	"use strict";

	;
	(function () {

	    exports.code = {
	        WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR: 0,
	        WEBIM_CONNCTION_OPEN_ERROR: 1,
	        WEBIM_CONNCTION_AUTH_ERROR: 2,
	        WEBIM_CONNCTION_OPEN_USERGRID_ERROR: 3,
	        WEBIM_CONNCTION_ATTACH_ERROR: 4,
	        WEBIM_CONNCTION_ATTACH_USERGRID_ERROR: 5,
	        WEBIM_CONNCTION_REOPEN_ERROR: 6,
	        WEBIM_CONNCTION_SERVER_CLOSE_ERROR: 7, //7: client-side network offline (net::ERR_INTERNET_DISCONNECTED)
	        WEBIM_CONNCTION_SERVER_ERROR: 8, //8: offline by multi login
	        WEBIM_CONNCTION_IQ_ERROR: 9,

	        WEBIM_CONNCTION_PING_ERROR: 10,
	        WEBIM_CONNCTION_NOTIFYVERSION_ERROR: 11,
	        WEBIM_CONNCTION_GETROSTER_ERROR: 12,
	        WEBIM_CONNCTION_CROSSDOMAIN_ERROR: 13,
	        WEBIM_CONNCTION_LISTENING_OUTOF_MAXRETRIES: 14,
	        WEBIM_CONNCTION_RECEIVEMSG_CONTENTERROR: 15,
	        WEBIM_CONNCTION_DISCONNECTED: 16, //16: server-side close the websocket connection
	        WEBIM_CONNCTION_AJAX_ERROR: 17,
	        WEBIM_CONNCTION_JOINROOM_ERROR: 18,
	        WEBIM_CONNCTION_GETROOM_ERROR: 19,

	        WEBIM_CONNCTION_GETROOMINFO_ERROR: 20,
	        WEBIM_CONNCTION_GETROOMMEMBER_ERROR: 21,
	        WEBIM_CONNCTION_GETROOMOCCUPANTS_ERROR: 22,
	        WEBIM_CONNCTION_LOAD_CHATROOM_ERROR: 23,
	        WEBIM_CONNCTION_NOT_SUPPORT_CHATROOM_ERROR: 24,
	        WEBIM_CONNCTION_JOINCHATROOM_ERROR: 25,
	        WEBIM_CONNCTION_QUITCHATROOM_ERROR: 26,
	        WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR: 27,
	        WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR: 28,
	        WEBIM_CONNCTION_SESSIONID_NOT_ASSIGN_ERROR: 29,

	        WEBIM_CONNCTION_RID_NOT_ASSIGN_ERROR: 30,
	        WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31,
	        WEBIM_CONNCTION_CLIENT_OFFLINE: 32, //32: client offline
	        WEBIM_CONNCTION_CLIENT_LOGOUT: 33, //33: client logout
	        WEBIM_CONNCTION_CLIENT_TOO_MUCH_ERROR: 34, // Over amount of the tabs a user opened in the same browser
	        WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP: 35,
	        WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP: 36,
	        WEBIM_CONNECTION_ACCEPT_JOIN_GROUP: 37,
	        WEBIM_CONNECTION_DECLINE_JOIN_GROUP: 38,
	        WEBIM_CONNECTION_CLOSED: 39,

	        WEBIM_UPLOADFILE_BROWSER_ERROR: 100,
	        WEBIM_UPLOADFILE_ERROR: 101,
	        WEBIM_UPLOADFILE_NO_LOGIN: 102,
	        WEBIM_UPLOADFILE_NO_FILE: 103,

	        WEBIM_DOWNLOADFILE_ERROR: 200,
	        WEBIM_DOWNLOADFILE_NO_LOGIN: 201,
	        WEBIM_DOWNLOADFILE_BROWSER_ERROR: 202,

	        WEBIM_MESSAGE_REC_TEXT: 300,
	        WEBIM_MESSAGE_REC_TEXT_ERROR: 301,
	        WEBIM_MESSAGE_REC_EMOTION: 302,
	        WEBIM_MESSAGE_REC_PHOTO: 303,
	        WEBIM_MESSAGE_REC_AUDIO: 304,
	        WEBIM_MESSAGE_REC_AUDIO_FILE: 305,
	        WEBIM_MESSAGE_REC_VEDIO: 306,
	        WEBIM_MESSAGE_REC_VEDIO_FILE: 307,
	        WEBIM_MESSAGE_REC_FILE: 308,
	        WEBIM_MESSAGE_SED_TEXT: 309,
	        WEBIM_MESSAGE_SED_EMOTION: 310,
	        WEBIM_MESSAGE_SED_PHOTO: 311,
	        WEBIM_MESSAGE_SED_AUDIO: 312,
	        WEBIM_MESSAGE_SED_AUDIO_FILE: 313,
	        WEBIM_MESSAGE_SED_VEDIO: 314,
	        WEBIM_MESSAGE_SED_VEDIO_FILE: 315,
	        WEBIM_MESSAGE_SED_FILE: 316,
	        WEBIM_MESSAGE_SED_ERROR: 317,

	        STATUS_INIT: 400,
	        STATUS_DOLOGIN_USERGRID: 401,
	        STATUS_DOLOGIN_IM: 402,
	        STATUS_OPENED: 403,
	        STATUS_CLOSING: 404,
	        STATUS_CLOSED: 405,
	        STATUS_ERROR: 406
	    };
	})();

/***/ },

/***/ 230:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(231);

/***/ },

/***/ 231:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _version = '1.4.2';
	var _code = __webpack_require__(224).code;
	var _utils = __webpack_require__(223).utils;
	var _msg = __webpack_require__(232);
	var _message = _msg._msg;
	var _msgHash = {};
	var Queue = __webpack_require__(233).Queue;

	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

	if (window.XDomainRequest) {
	    XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
	    XDomainRequest.prototype.send = function () {
	        XDomainRequest.prototype.oldsend.apply(this, arguments);
	        this.readyState = 2;
	    };
	}

	Strophe.Request.prototype._newXHR = function () {
	    var xhr = _utils.xmlrequest(true);
	    if (xhr.overrideMimeType) {
	        xhr.overrideMimeType('text/xml');
	    }
	    // use Function.bind() to prepend ourselves as an argument
	    xhr.onreadystatechange = this.func.bind(null, this);
	    return xhr;
	};

	Strophe.Websocket.prototype._closeSocket = function () {
	    if (this.socket) {
	        var me = this;
	        setTimeout(function () {
	            try {
	                me.socket.close();
	            } catch (e) {}
	        }, 0);
	    } else {
	        this.socket = null;
	    }
	};

	/**
	 *
	 * Strophe.Websocket has a bug while logout:
	 * 1.send: <presence xmlns='jabber:client' type='unavailable'/> is ok;
	 * 2.send: <close xmlns='urn:ietf:params:xml:ns:xmpp-framing'/> will cause a problem,log as follows:
	 * WebSocket connection to 'ws://im-api.easemob.com/ws/' failed: Data frame received after close_connect @ strophe.js:5292connect @ strophe.js:2491_login @ websdk-1.1.2.js:278suc @ websdk-1.1.2.js:636xhr.onreadystatechange @ websdk-1.1.2.js:2582
	 * 3 "Websocket error [object Event]"
	 * _changeConnectStatus
	 * onError Object {type: 7, msg: "The WebSocket connection could not be established or was disconnected.", reconnect: true}
	 *
	 * this will trigger socket.onError, therefore _doDisconnect again.
	 * Fix it by overide  _onMessage
	 */
	Strophe.Websocket.prototype._onMessage = function (message) {
	    WebIM && WebIM.config.isDebug && console.log(WebIM.utils.ts() + 'recv:', message.data);
	    var elem, data;
	    // check for closing stream
	    // var close = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';
	    // if (message.data === close) {
	    //     this._conn.rawInput(close);
	    //     this._conn.xmlInput(message);
	    //     if (!this._conn.disconnecting) {
	    //         this._conn._doDisconnect();
	    //     }
	    //     return;
	    //
	    // send and receive close xml: <close xmlns='urn:ietf:params:xml:ns:xmpp-framing'/>
	    // so we can't judge whether message.data equals close by === simply.
	    if (message.data.indexOf("<close ") === 0) {
	        elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;
	        var see_uri = elem.getAttribute("see-other-uri");
	        if (see_uri) {
	            this._conn._changeConnectStatus(Strophe.Status.REDIRECT, "Received see-other-uri, resetting connection");
	            this._conn.reset();
	            this._conn.service = see_uri;
	            this._connect();
	        } else {
	            // if (!this._conn.disconnecting) {
	            this._conn._doDisconnect("receive <close> from server");
	            // }
	        }
	        return;
	    } else if (message.data.search("<open ") === 0) {
	        // This handles stream restarts
	        elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;
	        if (!this._handleStreamStart(elem)) {
	            return;
	        }
	    } else {
	        data = this._streamWrap(message.data);
	        elem = new DOMParser().parseFromString(data, "text/xml").documentElement;
	    }

	    if (this._check_streamerror(elem, Strophe.Status.ERROR)) {
	        return;
	    }

	    //handle unavailable presence stanza before disconnecting
	    if (this._conn.disconnecting && elem.firstChild.nodeName === "presence" && elem.firstChild.getAttribute("type") === "unavailable") {
	        this._conn.xmlInput(elem);
	        this._conn.rawInput(Strophe.serialize(elem));
	        // if we are already disconnecting we will ignore the unavailable stanza and
	        // wait for the </stream:stream> tag before we close the connection
	        return;
	    }
	    this._conn._dataRecv(elem, message.data);
	};

	var _listenNetwork = function _listenNetwork(onlineCallback, offlineCallback) {

	    if (window.addEventListener) {
	        window.addEventListener('online', onlineCallback);
	        window.addEventListener('offline', offlineCallback);
	    } else if (window.attachEvent) {
	        if (document.body) {
	            document.body.attachEvent('ononline', onlineCallback);
	            document.body.attachEvent('onoffline', offlineCallback);
	        } else {
	            window.attachEvent('load', function () {
	                document.body.attachEvent('ononline', onlineCallback);
	                document.body.attachEvent('onoffline', offlineCallback);
	            });
	        }
	    } else {
	        /*var onlineTmp = window.ononline;
	         var offlineTmp = window.onoffline;
	          window.attachEvent('ononline', function () {
	         try {
	         typeof onlineTmp === 'function' && onlineTmp();
	         } catch ( e ) {}
	         onlineCallback();
	         });
	         window.attachEvent('onoffline', function () {
	         try {
	         typeof offlineTmp === 'function' && offlineTmp();
	         } catch ( e ) {}
	         offlineCallback();
	         });*/
	    }
	};

	var _parseRoom = function _parseRoom(result) {
	    var rooms = [];
	    var items = result.getElementsByTagName('item');
	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var roomJid = item.getAttribute('jid');
	            var tmp = roomJid.split('@')[0];
	            var room = {
	                jid: roomJid,
	                name: item.getAttribute('name'),
	                roomId: tmp.split('_')[1]
	            };
	            rooms.push(room);
	        }
	    }
	    return rooms;
	};

	var _parseRoomOccupants = function _parseRoomOccupants(result) {
	    var occupants = [];
	    var items = result.getElementsByTagName('item');
	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var room = {
	                jid: item.getAttribute('jid'),
	                name: item.getAttribute('name')
	            };
	            occupants.push(room);
	        }
	    }
	    return occupants;
	};

	var _parseResponseMessage = function _parseResponseMessage(msginfo) {
	    var parseMsgData = { errorMsg: true, data: [] };

	    var msgBodies = msginfo.getElementsByTagName('body');
	    if (msgBodies) {
	        for (var i = 0; i < msgBodies.length; i++) {
	            var msgBody = msgBodies[i];
	            var childNodes = msgBody.childNodes;
	            if (childNodes && childNodes.length > 0) {
	                var childNode = msgBody.childNodes[0];
	                if (childNode.nodeType == Strophe.ElementType.TEXT) {
	                    var jsondata = childNode.wholeText || childNode.nodeValue;
	                    jsondata = jsondata.replace('\n', '<br>');
	                    try {
	                        var data = eval('(' + jsondata + ')');
	                        parseMsgData.errorMsg = false;
	                        parseMsgData.data = [data];
	                    } catch (e) {}
	                }
	            }
	        }

	        var delayTags = msginfo.getElementsByTagName('delay');
	        if (delayTags && delayTags.length > 0) {
	            var delayTag = delayTags[0];
	            var delayMsgTime = delayTag.getAttribute('stamp');
	            if (delayMsgTime) {
	                parseMsgData.delayTimeStamp = delayMsgTime;
	            }
	        }
	    } else {
	        var childrens = msginfo.childNodes;
	        if (childrens && childrens.length > 0) {
	            var child = msginfo.childNodes[0];
	            if (child.nodeType == Strophe.ElementType.TEXT) {
	                try {
	                    var data = eval('(' + child.nodeValue + ')');
	                    parseMsgData.errorMsg = false;
	                    parseMsgData.data = [data];
	                } catch (e) {}
	            }
	        }
	    }
	    return parseMsgData;
	};

	var _parseNameFromJidFn = function _parseNameFromJidFn(jid, domain) {
	    domain = domain || '';
	    var tempstr = jid;
	    var findex = tempstr.indexOf('_');

	    if (findex !== -1) {
	        tempstr = tempstr.substring(findex + 1);
	    }
	    var atindex = tempstr.indexOf('@' + domain);
	    if (atindex !== -1) {
	        tempstr = tempstr.substring(0, atindex);
	    }
	    return tempstr;
	};

	var _parseFriend = function _parseFriend(queryTag, conn, from) {
	    var rouster = [];
	    var items = queryTag.getElementsByTagName('item');
	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var jid = item.getAttribute('jid');
	            if (!jid) {
	                continue;
	            }
	            var subscription = item.getAttribute('subscription');
	            var friend = {
	                subscription: subscription,
	                jid: jid
	            };
	            var ask = item.getAttribute('ask');
	            if (ask) {
	                friend.ask = ask;
	            }
	            var name = item.getAttribute('name');
	            if (name) {
	                friend.name = name;
	            } else {
	                var n = _parseNameFromJidFn(jid);
	                friend.name = n;
	            }
	            var groups = [];
	            Strophe.forEachChild(item, 'group', function (group) {
	                groups.push(Strophe.getText(group));
	            });
	            friend.groups = groups;
	            rouster.push(friend);
	            // B同意之后 -> B订阅A
	            if (conn && subscription == 'from') {
	                conn.subscribe({
	                    toJid: jid
	                });
	            }

	            if (conn && subscription == 'to') {
	                conn.subscribed({
	                    toJid: jid
	                });
	            }
	        }
	    }
	    return rouster;
	};

	var _login = function _login(options, conn) {
	    var accessToken = options.access_token || '';
	    if (accessToken == '') {
	        var loginfo = _utils.stringify(options);
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_OPEN_USERGRID_ERROR,
	            data: options
	        });
	        return;
	    }
	    conn.context.accessToken = options.access_token;
	    conn.context.accessTokenExpires = options.expires_in;
	    var stropheConn = null;
	    if (conn.isOpening() && conn.context.stropheConn) {
	        stropheConn = conn.context.stropheConn;
	    } else if (conn.isOpened() && conn.context.stropheConn) {
	        // return;
	        stropheConn = conn.getStrophe();
	    } else {
	        stropheConn = conn.getStrophe();
	    }
	    var callback = function callback(status, msg) {
	        _loginCallback(status, msg, conn);
	    };

	    conn.context.stropheConn = stropheConn;
	    if (conn.route) {
	        stropheConn.connect(conn.context.jid, '$t$' + accessToken, callback, conn.wait, conn.hold, conn.route);
	    } else {
	        stropheConn.connect(conn.context.jid, '$t$' + accessToken, callback, conn.wait, conn.hold);
	    }
	};

	var _parseMessageType = function _parseMessageType(msginfo) {
	    var msgtype = 'normal';
	    var receiveinfo = msginfo.getElementsByTagName('received');
	    if (receiveinfo && receiveinfo.length > 0 && receiveinfo[0].namespaceURI === 'urn:xmpp:receipts') {
	        msgtype = 'received';
	    } else {
	        var inviteinfo = msginfo.getElementsByTagName('invite');
	        if (inviteinfo && inviteinfo.length > 0) {
	            msgtype = 'invite';
	        }
	    }
	    return msgtype;
	};

	var _handleMessageQueue = function _handleMessageQueue(conn) {
	    for (var i in _msgHash) {
	        if (_msgHash.hasOwnProperty(i)) {
	            _msgHash[i].send(conn);
	        }
	    }
	};

	var _loginCallback = function _loginCallback(status, msg, conn) {
	    var conflict, error;

	    if (msg === 'conflict') {
	        conflict = true;
	    }

	    if (status == Strophe.Status.CONNFAIL) {
	        //client offline, ping/pong timeout, server quit, server offline
	        error = {
	            type: _code.WEBIM_CONNCTION_SERVER_CLOSE_ERROR,
	            msg: msg,
	            reconnect: true
	        };

	        conflict && (error.conflict = true);
	        conn.onError(error);
	    } else if (status == Strophe.Status.ATTACHED || status == Strophe.Status.CONNECTED) {
	        // client should limit the speed of sending ack messages  up to 5/s
	        conn.autoReconnectNumTotal = 0;
	        conn.intervalId = setInterval(function () {
	            conn.handelSendQueue();
	        }, 200);
	        var handleMessage = function handleMessage(msginfo) {
	            var type = _parseMessageType(msginfo);

	            if ('received' === type) {
	                conn.handleReceivedMessage(msginfo);
	                return true;
	            } else if ('invite' === type) {
	                conn.handleInviteMessage(msginfo);
	                return true;
	            } else {
	                conn.handleMessage(msginfo);
	                return true;
	            }
	        };
	        var handlePresence = function handlePresence(msginfo) {
	            conn.handlePresence(msginfo);
	            return true;
	        };
	        var handlePing = function handlePing(msginfo) {
	            conn.handlePing(msginfo);
	            return true;
	        };
	        var handleIqRoster = function handleIqRoster(msginfo) {
	            conn.handleIqRoster(msginfo);
	            return true;
	        };
	        var handleIqPrivacy = function handleIqPrivacy(msginfo) {
	            conn.handleIqPrivacy(msginfo);
	            return true;
	        };
	        var handleIq = function handleIq(msginfo) {
	            conn.handleIq(msginfo);
	            return true;
	        };

	        conn.addHandler(handleMessage, null, 'message', null, null, null);
	        conn.addHandler(handlePresence, null, 'presence', null, null, null);
	        conn.addHandler(handlePing, 'urn:xmpp:ping', 'iq', 'get', null, null);
	        conn.addHandler(handleIqRoster, 'jabber:iq:roster', 'iq', 'set', null, null);
	        conn.addHandler(handleIqPrivacy, 'jabber:iq:privacy', 'iq', 'set', null, null);
	        conn.addHandler(handleIq, null, 'iq', null, null, null);

	        conn.context.status = _code.STATUS_OPENED;

	        var supportRecMessage = [_code.WEBIM_MESSAGE_REC_TEXT, _code.WEBIM_MESSAGE_REC_EMOJI];

	        if (_utils.isCanDownLoadFile) {
	            supportRecMessage.push(_code.WEBIM_MESSAGE_REC_PHOTO);
	            supportRecMessage.push(_code.WEBIM_MESSAGE_REC_AUDIO_FILE);
	        }
	        var supportSedMessage = [_code.WEBIM_MESSAGE_SED_TEXT];
	        if (_utils.isCanUploadFile) {
	            supportSedMessage.push(_code.WEBIM_MESSAGE_REC_PHOTO);
	            supportSedMessage.push(_code.WEBIM_MESSAGE_REC_AUDIO_FILE);
	        }
	        conn.notifyVersion();
	        conn.retry && _handleMessageQueue(conn);
	        conn.heartBeat();
	        conn.isAutoLogin && conn.setPresence();
	        conn.onOpened({
	            canReceive: supportRecMessage,
	            canSend: supportSedMessage,
	            accessToken: conn.context.accessToken
	        });
	    } else if (status == Strophe.Status.DISCONNECTING) {
	        if (conn.isOpened()) {
	            conn.stopHeartBeat();
	            conn.context.status = _code.STATUS_CLOSING;

	            error = {
	                type: _code.WEBIM_CONNCTION_SERVER_CLOSE_ERROR,
	                msg: msg,
	                reconnect: true
	            };

	            conflict && (error.conflict = true);
	            conn.onError(error);
	        }
	    } else if (status == Strophe.Status.DISCONNECTED) {
	        if (conn.isOpened()) {
	            if (conn.autoReconnectNumTotal < conn.autoReconnectNumMax) {
	                conn.reconnect();
	                return;
	            } else {
	                error = {
	                    type: _code.WEBIM_CONNCTION_DISCONNECTED
	                };
	                conn.onError(error);
	            }
	        }
	        conn.context.status = _code.STATUS_CLOSED;
	        conn.clear();
	        conn.onClosed();
	    } else if (status == Strophe.Status.AUTHFAIL) {
	        error = {
	            type: _code.WEBIM_CONNCTION_AUTH_ERROR
	        };

	        conflict && (error.conflict = true);
	        conn.onError(error);
	        conn.clear();
	    } else if (status == Strophe.Status.ERROR) {
	        conn.context.status = _code.STATUS_ERROR;
	        error = {
	            type: _code.WEBIM_CONNCTION_SERVER_ERROR
	        };

	        conflict && (error.conflict = true);
	        conn.onError(error);
	    }
	    conn.context.status_now = status;
	};

	var _getJid = function _getJid(options, conn) {
	    var jid = options.toJid || '';

	    if (jid === '') {
	        var appKey = conn.context.appKey || '';
	        var toJid = appKey + '_' + options.to + '@' + conn.domain;

	        if (options.resource) {
	            toJid = toJid + '/' + options.resource;
	        }
	        jid = toJid;
	    }
	    return jid;
	};

	var _getJidByName = function _getJidByName(name, conn) {
	    var options = {
	        to: name
	    };
	    return _getJid(options, conn);
	};

	var _validCheck = function _validCheck(options, conn) {
	    options = options || {};

	    if (options.user == '') {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }

	    var user = options.user + '' || '';
	    var appKey = options.appKey || '';
	    var devInfos = appKey.split('#');

	    if (devInfos.length !== 2) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }
	    var orgName = devInfos[0];
	    var appName = devInfos[1];

	    if (!orgName) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }
	    if (!appName) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }

	    var jid = appKey + '_' + user.toLowerCase() + '@' + conn.domain,
	        resource = options.resource || 'webim';

	    if (conn.isMultiLoginSessions) {
	        resource += user + new Date().getTime() + Math.floor(Math.random().toFixed(6) * 1000000);
	    }
	    conn.context.jid = jid + '/' + resource;
	    /*jid: {appkey}_{username}@domain/resource*/
	    conn.context.userId = user;
	    conn.context.appKey = appKey;
	    conn.context.appName = appName;
	    conn.context.orgName = orgName;

	    return true;
	};

	var _getXmppUrl = function _getXmppUrl(baseUrl, https) {
	    if (/^(ws|http)s?:\/\/?/.test(baseUrl)) {
	        return baseUrl;
	    }

	    var url = {
	        prefix: 'http',
	        base: '://' + baseUrl,
	        suffix: '/http-bind/'
	    };

	    if (https && _utils.isSupportWss) {
	        url.prefix = 'wss';
	        url.suffix = '/ws/';
	    } else {
	        if (https) {
	            url.prefix = 'https';
	        } else if (window.WebSocket) {
	            url.prefix = 'ws';
	            url.suffix = '/ws/';
	        }
	    }

	    return url.prefix + url.base + url.suffix;
	};

	//class
	var connection = function connection(options) {
	    if (!this instanceof connection) {
	        return new connection(options);
	    }

	    var options = options || {};

	    this.isHttpDNS = options.isHttpDNS || false;
	    this.isMultiLoginSessions = options.isMultiLoginSessions || false;
	    this.wait = options.wait || 30;
	    this.retry = options.retry || false;
	    this.https = options.https || location.protocol === 'https:';
	    this.url = _getXmppUrl(options.url, this.https);
	    this.hold = options.hold || 1;
	    this.route = options.route || null;
	    this.domain = options.domain || 'easemob.com';
	    this.inactivity = options.inactivity || 30;
	    this.heartBeatWait = options.heartBeatWait || 4500;
	    this.maxRetries = options.maxRetries || 5;
	    this.isAutoLogin = options.isAutoLogin === false ? false : true;
	    this.pollingTime = options.pollingTime || 800;
	    this.stropheConn = false;
	    this.autoReconnectNumMax = options.autoReconnectNumMax || 0;
	    this.autoReconnectNumTotal = 0;
	    this.autoReconnectInterval = options.autoReconnectInterval || 0;
	    this.context = { status: _code.STATUS_INIT };
	    this.sendQueue = new Queue(); //instead of sending message immediately,cache them in this queue
	    this.intervalId = null; //clearInterval return value
	    this.apiUrl = options.apiUrl || '';
	    this.isWindowSDK = options.isWindowSDK || false;

	    this.dnsArr = ['https://rs.easemob.com', 'https://rsbak.easemob.com', 'http://182.92.174.78', 'http://112.126.66.111']; //http dns server hosts
	    this.dnsIndex = 0; //the dns ip used in dnsArr currently
	    this.dnsTotal = this.dnsArr.length; //max number of getting dns retries
	    this.restHosts = null; //rest server ips
	    this.restIndex = 0; //the rest ip used in restHosts currently
	    this.restTotal = 0; //max number of getting rest token retries
	    this.xmppHosts = null; //xmpp server ips
	    this.xmppIndex = 0; //the xmpp ip used in xmppHosts currently
	    this.xmppTotal = 0; //max number of creating xmpp server connection(ws/bosh) retries
	};

	connection.prototype.registerUser = function (options) {
	    if (location.protocol != 'https:' && this.isHttpDNS) {
	        this.dnsIndex = 0;
	        this.getHttpDNS(options, 'signup');
	    } else {
	        this.signup(options);
	    }
	};

	connection.prototype.handelSendQueue = function () {
	    var options = this.sendQueue.pop();
	    if (options !== null) {
	        this.sendReceiptsMessage(options);
	    }
	};
	connection.prototype.listen = function (options) {
	    this.onOpened = options.onOpened || _utils.emptyfn;
	    this.onClosed = options.onClosed || _utils.emptyfn;
	    this.onTextMessage = options.onTextMessage || _utils.emptyfn;
	    this.onEmojiMessage = options.onEmojiMessage || _utils.emptyfn;
	    this.onPictureMessage = options.onPictureMessage || _utils.emptyfn;
	    this.onAudioMessage = options.onAudioMessage || _utils.emptyfn;
	    this.onVideoMessage = options.onVideoMessage || _utils.emptyfn;
	    this.onFileMessage = options.onFileMessage || _utils.emptyfn;
	    this.onLocationMessage = options.onLocationMessage || _utils.emptyfn;
	    this.onCmdMessage = options.onCmdMessage || _utils.emptyfn;
	    this.onPresence = options.onPresence || _utils.emptyfn;
	    this.onRoster = options.onRoster || _utils.emptyfn;
	    this.onError = options.onError || _utils.emptyfn;
	    this.onReceivedMessage = options.onReceivedMessage || _utils.emptyfn;
	    this.onInviteMessage = options.onInviteMessage || _utils.emptyfn;
	    this.onOffline = options.onOffline || _utils.emptyfn;
	    this.onOnline = options.onOnline || _utils.emptyfn;
	    this.onConfirmPop = options.onConfirmPop || _utils.emptyfn;
	    //for WindowSDK start
	    this.onUpdateMyGroupList = options.onUpdateMyGroupList || _utils.emptyfn;
	    this.onUpdateMyRoster = options.onUpdateMyRoster || _utils.emptyfn;
	    //for WindowSDK end
	    this.onBlacklistUpdate = options.onBlacklistUpdate || _utils.emptyfn;

	    _listenNetwork(this.onOnline, this.onOffline);
	};

	connection.prototype.heartBeat = function () {
	    var me = this;
	    //IE8: strophe auto switch from ws to BOSH, need heartbeat
	    var isNeed = !/^ws|wss/.test(me.url) || /mobile/.test(navigator.userAgent);

	    if (this.heartBeatID || !isNeed) {
	        return;
	    }

	    var options = {
	        toJid: this.domain,
	        type: 'normal'
	    };
	    this.heartBeatID = setInterval(function () {
	        me.ping(options);
	    }, this.heartBeatWait);
	};

	connection.prototype.stopHeartBeat = function () {
	    if (typeof this.heartBeatID == "number") {
	        this.heartBeatID = clearInterval(this.heartBeatID);
	    }
	};

	connection.prototype.sendReceiptsMessage = function (options) {
	    var dom = $msg({
	        from: this.context.jid || '',
	        to: this.domain,
	        id: options.id || ''
	    }).c('received', {
	        xmlns: 'urn:xmpp:receipts',
	        id: options.id || ''
	    });
	    this.sendCommand(dom.tree());
	};

	connection.prototype.cacheReceiptsMessage = function (options) {
	    this.sendQueue.push(options);
	};

	connection.prototype.getStrophe = function () {
	    if (location.protocol != 'https:' && this.isHttpDNS) {
	        //TODO: try this.xmppTotal times on fail
	        var url = '';
	        var host = this.xmppHosts[this.xmppIndex];
	        var domain = _utils.getXmlFirstChild(host, 'domain');
	        var ip = _utils.getXmlFirstChild(host, 'ip');
	        if (ip) {
	            url = ip.textContent;
	            var port = _utils.getXmlFirstChild(host, 'port');
	            if (port.textContent != '80') {
	                url += ':' + port.textContent;
	            }
	        } else {
	            url = domain.textContent;
	        }

	        if (url != '') {
	            var parter = /(.+\/\/).+(\/.+)/;
	            this.url = this.url.replace(parter, "$1" + url + "$2");
	        }
	    }

	    var stropheConn = new Strophe.Connection(this.url, {
	        inactivity: this.inactivity,
	        maxRetries: this.maxRetries,
	        pollingTime: this.pollingTime
	    });
	    return stropheConn;
	};
	connection.prototype.getHostsByTag = function (data, tagName) {
	    var tag = _utils.getXmlFirstChild(data, tagName);
	    if (!tag) {
	        console.log(tagName + ' hosts error');
	        return null;
	    }
	    var hosts = tag.getElementsByTagName('hosts');
	    if (hosts.length == 0) {
	        console.log(tagName + ' hosts error2');
	        return null;
	    }
	    return hosts[0].getElementsByTagName('host');
	};
	connection.prototype.getRestFromHttpDNS = function (options, type) {
	    if (this.restIndex > this.restTotal) {
	        console.log('rest hosts all tried,quit');
	        return;
	    }
	    var url = '';
	    var host = this.restHosts[this.restIndex];
	    var domain = _utils.getXmlFirstChild(host, 'domain');
	    var ip = _utils.getXmlFirstChild(host, 'ip');
	    if (ip) {
	        var port = _utils.getXmlFirstChild(host, 'port');
	        url = (location.protocol === 'https:' ? 'https:' : 'http:') + '//' + ip.textContent + ':' + port.textContent;
	    } else {
	        url = (location.protocol === 'https:' ? 'https:' : 'http:') + '//' + domain.textContent;
	    }

	    if (url != '') {
	        this.apiUrl = url;
	        options.apiUrl = url;
	    }

	    if (type == 'login') {
	        this.login(options);
	    } else {
	        this.signup(options);
	    }
	};

	connection.prototype.getHttpDNS = function (options, type) {
	    if (this.restHosts) {
	        this.getRestFromHttpDNS(options, type);
	        return;
	    }
	    var self = this;
	    var suc = function suc(data, xhr) {
	        data = new DOMParser().parseFromString(data, "text/xml").documentElement;
	        //get rest ips
	        var restHosts = self.getHostsByTag(data, 'rest');
	        if (!restHosts) {
	            console.log('rest hosts error3');
	            return;
	        }
	        self.restHosts = restHosts;
	        self.restTotal = restHosts.length;

	        //get xmpp ips
	        var xmppHosts = self.getHostsByTag(data, 'xmpp');
	        if (!xmppHosts) {
	            console.log('xmpp hosts error3');
	            return;
	        }
	        self.xmppHosts = xmppHosts;
	        self.xmppTotal = xmppHosts.length;

	        self.getRestFromHttpDNS(options, type);
	    };
	    var error = function error(res, xhr, msg) {

	        console.log('getHttpDNS error', res, msg);
	        self.dnsIndex++;
	        if (self.dnsIndex < self.dnsTotal) {
	            self.getHttpDNS(options, type);
	        }
	    };
	    var options2 = {
	        url: this.dnsArr[this.dnsIndex] + '/easemob/server.xml',
	        dataType: 'text',
	        type: 'GET',

	        // url: 'http://www.easemob.com/easemob/server.xml',
	        // dataType: 'xml',
	        data: { app_key: encodeURIComponent(options.appKey) },
	        success: suc || _utils.emptyfn,
	        error: error || _utils.emptyfn
	    };
	    _utils.ajax(options2);
	};

	connection.prototype.signup = function (options) {
	    var self = this;
	    var orgName = options.orgName || '';
	    var appName = options.appName || '';
	    var appKey = options.appKey || '';
	    var suc = options.success || EMPTYFN;
	    var err = options.error || EMPTYFN;

	    if (!orgName && !appName && appKey) {
	        var devInfos = appKey.split('#');
	        if (devInfos.length === 2) {
	            orgName = devInfos[0];
	            appName = devInfos[1];
	        }
	    }
	    if (!orgName && !appName) {
	        err({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var error = function error(res, xhr, msg) {
	        if (location.protocol != 'https:' && self.isHttpDNS) {
	            if (self.restIndex + 1 < self.restTotal) {
	                self.restIndex++;
	                self.getRestFromHttpDNS(options, 'signup');
	                return;
	            }
	        }
	        self.clear();
	        err(res);
	    };
	    var https = options.https || https;
	    var apiUrl = options.apiUrl;
	    var restUrl = apiUrl + '/' + orgName + '/' + appName + '/users';

	    var userjson = {
	        username: options.username,
	        password: options.password,
	        nickname: options.nickname || ''
	    };

	    var userinfo = _utils.stringify(userjson);
	    var options2 = {
	        url: restUrl,
	        dataType: 'json',
	        data: userinfo,
	        success: suc,
	        error: error
	    };
	    _utils.ajax(options2);
	};

	connection.prototype.open = function (options) {
	    if (location.protocol != 'https:' && this.isHttpDNS) {
	        this.dnsIndex = 0;
	        this.getHttpDNS(options, 'login');
	    } else {
	        this.login(options);
	    }
	};

	connection.prototype.login = function (options) {
	    var pass = _validCheck(options, this);

	    if (!pass) {
	        return;
	    }

	    var conn = this;

	    if (conn.isOpened()) {
	        return;
	    }

	    if (options.accessToken) {
	        options.access_token = options.accessToken;
	        _login(options, conn);
	    } else {
	        var apiUrl = options.apiUrl;
	        var userId = this.context.userId;
	        var pwd = options.pwd || '';
	        var appName = this.context.appName;
	        var orgName = this.context.orgName;

	        var suc = function suc(data, xhr) {
	            conn.context.status = _code.STATUS_DOLOGIN_IM;
	            conn.context.restTokenData = data;
	            _login(data, conn);
	        };
	        var error = function error(res, xhr, msg) {
	            if (location.protocol != 'https:' && conn.isHttpDNS) {
	                if (conn.restIndex + 1 < conn.restTotal) {
	                    conn.restIndex++;
	                    conn.getRestFromHttpDNS(options, 'login');
	                    return;
	                }
	            }
	            conn.clear();
	            if (res.error && res.error_description) {
	                conn.onError({
	                    type: _code.WEBIM_CONNCTION_OPEN_USERGRID_ERROR,
	                    data: res,
	                    xhr: xhr
	                });
	            } else {
	                conn.onError({
	                    type: _code.WEBIM_CONNCTION_OPEN_ERROR,
	                    data: res,
	                    xhr: xhr
	                });
	            }
	        };

	        this.context.status = _code.STATUS_DOLOGIN_USERGRID;

	        var loginJson = {
	            grant_type: 'password',
	            username: userId,
	            password: pwd,
	            timestamp: +new Date()
	        };
	        var loginfo = _utils.stringify(loginJson);

	        var options2 = {
	            url: apiUrl + '/' + orgName + '/' + appName + '/token',
	            dataType: 'json',
	            data: loginfo,
	            success: suc || _utils.emptyfn,
	            error: error || _utils.emptyfn
	        };
	        _utils.ajax(options2);
	    }
	};

	// attach to xmpp server for BOSH
	connection.prototype.attach = function (options) {
	    var pass = _validCheck(options, this);

	    if (!pass) {
	        return;
	    }

	    options = options || {};

	    var accessToken = options.accessToken || '';
	    if (accessToken == '') {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var sid = options.sid || '';
	    if (sid === '') {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_SESSIONID_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var rid = options.rid || '';
	    if (rid === '') {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_RID_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var stropheConn = this.getStrophe();

	    this.context.accessToken = accessToken;
	    this.context.stropheConn = stropheConn;
	    this.context.status = _code.STATUS_DOLOGIN_IM;

	    var conn = this;
	    var callback = function callback(status, msg) {
	        _loginCallback(status, msg, conn);
	    };

	    var jid = this.context.jid;
	    var wait = this.wait;
	    var hold = this.hold;
	    var wind = this.wind || 5;
	    stropheConn.attach(jid, sid, rid, callback, wait, hold, wind);
	};

	connection.prototype.close = function (reason) {
	    this.stopHeartBeat();

	    var status = this.context.status;
	    if (status == _code.STATUS_INIT) {
	        return;
	    }

	    if (this.isClosed() || this.isClosing()) {
	        return;
	    }

	    this.context.status = _code.STATUS_CLOSING;
	    this.context.stropheConn.disconnect(reason);
	};

	connection.prototype.addHandler = function (handler, ns, name, type, id, from, options) {
	    this.context.stropheConn.addHandler(handler, ns, name, type, id, from, options);
	};

	connection.prototype.notifyVersion = function (suc, fail) {
	    var jid = _getJid({}, this);
	    var dom = $iq({
	        from: this.context.jid || '',
	        to: this.domain,
	        type: 'result'
	    }).c('query', { xmlns: 'jabber:iq:version' }).c('name').t('easemob').up().c('version').t(_version).up().c('os').t('webim');

	    var suc = suc || _utils.emptyfn;
	    var error = fail || this.onError;
	    var failFn = function failFn(ele) {
	        error({
	            type: _code.WEBIM_CONNCTION_NOTIFYVERSION_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(dom.tree(), suc, failFn);
	    return;
	};

	// handle all types of presence message
	connection.prototype.handlePresence = function (msginfo) {
	    if (this.isClosed()) {
	        return;
	    }
	    var from = msginfo.getAttribute('from') || '';
	    var to = msginfo.getAttribute('to') || '';
	    var type = msginfo.getAttribute('type') || '';
	    var presence_type = msginfo.getAttribute('presence_type') || '';
	    var fromUser = _parseNameFromJidFn(from);
	    var toUser = _parseNameFromJidFn(to);
	    var info = {
	        from: fromUser,
	        to: toUser,
	        fromJid: from,
	        toJid: to,
	        type: type,
	        chatroom: msginfo.getElementsByTagName('roomtype').length ? true : false
	    };

	    var showTags = msginfo.getElementsByTagName('show');
	    if (showTags && showTags.length > 0) {
	        var showTag = showTags[0];
	        info.show = Strophe.getText(showTag);
	    }
	    var statusTags = msginfo.getElementsByTagName('status');
	    if (statusTags && statusTags.length > 0) {
	        var statusTag = statusTags[0];
	        info.status = Strophe.getText(statusTag);
	        info.code = statusTag.getAttribute('code');
	    }

	    var priorityTags = msginfo.getElementsByTagName('priority');
	    if (priorityTags && priorityTags.length > 0) {
	        var priorityTag = priorityTags[0];
	        info.priority = Strophe.getText(priorityTag);
	    }

	    var error = msginfo.getElementsByTagName('error');
	    if (error && error.length > 0) {
	        var error = error[0];
	        info.error = {
	            code: error.getAttribute('code')
	        };
	    }

	    var destroy = msginfo.getElementsByTagName('destroy');
	    if (destroy && destroy.length > 0) {
	        var destroy = destroy[0];
	        info.destroy = true;

	        var reason = destroy.getElementsByTagName('reason');
	        if (reason && reason.length > 0) {
	            info.reason = Strophe.getText(reason[0]);
	        }
	    }

	    // <item affiliation="member" jid="easemob-demo#chatdemoui_lwz2@easemob.com" role="none">
	    //     <actor nick="liuwz"/>
	    // </item>
	    // one record once a time
	    // kick info: actor / member
	    var members = msginfo.getElementsByTagName('item');
	    if (members && members.length > 0) {
	        var member = members[0];
	        var role = member.getAttribute('role');
	        var jid = member.getAttribute('jid');
	        // dismissed by group
	        if (role == 'none' && jid) {
	            var kickedMember = _parseNameFromJidFn(jid);
	            var actor = member.getElementsByTagName('actor')[0];
	            var actorNick = actor.getAttribute('nick');
	            info.actor = actorNick;
	            info.kicked = kickedMember;
	        }
	        // Service Acknowledges Room Creation `createGroupACK`
	        if (role == 'moderator' && info.code == '201') {
	            // info.type = 'createGroupACK';
	            info.type = 'joinPublicGroupSuccess';
	        }
	    }

	    // from message : apply to join group
	    // <message from="easemob-demo#chatdemoui_lwz4@easemob.com/mobile" id="259151681747419640" to="easemob-demo#chatdemoui_liuwz@easemob.com" xmlns="jabber:client">
	    //     <x xmlns="http://jabber.org/protocol/muc#user">
	    //         <apply from="easemob-demo#chatdemoui_lwz4@easemob.com" to="easemob-demo#chatdemoui_1477733677560@conference.easemob.com" toNick="lwzlwzlwz">
	    //             <reason>qwe</reason>
	    //         </apply>
	    //     </x>
	    // </message>
	    var apply = msginfo.getElementsByTagName('apply');
	    if (apply && apply.length > 0) {
	        apply = apply[0];
	        var toNick = apply.getAttribute('toNick');
	        var groupJid = apply.getAttribute('to');
	        var userJid = apply.getAttribute('from');
	        var groupName = _parseNameFromJidFn(groupJid);
	        var userName = _parseNameFromJidFn(userJid);
	        info.toNick = toNick;
	        info.groupName = groupName;
	        info.type = 'joinGroupNotifications';
	        var reason = apply.getElementsByTagName('reason');
	        if (reason && reason.length > 0) {
	            info.reason = Strophe.getText(reason[0]);
	        }
	    }

	    if (info.chatroom) {
	        // diff the
	        info.presence_type = presence_type;
	        info.original_type = info.type;
	        var reflectUser = from.slice(from.lastIndexOf('/') + 1);

	        if (reflectUser === this.context.userId) {
	            if (info.type === '' && !info.code) {
	                info.type = 'joinChatRoomSuccess';
	            } else if (presence_type === 'unavailable' || info.type === 'unavailable') {
	                if (!info.status) {
	                    // logout successfully.
	                    info.type = 'leaveChatRoom';
	                } else if (info.code == 110) {
	                    // logout or dismissied by admin.
	                    info.type = 'leaveChatRoom';
	                } else if (info.error && info.error.code == 406) {
	                    // The chat room is full.
	                    info.type = 'reachChatRoomCapacity';
	                }
	            }
	        }
	    } else {
	        info.presence_type = presence_type;
	        info.original_type = type;

	        if (/subscribe/.test(info.type)) {
	            //subscribe | subscribed | unsubscribe | unsubscribed
	        } else if (type == "" && !info.status && !info.error) {
	            info.type = 'joinPublicGroupSuccess';
	        } else if (presence_type === 'unavailable' || type === 'unavailable') {
	            // There is no roomtype when a chat room is deleted.
	            if (info.destroy) {
	                // Group or Chat room Deleted.
	                info.type = 'deleteGroupChat';
	            } else if (info.code == 307 || info.code == 321) {
	                // Dismissed by group.
	                info.type = 'leaveGroup';
	            }
	        }
	    }
	    this.onPresence(info, msginfo);
	};

	connection.prototype.handlePing = function (e) {
	    if (this.isClosed()) {
	        return;
	    }
	    var id = e.getAttribute('id');
	    var from = e.getAttribute('from');
	    var to = e.getAttribute('to');
	    var dom = $iq({
	        from: to,
	        to: from,
	        id: id,
	        type: 'result'
	    });
	    this.sendCommand(dom.tree());
	};

	connection.prototype.handleIq = function (iq) {
	    return true;
	};

	connection.prototype.handleIqPrivacy = function (msginfo) {
	    var list = msginfo.getElementsByTagName('list');
	    if (list.length == 0) {
	        return;
	    }
	    this.getBlacklist();
	};

	connection.prototype.handleIqRoster = function (e) {
	    var id = e.getAttribute('id');
	    var from = e.getAttribute('from') || '';
	    var name = _parseNameFromJidFn(from);
	    var curJid = this.context.jid;
	    var curUser = this.context.userId;

	    var iqresult = $iq({ type: 'result', id: id, from: curJid });
	    this.sendCommand(iqresult.tree());

	    var msgBodies = e.getElementsByTagName('query');
	    if (msgBodies && msgBodies.length > 0) {
	        var queryTag = msgBodies[0];
	        var rouster = _parseFriend(queryTag, this, from);
	        this.onRoster(rouster);
	    }
	    return true;
	};

	connection.prototype.handleMessage = function (msginfo) {
	    var self = this;
	    if (this.isClosed()) {
	        return;
	    }

	    var id = msginfo.getAttribute('id') || '';

	    // cache ack into sendQueue first , handelSendQueue will do the send thing with the speed of  5/s
	    this.cacheReceiptsMessage({
	        id: id
	    });
	    var parseMsgData = _parseResponseMessage(msginfo);
	    if (parseMsgData.errorMsg) {
	        this.handlePresence(msginfo);
	        return;
	    }
	    // send error
	    var error = msginfo.getElementsByTagName('error');
	    var errorCode = '';
	    var errorText = '';
	    var errorBool = false;
	    if (error.length > 0) {
	        errorBool = true;
	        errorCode = error[0].getAttribute('code');
	        var textDOM = error[0].getElementsByTagName('text');
	        errorText = textDOM[0].textContent || textDOM[0].text;
	        log('handle error', errorCode, errorText);
	    }

	    var msgDatas = parseMsgData.data;
	    for (var i in msgDatas) {
	        if (!msgDatas.hasOwnProperty(i)) {
	            continue;
	        }
	        var msg = msgDatas[i];
	        if (!msg.from || !msg.to) {
	            continue;
	        }

	        var from = (msg.from + '').toLowerCase();
	        var too = (msg.to + '').toLowerCase();
	        var extmsg = msg.ext || {};
	        var chattype = '';
	        var typeEl = msginfo.getElementsByTagName('roomtype');
	        if (typeEl.length) {
	            chattype = typeEl[0].getAttribute('type') || 'chat';
	        } else {
	            chattype = msginfo.getAttribute('type') || 'chat';
	        }

	        var msgBodies = msg.bodies;
	        if (!msgBodies || msgBodies.length == 0) {
	            continue;
	        }
	        var msgBody = msg.bodies[0];
	        var type = msgBody.type;

	        try {
	            switch (type) {
	                case 'txt':
	                    var receiveMsg = msgBody.msg;
	                    var emojibody = _utils.parseTextMessage(receiveMsg, WebIM.Emoji);
	                    if (emojibody.isemoji) {
	                        var msg = {
	                            id: id,
	                            type: chattype,
	                            from: from,
	                            to: too,
	                            delay: parseMsgData.delayTimeStamp,
	                            data: emojibody.body,
	                            ext: extmsg
	                        };
	                        !msg.delay && delete msg.delay;
	                        msg.error = errorBool;
	                        msg.errorText = errorText;
	                        msg.errorCode = errorCode;
	                        this.onEmojiMessage(msg);
	                    } else {
	                        var msg = {
	                            id: id,
	                            type: chattype,
	                            from: from,
	                            to: too,
	                            delay: parseMsgData.delayTimeStamp,
	                            data: receiveMsg,
	                            ext: extmsg
	                        };
	                        !msg.delay && delete msg.delay;
	                        msg.error = errorBool;
	                        msg.errorText = errorText;
	                        msg.errorCode = errorCode;
	                        this.onTextMessage(msg);
	                    }
	                    break;
	                case 'img':
	                    var rwidth = 0;
	                    var rheight = 0;
	                    if (msgBody.size) {
	                        rwidth = msgBody.size.width;
	                        rheight = msgBody.size.height;
	                    }
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        thumb: msgBody.thumb,
	                        thumb_secret: msgBody.thumb_secret,
	                        file_length: msgBody.file_length || '',
	                        width: rwidth,
	                        height: rheight,
	                        filetype: msgBody.filetype || '',
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onPictureMessage(msg);
	                    break;
	                case 'audio':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        length: msgBody.length || '',
	                        file_length: msgBody.file_length || '',
	                        filetype: msgBody.filetype || '',
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onAudioMessage(msg);
	                    break;
	                case 'file':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        file_length: msgBody.file_length,
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onFileMessage(msg);
	                    break;
	                case 'loc':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,
	                        addr: msgBody.addr,
	                        lat: msgBody.lat,
	                        lng: msgBody.lng,
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onLocationMessage(msg);
	                    break;
	                case 'video':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        file_length: msgBody.file_length,
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onVideoMessage(msg);
	                    break;
	                case 'cmd':
	                    var msg = {
	                        id: id,
	                        from: from,
	                        to: too,
	                        action: msgBody.action,
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onCmdMessage(msg);
	                    break;
	            }
	            ;
	        } catch (e) {
	            this.onError({
	                type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	                data: e
	            });
	        }
	    }
	};

	connection.prototype.handleReceivedMessage = function (message) {
	    try {
	        this.onReceivedMessage(message);
	    } catch (e) {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	            data: e
	        });
	    }

	    var rcv = message.getElementsByTagName('received'),
	        id,
	        mid;

	    if (rcv.length > 0) {
	        if (rcv[0].childNodes && rcv[0].childNodes.length > 0) {
	            id = rcv[0].childNodes[0].nodeValue;
	        } else {
	            id = rcv[0].innerHTML || rcv[0].innerText;
	        }
	        mid = rcv[0].getAttribute('mid');
	    }

	    if (_msgHash[id]) {
	        try {
	            _msgHash[id].msg.success instanceof Function && _msgHash[id].msg.success(id, mid);
	        } catch (e) {
	            this.onError({
	                type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	                data: e
	            });
	        }
	        delete _msgHash[id];
	    }
	};

	connection.prototype.handleInviteMessage = function (message) {
	    var form = null;
	    var invitemsg = message.getElementsByTagName('invite');
	    var reasonDom = message.getElementsByTagName('reason')[0];
	    var reasonMsg = reasonDom.textContent;
	    var id = message.getAttribute('id') || '';
	    this.sendReceiptsMessage({
	        id: id
	    });

	    if (invitemsg && invitemsg.length > 0) {
	        var fromJid = invitemsg[0].getAttribute('from');
	        form = _parseNameFromJidFn(fromJid);
	    }
	    var xmsg = message.getElementsByTagName('x');
	    var roomid = null;
	    if (xmsg && xmsg.length > 0) {
	        for (var i = 0; i < xmsg.length; i++) {
	            if ('jabber:x:conference' === xmsg[i].namespaceURI) {
	                var roomjid = xmsg[i].getAttribute('jid');
	                roomid = _parseNameFromJidFn(roomjid);
	            }
	        }
	    }
	    this.onInviteMessage({
	        type: 'invite',
	        from: form,
	        roomid: roomid,
	        reason: reasonMsg
	    });
	};

	connection.prototype.sendCommand = function (dom, id) {
	    if (this.isOpened()) {
	        this.context.stropheConn.send(dom);
	    } else {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_DISCONNECTED,
	            reconnect: true
	        });
	    }
	};

	connection.prototype.getUniqueId = function (prefix) {
	    var cdate = new Date();
	    var offdate = new Date(2010, 1, 1);
	    var offset = cdate.getTime() - offdate.getTime();
	    var hexd = parseInt(offset).toString(16);

	    if (typeof prefix === 'string' || typeof prefix === 'number') {
	        return prefix + '_' + hexd;
	    } else {
	        return 'WEBIM_' + hexd;
	    }
	};

	connection.prototype.send = function (message) {
	    var self = this;
	    if (this.isWindowSDK) {
	        WebIM.doQuery('{"type":"sendMessage","to":"' + message.to + '","message_type":"' + message.type + '","msg":"' + encodeURI(message.msg) + '","chatType":"' + message.chatType + '"}', function (response) {}, function (code, msg) {
	            var message = {
	                data: {
	                    data: "send"
	                },
	                type: _code.WEBIM_MESSAGE_SED_ERROR
	            };
	            self.onError(message);
	        });
	    } else {
	        if (Object.prototype.toString.call(message) === '[object Object]') {
	            var appKey = this.context.appKey || '';
	            var toJid = appKey + '_' + message.to + '@' + this.domain;

	            if (message.group) {
	                toJid = appKey + '_' + message.to + '@conference.' + this.domain;
	            }
	            if (message.resource) {
	                toJid = toJid + '/' + message.resource;
	            }

	            message.toJid = toJid;
	            message.id = message.id || this.getUniqueId();
	            _msgHash[message.id] = new _message(message);
	            _msgHash[message.id].send(this);
	        } else if (typeof message === 'string') {
	            _msgHash[message] && _msgHash[message].send(this);
	        }
	    }
	};

	connection.prototype.addRoster = function (options) {
	    var jid = _getJid(options, this);
	    var name = options.name || '';
	    var groups = options.groups || '';

	    var iq = $iq({ type: 'set' });
	    iq.c('query', { xmlns: 'jabber:iq:roster' });
	    iq.c('item', { jid: jid, name: name });

	    if (groups) {
	        for (var i = 0; i < groups.length; i++) {
	            iq.c('group').t(groups[i]).up();
	        }
	    }
	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || _utils.emptyfn;
	    this.context.stropheConn.sendIQ(iq.tree(), suc, error);
	};

	connection.prototype.removeRoster = function (options) {
	    var jid = _getJid(options, this);
	    var iq = $iq({ type: 'set' }).c('query', { xmlns: 'jabber:iq:roster' }).c('item', {
	        jid: jid,
	        subscription: 'remove'
	    });

	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || _utils.emptyfn;
	    this.context.stropheConn.sendIQ(iq, suc, error);
	};

	connection.prototype.getRoster = function (options) {
	    var conn = this;
	    var dom = $iq({
	        type: 'get'
	    }).c('query', { xmlns: 'jabber:iq:roster' });

	    var options = options || {};
	    var suc = options.success || this.onRoster;
	    var completeFn = function completeFn(ele) {
	        var rouster = [];
	        var msgBodies = ele.getElementsByTagName('query');
	        if (msgBodies && msgBodies.length > 0) {
	            var queryTag = msgBodies[0];
	            rouster = _parseFriend(queryTag);
	        }
	        suc(rouster, ele);
	    };
	    var error = options.error || this.onError;
	    var failFn = function failFn(ele) {
	        error({
	            type: _code.WEBIM_CONNCTION_GETROSTER_ERROR,
	            data: ele
	        });
	    };
	    if (this.isOpened()) {
	        this.context.stropheConn.sendIQ(dom.tree(), completeFn, failFn);
	    } else {
	        error({
	            type: _code.WEBIM_CONNCTION_DISCONNECTED
	        });
	    }
	};

	connection.prototype.subscribe = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'subscribe' });
	    if (options.message) {
	        pres.c('status').t(options.message).up();
	    }
	    if (options.nick) {
	        pres.c('nick', { 'xmlns': 'http://jabber.org/protocol/nick' }).t(options.nick);
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.subscribed = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'subscribed' });

	    if (options.message) {
	        pres.c('status').t(options.message).up();
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.unsubscribe = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'unsubscribe' });

	    if (options.message) {
	        pres.c('status').t(options.message);
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.unsubscribed = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'unsubscribed' });

	    if (options.message) {
	        pres.c('status').t(options.message).up();
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.joinPublicGroup = function (options) {
	    var roomJid = this.context.appKey + '_' + options.roomId + '@conference.' + this.domain;
	    var room_nick = roomJid + '/' + this.context.userId;
	    var suc = options.success || _utils.emptyfn;
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_JOINROOM_ERROR,
	            data: ele
	        });
	    };
	    var iq = $pres({
	        from: this.context.jid,
	        to: room_nick
	    }).c('x', { xmlns: Strophe.NS.MUC });

	    this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
	};

	connection.prototype.listRooms = function (options) {
	    var iq = $iq({
	        to: options.server || 'conference.' + this.domain,
	        from: this.context.jid,
	        type: 'get'
	    }).c('query', { xmlns: Strophe.NS.DISCO_ITEMS });

	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || this.onError;
	    var completeFn = function completeFn(result) {
	        var rooms = [];
	        rooms = _parseRoom(result);
	        try {
	            suc(rooms);
	        } catch (e) {
	            error({
	                type: _code.WEBIM_CONNCTION_GETROOM_ERROR,
	                data: e
	            });
	        }
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOM_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
	};

	connection.prototype.queryRoomMember = function (options) {
	    var domain = this.domain;
	    var members = [];
	    var iq = $iq({
	        to: this.context.appKey + '_' + options.roomId + '@conference.' + this.domain,
	        type: 'get'
	    }).c('query', { xmlns: Strophe.NS.MUC + '#admin' }).c('item', { affiliation: 'member' });

	    var suc = options.success || _utils.emptyfn;
	    var completeFn = function completeFn(result) {
	        var items = result.getElementsByTagName('item');

	        if (items) {
	            for (var i = 0; i < items.length; i++) {
	                var item = items[i];
	                var mem = {
	                    jid: item.getAttribute('jid'),
	                    affiliation: 'member'
	                };
	                members.push(mem);
	            }
	        }
	        suc(members);
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOMMEMBER_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
	};

	connection.prototype.queryRoomInfo = function (options) {
	    var domain = this.domain;
	    var iq = $iq({
	        to: this.context.appKey + '_' + options.roomId + '@conference.' + domain,
	        type: 'get'
	    }).c('query', { xmlns: Strophe.NS.DISCO_INFO });

	    var suc = options.success || _utils.emptyfn;
	    var members = [];

	    var completeFn = function completeFn(result) {
	        var settings = '';
	        var features = result.getElementsByTagName('feature');
	        if (features) {
	            settings = features[1].getAttribute('var') + '|' + features[3].getAttribute('var') + '|' + features[4].getAttribute('var');
	        }
	        switch (settings) {
	            case 'muc_public|muc_membersonly|muc_notallowinvites':
	                settings = 'PUBLIC_JOIN_APPROVAL';
	                break;
	            case 'muc_public|muc_open|muc_notallowinvites':
	                settings = 'PUBLIC_JOIN_OPEN';
	                break;
	            case 'muc_hidden|muc_membersonly|muc_allowinvites':
	                settings = 'PRIVATE_MEMBER_INVITE';
	                break;
	            case 'muc_hidden|muc_membersonly|muc_notallowinvites':
	                settings = 'PRIVATE_OWNER_INVITE';
	                break;
	        }
	        var owner = '';
	        var fields = result.getElementsByTagName('field');
	        var fieldValues = {};
	        if (fields) {
	            for (var i = 0; i < fields.length; i++) {
	                var field = fields[i];
	                var fieldVar = field.getAttribute('var');
	                var fieldSimplify = fieldVar.split('_')[1];
	                switch (fieldVar) {
	                    case 'muc#roominfo_occupants':
	                    case 'muc#roominfo_maxusers':
	                    case 'muc#roominfo_affiliations':
	                    case 'muc#roominfo_description':
	                        fieldValues[fieldSimplify] = field.textContent || field.text || '';
	                        break;
	                    case 'muc#roominfo_owner':
	                        var mem = {
	                            jid: (field.textContent || field.text) + '@' + domain,
	                            affiliation: 'owner'
	                        };
	                        members.push(mem);
	                        fieldValues[fieldSimplify] = field.textContent || field.text;
	                        break;
	                }

	                // if (field.getAttribute('label') === 'owner') {
	                //     var mem = {
	                //         jid: (field.textContent || field.text) + '@' + domain
	                //         , affiliation: 'owner'
	                //     };
	                //     members.push(mem);
	                //     break;
	                // }
	            }
	            fieldValues['name'] = result.getElementsByTagName('identity')[0].getAttribute('name');
	        }
	        log(settings, members, fieldValues);
	        suc(settings, members, fieldValues);
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOMINFO_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
	};

	connection.prototype.queryRoomOccupants = function (options) {
	    var suc = options.success || _utils.emptyfn;
	    var completeFn = function completeFn(result) {
	        var occupants = [];
	        occupants = _parseRoomOccupants(result);
	        suc(occupants);
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOMOCCUPANTS_ERROR,
	            data: ele
	        });
	    };
	    var attrs = {
	        xmlns: Strophe.NS.DISCO_ITEMS
	    };
	    var info = $iq({
	        from: this.context.jid,
	        to: this.context.appKey + '_' + options.roomId + '@conference.' + this.domain,
	        type: 'get'
	    }).c('query', attrs);
	    this.context.stropheConn.sendIQ(info.tree(), completeFn, errorFn);
	};

	connection.prototype.setUserSig = function (desc) {
	    var dom = $pres({ xmlns: 'jabber:client' });
	    desc = desc || '';
	    dom.c('status').t(desc);
	    this.sendCommand(dom.tree());
	};

	connection.prototype.setPresence = function (type, status) {
	    var dom = $pres({ xmlns: 'jabber:client' });
	    if (type) {
	        if (status) {
	            dom.c('show').t(type);
	            dom.up().c('status').t(status);
	        } else {
	            dom.c('show').t(type);
	        }
	    }
	    this.sendCommand(dom.tree());
	};

	connection.prototype.getPresence = function () {
	    var dom = $pres({ xmlns: 'jabber:client' });
	    var conn = this;
	    this.sendCommand(dom.tree());
	};

	connection.prototype.ping = function (options) {
	    var options = options || {};
	    var jid = _getJid(options, this);

	    var dom = $iq({
	        from: this.context.jid || '',
	        to: jid,
	        type: 'get'
	    }).c('ping', { xmlns: 'urn:xmpp:ping' });

	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || this.onError;
	    var failFn = function failFn(ele) {
	        error({
	            type: _code.WEBIM_CONNCTION_PING_ERROR,
	            data: ele
	        });
	    };
	    if (this.isOpened()) {
	        this.context.stropheConn.sendIQ(dom.tree(), suc, failFn);
	    } else {
	        error({
	            type: _code.WEBIM_CONNCTION_DISCONNECTED
	        });
	    }
	    return;
	};

	connection.prototype.isOpened = function () {
	    return this.context.status == _code.STATUS_OPENED;
	};

	connection.prototype.isOpening = function () {
	    var status = this.context.status;
	    return status == _code.STATUS_DOLOGIN_USERGRID || status == _code.STATUS_DOLOGIN_IM;
	};

	connection.prototype.isClosing = function () {
	    return this.context.status == _code.STATUS_CLOSING;
	};

	connection.prototype.isClosed = function () {
	    return this.context.status == _code.STATUS_CLOSED;
	};

	connection.prototype.clear = function () {
	    var key = this.context.appKey;
	    if (this.errorType != _code.WEBIM_CONNCTION_DISCONNECTED) {
	        this.context = {
	            status: _code.STATUS_INIT,
	            appKey: key
	        };
	    }
	    if (this.intervalId) {
	        clearInterval(this.intervalId);
	    }
	    this.restIndex = 0;
	    this.xmppIndex = 0;

	    if (this.errorType == _code.WEBIM_CONNCTION_CLIENT_LOGOUT || this.errorType == -1) {
	        var message = {
	            data: {
	                data: "clear"
	            },
	            type: _code.WEBIM_CONNCTION_CLIENT_LOGOUT
	        };
	        this.onError(message);
	    }
	};

	connection.prototype.getChatRooms = function (options) {

	    if (!_utils.isCanSetRequestHeader) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_NOT_SUPPORT_CHATROOM_ERROR
	        });
	        return;
	    }

	    var conn = this,
	        token = options.accessToken || this.context.accessToken;

	    if (token) {
	        var apiUrl = options.apiUrl;
	        var appName = this.context.appName;
	        var orgName = this.context.orgName;

	        if (!appName || !orgName) {
	            conn.onError({
	                type: _code.WEBIM_CONNCTION_AUTH_ERROR
	            });
	            return;
	        }

	        var suc = function suc(data, xhr) {
	            typeof options.success === 'function' && options.success(data);
	        };

	        var error = function error(res, xhr, msg) {
	            if (res.error && res.error_description) {
	                conn.onError({
	                    type: _code.WEBIM_CONNCTION_LOAD_CHATROOM_ERROR,
	                    msg: res.error_description,
	                    data: res,
	                    xhr: xhr
	                });
	            }
	        };

	        var pageInfo = {
	            pagenum: parseInt(options.pagenum) || 1,
	            pagesize: parseInt(options.pagesize) || 20
	        };

	        var opts = {
	            url: apiUrl + '/' + orgName + '/' + appName + '/chatrooms',
	            dataType: 'json',
	            type: 'GET',
	            headers: { 'Authorization': 'Bearer ' + token },
	            data: pageInfo,
	            success: suc || _utils.emptyfn,
	            error: error || _utils.emptyfn
	        };
	        _utils.ajax(opts);
	    } else {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR
	        });
	    }
	};

	connection.prototype.joinChatRoom = function (options) {
	    var roomJid = this.context.appKey + '_' + options.roomId + '@conference.' + this.domain;
	    var room_nick = roomJid + '/' + this.context.userId;
	    var suc = options.success || _utils.emptyfn;
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_JOINCHATROOM_ERROR,
	            data: ele
	        });
	    };

	    var iq = $pres({
	        from: this.context.jid,
	        to: room_nick
	    }).c('x', { xmlns: Strophe.NS.MUC + '#user' }).c('item', { affiliation: 'member', role: 'participant' }).up().up().c('roomtype', { xmlns: 'easemob:x:roomtype', type: 'chatroom' });

	    this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
	};

	connection.prototype.quitChatRoom = function (options) {
	    var roomJid = this.context.appKey + '_' + options.roomId + '@conference.' + this.domain;
	    var room_nick = roomJid + '/' + this.context.userId;
	    var suc = options.success || _utils.emptyfn;
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_QUITCHATROOM_ERROR,
	            data: ele
	        });
	    };
	    var iq = $pres({
	        from: this.context.jid,
	        to: room_nick,
	        type: 'unavailable'
	    }).c('x', { xmlns: Strophe.NS.MUC + '#user' }).c('item', { affiliation: 'none', role: 'none' }).up().up().c('roomtype', { xmlns: 'easemob:x:roomtype', type: 'chatroom' });

	    this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
	};

	connection.prototype._onReceiveInviteFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var self = this;
	    var options = {
	        title: "Group invitation",
	        msg: info.user + " invites you to join into group:" + info.group_id,
	        agree: function agree() {
	            WebIM.doQuery('{"type":"acceptInvitationFromGroup","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "acceptInvitationFromGroup error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP
	                };
	                self.onError(message);
	            });
	        },
	        reject: function reject() {
	            WebIM.doQuery('{"type":"declineInvitationFromGroup","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "declineInvitationFromGroup error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP
	                };
	                self.onError(message);
	            });
	        }
	    };

	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveInviteAcceptionFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group invitation response",
	        msg: info.user + " agreed to join into group:" + info.group_id,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveInviteDeclineFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group invitation response",
	        msg: info.user + " rejected to join into group:" + info.group_id,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onAutoAcceptInvitationFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group invitation",
	        msg: "You had joined into the group:" + info.group_name + " automatically.Inviter:" + info.user,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onLeaveGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group notification",
	        msg: "You have been out of the group:" + info.group_id + ".Reason:" + info.msg,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveJoinGroupApplication = function (info) {
	    info = eval('(' + info + ')');
	    var self = this;
	    var options = {
	        title: "Group join application",
	        msg: info.user + " applys to join into group:" + info.group_id,
	        agree: function agree() {
	            WebIM.doQuery('{"type":"acceptJoinGroupApplication","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "acceptJoinGroupApplication error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_ACCEPT_JOIN_GROUP
	                };
	                self.onError(message);
	            });
	        },
	        reject: function reject() {
	            WebIM.doQuery('{"type":"declineJoinGroupApplication","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "declineJoinGroupApplication error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_DECLINE_JOIN_GROUP
	                };
	                self.onError(message);
	            });
	        }
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveAcceptionFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group notification",
	        msg: "You had joined into the group:" + info.group_name + ".",
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveRejectionFromGroup = function () {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group notification",
	        msg: "You have been rejected to join into the group:" + info.group_name + ".",
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onUpdateMyGroupList = function (options) {
	    this.onUpdateMyGroupList(options);
	};
	connection.prototype._onUpdateMyRoster = function (options) {
	    this.onUpdateMyRoster(options);
	};
	connection.prototype.reconnect = function () {
	    console.log('reconnect');
	    var that = this;
	    setTimeout(function () {
	        _login(that.context.restTokenData, that);
	    }, (this.autoReconnectNumTotal == 0 ? 0 : this.autoReconnectInterval) * 1000);
	    this.autoReconnectNumTotal++;
	};

	connection.prototype.closed = function () {
	    var message = {
	        data: {
	            data: "Closed error"
	        },
	        type: _code.WEBIM_CONNECTION_CLOSED
	    };
	    this.onError(message);
	};

	// used for blacklist
	function _parsePrivacy(iq) {
	    var list = [];
	    var items = iq.getElementsByTagName('item');

	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var jid = item.getAttribute('value');
	            var order = item.getAttribute('order');
	            var type = item.getAttribute('type');
	            if (!jid) {
	                continue;
	            }
	            var n = _parseNameFromJidFn(jid);
	            list[n] = {
	                type: type,
	                order: order,
	                jid: jid,
	                name: n
	            };
	        }
	    }
	    return list;
	};

	// used for blacklist
	connection.prototype.getBlacklist = function (options) {
	    options = options || {};
	    var iq = $iq({ type: 'get' });
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var me = this;

	    iq.c('query', { xmlns: 'jabber:iq:privacy' }).c('list', { name: 'special' });

	    this.context.stropheConn.sendIQ(iq.tree(), function (iq) {
	        me.onBlacklistUpdate(_parsePrivacy(iq));
	        sucFn();
	    }, function () {
	        me.onBlacklistUpdate([]);
	        errFn();
	    });
	};

	// used for blacklist
	connection.prototype.addToBlackList = function (options) {
	    var iq = $iq({ type: 'set' });
	    var blacklist = options.list || {};
	    var type = options.type || 'jid';
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var piece = iq.c('query', { xmlns: 'jabber:iq:privacy' }).c('list', { name: 'special' });

	    var keys = Object.keys(blacklist);
	    var len = keys.length;
	    var order = 2;

	    for (var i = 0; i < len; i++) {
	        var item = blacklist[keys[i]];
	        var type = item.type || 'jid';
	        var jid = item.jid;

	        piece = piece.c('item', { action: 'deny', order: order++, type: type, value: jid }).c('message');
	        if (i !== len - 1) {
	            piece = piece.up().up();
	        }
	    }

	    // log('addToBlackList', blacklist, piece.tree());
	    this.context.stropheConn.sendIQ(piece.tree(), sucFn, errFn);
	};

	// used for blacklist
	connection.prototype.removeFromBlackList = function (options) {

	    var iq = $iq({ type: 'set' });
	    var blacklist = options.list || {};
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var piece = iq.c('query', { xmlns: 'jabber:iq:privacy' }).c('list', { name: 'special' });

	    var keys = Object.keys(blacklist);
	    var len = keys.length;

	    for (var i = 0; i < len; i++) {
	        var item = blacklist[keys[i]];
	        var type = item.type || 'jid';
	        var jid = item.jid;
	        var order = item.order;

	        piece = piece.c('item', { action: 'deny', order: order, type: type, value: jid }).c('message');
	        if (i !== len - 1) {
	            piece = piece.up().up();
	        }
	    }

	    // log('removeFromBlackList', blacklist, piece.tree());
	    this.context.stropheConn.sendIQ(piece.tree(), sucFn, errFn);
	};

	connection.prototype._getGroupJid = function (to) {
	    var appKey = this.context.appKey || '';
	    return appKey + '_' + to + '@conference.' + this.domain;
	};

	// used for blacklist
	connection.prototype.addToGroupBlackList = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var jid = _getJid(options, this);
	    var affiliation = 'admin'; //options.affiliation || 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'outcast',
	        jid: jid
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), sucFn, errFn);
	};

	function _parseGroupBlacklist(iq) {
	    var list = {};
	    var items = iq.getElementsByTagName('item');

	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var jid = item.getAttribute('jid');
	            var affiliation = item.getAttribute('affiliation');
	            var nick = item.getAttribute('nick');
	            if (!jid) {
	                continue;
	            }
	            var n = _parseNameFromJidFn(jid);
	            list[n] = {
	                jid: jid,
	                affiliation: affiliation,
	                nick: nick,
	                name: n
	            };
	        }
	    }
	    return list;
	}

	// used for blacklist
	connection.prototype.getGroupBlacklist = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // var jid = _getJid(options, this);
	    var affiliation = 'admin'; //options.affiliation || 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'get', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'outcast'
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        log('getGroupBlackList');
	        sucFn(_parseGroupBlacklist(msginfo));
	    }, function () {
	        errFn();
	    });
	};

	// used for blacklist
	connection.prototype.removeGroupMemberFromBlacklist = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    var jid = _getJid(options, this);
	    var affiliation = 'admin'; //options.affiliation || 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'member',
	        jid: jid
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        sucFn();
	    }, function () {
	        errFn();
	    });
	};

	/**
	 * changeGroupSubject 修改群名称
	 *
	 * @param options
	 */
	// <iq to='easemob-demo#chatdemoui_roomid@conference.easemob.com' type='set' id='3940489311' xmlns='jabber:client'>
	//     <query xmlns='http://jabber.org/protocol/muc#owner'>
	//         <x type='submit' xmlns='jabber:x:data'>
	//             <field var='FORM_TYPE'><value>http://jabber.org/protocol/muc#roomconfig</value></field>
	//             <field var='muc#roomconfig_roomname'><value>Room Name</value></field>
	//         </x>
	//     </query>
	// </iq>
	connection.prototype.changeGroupSubject = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // must be `owner`
	    var affiliation = 'owner';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('x', { type: 'submit', xmlns: 'jabber:x:data' }).c('field', { 'var': 'FORM_TYPE' }).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up().c('field', { 'var': 'muc#roomconfig_roomname' }).c('value').t(options.subject).up().up().c('field', { 'var': 'muc#roomconfig_roomdesc' }).c('value').t(options.description);

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        sucFn();
	    }, function () {
	        errFn();
	    });
	};

	/**
	 * destroyGroup 删除群组
	 *
	 * @param options
	 */
	// <iq id="9BEF5D20-841A-4048-B33A-F3F871120E58" to="easemob-demo#chatdemoui_1477462231499@conference.easemob.com" type="set">
	//     <query xmlns="http://jabber.org/protocol/muc#owner">
	//         <destroy>
	//             <reason>xxx destory group yyy</reason>
	//         </destroy>
	//     </query>
	// </iq>
	connection.prototype.destroyGroup = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // must be `owner`
	    var affiliation = 'owner';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('destroy').c('reason').t(options.reason || '');

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        sucFn();
	    }, function () {
	        errFn();
	    });
	};

	/**
	 * leaveGroupBySelf 主动离开群组
	 *
	 * @param options
	 */
	// <iq id="5CD33172-7B62-41B7-98BC-CE6EF840C4F6_easemob_occupants_change_affiliation" to="easemob-demo#chatdemoui_1477481609392@conference.easemob.com" type="set">
	//     <query xmlns="http://jabber.org/protocol/muc#admin">
	//         <item affiliation="none" jid="easemob-demo#chatdemoui_lwz2@easemob.com"/>
	//     </query>
	// </iq>
	connection.prototype.leaveGroupBySelf = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // must be `owner`
	    var jid = _getJid(options, this);
	    var affiliation = 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'none',
	        jid: jid
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	        sucFn(msgInfo);
	    }, function (errInfo) {
	        errFn(errInfo);
	    });
	};

	/**
	 * leaveGroup 被踢出群组
	 *
	 * @param options
	 */
	// <iq id="9fb25cf4-1183-43c9-961e-9df70e300de4:sendIQ" to="easemob-demo#chatdemoui_1477481597120@conference.easemob.com" type="set" xmlns="jabber:client">
	//     <query xmlns="http://jabber.org/protocol/muc#admin">
	//         <item affiliation="none" jid="easemob-demo#chatdemoui_lwz4@easemob.com"/>
	//         <item jid="easemob-demo#chatdemoui_lwz4@easemob.com" role="none"/>
	//         <item affiliation="none" jid="easemob-demo#chatdemoui_lwz2@easemob.com"/>
	//         <item jid="easemob-demo#chatdemoui_lwz2@easemob.com" role="none"/>
	//     </query>
	// </iq>
	connection.prototype.leaveGroup = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var list = options.list || [];
	    var affiliation = 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });
	    var piece = iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation });
	    var keys = Object.keys(list);
	    var len = keys.length;

	    for (var i = 0; i < len; i++) {
	        var name = list[keys[i]];
	        var jid = _getJidByName(name, this);

	        piece = piece.c('item', {
	            affiliation: 'none',
	            jid: jid
	        }).up().c('item', {
	            role: 'none',
	            jid: jid
	        }).up();
	    }

	    this.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	        sucFn(msgInfo);
	    }, function (errInfo) {
	        errFn(errInfo);
	    });
	};

	/**
	 * addGroupMembers 添加群组成员
	 *
	 * @param options

	 Attention the sequence: message first (每个成员单独发一条message), iq second (多个成员可以合成一条iq发)
	 <!-- 添加成员通知：send -->
	 <message to='easemob-demo#chatdemoui_1477482739698@conference.easemob.com'>
	 <x xmlns='http://jabber.org/protocol/muc#user'>
	 <invite to='easemob-demo#chatdemoui_lwz2@easemob.com'>
	 <reason>liuwz invite you to join group '谢谢'</reason>
	 </invite>
	 </x>
	 </message>
	 <!-- 添加成员：send -->
	 <iq id='09DFB1E5-C939-4C43-B5A7-8000DA0E3B73_easemob_occupants_change_affiliation' to='easemob-demo#chatdemoui_1477482739698@conference.easemob.com' type='set'>
	 <query xmlns='http://jabber.org/protocol/muc#admin'>
	 <item affiliation='member' jid='easemob-demo#chatdemoui_lwz2@easemob.com'/>
	 </query>
	 </iq>
	 */

	connection.prototype.addGroupMembers = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var list = options.list || [];
	    var affiliation = 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });
	    var piece = iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation });
	    var len = list.length;

	    for (var i = 0; i < len; i++) {

	        var name = list[i];
	        var jid = _getJidByName(name, this);

	        piece = piece.c('item', {
	            affiliation: 'member',
	            jid: jid
	        }).up();

	        var dom = $msg({
	            to: to
	        }).c('x', {
	            xmlns: 'http://jabber.org/protocol/muc#user'
	        }).c('invite', {
	            to: jid
	        }).c('reason').t(options.reason || '');

	        this.sendCommand(dom.tree());
	    }

	    this.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	        sucFn(msgInfo);
	    }, function (errInfo) {
	        errFn(errInfo);
	    });
	};

	/**
	 * acceptInviteFromGroup 接受加入申请
	 *
	 * @param options
	 */
	connection.prototype.acceptInviteFromGroup = function (options) {
	    options.success = function () {
	        // then send sendAcceptInviteMessage
	        // connection.prototype.sendAcceptInviteMessage(optoins);
	    };
	    this.addGroupMembers(options);
	};

	/**
	 * rejectInviteFromGroup 拒绝入群申请
	 *
	 * throw request for now 暂时不处理，直接丢弃
	 *
	 <message to='easemob-demo#chatdemoui_mt002@easemob.com' from='easmeob-demo#chatdemoui_mt001@easemob.com' id='B83B7210-BCFF-4DEE-AB28-B9FE5579C1E2'>
	 <x xmlns='http://jabber.org/protocol/muc#user'>
	 <apply to='easemob-demo#chatdemoui_groupid1@conference.easemob.com' from='easmeob-demo#chatdemoui_mt001@easemob.com' toNick='llllll'>
	 <reason>reject</reason>
	 </apply>
	 </x>
	 </message>
	 *
	 * @param options
	 */
	connection.prototype.rejectInviteFromGroup = function (options) {
	    // var from = _getJidByName(options.from, this);
	    // var dom = $msg({
	    //     from: from,
	    //     to: _getJidByName(options.to, this)
	    // }).c('x', {
	    //     xmlns: 'http://jabber.org/protocol/muc#user'
	    // }).c('apply', {
	    //     from: from,
	    //     to: this._getGroupJid(options.groupId),
	    //     toNick: options.groupName
	    // }).c('reason').t(options.reason || '');
	    //
	    // this.sendCommand(dom.tree());
	};

	/**
	 * createGroup 创建群组
	 *
	 * 1. 创建申请 -> 得到房主身份
	 * 2. 获取房主信息 -> 得到房间form
	 * 3. 完善房间form -> 创建成功
	 * 4. 添加房间成员
	 * 5. 消息通知成员
	 * @param options
	 */
	connection.prototype.createGroup = function (options) {
	    var roomId = +new Date();
	    var toRoom = this._getGroupJid(roomId);
	    var to = toRoom + '/' + this.context.userId;

	    var pres = $pres({ to: to }).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).up().c('create', { xmlns: 'http://jabber.org/protocol/muc' }).up();
	    // .c('c', {
	    //     hash: 'sha-1',
	    //     node: 'https://github.com/robbiehanson/XMPPFramework',
	    //     ver: 'k6gP4Ua5m4uu9YorAG0LRXM+kZY=',
	    //     xmlns: 'http://jabber.org/protocol/caps'
	    // }).up();

	    // createGroupACK
	    this.sendCommand(pres.tree());

	    var me = this;
	    // timeout hack for create group async
	    setTimeout(function () {
	        // Creating a Reserved Room
	        var iq = $iq({ type: 'get', to: toRoom }).c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' });

	        // Strophe.info('step 1 ----------');
	        // Strophe.info(options);
	        me.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	            // log(msgInfo);

	            // for ie hack
	            if ('setAttribute' in msgInfo) {
	                // Strophe.info('step 3 ----------');
	                var x = msgInfo.getElementsByTagName('x')[0];
	                x.setAttribute('type', 'submit');
	            } else {
	                // Strophe.info('step 4 ----------');
	                Strophe.forEachChild(msgInfo, 'x', function (field) {
	                    field.setAttribute('type', 'submit');
	                });
	            }

	            // var rcv = msgInfo.getElementsByTagName('x');
	            // var v;
	            // if (rcv.length > 0) {
	            //     if (rcv[0].childNodes && rcv[0].childNodes.length > 0) {
	            //         v = rcv[0].childNodes[0].nodeValue;
	            //     } else {
	            //         v = rcv[0].innerHTML || rcv[0].innerText
	            //     }
	            //     mid = rcv[0].getAttribute('mid');
	            // }
	            Strophe.info('step 5 ----------');
	            Strophe.forEachChild(x, 'field', function (field) {
	                var fieldVar = field.getAttribute('var');
	                var valueDom = field.getElementsByTagName('value')[0];
	                Strophe.info(fieldVar);
	                switch (fieldVar) {
	                    case 'muc#roomconfig_roomname':
	                        _setText(valueDom, options.subject || '');
	                        break;
	                    case 'muc#roomconfig_roomdesc':
	                        _setText(valueDom, options.description || '');
	                        break;
	                    case 'muc#roomconfig_publicroom':
	                        // public 1
	                        _setText(valueDom, +options.optionsPublic);
	                        break;
	                    case 'muc#roomconfig_membersonly':
	                        _setText(valueDom, +options.optionsMembersOnly);
	                        break;
	                    case 'muc#roomconfig_moderatedroom':
	                        _setText(valueDom, +options.optionsModerate);
	                        break;
	                    case 'muc#roomconfig_persistentroom':
	                        _setText(valueDom, 1);
	                        break;
	                    case 'muc#roomconfig_allowinvites':
	                        _setText(valueDom, +options.optionsAllowInvites);
	                        break;
	                    case 'muc#roomconfig_allowvisitornickchange':
	                        _setText(valueDom, 0);
	                        break;
	                    case 'muc#roomconfig_allowvisitorstatus':
	                        _setText(valueDom, 0);
	                        break;
	                    case 'allow_private_messages':
	                        _setText(valueDom, 0);
	                        break;
	                    case 'allow_private_messages_from_visitors':
	                        _setText(valueDom, 'nobody');
	                        break;
	                    default:
	                        break;
	                }
	                // log(valueDom);
	            });

	            var iq = $iq({ to: toRoom, type: 'set' }).c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' }).cnode(x);

	            // log(iq.tree());

	            me.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	                // sucFn(msgInfo);

	                me.addGroupMembers({
	                    list: options.members,
	                    roomId: roomId
	                });
	            }, function (errInfo) {
	                // errFn(errInfo);
	            });
	            // sucFn(msgInfo);
	        }, function (errInfo) {
	            // errFn(errInfo);
	        });
	    }, 1000);
	};

	function _setText(valueDom, v) {
	    if ('textContent' in valueDom) {
	        valueDom.textContent = v;
	    } else if ('text' in valueDom) {
	        valueDom.text = v;
	    } else {
	        // Strophe.info('_setText 4 ----------');
	        // valueDom.innerHTML = v;
	    }
	}

	var WebIM = window.WebIM || {};
	WebIM.connection = connection;
	WebIM.utils = _utils;
	WebIM.statusCode = _code;
	WebIM.message = _msg.message;
	WebIM.doQuery = function (str, suc, fail) {
	    if (typeof window.cefQuery === 'undefined') {
	        return;
	    }
	    window.cefQuery({
	        request: str,
	        persistent: false,
	        onSuccess: suc,
	        onFailure: fail
	    });
	};

	module.exports = WebIM;

	if (false) {
	    module.hot.accept();
	}

/***/ },

/***/ 232:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	;(function () {
	    'use strict';

	    var _utils = __webpack_require__(223).utils;
	    var Message = function Message(type, id) {
	        if (!this instanceof Message) {
	            return new Message(type);
	        }

	        this._msg = {};

	        if (typeof Message[type] === 'function') {
	            Message[type].prototype.setGroup = this.setGroup;
	            this._msg = new Message[type](id);
	        }
	        return this._msg;
	    };
	    Message.prototype.setGroup = function (group) {
	        this.body.group = group;
	    };

	    /*
	     * text message
	     */
	    Message.txt = function (id) {
	        this.id = id;
	        this.type = 'txt';
	        this.body = {};
	    };
	    Message.txt.prototype.set = function (opt) {
	        this.value = opt.msg;
	        this.body = {
	            id: this.id,
	            to: opt.to,
	            msg: this.value,
	            type: this.type,
	            roomType: opt.roomType,
	            ext: opt.ext || {},
	            success: opt.success,
	            fail: opt.fail
	        };

	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * cmd message
	     */
	    Message.cmd = function (id) {
	        this.id = id;
	        this.type = 'cmd';
	        this.body = {};
	    };
	    Message.cmd.prototype.set = function (opt) {
	        this.value = '';

	        this.body = {
	            to: opt.to,
	            action: opt.action,
	            msg: this.value,
	            type: this.type,
	            roomType: opt.roomType,
	            ext: opt.ext || {},
	            success: opt.success
	        };
	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * loc message
	     */
	    Message.location = function (id) {
	        this.id = id;
	        this.type = 'loc';
	        this.body = {};
	    };
	    Message.location.prototype.set = function (opt) {
	        this.body = {
	            to: opt.to,
	            type: this.type,
	            roomType: opt.roomType,
	            addr: opt.addr,
	            lat: opt.lat,
	            lng: opt.lng,
	            ext: opt.ext || {}
	        };
	    };

	    /*
	     * img message
	     */
	    Message.img = function (id) {
	        this.id = id;
	        this.type = 'img';
	        this.body = {};
	    };
	    Message.img.prototype.set = function (opt) {
	        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

	        this.value = opt.file;

	        this.body = {
	            id: this.id,
	            file: this.value,
	            apiUrl: opt.apiUrl,
	            to: opt.to,
	            type: this.type,
	            ext: opt.ext || {},
	            roomType: opt.roomType,
	            onFileUploadError: opt.onFileUploadError,
	            onFileUploadComplete: opt.onFileUploadComplete,
	            success: opt.success,
	            fail: opt.fail,
	            flashUpload: opt.flashUpload,
	            width: opt.width,
	            height: opt.height,
	            body: opt.body,
	            uploadError: opt.uploadError,
	            uploadComplete: opt.uploadComplete
	        };

	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * audio message
	     */
	    Message.audio = function (id) {
	        this.id = id;
	        this.type = 'audio';
	        this.body = {};
	    };
	    Message.audio.prototype.set = function (opt) {
	        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

	        this.value = opt.file;
	        this.filename = opt.filename || this.value.filename;

	        this.body = {
	            id: this.id,
	            file: this.value,
	            filename: this.filename,
	            apiUrl: opt.apiUrl,
	            to: opt.to,
	            type: this.type,
	            ext: opt.ext || {},
	            length: opt.length || 0,
	            roomType: opt.roomType,
	            file_length: opt.file_length,
	            onFileUploadError: opt.onFileUploadError,
	            onFileUploadComplete: opt.onFileUploadComplete,
	            success: opt.success,
	            fail: opt.fail,
	            flashUpload: opt.flashUpload,
	            body: opt.body
	        };
	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * file message
	     */
	    Message.file = function (id) {
	        this.id = id;
	        this.type = 'file';
	        this.body = {};
	    };
	    Message.file.prototype.set = function (opt) {
	        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

	        this.value = opt.file;
	        this.filename = opt.filename || this.value.filename;

	        this.body = {
	            id: this.id,
	            file: this.value,
	            filename: this.filename,
	            apiUrl: opt.apiUrl,
	            to: opt.to,
	            type: this.type,
	            ext: opt.ext || {},
	            roomType: opt.roomType,
	            onFileUploadError: opt.onFileUploadError,
	            onFileUploadComplete: opt.onFileUploadComplete,
	            success: opt.success,
	            fail: opt.fail,
	            flashUpload: opt.flashUpload,
	            body: opt.body
	        };
	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * video message
	     */
	    Message.video = function (id) {};
	    Message.video.prototype.set = function (opt) {};

	    var _Message = function _Message(message) {

	        if (!this instanceof _Message) {
	            return new _Message(message, conn);
	        }

	        this.msg = message;
	    };

	    _Message.prototype.send = function (conn) {
	        var me = this;

	        var _send = function _send(message) {

	            message.ext = message.ext || {};
	            message.ext.weichat = message.ext.weichat || {};
	            message.ext.weichat.originType = message.ext.weichat.originType || 'webim';

	            var json = {
	                from: conn.context.userId || '',
	                to: message.to,
	                bodies: [message.body],
	                ext: message.ext || {}
	            };

	            var jsonstr = _utils.stringify(json);
	            var dom = $msg({
	                type: message.group || 'chat',
	                to: message.toJid,
	                id: message.id,
	                xmlns: 'jabber:client'
	            }).c('body').t(jsonstr);

	            if (message.roomType) {
	                dom.up().c('roomtype', { xmlns: 'easemob:x:roomtype', type: 'chatroom' });
	            }

	            setTimeout(function () {
	                if (typeof _msgHash !== 'undefined' && _msgHash[message.id]) {
	                    _msgHash[message.id].msg.fail instanceof Function && _msgHash[message.id].msg.fail(message.id);
	                }
	            }, 60000);
	            conn.sendCommand(dom.tree(), message.id);
	        };

	        if (me.msg.file) {
	            if (me.msg.body && me.msg.body.url) {
	                // Only send msg
	                _send(me.msg);
	                return;
	            }
	            var _tmpComplete = me.msg.onFileUploadComplete;
	            var _complete = function _complete(data) {

	                if (data.entities[0]['file-metadata']) {
	                    var file_len = data.entities[0]['file-metadata']['content-length'];
	                    me.msg.file_length = file_len;
	                    me.msg.filetype = data.entities[0]['file-metadata']['content-type'];
	                    if (file_len > 204800) {
	                        me.msg.thumbnail = true;
	                    }
	                }

	                me.msg.body = {
	                    type: me.msg.type || 'file',

	                    url: (location.protocol != 'https:' && conn.isHttpDNS ? conn.apiUrl + data.uri.substr(data.uri.indexOf("/", 9)) : data.uri) + '/' + data.entities[0]['uuid'],
	                    secret: data.entities[0]['share-secret'],
	                    filename: me.msg.file.filename || me.msg.filename,
	                    size: {
	                        width: me.msg.width || 0,
	                        height: me.msg.height || 0
	                    },
	                    length: me.msg.length || 0,
	                    file_length: me.msg.file_length || 0,
	                    filetype: me.msg.filetype
	                };
	                _send(me.msg);
	                _tmpComplete instanceof Function && _tmpComplete(data, me.msg.id);
	            };

	            me.msg.onFileUploadComplete = _complete;
	            _utils.uploadFile.call(conn, me.msg);
	        } else {
	            me.msg.body = {
	                type: me.msg.type === 'chat' ? 'txt' : me.msg.type,
	                msg: me.msg.msg
	            };
	            if (me.msg.type === 'cmd') {
	                me.msg.body.action = me.msg.action;
	            } else if (me.msg.type === 'loc') {
	                me.msg.body.addr = me.msg.addr;
	                me.msg.body.lat = me.msg.lat;
	                me.msg.body.lng = me.msg.lng;
	            }

	            _send(me.msg);
	        }
	    };

	    exports._msg = _Message;
	    exports.message = Message;
	})();

/***/ },

/***/ 233:
/***/ function(module, exports) {

	"use strict";

	;(function () {
	    function Array_h(length) {
	        this.array = length === undefined ? [] : new Array(length);
	    }

	    Array_h.prototype = {
	        /**
	         * 返回数组长度
	         *
	         * @return {Number} length [数组长度]
	         */
	        length: function length() {
	            return this.array.length;
	        },

	        at: function at(index) {
	            return this.array[index];
	        },

	        set: function set(index, obj) {
	            this.array[index] = obj;
	        },

	        /**
	         * 向数组的末尾添加一个或多个元素，并返回新的长度。
	         *
	         * @param  {*} obj [description]
	         * @return {Number} length [新数组的长度]
	         */
	        push: function push(obj) {
	            return this.array.push(obj);
	        },

	        /**
	         * 返回数组中选定的元素
	         *
	         * @param  {Number} start [开始索引值]
	         * @param  {Number} end [结束索引值]
	         * @return {Array} newArray  [新的数组]
	         */
	        slice: function slice(start, end) {
	            return this.array = this.array.slice(start, end);
	        },

	        concat: function concat(array) {
	            this.array = this.array.concat(array);
	        },

	        remove: function remove(index, count) {
	            count = count === undefined ? 1 : count;
	            this.array.splice(index, count);
	        },

	        join: function join(separator) {
	            return this.array.join(separator);
	        },

	        clear: function clear() {
	            this.array.length = 0;
	        }
	    };

	    /**
	     * 先进先出队列 (First Input First Output)
	     *
	     * 一种先进先出的数据缓存器
	     */
	    var Queue = function Queue() {
	        this._array_h = new Array_h();
	    };

	    Queue.prototype = {
	        _index: 0,

	        /**
	         * 排队
	         *
	         * @param  {Object} obj [description]
	         * @return {[type]}     [description]
	         */
	        push: function push(obj) {
	            this._array_h.push(obj);
	        },

	        /**
	         * 出队
	         *
	         * @return {Object} [description]
	         */
	        pop: function pop() {
	            var ret = null;
	            if (this._array_h.length()) {
	                ret = this._array_h.at(this._index);
	                if (++this._index * 2 >= this._array_h.length()) {
	                    this._array_h.slice(this._index);
	                    this._index = 0;
	                }
	            }
	            return ret;
	        },

	        /**
	         * 返回队列中头部(即最新添加的)的动态对象
	         *
	         * @return {Object} [description]
	         */
	        head: function head() {
	            var ret = null,
	                len = this._array_h.length();
	            if (len) {
	                ret = this._array_h.at(len - 1);
	            }
	            return ret;
	        },

	        /**
	         * 返回队列中尾部(即最早添加的)的动态对象
	         *
	         * @return {Object} [description]
	         */
	        tail: function tail() {
	            var ret = null,
	                len = this._array_h.length();
	            if (len) {
	                ret = this._array_h.at(this._index);
	            }
	            return ret;
	        },

	        /**
	         * 返回数据队列长度
	         *
	         * @return {Number} [description]
	         */
	        length: function length() {
	            return this._array_h.length() - this._index;
	        },

	        /**
	         * 队列是否为空
	         *
	         * @return {Boolean} [description]
	         */
	        empty: function empty() {
	            return this._array_h.length() === 0;
	        },

	        clear: function clear() {
	            this._array_h.clear();
	        }
	    };
	    exports.Queue = Queue;
	})();

/***/ }

/******/ });
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(228);


/***/ },

/***/ 228:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var Util = __webpack_require__(230);
	var Call = __webpack_require__(231);

	window.WebIM = typeof WebIM !== 'undefined' ? WebIM : {};
	WebIM.WebRTC = WebIM.WebRTC || {};
	WebIM.WebRTC.Call = Call;
	WebIM.WebRTC.Util = Util;

	if (( false ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
	    module.exports = WebIM.WebRTC;
	} else if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return WebIM.WebRTC;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	/**
	 * 判断是否支持pranswer
	 */
	if (/Chrome/.test(navigator.userAgent)) {
	    WebIM.WebRTC.supportPRAnswer = navigator.userAgent.split("Chrome/")[1].split(".")[0] >= 50 ? true : false;
	}

	//WebIM.WebRTC.supportPRAnswer = false;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(229)(module)))

/***/ },

/***/ 229:
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },

/***/ 230:
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/*
	 * ! Math.uuid.js (v1.4) http://www.broofa.com mailto:robert@broofa.com
	 * 
	 * Copyright (c) 2010 Robert Kieffer Dual licensed under the MIT and GPL
	 * licenses.
	 */

	/*
	 * Generate a random uuid.
	 * 
	 * USAGE: Math.uuid(length, radix) length - the desired number of characters
	 * radix - the number of allowable values for each character.
	 * 
	 * EXAMPLES: // No arguments - returns RFC4122, version 4 ID >>> Math.uuid()
	 * "92329D39-6F5C-4520-ABFC-AAB64544E172" // One argument - returns ID of the
	 * specified length >>> Math.uuid(15) // 15 character ID (default base=62)
	 * "VcydxgltxrVZSTV" // Two arguments - returns ID of the specified length, and
	 * radix. (Radix must be <= 62) >>> Math.uuid(8, 2) // 8 character ID (base=2)
	 * "01001010" >>> Math.uuid(8, 10) // 8 character ID (base=10) "47473046" >>>
	 * Math.uuid(8, 16) // 8 character ID (base=16) "098F4D35"
	 */
	(function () {
	    // Private array of chars to use
	    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

	    Math.uuid = function (len, radix) {
	        var chars = CHARS,
	            uuid = [],
	            i;
	        radix = radix || chars.length;

	        if (len) {
	            // Compact form
	            for (i = 0; i < len; i++) {
	                uuid[i] = chars[0 | Math.random() * radix];
	            }
	        } else {
	            // rfc4122, version 4 form
	            var r;

	            // rfc4122 requires these characters
	            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	            uuid[14] = '4';

	            // Fill in random data. At i==19 set the high bits of clock sequence
	            // as
	            // per rfc4122, sec. 4.1.5
	            for (i = 0; i < 36; i++) {
	                if (!uuid[i]) {
	                    r = 0 | Math.random() * 16;
	                    uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
	                }
	            }
	        }

	        return uuid.join('');
	    };

	    // A more performant, but slightly bulkier, RFC4122v4 solution. We boost
	    // performance
	    // by minimizing calls to random()
	    Math.uuidFast = function () {
	        var chars = CHARS,
	            uuid = new Array(36),
	            rnd = 0,
	            r;
	        for (var i = 0; i < 36; i++) {
	            if (i == 8 || i == 13 || i == 18 || i == 23) {
	                uuid[i] = '-';
	            } else if (i == 14) {
	                uuid[i] = '4';
	            } else {
	                if (rnd <= 0x02) rnd = 0x2000000 + Math.random() * 0x1000000 | 0;
	                r = rnd & 0xf;
	                rnd = rnd >> 4;
	                uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
	            }
	        }
	        return uuid.join('');
	    };

	    // A more compact, but less performant, RFC4122v4 solution:
	    Math.uuidCompact = function () {
	        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	            var r = Math.random() * 16 | 0,
	                v = c == 'x' ? r : r & 0x3 | 0x8;
	            return v.toString(16);
	        });
	    };
	})();

	/**
	 * Util
	 *
	 * @constructor
	 */
	function Util() {}

	/**
	 * Function Logger
	 *
	 * @constructor
	 */
	var Logger = function Logger() {
	    var self = this;

	    var LogLevel = {
	        TRACE: 0,
	        DEBUG: 1,
	        INFO: 2,
	        WARN: 3,
	        ERROR: 4,
	        FATAL: 5
	    };

	    var LogLevelName = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

	    this.log = function () {
	        var level = arguments[0];

	        level = arguments[0] = '[' + LogLevelName[level] + '] ';

	        var text = arguments[1];

	        if (WebIM && WebIM.config && WebIM.config.isDebug) {
	            console.log.apply(console, arguments);
	        }
	    };

	    function callLog(level, args) {
	        var _args = [];

	        _args.push(level);

	        for (var i in args) {
	            _args.push(args[i]);
	        }

	        self.log.apply(self, _args);
	    };

	    this.trace = function () {
	        this.log && callLog(LogLevel.TRACE, arguments);
	    };

	    this.debug = function () {
	        this.log && callLog(LogLevel.DEBUG, arguments);
	    };

	    this.info = function () {
	        this.log && callLog(LogLevel.INFO, arguments);
	    };

	    this.warn = function () {
	        this.log && callLog(LogLevel.WARN, arguments);
	    };

	    this.error = function () {
	        this.log && callLog(LogLevel.ERROR, arguments);
	    };

	    this.fatal = function () {
	        this.log && callLog(LogLevel.FATAL, arguments);
	    };
	};

	Util.prototype.logger = new Logger();

	/**
	 * parse json
	 *
	 * @param jsonString
	 */
	Util.prototype.parseJSON = function (jsonString) {
	    return JSON.parse(jsonString);
	};

	/**
	 * json to string
	 *
	 * @type {Util.stringifyJSON}
	 */
	var stringifyJSON = Util.prototype.stringifyJSON = function (jsonObj) {
	    return JSON.stringify(jsonObj);
	};

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var fnToString = hasOwn.toString;

	var ObjectFunctionString = fnToString.call(Object);

	/**
	 * check object type
	 *
	 * @type {Util.isPlainObject}
	 */
	var isPlainObject = Util.prototype.isPlainObject = function (obj) {
	    var proto, Ctor;

	    // Detect obvious negatives
	    // Use toString instead of jQuery.type to catch host objects
	    if (!obj || toString.call(obj) !== "[object Object]") {
	        return false;
	    }

	    proto = Object.getPrototypeOf(obj);

	    // Objects with no prototype (e.g., `Object.create( null )`) are plain
	    if (!proto) {
	        return true;
	    }

	    // Objects with prototype are plain iff they were constructed by a
	    // global Object function
	    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
	    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
	};

	Util.prototype.isArray = Array.isArray;

	/**
	 * check empty object
	 *
	 * @param obj
	 * @returns {boolean}
	 */
	Util.prototype.isEmptyObject = function (obj) {
	    var name;
	    for (name in obj) {
	        return false;
	    }
	    return true;
	};

	Util.prototype.type = function (obj) {
	    if (obj == null) {
	        return obj + "";
	    }
	    return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
	};

	/**
	 * Function extend
	 *
	 * @returns {*|{}}
	 */
	Util.prototype.extend = function () {
	    var self = this;
	    var options,
	        name,
	        src,
	        copy,
	        copyIsArray,
	        clone,
	        target = arguments[0] || {},
	        i = 1,
	        length = arguments.length,
	        deep = false;

	    // Handle a deep copy situation
	    if (typeof target === "boolean") {
	        deep = target;

	        // Skip the boolean and the target
	        target = arguments[i] || {};
	        i++;
	    }

	    // Handle case when target is a string or something (possible in deep
	    // copy)
	    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== "object" && !self.isFunction(target)) {
	        target = {};
	    }

	    // Extend self itself if only one argument is passed
	    if (i === length) {
	        target = this;
	        i--;
	    }

	    for (; i < length; i++) {

	        // Only deal with non-null/undefined values
	        if ((options = arguments[i]) != null) {

	            // Extend the base object
	            for (name in options) {
	                src = target[name];
	                copy = options[name];

	                // Prevent never-ending loop
	                if (target === copy) {
	                    continue;
	                }

	                // Recurse if we're merging plain objects or arrays
	                if (deep && copy && (self.isPlainObject(copy) || (copyIsArray = self.isArray(copy)))) {

	                    if (copyIsArray) {
	                        copyIsArray = false;
	                        clone = src && self.isArray(src) ? src : [];
	                    } else {
	                        clone = src && self.isPlainObject(src) ? src : {};
	                    }

	                    // Never move original objects, clone them
	                    target[name] = self.extend(deep, clone, copy);

	                    // Don't bring in undefined values
	                } else if (copy !== undefined) {
	                    target[name] = copy;
	                }
	            }
	        }
	    }

	    // Return the modified object
	    return target;
	};

	/**
	 * get local cache
	 *
	 * @memberOf tool
	 * @name hasLocalData
	 * @param key{string}
	 *            localStorage的key值
	 * @return boolean
	 */
	Util.prototype.hasLocalStorage = function (key) {
	    // null -> localStorage.removeItem时
	    // '{}' -> collection.models.destroy时
	    if (localStorage.getItem(key) == null || localStorage.getItem(key) == '{}') {
	        return false;
	    }
	    return true;
	};

	Util.prototype.toggleClass = function (node, className) {
	    if (node.hasClass(className)) {
	        node.removeClass(className);
	        return;
	    }
	    node.addClass(className);
	};

	/**
	 * set cookie
	 *
	 * @param name{String}
	 *
	 * @param value{String}
	 *
	 * @param hour{Number}
	 *
	 * @return void
	 */
	Util.prototype.setCookie = function (name, value, hour) {
	    var exp = new Date();
	    exp.setTime(exp.getTime() + hour * 60 * 60 * 1000);
	    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	};

	/**
	 * read cookie
	 *
	 * @param name(String)
	 *            cookie key
	 * @return cookie value
	 * @memberOf Tool
	 */
	Util.prototype.getCookie = function (name) {
	    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
	    if (arr != null) {
	        return unescape(arr[2]);
	    }
	    return null;
	};

	/**
	 * query parameter from url
	 *
	 * @name parseURL
	 * @memberof C.Tools
	 * @param {string}
	 *
	 * @return {string}
	 * @type function
	 * @public
	 */
	Util.prototype.parseURL = function (name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    if (r != null) {
	        return unescape(r[2]);
	    }
	    return null;
	};

	module.exports = new Util();

/***/ },

/***/ 231:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Util = __webpack_require__(230);
	var RTCIQHandler = __webpack_require__(232);
	var API = __webpack_require__(233);
	var WebRTC = __webpack_require__(234);
	var CommonPattern = __webpack_require__(235);

	var RouteTo = API.RouteTo;
	var Api = API.Api;
	var _logger = Util.logger;

	var _Call = {
	    api: null,
	    caller: '',
	    connection: null,

	    pattern: null,

	    listener: {
	        onAcceptCall: function onAcceptCall(from, options) {},

	        onRinging: function onRinging(caller) {},

	        onTermCall: function onTermCall() {},

	        onIceConnectionStateChange: function onIceConnectionStateChange(iceState) {}
	    },

	    mediaStreamConstaints: {
	        audio: true,
	        video: true
	    },

	    init: function init() {
	        var self = this;

	        if (typeof self.connection === "undefined") {
	            throw "Caller need a instance of Easemob.im.Connection";
	        }

	        self.api = self.api || new Api({
	            imConnection: self.connection,

	            rtcHandler: new RTCIQHandler({
	                imConnection: self.connection
	            })
	        });

	        self.api.onInitC = function () {
	            self._onInitC.apply(self, arguments);
	        }, self.api.onIceConnectionStateChange = function () {
	            self.listener.onIceConnectionStateChange.apply(self, arguments);
	        };
	    },

	    makeVideoCall: function makeVideoCall(callee, accessSid) {

	        var mediaStreamConstaints = {};
	        Util.extend(mediaStreamConstaints, this.mediaStreamConstaints);

	        this.call(callee, mediaStreamConstaints, accessSid);
	    },

	    makeVoiceCall: function makeVoiceCall(callee, accessSid) {
	        var self = this;

	        var mediaStreamConstaints = {};
	        Util.extend(mediaStreamConstaints, self.mediaStreamConstaints);
	        self.mediaStreamConstaints.video = false;

	        self.call(callee, mediaStreamConstaints, accessSid);
	    },

	    acceptCall: function acceptCall() {
	        var self = this;
	        self.pattern.accept();
	    },

	    endCall: function endCall(callee) {
	        var self = this;
	        self.caller = '';
	        self.pattern.termCall();
	    },

	    call: function call(callee, mediaStreamConstaints, accessSid) {
	        var self = this;
	        this.callee = this.api.jid(callee);

	        var rt = new RouteTo({
	            rtKey: "",
	            sid: accessSid,

	            success: function success(result) {
	                _logger.debug("iq to server success", result);
	            },
	            fail: function fail(error) {
	                _logger.debug("iq to server error", error);
	                self.onError(error);
	            }
	        });

	        this.api.reqP2P(rt, mediaStreamConstaints.video ? 1 : 0, mediaStreamConstaints.audio ? 1 : 0, this.api.jid(callee), function (from, rtcOptions) {
	            if (rtcOptions.online == "0") {
	                self.listener.onError({ message: "callee is not online!" });
	                return;
	            }
	            self._onGotServerP2PConfig(from, rtcOptions);
	            self.pattern.initC(self.mediaStreamConstaints, accessSid);
	        });
	    },

	    _onInitC: function _onInitC(from, options, rtkey, tsxId, fromSid) {
	        var self = this;

	        self.callee = from;
	        self._rtcCfg = options.rtcCfg;
	        self._WebRTCCfg = options.WebRTC;

	        self.sessId = options.sessId;
	        self.rtcId = options.rtcId;

	        self.switchPattern();
	        self.pattern._onInitC(from, options, rtkey, tsxId, fromSid);
	    },

	    _onGotServerP2PConfig: function _onGotServerP2PConfig(from, rtcOptions) {
	        var self = this;

	        if (rtcOptions.result == 0) {
	            self._p2pConfig = rtcOptions;
	            self._rtcCfg = rtcOptions.rtcCfg;
	            self._rtcCfg2 = rtcOptions.rtcCfg2;

	            self.sessId = rtcOptions.sessId;
	            self.rtcId = "Channel_webIM";

	            self._rtKey = self._rtkey = rtcOptions.rtKey || rtcOptions.rtkey;
	            self._rtFlag = self._rtflag = rtcOptions.rtFlag || rtcOptions.rtflag;

	            self._WebRTCCfg = rtcOptions.WebRTC;
	            self.admtok = rtcOptions.admtok;
	            self.tkt = rtcOptions.tkt;

	            self.switchPattern();
	        } else {
	            //
	        }
	    },

	    switchPattern: function switchPattern() {
	        var self = this;

	        !self._WebRTCCfg && (self.pattern = new CommonPattern({
	            callee: self.callee,

	            _p2pConfig: self._p2pConfig,
	            _rtcCfg: self._rtcCfg,
	            _rtcCfg2: self._rtcCfg2,

	            _rtKey: self._rtKey || self._rtkey,
	            _rtFlag: self._rtFlag || self._rtflag,

	            _sessId: self.sessId,
	            _rtcId: self.rtcId,

	            webRtc: new WebRTC({
	                onGotLocalStream: self.listener.onGotLocalStream,
	                onGotRemoteStream: self.listener.onGotRemoteStream,
	                onError: self.listener.onError
	            }),

	            api: self.api,

	            onAcceptCall: self.listener && self.listener.onAcceptCall || function () {},
	            onRinging: self.listener && self.listener.onRinging || function () {},
	            onTermCall: self.listener && self.listener.onTermCall || function () {}
	        }));
	    }
	};

	module.exports = function (initConfigs) {
	    Util.extend(true, this, _Call, initConfigs || {});

	    this.init();
	};

/***/ },

/***/ 232:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * IQ Message，IM -> CMServer --> IM
	 */

	var _util = __webpack_require__(230);
	var _logger = _util.logger;
	var API = __webpack_require__(233);
	var RouteTo = API.RouteTo;

	var CONFERENCE_XMLNS = "urn:xmpp:media-conference";

	var _RtcHandler = {
	    _apiCallbacks: {},

	    imConnection: null,

	    _connectedSid: '',

	    init: function init() {
	        var self = this;

	        var _conn = self.imConnection;

	        var handleConferenceIQ;

	        _conn.addHandler = function (handler, ns, name, type, id, from, options) {
	            if (typeof handleConferenceIQ !== 'function') {

	                handleConferenceIQ = function handleConferenceIQ(msginfo) {
	                    try {
	                        self.handleRtcMessage(msginfo);
	                    } catch (error) {
	                        _logger.error(error.stack || error);
	                        throw error;
	                    }

	                    return true;
	                };
	                _conn.addHandler(handleConferenceIQ, CONFERENCE_XMLNS, 'iq', "set", null, null);
	                _conn.addHandler(handleConferenceIQ, CONFERENCE_XMLNS, 'iq', "get", null, null);
	            }

	            _conn.context.stropheConn.addHandler(handler, ns, name, type, id, from, options);
	        };
	    },

	    handleRtcMessage: function handleRtcMessage(msginfo) {
	        var self = this;

	        var id = msginfo.getAttribute('id');
	        var from = msginfo.getAttribute('from') || '';

	        // remove resource
	        from.lastIndexOf("/") >= 0 && (from = from.substring(0, from.lastIndexOf("/")));

	        var rtkey = msginfo.getElementsByTagName('rtkey')[0].innerHTML;

	        var fromSessionId = msginfo.getElementsByTagName('sid')[0].innerHTML;

	        (self._fromSessionID || (self._fromSessionID = {}))[from] = fromSessionId;

	        var contentTags = msginfo.getElementsByTagName('content');

	        var streamType = msginfo.getElementsByTagName('stream_type')[0].innerHTML; //VOICE, VIDEO

	        var contentString = contentTags[0].innerHTML;

	        var content = _util.parseJSON(contentString);

	        var rtcOptions = content;
	        var tsxId = content.tsxId;

	        self.ctx = content.ctx;

	        _logger.debug("Recv [op = " + rtcOptions.op + "] [tsxId=" + tsxId + "]\r\n json :", msginfo);

	        //if a->b already, c->a/b should be termiated with 'busy' reason
	        if (from.indexOf("@") >= 0) {
	            if (self._connectedSid == '' && rtcOptions.op == 102) {
	                self._connectedSid = fromSessionId;
	            } else {
	                if (self._connectedSid != fromSessionId) {
	                    //onInitC
	                    if (rtcOptions.op == 102) {
	                        var rt = new RouteTo({
	                            to: from,
	                            rtKey: rtkey,
	                            sid: fromSessionId,
	                            success: function success(result) {
	                                _logger.debug("iq to server success", result);
	                            },
	                            fail: function fail(error) {
	                                _logger.debug("iq to server error", error);
	                                self.onError(error);
	                            }
	                        });

	                        var options = {
	                            data: {
	                                op: 107,
	                                sessId: rtcOptions.sessId,
	                                rtcId: rtcOptions.rtcId,
	                                reason: 'busy'

	                            },
	                            reason: 'busy'
	                        };
	                        self.sendRtcMessage(rt, options);
	                    }
	                    return;
	                }
	            }
	        }

	        //onTermC
	        if (rtcOptions.op == 107) {
	            self._connectedSid = '';
	            self._fromSessionID = {};
	        }

	        if (rtcOptions.sdp) {
	            if (typeof rtcOptions.sdp === 'string') {
	                rtcOptions.sdp = _util.parseJSON(rtcOptions.sdp);
	            }
	            rtcOptions.sdp.type && (rtcOptions.sdp.type = rtcOptions.sdp.type.toLowerCase());
	        }
	        if (rtcOptions.cands) {
	            if (typeof rtcOptions.cands === 'string') {
	                rtcOptions.cands = _util.parseJSON(rtcOptions.cands);
	            }

	            for (var i = 0; i < rtcOptions.cands.length; i++) {
	                typeof rtcOptions.cands[i] === 'string' && (rtcOptions.cands[i] = _util.parseJSON(rtcOptions.cands[i]));

	                rtcOptions.cands[i].sdpMLineIndex = rtcOptions.cands[i].mlineindex;
	                rtcOptions.cands[i].sdpMid = rtcOptions.cands[i].mid;

	                delete rtcOptions.cands[i].mlineindex;
	                delete rtcOptions.cands[i].mid;
	            }
	        }

	        rtcOptions.rtcCfg && typeof rtcOptions.rtcCfg === 'string' && (rtcOptions.rtcCfg = _util.parseJSON(rtcOptions.rtcCfg));
	        rtcOptions.rtcCfg2 && typeof rtcOptions.rtcCfg2 === 'string' && (rtcOptions.rtcCfg2 = _util.parseJSON(rtcOptions.rtcCfg2));
	        rtcOptions.WebRTC && typeof rtcOptions.WebRTC === 'string' && (rtcOptions.WebRTC = _util.parseJSON(rtcOptions.WebRTC));

	        if (tsxId && self._apiCallbacks[tsxId]) {
	            try {
	                self._apiCallbacks[tsxId].callback && self._apiCallbacks[tsxId].callback(from, rtcOptions);
	            } catch (err) {
	                throw err;
	            } finally {
	                delete self._apiCallbacks[tsxId];
	            }
	        } else {
	            self.onRecvRtcMessage(from, rtcOptions, rtkey, tsxId, fromSessionId);
	        }

	        return true;
	    },

	    onRecvRtcMessage: function onRecvRtcMessage(from, rtcOptions, rtkey, tsxId, fromSessionId) {
	        _logger.debug(' form : ' + from + " \r\n json :" + _util.stringifyJSON(rtcJSON));
	    },

	    convertRtcOptions: function convertRtcOptions(options) {
	        var sdp = options.data.sdp;
	        if (sdp) {
	            var _sdp = {
	                type: sdp.type,
	                sdp: sdp.sdp
	            };

	            sdp = _sdp;

	            sdp.type = sdp.type.toUpperCase();
	            sdp = _util.stringifyJSON(sdp);

	            options.data.sdp = sdp;
	        }

	        var cands = options.data.cands;

	        if (cands) {
	            if (_util.isArray(cands)) {} else {
	                var _cands = [];
	                _cands.push(cands);
	                cands = _cands;
	            }

	            for (var i in cands) {
	                if (cands[i] instanceof RTCIceCandidate) {
	                    var _cand = {
	                        type: "candidate",
	                        candidate: cands[i].candidate,
	                        mlineindex: cands[i].sdpMLineIndex,
	                        mid: cands[i].sdpMid
	                    };

	                    cands[i] = _util.stringifyJSON(_cand);
	                }
	            }

	            options.data.cands = cands;
	        } else {
	            // options.data.cands = [];
	        }

	        var rtcCfg = options.data.rtcCfg;
	        if (rtcCfg) {
	            typeof rtcCfg !== 'string' && (options.data.rtcCfg = _util.stringifyJSON(rtcCfg));
	        }

	        var _webrtc = options.data.WebRTC;
	        if (_webrtc) {
	            typeof _webrtc !== 'string' && (options.data.WebRTC = _util.stringifyJSON(_webrtc));
	        }
	    },

	    /**
	     * rt: { id: , to: , rtKey: , rtflag: , sid: , tsxId: , type: , }
	     *
	     * rtcOptions: { data : { op : 'reqP2P', video : 1, audio : 1, peer :
	     * curChatUserId, //appKey + "_" + curChatUserId + "@" + this.domain, } }
	     *
	     */
	    sendRtcMessage: function sendRtcMessage(rt, options, callback) {
	        var self = this;

	        var _conn = self.imConnection;

	        var tsxId = rt.tsxId || _conn.getUniqueId();

	        var to = rt.to || _conn.domain;

	        var sid = rt.sid || self._fromSessionID && self._fromSessionID[to];
	        //sid = sid || ((self._fromSessionID || (self._fromSessionID = {}))[to] = _conn.getUniqueId("CONFR_"));
	        sid = sid || _conn.getUniqueId("CONFR_");
	        (self._fromSessionID || (self._fromSessionID = {}))[to] = sid;

	        if (to.indexOf("@") >= 0) {
	            if (self._connectedSid == '' && options.data.op == 102) {
	                self._connectedSid = sid;
	            }
	        }
	        var rtKey = rt.rtKey || rt.rtkey;
	        // rtKey && delete rt.rtKey;
	        rtKey || (rtKey = "");

	        var rtflag = rt.rtflag;
	        // rtflag && delete rt.rtflag;
	        rtflag || (rtflag = 1);

	        options.data || (options.data = {});
	        options.data.tsxId = tsxId;

	        self.ctx && (options.data.ctx = self.ctx);
	        self.convertRtcOptions(options);

	        var streamType = "VIDEO"; //VOICE, VIDEO

	        var id = rt.id || _conn.getUniqueId("CONFR_");
	        var iq = $iq({
	            // xmlns: CONFERENCE_XMLNS,
	            id: id,
	            to: to,
	            from: _conn.context.jid,
	            type: rt.type || "get"
	        }).c("query", {
	            xmlns: CONFERENCE_XMLNS
	        }).c("MediaReqExt").c('rtkey').t(rtKey).up().c('rtflag').t(rtflag).up().c('stream_type').t(streamType).up().c('sid').t(sid).up().c('content').t(_util.stringifyJSON(options.data));

	        if (options.data.op == 107 && options.reason) {
	            iq.up().c('reaseon').t(options.reason);
	        }
	        _logger.debug("Send [op = " + options.data.op + "] : \r\n", iq.tree());

	        callback && (self._apiCallbacks[tsxId] = {
	            callback: callback
	        });

	        var completeFn = function (result) {
	            rt.success(result);
	        } || function (result) {
	            _logger.debug("send result. op:" + options.data.op + ".", result);
	        };

	        var errFn = function (ele) {
	            rt.fail(ele);
	        } || function (ele) {
	            _logger.debug(ele);
	        };

	        _conn.context.stropheConn.sendIQ(iq.tree(), completeFn, errFn);

	        //onTermC
	        if (options.data.op == 107 && self._connectedSid) {
	            if (!rt.sid || self._connectedSid == rt.sid) {
	                self._connectedSid = '';
	                self._fromSessionID = {};
	            }
	        }
	    }
	};

	var RTCIQHandler = function RTCIQHandler(initConfigs) {
	    _util.extend(true, this, _RtcHandler, initConfigs || {});

	    this.init();
	};
	module.exports = RTCIQHandler;

/***/ },

/***/ 233:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * API
	 */
	var _util = __webpack_require__(230);
	var _logger = _util.logger;

	var _RouteTo = {
	    // to : null,
	    // rtKey: null,
	    rtFlag: 1,

	    success: function success(result) {},
	    fail: function fail(error) {}
	};

	var RouteTo = function RouteTo(extendCfg) {
	    if (this instanceof RouteTo) {
	        var self = this;
	        _util.extend(true, self, _RouteTo, extendCfg || {});
	    } else {
	        var sub = function sub(extendCfg) {
	            var self = this;
	            _util.extend(true, self, extendCfg || {});
	        };

	        _util.extend(true, sub.prototype, _RouteTo, extendCfg || {});

	        return sub;
	    }
	};
	exports.RouteTo = RouteTo;

	var _clazz = {
	    imConnection: null,
	    // webRtc: null,

	    rtcHandler: null,

	    events: {
	        '0': 'onReqP2P',
	        '1': 'onNewCfr',
	        '2': 'onDelCfr',
	        '3': 'onReqTkt',

	        '100': 'onPing',
	        '101': 'onPong',
	        '102': 'onInitC',
	        '103': 'onReqC',
	        '104': 'onAcptC',
	        '105': 'onTcklC',
	        '106': 'onAnsC',
	        '107': 'onTermC',

	        // '200' : 'onEnter',
	        // '201' : 'onExit',
	        // '202' : 'onInvite',
	        // '203' : 'onGetMems',

	        // '205' : 'onSubC',
	        // '206' : 'onUsubC',

	        '300': 'onEvEnter',
	        '301': 'onEvExit',
	        '302': 'onEvPub',
	        '303': 'onEvUnpub',
	        '304': 'onEvMems',
	        '204': 'onEvClose',

	        'onServerError': 'onServerError'
	    },

	    register: function register(listener) {
	        if ((typeof listener === 'undefined' ? 'undefined' : _typeof(listener)) === "object") {
	            for (var event in listener) {
	                this.bind(event, listener[event]);
	            }
	        }
	    },

	    bind: function bind(event, func) {
	        var self = this;

	        var onFunc;
	        if (onFunc = self.events[event]) {
	            self[onFunc] = func;
	        } else {
	            onFunc = self.events[event] = 'on_' + event;
	            self[onFunc] = func;
	        }
	    },

	    jid: function jid(shortUserName) {
	        if (/^.+#.+_.+@.+$/g.test(shortUserName)) {
	            return shortUserName;
	        }
	        // if (shortUserName.indexOf(this.imConnection.context.appKey) >= 0) {
	        //     return shortUserName;
	        // }
	        return this.imConnection.context.appKey + "_" + shortUserName + "@" + this.imConnection.domain;
	    },

	    /**
	     * ReqP2P 0
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param video
	     *            1 0
	     * @param audio
	     *            1 0
	     * @param peer
	     *
	     */
	    reqP2P: function reqP2P(rt, video, audio, peer, callback) {
	        _logger.debug("req p2p ...");

	        var rtcOptions = {
	            data: {
	                op: 0,
	                video: video,
	                audio: audio,
	                peer: peer // appKey + "_" + curChatUserId + "@" + this.domain,
	            }
	        };

	        this.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * NewCfr 1
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param reqTkt
	     *            1 null
	     * @param password
	     *            string null
	     *
	     */
	    newCfr: function newCfr(rt, reqTkt, password, callback) {
	        _logger.debug("newCfr ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 1
	            }
	        };

	        reqTkt && (rtcOptions.data.reqTkt = reqTkt);
	        password && (rtcOptions.data.password = password);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * Enter 200
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param reqMembers !=
	     *            0 members
	     * @param tkt
	     * @param nonce
	     * @param digest
	     *
	     */
	    enter: function enter(rt, WebRTCId, reqMembers, tkt, nonce, digest, callback) {
	        _logger.debug("enter ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 200
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        reqMembers && (rtcOptions.data.reqMembers = reqMembers);
	        tkt && (rtcOptions.data.tkt = tkt);
	        nonce && (rtcOptions.data.nonce = nonce);
	        digest && (rtcOptions.data.digest = digest);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * Ping 100
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     *
	     */
	    ping: function ping(rt, sessId, callback) {
	        _logger.debug("ping ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 100
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * ReqTkt 3
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    reqTkt: function reqTkt(rt, WebRTCId, callback) {
	        _logger.debug("reqTkt ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 3
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * InitC 102
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param tkt
	     * @param sessId
	     * @param rtcId
	     * @param pubS
	     *            {name: streamName, video:1, audio:1, type: 0}
	     * @param subS
	     *            {memId: , rtcId: }
	     * @param sdp
	     *            sdp:sdpstring
	     * @param cands [ ]
	     *
	     */
	    initC: function initC(rt, WebRTCId, tkt, sessId, rtcId, pubS, subS, sdp, cands, rtcCfg, WebRTC, callback) {
	        _logger.debug("initC ...");

	        var rtcOptions = {
	            data: {
	                op: 102
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        tkt && (rtcOptions.data.tkt = tkt);
	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        pubS && (rtcOptions.data.pubS = pubS);
	        subS && (rtcOptions.data.subS = subS);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);
	        rtcCfg && (rtcOptions.data.rtcCfg = rtcCfg);
	        WebRTC && (rtcOptions.data.WebRTC = WebRTC);

	        this.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * TcklC 105
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param cands
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    tcklC: function tcklC(rt, sessId, rtcId, sdp, cands, callback) {
	        _logger.debug("tcklC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 105
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * AnsC 106
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param sdp
	     * @param cands
	     *
	     */
	    ansC: function ansC(rt, sessId, rtcId, sdp, cands, callback) {
	        _logger.debug("ansC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 106
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * AcptC 104
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param sdp
	     * @param ans
	     *            1
	     *
	     */
	    acptC: function acptC(rt, sessId, rtcId, sdp, cands, ans, callback) {
	        _logger.debug("acptC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 104
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);
	        ans && (rtcOptions.data.ans = ans);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * GetMems 203
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param sessId
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    getMems: function getMems(rt, WebRTCId, sessId, callback) {
	        _logger.debug("getMems ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 203
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        sessId && (rtcOptions.data.sessId = sessId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * SubC 205
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param subS
	     *            {memId:m001, rtcId:r001}
	     *
	     */
	    subC: function subC(rt, sessId, rtcId, subS, callback) {
	        _logger.debug("subC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 205
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        subS && (rtcOptions.data.subS = subS);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * UsubC 206
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     *
	     */
	    usubC: function usubC(rt, sessId, rtcId, callback) {
	        _logger.debug("usubC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 206
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * TermC 107
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param reason
	     *               "ok"      -> 'HANGUP'     "success" -> 'HANGUP'   "timeout"          -> 'NORESPONSE'
	     *               "decline" -> 'REJECT'     "busy"    -> 'BUSY'     "failed-transport" -> 'FAIL'
	     *
	     */
	    termC: function termC(rt, sessId, rtcId, reason, callback) {
	        _logger.debug("termC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 107
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        reason && (rtcOptions.reason = reason);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * Exit 201
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param sessId
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    exit: function exit(rt, WebRTCId, sessId, callback) {
	        _logger.debug("exit ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 201
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        sessId && (rtcOptions.data.sessId = sessId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * DelCfr 2
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param admtok
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    delCfr: function delCfr(rt, WebRTCId, admtok, callback) {
	        _logger.debug("delCfr ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 2
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        admtok && (rtcOptions.data.admtok = admtok);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    }
	};

	exports.Api = function (initConfigs) {
	    var self = this;

	    _util.extend(true, this, _clazz, initConfigs || {});

	    function _onRecvRtcMessage(from, rtcOptions, rtkey, tsxId, fromSessionId) {
	        if (rtcOptions.result != 0 && self['onServerError']) {
	            self['onServerError'].call(self, from, rtcOptions, rtkey, tsxId, fromSessionId);
	        } else {
	            var onFunction;

	            if (self.events[rtcOptions.op] && (onFunction = self[self.events[rtcOptions.op]])) {
	                onFunction.call(self, from, rtcOptions, rtkey, tsxId, fromSessionId);
	            } else {
	                _logger.info("can not handle(recvRtcMessage) the op: " + rtcOptions.op, rtcOptions);
	            }
	        }
	    }

	    this.rtcHandler.onRecvRtcMessage = _onRecvRtcMessage;
	};

/***/ },

/***/ 234:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * WebRTC
	 *
	 *                              A                   |                                       B
	 *                                                  |
	 *   1.createMedia:got streamA                      | 1.createMedia:got streamB
	 *   2.new RTCPeerConnection: APeerConnection       | 2.new RTCPeerConnection: BPeerConnection
	 *   3.APeerConnection.createOffer:got offerA       |
	 *      APeerConnection.setLocalDescription(offerA) |
	 *      send offerA ---> ---> ---> --->        ---> |
	 *                                                  | ---> 3.got offerA | offerA = new RTCSessionDescription(offerA);
	 *                                                  | BPeerConnection.setRemoteDescription(offerA)
	 *                                                  |
	 *                                                  |
	 *                                                  | 4.BPeerConnection.createAnswer: got answerB
	 *                                                  | BPeerConnection.setLocalDescription(answerB)
	 *                                                  | <---- send answerB
	 *                                                  | 5.got answerB <--- <--- <--- <---
	 *                                                  | answerB = new RTCSessionDescription(answerB)
	 *                                                  |
	 * APeerConnection.setRemoteDescription(answerB)    |
	 *                                                  |
	 * 6.got candidateA ---> --->  ---> --->            | ---> got candidateA
	 *                                                  | BPeerConnection.addIceCandidate(new RTCIceCandidate(candidateA))
	 *                                                  |
	 *                                                  |
	 *                                                  | got candidateB <--- <--- <--- <---
	 *                                                  | <--- 6.got candidateB APeerConnection.addIceCandidate(candidateB)
	 *                                                  |
	 *                                                  |
	 *                                                  | 7. APeerConnection.addStream(streamA)
	 *                                                  | 7.BPeerConnection.addStream(streamB)
	 *                                                  |
	 *                              streamA >>>>>>>>>>> |  <<<<< see A
	 *                              seeB <<<<<<<<<<<    | <<<<< streamB
	 *                                                  |
	 *
	 */
	var _util = __webpack_require__(230);
	var _logger = _util.logger;

	var _SDPSection = {
	    headerSection: null,

	    audioSection: null,
	    videoSection: null,

	    _parseHeaderSection: function _parseHeaderSection(sdp) {
	        var index = sdp.indexOf('m=audio');
	        if (index >= 0) {
	            return sdp.slice(0, index);
	        }

	        index = sdp.indexOf('m=video');
	        if (index >= 0) {
	            return sdp.slice(0, index);
	        }

	        return sdp;
	    },

	    _parseAudioSection: function _parseAudioSection(sdp) {
	        var index = sdp.indexOf('m=audio');
	        if (index >= 0) {
	            var endIndex = sdp.indexOf('m=video');
	            return sdp.slice(index, endIndex < 0 ? sdp.length : endIndex);
	        }
	    },

	    _parseVideoSection: function _parseVideoSection(sdp) {
	        var index = sdp.indexOf('m=video');
	        if (index >= 0) {
	            return sdp.slice(index);
	        }
	    },

	    spiltSection: function spiltSection(sdp) {
	        var self = this;

	        self.headerSection = self._parseHeaderSection(sdp);
	        self.audioSection = self._parseAudioSection(sdp);
	        self.videoSection = self._parseVideoSection(sdp);
	    },

	    removeSSRC: function removeSSRC(section) {
	        var arr = [];

	        var _arr = section.split(/a=ssrc:[^\n]+/g);
	        for (var i = 0; i < _arr.length; i++) {
	            _arr[i] != '\n' && arr.push(_arr[i]);
	        }
	        // arr.push('');

	        return arr.join('\n');
	    },

	    updateHeaderMsidSemantic: function updateHeaderMsidSemantic(wms) {

	        var self = this;

	        var line = "a=msid-semantic: WMS " + wms;

	        var _arr = self.headerSection.split(/a=msid\-semantic: WMS.*/g);
	        var arr = [];
	        switch (_arr.length) {
	            case 1:
	                arr.push(_arr[0]);
	                break;
	            case 2:
	                arr.push(_arr[0]);
	                arr.push(line);
	                arr.push('\n');
	                break;
	            case 3:
	                arr.push(_arr[0]);
	                arr.push(line);
	                arr.push('\n');
	                arr.push(_arr[2]);
	                arr.push('\n');
	                break;
	        }

	        return self.headerSection = arr.join('');
	    },

	    updateAudioSSRCSection: function updateAudioSSRCSection(ssrc, cname, msid, label) {
	        var self = this;

	        self.audioSection && (self.audioSection = self.removeSSRC(self.audioSection) + self.ssrcSection(ssrc, cname, msid, label));
	    },

	    updateVideoSSRCSection: function updateVideoSSRCSection(ssrc, cname, msid, label) {
	        var self = this;

	        self.videoSection && (self.videoSection = self.removeSSRC(self.videoSection) + self.ssrcSection(ssrc, cname, msid, label));
	    },

	    getUpdatedSDP: function getUpdatedSDP() {
	        var self = this;

	        var sdp = "";

	        self.headerSection && (sdp += self.headerSection);
	        self.audioSection && (sdp += self.audioSection);
	        self.videoSection && (sdp += self.videoSection);

	        return sdp;
	    },

	    parseMsidSemantic: function parseMsidSemantic(header) {
	        var self = this;

	        var regexp = /a=msid\-semantic: WMS (\S+)/ig;
	        var arr = self._parseLine(header, regexp);

	        arr && arr.length == 2 && (self.msidSemantic = {
	            line: arr[0],
	            WMS: arr[1]
	        });

	        return self.msidSemantic;
	    },

	    ssrcSection: function ssrcSection(ssrc, cname, msid, label) {
	        var lines = ['a=ssrc:' + ssrc + ' cname:' + cname, 'a=ssrc:' + ssrc + ' msid:' + msid + ' ' + label, 'a=ssrc:' + ssrc + ' mslabel:' + msid, 'a=ssrc:' + ssrc + ' label:' + label, ''];

	        return lines.join('\n');
	    },

	    parseSSRC: function parseSSRC(section) {
	        var self = this;

	        var regexp = new RegExp("a=(ssrc):(\\d+) (\\S+):(\\S+)", "ig");

	        var arr = self._parseLine(section, regexp);
	        if (arr) {
	            var ssrc = {
	                lines: [],
	                updateSSRCSection: self.ssrcSection
	            };

	            for (var i = 0; i < arr.length; i++) {
	                var e = arr[i];
	                if (e.indexOf("a=ssrc") >= 0) {
	                    ssrc.lines.push(e);
	                } else {
	                    switch (e) {
	                        case 'ssrc':
	                        case 'cname':
	                        case 'msid':
	                        case 'mslabel':
	                        case 'label':
	                            ssrc[e] = arr[++i];
	                    }
	                }
	            }

	            return ssrc;
	        }
	    },

	    _parseLine: function _parseLine(str, regexp) {
	        var arr = [];

	        var _arr;
	        while ((_arr = regexp.exec(str)) != null) {
	            for (var i = 0; i < _arr.length; i++) {
	                arr.push(_arr[i]);
	            }
	        }

	        if (arr.length > 0) {
	            return arr;
	        }
	    }
	};

	var SDPSection = function SDPSection(sdp) {
	    _util.extend(this, _SDPSection);
	    this.spiltSection(sdp);
	};

	/**
	 * Abstract
	 */
	var _WebRTC = {
	    mediaStreamConstaints: {
	        audio: true,
	        video: true
	    },

	    localStream: null,
	    rtcPeerConnection: null,

	    offerOptions: {
	        offerToReceiveAudio: 1,
	        offerToReceiveVideo: 1
	    },

	    createMedia: function createMedia(constaints, onGotStream) {
	        var self = this;

	        if (constaints && typeof constaints === "function") {
	            onGotStream = constaints;
	            constaints = null;
	        }

	        _logger.debug('[WebRTC-API] begin create media ......');

	        function gotStream(stream) {
	            _logger.debug('[WebRTC-API] got local stream');

	            self.localStream = stream;

	            var videoTracks = self.localStream.getVideoTracks();
	            var audioTracks = self.localStream.getAudioTracks();

	            if (videoTracks.length > 0) {
	                _logger.debug('[WebRTC-API] Using video device: ' + videoTracks[0].label);
	            }
	            if (audioTracks.length > 0) {
	                _logger.debug('[WebRTC-API] Using audio device: ' + audioTracks[0].label);
	            }

	            onGotStream ? onGotStream(self, stream) : self.onGotStream(stream);
	        }

	        return navigator.mediaDevices.getUserMedia(constaints
	        	|| self.mediaStreamConstaints)
	        		.then(gotStream)
	        		.then(self.onCreateMedia)
	        		['catch'](function (e) {
			            _logger.debug('[WebRTC-API] getUserMedia() error: ', e);
			            self.onError(e);
			        });
	    },

	    setLocalVideoSrcObject: function setLocalVideoSrcObject(stream) {
	        this.onGotLocalStream(stream);
	        _logger.debug('[WebRTC-API] you can see yourself !');
	    },

	    createRtcPeerConnection: function createRtcPeerConnection(iceServerConfig) {
	        _logger.debug('[WebRTC-API] begin create RtcPeerConnection ......');

	        var self = this;

	        // if (iceServerConfig && iceServerConfig.iceServers) {
	        // } else {
	        //     iceServerConfig = null;
	        // }

	        if (iceServerConfig) {
	            //reduce icecandidate number:add default value
	            !iceServerConfig.iceServers && (iceServerConfig.iceServers = []);

	            iceServerConfig.rtcpMuxPolicy = "require";
	            iceServerConfig.bundlePolicy = "max-bundle";

	            //iceServerConfig.iceTransportPolicy = 'relay';
	            if (iceServerConfig.relayOnly) {
	                iceServerConfig.iceTransportPolicy = 'relay';
	            }
	        } else {
	            iceServerConfig = null;
	        }
	        _logger.debug('[WebRTC-API] RtcPeerConnection config:', iceServerConfig);

	        self.startTime = window.performance.now();

	        var rtcPeerConnection = self.rtcPeerConnection = new RTCPeerConnection(iceServerConfig);
	        _logger.debug('[WebRTC-API] Created local peer connection object', rtcPeerConnection);

	        rtcPeerConnection.onicecandidate = function (event) {
	            //reduce icecandidate number: don't deal with tcp, udp only
	            if (event.type == "icecandidate" && (event.candidate == null || / tcp /.test(event.candidate.candidate))) {
	                return;
	            }
	            self.onIceCandidate(event);
	        };

	        rtcPeerConnection.onicestatechange = function (event) {
	            self.onIceStateChange(event);
	        };

	        rtcPeerConnection.oniceconnectionstatechange = function (event) {
	            self.onIceStateChange(event);
	        };

	        rtcPeerConnection.onaddstream = function (event) {
	            self._onGotRemoteStream(event);
	        };
	    },

	    _uploadLocalStream: function _uploadLocalStream() {
	        this.rtcPeerConnection.addStream(this.localStream);
	        _logger.debug('[WebRTC-API] Added local stream to RtcPeerConnection');
	    },

	    createOffer: function createOffer(onCreateOfferSuccess, onCreateOfferError) {
	        var self = this;

	        self._uploadLocalStream();

	        _logger.debug('[WebRTC-API] createOffer start...');

	        return self.rtcPeerConnection.createOffer(self.offerOptions).then(function (desc) {
	            self.offerDescription = desc;

	            _logger.debug('[WebRTC-API] Offer '); //_logger.debug('from \n' + desc.sdp);
	            _logger.debug('[WebRTC-API] setLocalDescription start');

	            self.rtcPeerConnection.setLocalDescription(desc).then(self.onSetLocalSessionDescriptionSuccess, self.onSetSessionDescriptionError).then(function () {
	                (onCreateOfferSuccess || self.onCreateOfferSuccess)(desc);
	            });
	        }, onCreateOfferError || self.onCreateSessionDescriptionError);
	    },

	    createPRAnswer: function createPRAnswer(onCreatePRAnswerSuccess, onCreatePRAnswerError) {
	        var self = this;

	        _logger.info(' createPRAnswer start');
	        // Since the 'remote' side has no media stream we need
	        // to pass in the right constraints in order for it to
	        // accept the incoming offer of audio and video.
	        return self.rtcPeerConnection.createAnswer().then(function (desc) {
	            _logger.debug('[WebRTC-API] _____________PRAnswer '); //_logger.debug('from :\n' + desc.sdp);

	            desc.type = "pranswer";
	            desc.sdp = desc.sdp.replace(/a=recvonly/g, 'a=inactive');

	            self.prAnswerDescription = desc;

	            _logger.debug('[WebRTC-API] inactive PRAnswer '); //_logger.debug('from :\n' + desc.sdp);
	            _logger.debug('[WebRTC-API] setLocalDescription start');

	            self.rtcPeerConnection.setLocalDescription(desc).then(self.onSetLocalSuccess, self.onSetSessionDescriptionError).then(function () {
	                var sdpSection = new SDPSection(desc.sdp);
	                sdpSection.updateHeaderMsidSemantic("MS_0000");
	                sdpSection.updateAudioSSRCSection(1000, "CHROME0000", "MS_0000", "LABEL_AUDIO_1000");
	                sdpSection.updateVideoSSRCSection(2000, "CHROME0000", "MS_0000", "LABEL_VIDEO_2000");

	                desc.sdp = sdpSection.getUpdatedSDP();

	                _logger.debug('[WebRTC-API] Send PRAnswer '); //_logger.debug('from :\n' + desc.sdp);

	                (onCreatePRAnswerSuccess || self.onCreatePRAnswerSuccess)(desc);
	            });
	        }, onCreatePRAnswerError || self.onCreateSessionDescriptionError);
	    },

	    createAnswer: function createAnswer(onCreateAnswerSuccess, onCreateAnswerError) {
	        var self = this;

	        self._uploadLocalStream();

	        _logger.info('[WebRTC-API] createAnswer start');
	        // Since the 'remote' side has no media stream we need
	        // to pass in the right constraints in order for it to
	        // accept the incoming offer of audio and video.
	        return self.rtcPeerConnection.createAnswer().then(function (desc) {
	            _logger.debug('[WebRTC-API] _____________________Answer '); //_logger.debug('from :\n' + desc.sdp);

	            desc.type = 'answer';

	            var sdpSection = new SDPSection(desc.sdp);
	            var ms = sdpSection.parseMsidSemantic(sdpSection.headerSection);

	            var audioSSRC = sdpSection.parseSSRC(sdpSection.audioSection);
	            var videoSSRC = sdpSection.parseSSRC(sdpSection.videoSection);

	            sdpSection.updateAudioSSRCSection(1000, "CHROME0000", ms.WMS, audioSSRC.label);
	            sdpSection.updateVideoSSRCSection(2000, "CHROME0000", ms.WMS, videoSSRC.label);
	            // mslabel cname


	            desc.sdp = sdpSection.getUpdatedSDP();

	            self.answerDescription = desc;

	            _logger.debug('[WebRTC-API] Answer '); //_logger.debug('from :\n' + desc.sdp);
	            _logger.debug('[WebRTC-API] setLocalDescription start');

	            self.rtcPeerConnection.setLocalDescription(desc).then(self.onSetLocalSuccess, self.onSetSessionDescriptionError).then(function () {
	                var sdpSection = new SDPSection(desc.sdp);
	                sdpSection.updateHeaderMsidSemantic("MS_0000");
	                sdpSection.updateAudioSSRCSection(1000, "CHROME0000", "MS_0000", "LABEL_AUDIO_1000");
	                sdpSection.updateVideoSSRCSection(2000, "CHROME0000", "MS_0000", "LABEL_VIDEO_2000");

	                desc.sdp = sdpSection.getUpdatedSDP();

	                _logger.debug('[WebRTC-API] Send Answer '); //_logger.debug('from :\n' + desc.sdp);

	                (onCreateAnswerSuccess || self.onCreateAnswerSuccess)(desc);
	            });
	        }, onCreateAnswerError || self.onCreateSessionDescriptionError);
	    },

	    close: function close() {
	        var self = this;
	        try {
	            self.rtcPeerConnection && self.rtcPeerConnection.close();
	        } catch (e) {}

	        if (self.localStream) {
	            self.localStream.getTracks().forEach(function (track) {
	                track.stop();
	            });
	        }
	        self.localStream = null;
	    },

	    addIceCandidate: function addIceCandidate(candidate) {
	        var self = this;

	        if (!self.rtcPeerConnection) {
	            return;
	        }

	        _logger.debug('[WebRTC-API] Add ICE candidate: \n', candidate);

	        var _cands = _util.isArray(candidate) ? candidate : [];
	        !_util.isArray(candidate) && _cands.push(candidate);

	        for (var i = 0; i < _cands.length; i++) {
	            candidate = _cands[i];

	            self.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(self.onAddIceCandidateSuccess, self.onAddIceCandidateError);
	        }
	    },

	    setRemoteDescription: function setRemoteDescription(desc) {
	        var self = this;

	        _logger.debug('[WebRTC-API] setRemoteDescription start. ');

	        desc = new RTCSessionDescription(desc);

	        return self.rtcPeerConnection.setRemoteDescription(desc).then(self.onSetRemoteSuccess, self.onSetSessionDescriptionError);
	    },

	    iceConnectionState: function iceConnectionState() {
	        var self = this;

	        return self.rtcPeerConnection.iceConnectionState;
	    },

	    onCreateMedia: function onCreateMedia() {
	        _logger.debug('[WebRTC-API] media created.');
	    },

	    _onGotRemoteStream: function _onGotRemoteStream(event) {
	        _logger.debug('[WebRTC-API] onGotRemoteStream.', event);

	        this.onGotRemoteStream(event.stream);
	        _logger.debug('[WebRTC-API] received remote stream, you will see the other.');
	    },

	    onGotStream: function onGotStream(stream) {
	        _logger.debug('[WebRTC-API] on got a local stream');
	    },

	    onSetRemoteSuccess: function onSetRemoteSuccess() {
	        _logger.info('[WebRTC-API] onSetRemoteSuccess complete');
	    },

	    onSetLocalSuccess: function onSetLocalSuccess() {
	        _logger.info('[WebRTC-API] setLocalDescription complete');
	    },

	    onAddIceCandidateSuccess: function onAddIceCandidateSuccess() {
	        _logger.debug('[WebRTC-API] addIceCandidate success');
	    },

	    onAddIceCandidateError: function onAddIceCandidateError(error) {
	        _logger.debug('[WebRTC-API] failed to add ICE Candidate: ' + error.toString());
	    },

	    onIceCandidate: function onIceCandidate(event) {
	        _logger.debug('[WebRTC-API] onIceCandidate : ICE candidate: \n' + event.candidate);
	    },

	    onIceStateChange: function onIceStateChange(event) {
	        _logger.debug('[WebRTC-API] onIceStateChange : ICE state change event: ', event);
	    },

	    onCreateSessionDescriptionError: function onCreateSessionDescriptionError(error) {
	        _logger.error('[WebRTC-API] Failed to create session description: ' + error.toString());
	    },

	    onCreateOfferSuccess: function onCreateOfferSuccess(desc) {
	        _logger.debug('[WebRTC-API] create offer success');
	    },

	    onCreatePRAnswerSuccess: function onCreatePRAnswerSuccess(desc) {
	        _logger.debug('[WebRTC-API] create answer success');
	    },

	    onCreateAnswerSuccess: function onCreateAnswerSuccess(desc) {
	        _logger.debug('[WebRTC-API] create answer success');
	    },

	    onSetSessionDescriptionError: function onSetSessionDescriptionError(error) {
	        _logger.error('[WebRTC-API] onSetSessionDescriptionError : Failed to set session description: ' + error.toString());
	    },

	    onSetLocalSessionDescriptionSuccess: function onSetLocalSessionDescriptionSuccess() {
	        _logger.debug('[WebRTC-API] onSetLocalSessionDescriptionSuccess : setLocalDescription complete');
	    }

	};

	module.exports = function (initConfigs) {
	    _util.extend(true, this, _WebRTC, initConfigs || {});
	};

/***/ },

/***/ 235:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * P2P
	 */
	var _util = __webpack_require__(230);
	var RouteTo = __webpack_require__(233).RouteTo;
	var _logger = _util.logger;

	var P2PRouteTo = RouteTo({
	    success: function success(result) {
	        _logger.debug("iq to server success", result);
	    },
	    fail: function fail(error) {
	        _logger.debug("iq to server error", error);
	    }
	});

	var CommonPattern = {
	    _pingIntervalId: null,
	    _p2pConfig: null,
	    _rtcCfg: null,
	    _rtcCfg2: null,
	    _rtKey: null,
	    _rtFlag: null,

	    webRtc: null,
	    api: null,

	    callee: null,

	    consult: false,

	    init: function init() {
	        var self = this;

	        self.api.onPing = function () {
	            self._onPing.apply(self, arguments);
	        };
	        self.api.onTcklC = function () {
	            self._onTcklC.apply(self, arguments);
	        };
	        self.api.onAcptC = function () {
	            self._onAcptC.apply(self, arguments);
	        };
	        self.api.onAnsC = function () {
	            self._onAnsC.apply(self, arguments);
	        };
	        self.api.onTermC = function () {
	            self._onTermC.apply(self, arguments);
	        };
	        self.webRtc.onIceCandidate = function () {
	            self._onIceCandidate.apply(self, arguments);
	        };
	        self.webRtc.onIceStateChange = function () {
	            self._onIceStateChange.apply(self, arguments);
	        };
	    },

	    _ping: function _ping() {
	        var self = this;

	        function ping() {
	            var rt = new P2PRouteTo({
	                to: self.callee,
	                rtKey: self._rtKey
	            });

	            self.api.ping(rt, self._sessId, function (from, rtcOptions) {
	                _logger.debug("ping result", rtcOptions);
	            });
	        }

	        self._pingIntervalId = window.setInterval(ping, 59000);
	    },

	    _onPing: function _onPing(from, options, rtkey, tsxId, fromSid) {
	        _logger.debug('_onPing from', fromSid);
	    },

	    initC: function initC(mediaStreamConstaints, accessSid) {
	        var self = this;
	        self.sid = accessSid;

	        self.createLocalMedia(mediaStreamConstaints);
	    },

	    createLocalMedia: function createLocalMedia(mediaStreamConstaints) {
	        var self = this;

	        self.consult = false;

	        this.webRtc.createMedia(mediaStreamConstaints, function (webrtc, stream) {
	            webrtc.setLocalVideoSrcObject(stream);

	            self.webRtc.createRtcPeerConnection(self._rtcCfg);

	            self.webRtc.createOffer(function (offer) {
	                self._onGotWebRtcOffer(offer);

	                self._onHandShake();
	            });
	        });
	    },

	    _onGotWebRtcOffer: function _onGotWebRtcOffer(offer) {
	        var self = this;

	        var rt = new P2PRouteTo({
	            sid: self.sid,
	            to: self.callee,
	            rtKey: self._rtKey
	        });

	        self.api.initC(rt, null, null, self._sessId, self._rtcId, null, null, offer, null, self._rtcCfg2, null, function (from, rtcOptions) {
	            _logger.debug("initc result", rtcOptions);
	        });

	        self._ping();
	    },

	    _onAcptC: function _onAcptC(from, options) {
	        var self = this;

	        if (options.ans && options.ans == 1) {
	            _logger.info("[WebRTC-API] _onAcptC : 104, ans = 1, it is a answer. will onAcceptCall");
	            self.onAcceptCall(from, options);
	            self._onAnsC(from, options);
	        }
	        if (!WebIM.WebRTC.supportPRAnswer) {
	            _logger.info("[WebRTC-API] _onAcptC : not supported pranswer. drop it. will onAcceptCall");
	            self.onAcceptCall(from, options);
	        } else {
	            _logger.info("[WebRTC-API] _onAcptC : recv pranswer. ");

	            if (options.sdp || options.cands) {
	                // options.sdp && (options.sdp.type = "pranswer");
	                options.sdp && self.webRtc.setRemoteDescription(options.sdp);
	                options.cands && self._onTcklC(from, options);

	                //self._onHandShake(from, options);

	                self.onAcceptCall(from, options);
	            }
	        }
	    },

	    onAcceptCall: function onAcceptCall(from, options) {},

	    _onAnsC: function _onAnsC(from, options) {
	        // answer
	        var self = this;

	        _logger.info("[WebRTC-API] _onAnsC : recv answer. ");

	        options.sdp && self.webRtc.setRemoteDescription(options.sdp);
	        options.cands && self._onTcklC(from, options);
	    },

	    _onInitC: function _onInitC(from, options, rtkey, tsxId, fromSid) {
	        var self = this;

	        self.consult = false;

	        self.callee = from;
	        self._rtcCfg2 = options.rtcCfg;
	        self._rtKey = rtkey;
	        self._tsxId = tsxId;
	        self._fromSid = fromSid;

	        self._rtcId = options.rtcId;
	        self._sessId = options.sessId;

	        self.webRtc.createRtcPeerConnection(self._rtcCfg2);

	        options.cands && self._onTcklC(from, options);
	        options.sdp && self.webRtc.setRemoteDescription(options.sdp).then(function () {
	            self._onHandShake(from, options);

	            /*
	             * chrome 版本 大于 50时，可以使用pranswer。
	             * 小于50 不支持pranswer，此时处理逻辑是，直接进入振铃状态
	             *
	             */
	            if (WebIM.WebRTC.supportPRAnswer) {
	                self.webRtc.createPRAnswer(function (prAnswer) {
	                    self._onGotWebRtcPRAnswer(prAnswer);

	                    setTimeout(function () {
	                        //由于 chrome 在 pranswer时，ice状态只是 checking，并不能像sdk那样 期待 connected 振铃；所以目前改为 发送完pranswer后，直接振铃
	                        _logger.info("[WebRTC-API] onRinging : after send pranswer. ", self.callee);
	                        self.onRinging(self.callee);
	                    }, 500);
	                });
	            } else {
	                setTimeout(function () {
	                    _logger.info("[WebRTC-API] onRinging : After iniC, cause by: not supported pranswer. ", self.callee);
	                    self.onRinging(self.callee);
	                }, 500);
	                self._ping();
	            }
	        });
	    },

	    _onGotWebRtcPRAnswer: function _onGotWebRtcPRAnswer(prAnswer) {
	        var self = this;

	        var rt = new P2PRouteTo({
	            //tsxId: self._tsxId,
	            to: self.callee,
	            rtKey: self._rtKey
	        });

	        //self._onHandShake();

	        //self.api.acptC(rt, self._sessId, self._rtcId, prAnswer, null, 1);
	        self.api.acptC(rt, self._sessId, self._rtcId, prAnswer);

	        self._ping();
	    },

	    onRinging: function onRinging(caller) {},

	    accept: function accept() {
	        var self = this;

	        function createAndSendAnswer() {
	            _logger.info("createAndSendAnswer : ...... ");

	            self.webRtc.createAnswer(function (answer) {
	                var rt = new P2PRouteTo({
	                    //tsxId: self._tsxId,
	                    to: self.callee,
	                    rtKey: self._rtKey
	                });

	                if (WebIM.WebRTC.supportPRAnswer) {
	                    self.api.ansC(rt, self._sessId, self._rtcId, answer);
	                } else {
	                    self.api.acptC(rt, self._sessId, self._rtcId, answer, null, 1);
	                }
	            });
	        }

	        self.webRtc.createMedia(function (webrtc, stream) {
	            webrtc.setLocalVideoSrcObject(stream);

	            createAndSendAnswer();
	        });
	    },

	    _onHandShake: function _onHandShake(from, options) {
	        var self = this;

	        self.consult = true;
	        _logger.info("hand shake over. may switch cands.");

	        options && setTimeout(function () {
	            self._onTcklC(from, options);
	        }, 100);

	        setTimeout(function () {
	            self._onIceCandidate();
	        }, 100);
	    },

	    _onTcklC: function _onTcklC(from, options) {
	        // offer
	        var self = this;

	        // options.sdp && self.webRtc.setRemoteDescription(options.sdp);

	        if (self.consult) {
	            _logger.info("[WebRTC-API] recv and add cands.");

	            self._recvCands && self._recvCands.length > 0 && self.webRtc.addIceCandidate(self._recvCands);
	            options && options.cands && self.webRtc.addIceCandidate(options.cands);
	        } else if (options && options.cands && options.cands.length > 0) {
	            for (var i = 0; i < options.cands.length; i++) {
	                (self._recvCands || (self._recvCands = [])).push(options.cands[i]);
	            }
	            _logger.debug("[_onTcklC] temporary memory[recv] ice candidate. util consult = true");
	        }
	    },

	    _onIceStateChange: function _onIceStateChange(event) {
	        var self = this;
	        event && _logger.debug("[WebRTC-API] " + self.webRtc.iceConnectionState() + " |||| ice state is " + event.target.iceConnectionState);
	        self.api.onIceConnectionStateChange(self.webRtc.iceConnectionState());
	    },

	    _onIceCandidate: function _onIceCandidate(event) {
	        var self = this;

	        if (self.consult) {
	            var sendIceCandidate = function sendIceCandidate(candidate) {
	                _logger.debug("send ice candidate...");

	                var rt = new P2PRouteTo({
	                    to: self.callee,
	                    rtKey: self._rtKey
	                });

	                if (candidate) {
	                    self.api.tcklC(rt, self._sessId, self._rtcId, null, candidate);
	                }
	            };

	            if (self._cands && self._cands.length > 0) {

	                sendIceCandidate(self._cands);

	                self._cands = [];
	            }
	            event && event.candidate && sendIceCandidate(event.candidate);
	        } else {
	            event && event.candidate && (self._cands || (self._cands = [])).push(event.candidate);
	            _logger.debug("[_onIceCandidate] temporary memory[send] ice candidate. util consult = true");
	        }
	    },

	    termCall: function termCall(reason) {
	        var self = this;

	        self._pingIntervalId && window.clearInterval(self._pingIntervalId);

	        var rt = new P2PRouteTo({
	            to: self.callee,
	            rtKey: self._rtKey
	        });

	        self.hangup || self.api.termC(rt, self._sessId, self._rtcId, reason);

	        self.webRtc.close();

	        self.hangup = true;

	        self.onTermCall(reason);
	    },

	    _onTermC: function _onTermC(from, options) {
	        var self = this;

	        self.hangup = true;
	        self.termCall(options.reason);
	    },

	    onTermCall: function onTermCall() {
	        //to be overwrited by call.listener.onTermCall
	    }
	};

	module.exports = function (initConfigs) {
	    var self = this;

	    _util.extend(true, this, CommonPattern, initConfigs || {});

	    self.init();
	};

	/**
	 * TODO: Conference
	 */

/***/ }

/******/ });
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

/** PrivateFunction: Array.prototype.indexOf
 *  Return the index of an object in an array.
 *
 *  This function is not supplied by some JavaScript implementations, so
 *  we provide it if it is missing.  This code is from:
 *  http://developer.mozilla.org/En/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
 *
 *  Parameters:
 *	(Object) elt - The object to look for.
 *	(Integer) from - The index from which to start looking. (optional).
 *
 *  Returns:
 *	The index of elt in the array or -1 if not found.
 */
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (elt /*, from*/ ) {
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) {
			from += len;
		}

		for (; from < len; from++) {
			if (from in this && this[from] === elt) {
				return from;
			}
		}

		return -1;
	};
}

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim */
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

	Array.prototype.forEach = function (callback, thisArg) {

		var T, k;

		if (this === null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling toObject() passing the
		// |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get() internal
		// method of O with the argument "length".
		// 3. Let len be toUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If isCallable(callback) is false, throw a TypeError exception. 
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as
				// the this value and argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}

// reverted for backwards compatibility with ie8
// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function(global) {
	'use strict';
	if (!global.console) {
		global.console = {};
	}
	var con = global.console;
	var prop, method;
	var dummy = function() {};
	var properties = ['memory'];
	var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
		 'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
		 'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
	while (prop = properties.pop()) if (!con[prop]) con[prop] = {};
	while (method = methods.pop()) if (!con[method]) con[method] = dummy;
	// Using `this` for web workers & supports Browserify / Webpack.
})(typeof window === 'undefined' ? this : window);
(function () {
	window.easemobim = window.easemobim || {};

	var _isMobile = /mobile/i.test(navigator.userAgent);

	function _isNodeList(nodes) {
		var stringRepr = Object.prototype.toString.call(nodes);

		return typeof nodes === 'object'
			&& /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr)
			&& typeof nodes.length === 'number'
			&& (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
	}

	function _addClass(elem, className) {
		if (!_hasClass(elem, className)) {
			elem.className += ' ' + className;
		}
	}

	function _removeClass(elem, className) {
		if (_hasClass(elem, className)) {
			elem.className = (
				(' ' + elem.className + ' ')
				.replace(new RegExp(' ' + className + ' ', 'g'), ' ')
			).trim();
		}
	}

	function _hasClass(elem, className) {
		return !!~(' ' + elem.className + ' ').indexOf(' ' + className + ' ');
	}

	function _eachElement(elementOrNodeList, fn /* *arguments */ ) {
		if (typeof fn !== 'function') return;

		var nodeList = _isNodeList(elementOrNodeList) ? elementOrNodeList : [elementOrNodeList];
		var extraArgs = [];
		var i, l, tmpElem;

		// parse extra arguments
		for (i = 2, l = arguments.length; i < l; ++i) {
			extraArgs.push(arguments[i]);
		}

		for (i = 0, l = nodeList.length; i < l; ++i) {
			(tmpElem = nodeList[i])
			&& (tmpElem.nodeType === 1 || tmpElem.nodeType === 9 || tmpElem.nodeType === 11)
			&& fn.apply(null, [tmpElem].concat(extraArgs));
		}
	}

	function _bind(elem, evt, handler, isCapture) {
		if (elem.addEventListener) {
			elem.addEventListener(evt, handler, isCapture);
		}
		else if (elem.attachEvent) {
			// todo: add window.event to evt
			// todo: add srcElement
			// todo: remove this _event
			elem['_' + evt] = function () {
				handler.apply(elem, arguments);
			};
			elem.attachEvent('on' + evt, elem['_' + evt]);
		}
		else {
			elem['on' + evt] = handler;
		}
	}

	function _unbind(elem, evt, handler) {
		var keyName = '_' + evt;
		var eventName = 'on' + evt;

		if (elem.removeEventListener && handler) {
			elem.removeEventListener(evt, handler);
		}
		else if (elem.detachEvent) {
			elem.detachEvent(eventName, elem[keyName]);
			delete elem[keyName];
		}
		else {
			elem[eventName] = null;
		}
	}

	easemobim.utils = {
		isTop: true,
		isNodeList: _isNodeList,
		formatDate: function(d, format){
			var date = d ? new Date(d) : new Date();
			var fmt = format || 'M月d日 hh:mm';
			var o = {
				'M+': date.getMonth() + 1, //月份
				'd+': date.getDate(), //日
				'h+': date.getHours(), //小时
				'm+': date.getMinutes(), //分
				's+': date.getSeconds() //秒
			};

			if (/(y+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
			}

			for (var k in o) {
				if (new RegExp('(' + k + ')').test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? o[k] : (('00' + o[k]).substr(('' + o[k]).length)));
				}
			}
			return fmt;
		},
		filesizeFormat: function (filesize) {
			var UNIT_ARRAY = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
			var exponent;
			var result;

			if (filesize > 0) {
				exponent = Math.floor(Math.log(filesize) / Math.log(1024));
				result = (filesize / Math.pow(1024, exponent)).toFixed(2) + ' ' + UNIT_ARRAY[exponent];
			}
			else if (filesize === 0) {
				result = '0 B';
			}
			else {
				result = '';
			}
			return result;
		},
		uuid: function () {
			var s = [];
			var hexDigits = '0123456789abcdef';

			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}

			s[14] = '4';
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
			s[8] = s[13] = s[18] = s[23] = '-';

			return s.join('');
		},
		convertFalse: function (obj) {
			obj = typeof obj === 'undefined' ? '' : obj;
			return obj === 'false' ? false : obj;
		},
		$Remove: function (elem) {
			if (!elem) return;

			if (elem.remove) {
				elem.remove();
			}
			else if (elem.parentNode) {
				elem.parentNode.removeChild(elem);
			}
			else {}
		},
		live: function (selector, ev, handler, wrapper) {
			var me = this;
			var container = wrapper || document;
			me.on(container, ev, function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var targetList = container.querySelectorAll(selector);
				var i, l;

				for (i = 0, l = targetList.length; i < l; ++i) {
					targetList[i] === target && handler.call(target, evt);
				}
			});
		},
		on: function (elementOrNodeList, event, handler, isCapture) {
			event.split(' ').forEach(function (evt) {
				evt && _eachElement(elementOrNodeList, _bind, evt, handler, isCapture);
			});
		},
		off: function (elementOrNodeList, event, handler) {
			event.split(' ').forEach(function (evt) {
				evt && _eachElement(elementOrNodeList, _unbind, evt, handler);
			});
		},
		one: function (element, ev, handler, isCapture) {
				if (!element || !ev) return;

				var tempFn = function () {
					handler.apply(this, arguments);
					_unbind(element, ev, tempFn);
				};
				_bind(element, ev, tempFn, isCapture);
			}
			// 触发事件，对于ie8只支持原生事件，不支持自定义事件
			,
		trigger: function (element, eventName) {
			if (document.createEvent) {
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent(eventName, true, false);
				element.dispatchEvent(ev);
			}
			else {
				element.fireEvent('on' + eventName);
			}
		},
		// todo： 去掉 使用 _.extend 替代
		extend: function (object, extend) {
			for (var o in extend) {
				if (extend.hasOwnProperty(o)) {
					var t = Object.prototype.toString.call(extend[o]);
					if (t === '[object Array]') {
						object[o] = [];
						this.extend(object[o], extend[o]);
					}
					else if (t === '[object Object]') {
						object[o] = {};
						this.extend(object[o], extend[o]);
					}
					else {
						object[o] = extend[o];
					}
				}
			}
			return object;
		},
		addClass: function (elementOrNodeList, className) {
			_eachElement(elementOrNodeList, _addClass, className);
			return elementOrNodeList;
		},
		removeClass: function (elementOrNodeList, className) {
			_eachElement(elementOrNodeList, _removeClass, className);
			return elementOrNodeList;
		},
		hasClass: function (elem, className) {
			if (!elem) return false;
			return _hasClass(elem, className);
		},
		toggleClass: function (element, className, stateValue) {
			if (!element || !className) return;

			var ifNeedAddClass = typeof stateValue === 'undefined'
				? !_hasClass(element, className)
				: stateValue;

			if (ifNeedAddClass) {
				_addClass(element, className);
			}
			else {
				_removeClass(element, className);
			}
		},
		getDataByPath: function (obj, path) {
			var propArray = path.split('.');
			var currentObj = obj;

			return seek();

			function seek() {
				var prop = propArray.shift();

				if (typeof prop !== 'string') {
					// path 遍历完了，返回当前值
					return currentObj;
				}
				else if (typeof currentObj === 'object' && currentObj !== null) {
					// 正常遍历path，递归调用
					currentObj = currentObj[prop];
					return seek();
				}
				else {
					// 没有找到path，返回undefined
					return;
				}
			}
		},
		query: function (key) {
			var reg = new RegExp('[?&]' + key + '=([^&]*)(?=&|$)');
			var matches = reg.exec(location.search);
			return matches ? matches[1] : '';
		},
		isAndroid: /android/i.test(navigator.useragent),
		isMobile: _isMobile,
		click: _isMobile && ('ontouchstart' in window) ? 'touchstart' : 'click',
		// detect if the browser is minimized
		isMin: function () {
			return document.visibilityState === 'hidden' || document.hidden;
		},
		setStore: function (key, value) {
			try {
				localStorage.setItem(key, value);
			}
			catch (e) {}
		},
		getStore: function (key) {
			try {
				return localStorage.getItem(key);
			}
			catch (e) {}
		},
		clearStore: function (key) {
			try {
				localStorage.removeItem(key);
			}
			catch (e) {}
		},
		clearAllStore: function () {
			try {
				localStorage.clear();
			}
			catch (e) {}
		},
		set: function (key, value, expiration) {
			var date = new Date();
			// 过期时间默认为30天
			var expiresTime = date.getTime() + (expiration || 30) * 24 * 3600 * 1000;
			date.setTime(expiresTime);
			document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';path=/;expires=' + date.toGMTString();
		},
		get: function (key) {
			var matches = document.cookie.match('(^|;) ?' + encodeURIComponent(key) + '=([^;]*)(;|$)');
			return matches ? decodeURIComponent(matches[2]) : '';
		},
		getAvatarsFullPath: function (url, domain) {
			if (!url) return;

			url = url.replace(/^(https?:)?\/\/?/, '');
			var isKefuAvatar = ~url.indexOf('img-cn');
			var ossImg = ~url.indexOf('ossimages');

			return isKefuAvatar && !ossImg ? domain + '/ossimages/' + url : '//' + url;
		},
		getConfig: function (key) { //get config from current script
			var src;
			var obj = {};
			var scripts = document.scripts;

			for (var s = 0, l = scripts.length; s < l; s++) {
				if (~scripts[s].src.indexOf('easemob.js')) {
					src = scripts[s].src;
					break;
				}
			}

			if (!src) {
				return { json: obj, domain: '' };
			}

			var tmp;
			var idx = src.indexOf('?');
			var sIdx = ~src.indexOf('//') ? src.indexOf('//') : 0;
			var domain = src.slice(sIdx, src.indexOf('/', sIdx + 2));
			var arr = src.slice(idx + 1).split('&');

			for (var i = 0, len = arr.length; i < len; i++) {
				tmp = arr[i].split('=');
				obj[tmp[0]] = tmp.length > 1 ? decodeURIComponent(tmp[1]) : '';
			}
			return { json: obj, domain: domain };
		},
		// 向url里边添加或更新query params
		updateAttribute: function (link, attr, path) {
			var url = link || location.protocol + path + '/im.html?tenantId=';

			for (var o in attr) {
				if (attr.hasOwnProperty(o) && typeof attr[o] !== 'undefined') {
					// 此处可能有坑
					if (~url.indexOf(o + '=')) {
						url = url.replace(new RegExp(o + '=[^&#?]*', 'gim'), o + '=' + (attr[o] !== '' ? attr[o] : ''));
					}
					else {
						url += '&' + o + '=' + (attr[o] !== '' ? attr[o] : '');
					}
				}
			}
			return url;
		},
		copy: function (obj) {
			// todo：移到，easemob.js 里边
			return this.extend({}, obj);
		},
		code: (function () {
			var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

			var obj = {
				/**
				 * Encodes a string in base64
				 *
				 * @param {String}
				 *			input The string to encode in base64.
				 */
				encode: function (input) {
					var output = "";
					var chr1, chr2, chr3;
					var enc1, enc2, enc3, enc4;
					var i = 0;

					do {
						chr1 = input.charCodeAt(i++);
						chr2 = input.charCodeAt(i++);
						chr3 = input.charCodeAt(i++);

						enc1 = chr1 >> 2;
						enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
						enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
						enc4 = chr3 & 63;

						if (isNaN(chr2)) {
							enc3 = enc4 = 64;
						}
						else if (isNaN(chr3)) {
							enc4 = 64;
						}

						output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
							+ keyStr.charAt(enc3) + keyStr.charAt(enc4);
					} while (i < input.length);

					return output;
				},

				/**
				 * Decodes a base64 string.
				 *
				 * @param {String}
				 *			input The string to decode.
				 */
				decode: function (input) {
					var output = "";
					var chr1, chr2, chr3;
					var enc1, enc2, enc3, enc4;
					var i = 0;

					// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
					input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

					do {
						enc1 = keyStr.indexOf(input.charAt(i++));
						enc2 = keyStr.indexOf(input.charAt(i++));
						enc3 = keyStr.indexOf(input.charAt(i++));
						enc4 = keyStr.indexOf(input.charAt(i++));

						chr1 = (enc1 << 2) | (enc2 >> 4);
						chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
						chr3 = ((enc3 & 3) << 6) | enc4;

						output = output + String.fromCharCode(chr1);

						if (enc3 != 64) {
							output = output + String.fromCharCode(chr2);
						}
						if (enc4 != 64) {
							output = output + String.fromCharCode(chr3);
						}
					} while (i < input.length);

					return output;
				}
			};

			return obj;
		})()
	};
}());

(function () {
	easemobim._const = {
		agentStatusText: {
			Idle: '(离线)',
			Online: '(空闲)',
			Busy: '(忙碌)',
			Leave: '(离开)',
			Hidden: '(隐身)',
			Offline: '(离线)',
			Logout: '(离线)',
			Other: ''
		},

		// todo: change the class name to icon-*
		// 坐席状态，dom上的className值
		agentStatusClassName: {
			Idle: 'online',
			Online: 'online',
			Busy: 'busy',
			Leave: 'leave',
			Hidden: 'hidden',
			Offline: 'offline',
			Logout: 'offline',
			Other: 'hide'
		},

		// todo: simplify this part
		eventMessageText: {
			TRANSFERING: '会话转接中，请稍候',
			TRANSFER: '会话已被转接至其他客服',
			LINKED: '会话已被客服接起',
			CLOSED: '会话已结束',
			NOTE: '当前暂无客服在线，请您留下联系方式，稍后我们将主动联系您',
			CREATE: '会话创建成功'
		},

		themeMap: {
			'天空之城': 'theme-1',
			'丛林物语': 'theme-2',
			'红瓦洋房': 'theme-3',
			'鲜美橙汁': 'theme-4',
			'青草田间': 'theme-5',
			'湖光山色': 'theme-6',
			'冷峻山峰': 'theme-7',
			'月色池塘': 'theme-8',
			'天籁湖光': 'theme-9',
			'商务风格': 'theme-10'
		},

		IM: {
			WEBIM_CONNCTION_OPEN_ERROR: 1,
			WEBIM_CONNCTION_AUTH_ERROR: 2,
			WEBIM_CONNCTION_AJAX_ERROR: 17,
			WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31
		},

		EVENTS: {
			NOTIFY: 'notify',
			RECOVERY: 'recoveryTitle',
			SHOW: 'showChat',
			CLOSE: 'closeChat',
			CACHEUSER: 'setUser',
			DRAGREADY: 'dragReady',
			DRAGEND: 'dragEnd',
			SLIDE: 'titleSlide',
			ONMESSAGE: 'onMessage',
			ONSESSIONCLOSED: 'onSessionClosed',
			EXT: 'ext',
			TEXTMSG: 'textmsg',
			ONREADY: 'onready',
			SET_ITEM: 'setItem',
			UPDATE_URL: 'updateURL',
			REQUIRE_URL: 'requireURL',
			INIT_CONFIG: 'initConfig'
		},

		//上传文件大小限制
		UPLOAD_FILESIZE_LIMIT: 1024 * 1024 * 10,

		// 超时未收到 kefu-ack 启用第二通道发消息
		FIRST_CHANNEL_MESSAGE_TIMEOUT: 10000,

		// 发送消息第二通道失败后，最多再试1次
		SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT: 1,

		// 如果im连接超时后启用第二通道
		FIRST_CHANNEL_CONNECTION_TIMEOUT: 20000,

		// IM心跳时间间隔
		HEART_BEAT_INTERVAL: 60000,

		// 第二通道收消息轮询时间间隔
		SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL: 60000,

		// 消息预知功能截断长度
		MESSAGE_PREDICT_MAX_LENGTH: 100,

		// 最大文本消息长度
		MAX_TEXT_MESSAGE_LENGTH: 1500,

		// 每次拉取历史消息条数
		GET_HISTORY_MESSAGE_COUNT_EACH_TIME: 10,

		for_block_only: null
	};
}());

(function () {
	var EMPTYFN = function () {};

	var _createStandardXHR = function () {
		try {
			return new window.XMLHttpRequest();
		}
		catch (e) {
			return false;
		}
	};

	var _createActiveXHR = function () {
		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		}
		catch (e) {
			return false;
		}
	};

	var emajax = function (options) {
		var dataType = options.dataType || 'text';
		var suc = options.success || EMPTYFN;
		var error = options.error || EMPTYFN;
		var xhr = _createStandardXHR() || _createActiveXHR();
		xhr.onreadystatechange = function () {
			var json;
			if (xhr.readyState === 4) {
				var status = xhr.status || 0;
				if (status === 200) {
					if (dataType === 'text') {
						suc(xhr.responseText, xhr);
						return;
					}
					if (dataType === 'json') {
						try {
							json = JSON.parse(xhr.responseText);
							suc(json, xhr);
						}
						catch (e) {}
						return;
					}
					suc(xhr.response || xhr.responseText, xhr);
					return;
				}
				else {
					if (dataType == 'json') {
						try {
							json = JSON.parse(xhr.responseText);
							error(json, xhr, '服务器返回错误信息');
						}
						catch (e) {
							error(xhr.responseText, xhr, '服务器返回错误信息');
						}
						return;
					}
					error(xhr.responseText, xhr, '服务器返回错误信息');
					return;
				}
			}
			if (xhr.readyState === 0) {
				error(xhr.responseText, xhr, '服务器异常');
			}
		};

		var type = options.type || 'GET',
			data = options.data || {},
			tempData = '';

		if (type.toLowerCase() === 'get') {
			for (var o in data) {
				if (data.hasOwnProperty(o)) {
					tempData += o + '=' + data[o] + '&';
				}
			}
			tempData = tempData ? tempData.slice(0, -1) : tempData;
			options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date()
				.getTime();
			data = null;
		}
		else {
			data._v = new Date().getTime();
			data = JSON.stringify(data);
		}
		xhr.open(type, options.url);
		if (xhr.setRequestHeader) {

			var headers = options.headers || {};

			headers['Content-Type'] = headers['Content-Type'] || 'application/json';

			for (var key in headers) {
				if (headers.hasOwnProperty(key)) {
					xhr.setRequestHeader(key, headers[key]);
				}
			}
		}
		xhr.send(data);
		return xhr;
	};
	window.easemobim = window.easemobim || {};
	window.easemobim.emajax = emajax;
}());

window.easemobim = window.easemobim || {};
window.easemobIM = window.easemobIM || {};

easemobIM.Transfer = easemobim.Transfer = (function () {
	'use strict';

	var handleMsg = function (e, callback, accept) {
		// 微信调试工具会传入对象，导致解析出错
		if ('string' !== typeof e.data) return;
		var msg = JSON.parse(e.data);
		var i;
		var l;
		//兼容旧版的标志
		var flag = false;

		if (accept && accept.length) {
			for (i = 0, l = accept.length; i < l; i++) {
				if (msg.key === accept[i]) {
					flag = true;
					typeof callback === 'function' && callback(msg);
				}
			}
		}
		else {
			typeof callback === 'function' && callback(msg);
		}

		if (!flag && accept) {
			for (i = 0, l = accept.length; i < l; i++) {
				if (accept[i] === 'data') {
					typeof callback === 'function' && callback(msg);
					break;
				}
			}
		}
	};

	var Message = function (iframeId, key) {
		if (!(this instanceof Message)) {
			return new Message(iframeId);
		}
		this.key = key;
		this.iframe = document.getElementById(iframeId);
		this.origin = location.protocol + '//' + location.host;
	};

	Message.prototype.send = function (msg, to) {

		msg.origin = this.origin;

		msg.key = this.key;

		if (to) {
			msg.to = to;
		}

		msg = JSON.stringify(msg);

		if (this.iframe) {
			this.iframe.contentWindow.postMessage(msg, '*');
		}
		else {
			window.parent.postMessage(msg, '*');
		}
		return this;
	};

	Message.prototype.listen = function (callback, accept) {
		var me = this;

		if (window.addEventListener) {
			window.addEventListener('message', function (e) {
				handleMsg.call(me, e, callback, accept);
			}, false);
		}
		else if (window.attachEvent) {
			window.attachEvent('onmessage', function (e) {
				handleMsg.call(me, e, callback, accept);
			});
		}
		return this;
	};

	return Message;
}());

(function () {
	var getData = new easemobim.Transfer(null, 'api');

	var createObject = function (options) {
		var headers = null;

		if (options.msg.data && options.msg.data.headers) {
			headers = options.msg.data.headers;
			delete options.msg.data.headers;
		}

		return {
			url: options.url,
			headers: headers,
			data: options.excludeData ? null : options.msg.data,
			type: options.type || 'GET',
			success: function (info) {
				try {
					info = JSON.parse(info);
				}
				catch (e) {}
				getData.send({
					call: options.msg.api,
					timespan: options.msg.timespan,
					status: 0,
					data: info
				});
			},
			error: function (info) {
				try {
					info = JSON.parse(info);
				}
				catch (e) {}
				getData.send({
					call: options.msg.api,
					timespan: options.msg.timespan,
					status: 1,
					data: info
				});
			}
		};
	};

	getData.listen(function (msg) {

		getData.targetOrigin = msg.origin;

		switch (msg.api) {
		case 'getRelevanceList':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/targetChannels',
				msg: msg
			}));
			break;
		case 'getDutyStatus':
			// deprecated
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/showMessage',
				msg: msg
			}));
			break;
		case 'getWechatVisitor':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/wechat/' + msg.data.openid + '?tenantId=' + msg.data.tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'createVisitor':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors?tenantId=' + msg.data.tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'getSession':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/' + msg.data.id + '/schedule-data?techChannelInfo=' + msg.data.orgName + '%23'
					+ msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getExSession':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/' + msg.data.id + '/schedule-data-ex?techChannelInfo=' + msg.data.orgName +
					'%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getPassword':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/password',
				msg: msg
			}));
			break;
		case 'getGroup':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/' + msg.data.id + '/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' +
					msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getGroupNew':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenant/' + msg.data.tenantId + '/visitors/' + msg.data.id +
					'/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber
					+ '&tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getHistory':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/msgHistory',
				msg: msg
			}));
			break;
		case 'getSlogan':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/notice/options',
				msg: msg
			}));
			break;
		case 'getTheme':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/theme/options',
				msg: msg
			}));
			break;
		case 'getSystemGreeting':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/welcome',
				msg: msg
			}));
			break;
		case 'getRobertGreeting':
			// deprecated
			easemobim.emajax(createObject({
				url: '/v1/Tenants/'
					+ msg.data.tenantId
					+ '/robots/visitor/greetings/'
					+ msg.data.originType
					+ '?tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'sendVisitorInfo':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenants/' + msg.data.tenantId + '/visitors/' + msg.data.visitorId +
					'/attributes?tenantId=' + msg.data.tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'getProject':
			easemobim.emajax(createObject({
				url: '/tenants/' + msg.data.tenantId + '/projects',
				msg: msg
			}));
			break;
		case 'createTicket':
			easemobim.emajax(createObject({
				url: '/tenants/' + msg.data.tenantId + '/projects/' + msg.data.projectId + '/tickets?tenantId=' + msg.data.tenantId
					+ '&easemob-target-username=' + msg.data['easemob-target-username'] + '&easemob-appkey=' + msg.data[
						'easemob-appkey'] + '&easemob-username=' + msg.data['easemob-username'],
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'receiveMsgChannel':
			easemobim.emajax(createObject({
				url: '/v1/imgateway/messages',
				msg: msg
			}));
			break;
		case 'sendMsgChannel':
			easemobim.emajax(createObject({
				url: '/v1/imgateway/messages?tenantId=' + msg.data.tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'getAgentStatus':
			easemobim.emajax(createObject({
				url: '/v1/tenants/' + msg.data.tenantId + '/agents/' + msg.data.agentUserId + '/agentstate',
				msg: msg
			}));
			break;
		case 'getNickNameOption':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/agentnicename/options?tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
			// 此接口使用的是单独的微服务，无需限流
		case 'reportEvent':
			easemobim.emajax(createObject({
				url: '/v1/event_collector/events',
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'deleteEvent':
			easemobim.emajax(createObject({
				url: '/v1/event_collector/event/' + encodeURIComponent(msg.data.userId),
				msg: msg,
				type: 'DELETE',
				excludeData: true
			}));
			break;
		case 'mediaStreamUpdateStatus':
			// patch
			var streamId = msg.data.streamId;
			delete msg.data.streamId;

			easemobim.emajax(createObject({
				url: '/v1/rtcmedia/media_streams/' + streamId,
				msg: msg,
				type: 'PUT'
			}));
			break;
		case 'graylist':
			easemobim.emajax(createObject({
				url: '/management/graylist',
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getCurrentServiceSession':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenant/'
					+ msg.data.tenantId
					+ '/visitors/'
					+ msg.data.id
					+ '/CurrentServiceSession?techChannelInfo='
					+ msg.data.orgName + '%23'
					+ msg.data.appName + '%23'
					+ msg.data.imServiceNumber
					+ '&tenantId='
					+ msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'messagePredict':
			// fake: 避免多余的参数传递到 post body 中
			// todo：改进ajax，避免post时多传参数
			var tenantId = msg.data.tenantId;
			var agentId = msg.data.agentId;

			delete msg.data.tenantId;
			delete msg.data.agentId;

			easemobim.emajax(createObject({
				url: '/v1/webimplugin/agents/'
					+ agentId
					+ '/messagePredict'
					+ '?tenantId='
					+ tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'getSessionQueueId':
			var visitorUsername = msg.data.visitorUsername;
			easemobim.emajax(createObject({
				url: '/v1/visitors/' + visitorUsername + '/waitings/sessions',
				msg: msg,
				type: 'GET'
			}));
			break;
		case 'getWaitListNumber':
			easemobim.emajax(createObject({
				url: '/v1/visitors/waitings/data',
				msg: msg,
				type: 'GET'
			}));
			break;
		case 'getDutyStatus_2':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenants/show-message',
				msg: msg
			}));
			break;
		case 'getRobertGreeting_2':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenants/robots/welcome',
				msg: msg
			}));
			break;
		default:
			break;
		}
	}, ['data']);
}());

(function () {
	var LOADING = Modernizr.inlinesvg ? [
		'<div class="em-widget-loading">',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">',
		'<circle opacity=".3" fill="none" stroke="#000" stroke-width="4" stroke-miterlimit="10" cx="35" cy="35" r="11"/>',
		'<path fill="none" stroke="#E5E5E5" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10" d="M24 35c0-6.1 4.9-11 11-11 2.8 0 5.3 1 7.3 2.8"/>',
		'<image width="20" style="margin-top:10px"/>',
		'</svg>',
		'</div>'
	].join('')
		: '<img src="//kefu.easemob.com/webim/static/img/loading.gif" width="20" style="margin-top:10px;"/>';
	var parseLink = WebIM.utils.parseLink;
	var parseEmoji = WebIM.utils.parseEmoji;

	function _encode(str) {
		if (!str || str.length === 0) {
			return '';
		}
		var s = '';
		s = str.replace(/&amp;/g, "&");
		// 避免影响表情解析
		s = s.replace(/<(?=[^o][^)])/g, "&lt;");
		s = s.replace(/>/g, "&gt;");
		//s = s.replace(/\'/g, "&#39;");
		s = s.replace(/\"/g, "&quot;");
		return s;
	}

	function _decode(str) {
		if (!str || str.length === 0) {
			return '';
		}
		var s = '';
		s = str.replace(/&amp;/g, "&");
		s = s.replace(/&#39;/g, "'");
		s = s.replace(/&lt;/g, "<");
		return s;
	}

	function genMsgContent(msg) {
		var type = msg.type;
		var value = msg.value;
		var html = '';
		switch (type) {
		case 'txt':
			// fake:  todo: remove this
			value = _encode(_decode(value));
			html = '<pre>' + parseLink(parseEmoji(value)) + '</pre>';
			break;
		case "txtLink":
			// 历史消息表情未经过im sdk 解析，所以类型为txt
			// fake:  todo: remove this
			html = value;
			break;
		case 'img':
			if (value) {
				// todo: remove a
				html = '<a href="javascript:;"><img class="em-widget-imgview" src="'
					+ value.url + '"/></a>';
			}
			else {
				html = '<i class="icon-broken-pic"></i>';
			}
			break;
		case 'list':
			html = "<p>" + parseLink(_encode(value)) + "</p>" + msg.listDom;
			break;
		case 'file':
			// 历史会话中 filesize = 0
			// 访客端发文件消息 filesize = undefined
			// 需要过滤这两种情况，暂时只显示坐席发过来的文件大小
			if (value) {
				html = '<i class="icon-attachment container-icon-attachment"></i>'
					+ '<span class="file-info">'
					+ '<p class="filename">' + msg.filename + '</p>'
					+ '<p class="filesize">' + easemobim.utils.filesizeFormat(value.filesize) + '</p>'
					+ '</span>'
					+ "<a target='_blank' href='" + value.url + "' class='icon-download container-icon-download' title='"
					+ msg.filename + "'></a>";
			}
			else {
				html = '<i class="icon-broken-pic"></i>';
			}
			break;
		default:
			break;
		}

		return html;
	}

	function genDomFromMsg(msg, isReceived) {
		var id = msg.id;
		var type = msg.type;
		var html = '';
		var stack = [];
		var dom = document.createElement('div');
		var direction = isReceived ? 'left' : 'right';

		// 设置消息气泡显示在左侧还是右侧
		// .em-widget-right, .em-widget-left used here
		dom.className = 'em-widget-' + direction;

		// 给消息追加id，用于失败重发消息或撤回消息
		if (id) {
			dom.id = id;
		}

		// wrapper开始
		html += '<div class="em-widget-msg-wrapper">';

		// 设置消息气泡的突起位置
		// .icon-corner-right, .icon-corner-left used here
		html += '<i class="icon-corner-' + direction + '"></i>';

		// 发出的消息增加状态显示
		if (!isReceived && id) {
			html += '<div id="' + id
				+ '_failed" data-type="txt" class="em-widget-msg-status hide">'
				+ '<span>发送失败</span><i class="icon-circle"><i class="icon-exclamation"></i></i></div>'
				+ '<div id="' + id
				+ '_loading" class="em-widget-msg-loading">' + LOADING + '</div>';
		}


		// todo: simplify the class name em-widget-msg
		// container 开始
		// .em-widget-msg-* used here
		html += '<div class="em-widget-msg-container em-widget-msg-' + type + '">';
		// 消息内容
		html += genMsgContent(msg);

		// container 结束
		stack.push('</div>');

		// wrapper结尾
		stack.push('</div>');

		// 追加标签
		html += _.reduceRight(stack, function (a, b) { return a + b; }, '');
		dom.innerHTML = html;
		return dom;
	}

	// 按钮列表消息，机器人回复，满意度调查
	WebIM.message.list = function (id) {
		this.id = id;
		this.type = 'list';
		this.brief = '';
		this.body = {};
	};
	WebIM.message.list.prototype.set = function (opt) {
		this.value = opt.value;
		this.listDom = opt.list;
	};

	easemobim.genDomFromMsg = genDomFromMsg;
}());

/**
 * ctrl+v发送截图功能:当前仅支持chrome/firefox/edge
 */
easemobim.paste = function (chat) {
	var utils = easemobim.utils;
	var blob;
	var dataURL;

	var dom = document.querySelector('.em-widget-paste-wrapper');
	var cancelBtn = dom.querySelector('.em-widget-cancel');
	var sendImgBtn = dom.querySelector('.em-widget-confirm');
	var img = dom.querySelector('img');

	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'hide');
	});
	utils.on(sendImgBtn, 'click', function () {
		chat.channel.sendImg({ data: blob, url: dataURL });
		utils.addClass(dom, 'hide');
	});

	function _handler(ev) {
		if (/^image\/\w+$/.test(utils.getDataByPath(ev, 'clipboardData.items.0.type'))) {
			blob = ev.clipboardData.items[0].getAsFile();
			dataURL = window.URL.createObjectURL(blob);
			img.src = dataURL;
			utils.removeClass(dom, 'hide');
		}
	}
	return {
		init: function () {
			utils.on(easemobim.textarea, 'paste', _handler);
		}
	};
};

(function (utils) {
	easemobim.leaveMessage = function (chat, tenantId) {

		var projectId;
		var targetUser;
		var accessToken;
		var appkey;
		var isSending = false;
		var username;

		// 仅初始化一次
		if (dom) return;

		var dom = document.querySelector('.em-widget-offline');
		var content = dom.querySelector('textarea');
		var contact = dom.querySelector('.contact');
		var phone = dom.querySelector('.phone');
		var mail = dom.querySelector('.mail');
		var confirmBtn = dom.querySelector('.btn-ok');
		var cancelBtn = dom.querySelector('.btn-cancel');
		var success = dom.querySelector('.em-widget-success-prompt');

		utils.on(cancelBtn, utils.click, function () {
			utils.addClass(dom, 'hide');
		});

		utils.on(confirmBtn, utils.click, function () {
			if (isSending) {
				chat.errorPrompt('留言提交中...');
			}
			else if (!projectId || !targetUser) {
				chat.errorPrompt('留言失败，token无效');
			}
			else if (!contact.value || contact.value.length > 140) {
				chat.errorPrompt('姓名输入不正确');
			}
			else if (!phone.value || phone.value.length > 24) {
				chat.errorPrompt('电话输入不正确');
			}
			else if (!mail.value || mail.value.length > 127) {
				chat.errorPrompt('邮箱输入不正确');
			}
			else if (!content.value || content.value.length > 2000) {
				chat.errorPrompt('留言内容不能为空，长度小于2000字');
			}
			else {
				isSending = true;
				setTimeout(function () { isSending = false; }, 10000);
				easemobim.api('createTicket', {
					tenantId: tenantId,
					'easemob-target-username': targetUser,
					'easemob-appkey': appkey,
					'easemob-username': username,
					origin_type: 'webim',
					headers: { Authorization: 'Easemob IM ' + accessToken },
					projectId: projectId,
					subject: '',
					content: content.value,
					status_id: '',
					priority_id: '',
					category_id: '',
					creator: {
						name: contact.value,
						avatar: '',
						email: mail.value,
						phone: phone.value,
						qq: '',
						company: '',
						description: ''
					},
					attachments: null
				}, function (msg) {
					isSending = false;
					if (msg && msg.data && msg.data.id) {
						utils.removeClass(success, 'hide');

						setTimeout(function () {
							utils.addClass(success, 'hide');
						}, 1500);

						contact.value = '';
						phone.value = '';
						mail.value = '';
						content.value = '';
					}
					else {
						chat.errorPrompt('留言失败，请稍后重试');
					}
				});

			}
		});

		return {
			auth: function (token, config) {
				accessToken = token;
				targetUser = config.toUser;
				username = config.user.username;
				appkey = config.appKey.replace('#', '%23');

				if (!projectId) {
					easemobim.api('getProject', {
						tenantId: tenantId,
						'easemob-target-username': targetUser,
						'easemob-appkey': appkey,
						'easemob-username': username,
						headers: { Authorization: 'Easemob IM ' + accessToken }
					}, function (content) {
						projectId = utils.getDataByPath(content, 'data.entities.0.id');
					});
				}
			},
			show: function (isHideCancelBtn) {
				utils.toggleClass(cancelBtn, 'hide', !!isHideCancelBtn);
				utils.removeClass(dom, 'hide');
			}
		};
	};
}(easemobim.utils));

/**
 * 满意度调查
 */
easemobim.satisfaction = function (chat) {

	var dom = document.querySelector('.em-widget-satisfaction-dialog');
	var utils = easemobim.utils;
	var satisfactionEntry = document.querySelector('.em-widget-satisfaction');
	var starsUl = dom.getElementsByTagName('ul')[0];
	var lis = starsUl.getElementsByTagName('li');
	var msg = dom.getElementsByTagName('textarea')[0];
	var buttons = dom.getElementsByTagName('button');
	var cancelBtn = buttons[0];
	var submitBtn = buttons[1];
	var success = dom.getElementsByTagName('div')[1];
	var session;
	var invite;

	utils.on(satisfactionEntry, utils.click, function () {
		session = null;
		invite = null;
		utils.removeClass(dom, 'hide');
		clearInterval(chat.focusText);
	});

	utils.live('button.js_satisfybtn', 'click', function () {
		session = this.getAttribute('data-servicesessionid');
		invite = this.getAttribute('data-inviteid');
		utils.removeClass(dom, 'hide');
		clearInterval(chat.focusText);
	});

	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'hide');
	});

	utils.on(submitBtn, 'click', function () {
		var level = starsUl.querySelectorAll('li.sel').length;

		if (level === 0) {
			chat.errorPrompt('请先选择星级');
			return;
		}
		chat.channel.sendSatisfaction(level, msg.value, session, invite);

		msg.blur();
		utils.removeClass(success, 'hide');

		setTimeout(function () {
			msg.value = '';
			// clear stars
			_.each(lis, function (elem) {
				utils.removeClass(elem, 'sel');
			});
			utils.addClass(success, 'hide');
			utils.addClass(dom, 'hide');
		}, 1500);
	});
	utils.on(starsUl, 'click', function (e) {
		var ev = e || window.event;
		var target = ev.target || ev.srcElement;
		var selIndex = +target.getAttribute('idx') || 0;

		_.each(lis, function (elem, i) {
			utils.toggleClass(elem, 'sel', i < selIndex);
		});
	});
};

easemobim.imgView = (function (utils) {

	var imgWrapper = document.querySelector('div.img-view');
	var img = imgWrapper.querySelector('img');

	utils.on(imgWrapper, 'click', function () {
		utils.addClass(imgWrapper, 'hide');
	}, false);

	return {
		show: function (url) {
			img.setAttribute('src', url);
			utils.removeClass(imgWrapper, 'hide');
		}
	};
}(easemobim.utils));

(function () {
	var wechat = /MicroMessenger/.test(navigator.userAgent);
	var wechatAuth = easemobim.utils.query('wechatAuth');
	var appid = easemobim.utils.query('appid');
	var code = easemobim.utils.query('code');
	var tenantId = easemobim.utils.query('tenantId');


	if (!wechat || !wechatAuth || !tenantId || !appid) {
		return;
	}

	easemobim.wechat = function (callback) {
		//get profile
		var getComponentId = function (callback) {
			easemobim.emajax({
				url: '/v1/weixin/admin/appid',
				success: function (info) {
					callback(info);
				},
				error: function (e) {
					callback(null);
				}
			});
		};


		var getProfile = function (code, callback) {
			//get profile
			easemobim.emajax({
				url: '/v1/weixin/sns/userinfo/' + appid + '/' + code,
				data: { tenantId: tenantId },
				type: 'GET',
				success: function (info) {
					callback(info);
				},
				error: function (e) {
					var url = location.href.replace(/&code=[^&]+/, '');

					if (url.indexOf('appid') !== url.lastIndexOf('appid')) {
						url = url.replace(/&appid=wx[^&]+/, '');
					}
					location.href = url;
				}
			});
		};

		if (!code) {
			getComponentId(function (id) {
				if (!id) {
					callback();
					return;
				}

				var url = encodeURIComponent(location.href);
				var redirect = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + url +
					'&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=' + id + '#wechat_redirect';

				location.href = redirect;
			});

		}
		else {
			getProfile(code, function (resp) {
				if (!resp) {
					callback();
					return;
				}
				callback(resp);
			});
		}
	};
}());

(function () {
	var site = function () {
		this.list = {};
	};

	site.prototype.set = function (key, value) {
		if (typeof this.list[key] === 'undefined') {
			this.list[key] = value;
		}
		return this;
	};

	site.prototype.get = function (key) {
		if (this.list.hasOwnProperty(key)) {
			return this.list[key];
		}
		else {
			return null;
		}
	};

	site.prototype.remove = function (key) {
		if (typeof this.list[key] !== 'undefined') {
			delete this.list[key];
		}
	};

	easemobim.site = site;
}());

(function () {
	var Polling = function (fn, interval) {
		this.fn = fn;
		this.isStarted = false;
		this.timerHandler = null;
		this.interval = interval;
	};

	Polling.prototype.start = function () {
		if (!this.isStarted) {
			this.isStarted = true;
			setTimeout(this.fn, 0);
			this.timerHandler = setInterval(this.fn, this.interval);
		}
	};

	Polling.prototype.stop = function () {
		if (this.isStarted) {
			this.isStarted = false;
			clearInterval(this.timerHandler);
		}
	};

	Polling.prototype.isStarted = function () {
		return this.isStarted;
	};

	easemobim.Polling = Polling;
}());

easemobim.channel = function (config) {
	var me = this;
	var utils = easemobim.utils;
	var api = easemobim.api;
	var _const = easemobim._const;

	//监听ack的timer, 每条消息启动一个
	var ackTS = new easemobim.site();

	//发消息队列
	var sendMsgSite = new easemobim.site();

	//收消息队列
	var receiveMsgSite = new easemobim.site();


	var _obj = {

		getConnection: function () {
			return new WebIM.connection({
				url: config.xmppServer,
				retry: true,
				isMultiLoginSessions: config.resources,
				heartBeatWait: _const.HEART_BEAT_INTERVAL
			});
		},

		reSend: function (type, id) {
			if (id) {
				var msg = sendMsgSite.get(id);

				switch (type) {
				case 'txt':
					_sendMsgChannle(msg, 0); //重试只发一次
					break;
				}
			}
		},

		appendAck: function (msg, id) {
			msg.body.ext.weichat.msg_id_for_ack = id;
		},

		sendSatisfaction: function (level, content, session, invite) {
			_obj.sendText('', false, {ext: {
				orgtype: decodeURIComponent(utils.query('orgtype')),
				weichat: {
					ctrlType: 'enquiry',
					ctrlArgs: {
						inviteId: invite || '',
						serviceSessionId: session || '',
						detail: content,
						summary: level
					}
				}
			}});
		},

		sendText: function (message, isHistory, ext) {
			var id = utils.uuid();
			var msg = new WebIM.message.txt(isHistory ? null : id);
			msg.set({
				msg: message,
				to: config.toUser,
				// 此回调用于确认im server收到消息, 有别于kefu ack
				success: function (id) {},
				fail: function (id) {}
			});

			if (ext) {
				_.extend(msg.body, ext);
			}
			msg.body.ext && (msg.body.ext.orgtype = decodeURIComponent(utils.query('orgtype')));
			if (!isHistory) {
				// 开启倒计时
				_detectSendMsgByApi(id);
				me.setExt(msg);
				_obj.appendAck(msg, id);
				me.conn.send(msg.body);
				sendMsgSite.set(id, msg);
				// 空文本消息不上屏
				if (!message) return;
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			}
			else {
				if (!message) return;
				me.appendMsg(config.user.username, isHistory, msg, true);
			}
		},


		sendTransferToKf: function (tid, sessionId) {
			var id = utils.uuid();
			_detectSendMsgByApi(id);
			var msg = new WebIM.message.cmd(id);
			msg.set({
				to: config.toUser,
				action: 'TransferToKf',
				ext: {
					orgtype: decodeURIComponent(utils.query('orgtype')),
					weichat: {
						ctrlArgs: {
							id: tid,
							serviceSessionId: sessionId
						}
					}
				}
			});
			_obj.appendAck(msg, id);
			me.conn.send(msg.body);
			sendMsgSite.set(id, msg);

			me.handleEventStatus(null, null, true);
		},

		sendImg: function (file, isHistory, fileInput) {
			var id = utils.uuid();
			var msg = new WebIM.message.img(isHistory ? null : id);

			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: file,
				accessToken: me.token,
				to: config.toUser,
				uploadError: function (error) {
					setTimeout(function () {
						//显示图裂，无法重新发送
						var id = error.id;
						var loading = document.getElementById(id + '_loading');
						var msgWrap = document.querySelector('#' + id + ' .em-widget-msg-container');

						msgWrap && (msgWrap.innerHTML = '<i class="icon-broken-pic"></i>');
						utils.addClass(loading, 'hide');
						me.scrollBottom();
					}, 50);
				},
				success: function (id) {
					utils.$Remove(document.getElementById(id + '_loading'));
					utils.$Remove(document.getElementById(id + '_failed'));
					fileInput && (fileInput.value = '');
				},
				fail: function (id) {
					utils.addClass(document.getElementById(id + '_loading'), 'hide');
					utils.removeClass(document.getElementById(id + '_failed'), 'hide');
					fileInput && (fileInput.value = '');
				}
			});
			msg.body.ext && (msg.body.ext.orgtype = decodeURIComponent(utils.query('orgtype')));
			if (!isHistory) {
				me.setExt(msg);
				me.conn.send(msg.body);
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			}
			else {
				me.appendMsg(config.user.username, file.to, msg, true);
			}
		},

		sendFile: function (file, isHistory, fileInput) {
			var id = utils.uuid();
			var msg = new WebIM.message.file(isHistory ? null : id);

			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: file,
				to: config.toUser,
				uploadError: function (error) {
					var id = error.id;
					var loading = document.getElementById(id + '_loading');
					var msgWrap = document.querySelector('#' + id + ' .em-widget-msg-container');

					//显示图裂，无法重新发送
					msgWrap && (msgWrap.innerHTML = '<i class="icon-broken-pic"></i>');
					utils.addClass(loading, 'hide');
					me.scrollBottom();
				},
				success: function (id) {
					utils.$Remove(document.getElementById(id + '_loading'));
					utils.$Remove(document.getElementById(id + '_failed'));
					fileInput && (fileInput.value = '');
				},
				fail: function (id) {
					utils.addClass(document.getElementById(id + '_loading'), 'hide');
					utils.removeClass(document.getElementById(id + '_failed'), 'hide');
					fileInput && (fileInput.value = '');
				}
			});
			msg.body.ext && (msg.body.ext.orgtype = decodeURIComponent(utils.query('orgtype')));
			if (!isHistory) {
				me.setExt(msg);
				me.conn.send(msg.body);
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			}
			else {
				me.appendMsg(config.user.username, file.to, msg, true);
			}
		},

		handleReceive: function (msg, type, isHistory) {
			var str;
			var message;
			var msgId = msg.msgId || utils.getDataByPath(msg, 'ext.weichat.msgId');
			var satisfactionCommentInvitation = utils.getDataByPath(msg, "ext.weichat.extRobot.satisfactionCommentInvitation");
			var satisfactionCommentInfo = utils.getDataByPath(msg, "ext.weichat.extRobot.satisfactionCommentInfo");
			var agentId = utils.getDataByPath(msg, "ext.weichat.agent.userId");

			if (receiveMsgSite.get(msgId)) {
				// 重复消息不处理
				return;
			}
			else if (msgId){
				// 消息加入去重列表
				receiveMsgSite.set(msgId, 1);
			}
			else {
				// 没有msgId忽略，继续处理（KEFU-ACK消息没有msgId）
			}

			//绑定访客的情况有可能会收到多关联的消息，不是自己的不收
			if (!isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !msg.noprompt) {
				return;
			}

			//满意度评价
			if (utils.getDataByPath(msg, 'ext.weichat.ctrlType') === 'inviteEnquiry') {
				type = 'satisfactionEvaluation';
			}
			//机器人自定义菜单
			else if (utils.getDataByPath(msg, 'ext.msgtype.choice')) {
				type = 'robotList';
			}
			//机器人转人工
			else if (utils.getDataByPath(msg, 'ext.weichat.ctrlType') === 'TransferToKfHint') {
				type = 'robotTransfer';
			}
			else {}

			// 是否发送解决未解决msg.ext.extRobot.satisfactionCommentInvitation
			if(satisfactionCommentInvitation && !isHistory){
				me.appendMsg(msg.from, msg.to, {
					value: "<p>此次服务是否已解决您的问题：</p><a class='statisfyYes' data-satisfactionCommentInfo='" + satisfactionCommentInfo + "' data-agentId='" + agentId + "'>解决</a>/<a class='statisfyNo' data-satisfactionCommentInfo='" + satisfactionCommentInfo + "' data-agentId='" + agentId + "'>未解决</a>",
					type: "txtLink",
				}, false);
				return 
			}

			switch (type) {
			case 'txt':
			case 'emoji':
				message = new WebIM.message.txt(msgId);
				message.set({ msg: isHistory ? msg.data : me.getSafeTextValue(msg) });
				break;
			case 'cmd':
				var action = msg.action || utils.getDataByPath(msg, 'bodies.0.action');
				if (action === 'KF-ACK'){
					// 清除ack对应的site item
					_clearTS(msg.ext.weichat.ack_for_msg_id);
					return;
				}
				else if (action === 'KEFU_MESSAGE_RECALL'){
					// 撤回消息命令
					var recallMsgId = msg.ext.weichat.recall_msg_id;
					var dom = document.getElementById(recallMsgId);
					utils.$Remove(dom);
				}
				break;
			case 'img':
				message = new WebIM.message.img(msgId);
				message.set({
					file: {
						url: msg.url || utils.getDataByPath(msg, 'bodies.0.url')
					}
				});
				break;
			case 'file':
				message = new WebIM.message.file(msgId);
				message.set({
					file: {
						url: msg.url || utils.getDataByPath(msg, 'bodies.0.url'),
						filename: msg.filename || utils.getDataByPath(msg, 'bodies.0.filename'),
						filesize: msg.file_length || utils.getDataByPath(msg, 'bodies.0.file_length')
					}
				});
				break;
			case 'satisfactionEvaluation':
				message = new WebIM.message.list();
				message.set({
					value: '请对我的服务做出评价',
					list: [
						'<div class="em-widget-list-btns">'
							+ '<button class="em-widget-list-btn bg-hover-color js_satisfybtn" data-inviteid="'
							+ msg.ext.weichat.ctrlArgs.inviteId
							+ '" data-servicesessionid="'
							+ msg.ext.weichat.ctrlArgs.serviceSessionId
							+ '">立即评价</button></div>'
						]
				});

				if (!isHistory) {
					// 创建隐藏的立即评价按钮，并触发click事件
					var el = document.createElement('BUTTON');
					el.className = 'js_satisfybtn';
					el.style.display = 'none';
					el.setAttribute('data-inviteid', msg.ext.weichat.ctrlArgs.inviteId);
					el.setAttribute('data-servicesessionid', msg.ext.weichat.ctrlArgs.serviceSessionId);
					document.body.appendChild(el);
					utils.trigger(el, 'click');
					easemobim.textarea.blur();
				}
				break;
			case 'robotList':
				message = new WebIM.message.list();
				var list = msg.ext.msgtype.choice.items || msg.ext.msgtype.choice.list;

				if (list.length > 0) {
					str = '<div class="em-widget-list-btns">';
					for (var i = 0, l = list.length; i < l; i++) {
						if (list[i].id === 'TransferToKf') {
							str +=
								'<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js_robotbtn" data-id="' +
								list[i].id + '">' + (list[i].name || list[i]) + '</button>';
						}
						else {
							str += '<button class="em-widget-list-btn bg-hover-color js_robotbtn" data-id="' + list[i].id + '">' + (list[
								i].name || list[i]) + '</button>';
						}
					}
					str += '</div>';
				}
				message.set({ value: msg.ext.msgtype.choice.title, list: str });
				break;
			case 'robotTransfer':
				message = new WebIM.message.list();
				var ctrlArgs = msg.ext.weichat.ctrlArgs;
				var title = msg.data
					|| utils.getDataByPath(msg, 'bodies.0.msg')
					|| utils.getDataByPath(msg, 'ext.weichat.ctrlArgs.label');
				/*
					msg.data 用于处理即时消息
					msg.bodies[0].msg 用于处理历史消息
					msg.ext.weichat.ctrlArgs.label 未知是否有用，暂且保留
					此处修改为了修复取出历史消息时，转人工评价标题改变的bug
					还有待测试其他带有转人工的情况
				*/
				str = [
						'<div class="em-widget-list-btns">',
							'<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js_robotTransferBtn" ',
							'data-sessionid="' + ctrlArgs.serviceSessionId + '" ',
							'data-id="' + ctrlArgs.id + '">' + ctrlArgs.label + '</button>',
						'</div>'
					].join('');

				message.set({ value: title, list: str });
				break;
			default:
				break;
			}
			if (!isHistory) {
				// 实时消息需要处理事件
				switch (utils.getDataByPath(msg, 'ext.weichat.event.eventName')) {
					// 转接到客服
				case 'ServiceSessionTransferedEvent':
					me.handleEventStatus('transferd', msg.ext.weichat.event.eventObj);
					break;
					// 转人工或者转到技能组
				case 'ServiceSessionTransferedToAgentQueueEvent':
					me.waitListNumber.start();
					me.handleEventStatus('transfering', msg.ext.weichat.event.eventObj);
					break;
					// 会话结束
				case 'ServiceSessionClosedEvent':
					// todo: use promise to opt this code
					me.hasSentAttribute = false;
					// todo: use promise to opt this code
					me.waitListNumber.stop();
					config.agentUserId = null;
					me.stopGettingAgentStatus();
					// 还原企业头像和企业名称
					me.setEnterpriseInfo();
					// 去掉坐席状态
					me.clearAgentStatus();
					me.handleEventStatus('close');
					!utils.isTop && transfer.send({ event: _const.EVENTS.ONSESSIONCLOSED }, window.transfer.to);
					break;
					// 会话打开
				case 'ServiceSessionOpenedEvent':
					// fake: 会话接起就认为有坐席在线
					me.hasAgentOnline = true;

					// 停止轮询当前排队人数
					me.waitListNumber.stop();

					me.handleEventStatus('linked', msg.ext.weichat.event.eventObj);
					if (!me.hasSentAttribute) {
						api('getExSession', {
							id: config.user.username,
							orgName: config.orgName,
							appName: config.appName,
							imServiceNumber: config.toUser,
							tenantId: config.tenantId
						}, function (msg) {
							me.sendAttribute(msg);
						});
					}
					break;
					// 会话创建
				case 'ServiceSessionCreatedEvent':
					me.handleEventStatus('create');
					me.waitListNumber.start();
					if (!me.hasSentAttribute) {
						api('getExSession', {
							id: config.user.username,
							orgName: config.orgName,
							appName: config.appName,
							imServiceNumber: config.toUser,
							tenantId: config.tenantId
						}, function (msg) {
							me.sendAttribute(msg);
						});
					}
					break;
				default:
					var agent = utils.getDataByPath(msg, 'ext.weichat.agent');
					agent && me.handleEventStatus('reply', agent);
					break;
				}
			}
			if (!message || !message.value) {
				// 空消息不显示
			}
			else if (isHistory) {
				// 历史消息仅上屏
				me.appendMsg(msg.from, msg.to, message, true);
			}
			else {
				if (!msg.noprompt) {
					me.messagePrompt(message);
				}
				me.appendDate(new Date().getTime(), msg.from);
				me.resetSpan();
				// 	给收到的消息加id，用于撤回消息
				message.id = msgId;
				me.appendMsg(msg.from, msg.to, message);
				me.scrollBottom(50);

				// 收消息回调
				!utils.isTop && transfer.send({
					event: _const.EVENTS.ONMESSAGE,
					data: {
						from: msg.from,
						to: msg.to,
						message: message
					}
				}, window.transfer.to);
			}
		},

		listen: function (option) {
			var opt = option || { receiveMessage: true };
			var handlers = {
				onOpened: function (info) {
					// 连接未超时，清除timer，暂不开启api通道发送消息
					clearTimeout(firstTS);

					me.reOpen && clearTimeout(me.reOpen);
					me.token = info.accessToken;
					me.conn.setPresence();

					me.handleReady(info);
				},
				onTextMessage: function (message) {
					me.receiveMsg(message, 'txt');
				},
				onEmojiMessage: function (message) {
					me.receiveMsg(message, 'emoji');
				},
				onPictureMessage: function (message) {
					me.receiveMsg(message, 'img');
				},
				onFileMessage: function (message) {
					me.receiveMsg(message, 'file');
				},
				onCmdMessage: function (message) {
					me.receiveMsg(message, 'cmd');
				},
				onOnline: function () {
					utils.isMobile && me.open();
				},
				onOffline: function () {
					utils.isMobile && me.conn.close();
					// for debug
					console.log('onOffline-channel');
					// 断线关闭视频通话
					if (Modernizr.peerconnection) {
						easemobim.videoChat.onOffline();
					}
					// todo 断线后停止轮询坐席状态
					// me.stopGettingAgentStatus();
				},
				onError: function (e) {
					if (e.reconnect) {
						me.open();
					}
					else if (e.type === _const.IM.WEBIM_CONNCTION_AUTH_ERROR) {
						me.reOpen || (me.reOpen = setTimeout(function () {
							me.open();
						}, 2000));
					}
					else if (
						e.type === _const.IM.WEBIM_CONNCTION_OPEN_ERROR
						&& e.data.type === _const.IM.WEBIM_CONNCTION_AJAX_ERROR
						&& /user not found/.test(e.data.data)
						&& config.isUsernameFromCookie
					) {
						// 偶发创建用户失败，但依然可以获取到密码的情况，此时需要重新创建用户
						// 仅当用户名从cookie中取得时才会重新创建用户，客户集成指定用户错误不管
						console.warn(e.data);
						easemobim.reCreateImUser();
					}
					// im sdk 会捕获 receiveMsg 回调中的异常，需要把出错信息打出来
					else if (e.type === _const.IM.WEBIM_CONNCTION_CALLBACK_INNER_ERROR) {
						console.error(e.data);
					}
					else {
						console.warn(e);
						//me.conn.stopHeartBeat(me.conn);
						typeof config.onerror === 'function' && config.onerror(e);
					}
				}
			};

			if (!opt.receiveMessage) {
				delete handlers.onTextMessage;
				delete handlers.onEmojiMessage;
				delete handlers.onPictureMessage;
				delete handlers.onFileMessage;
				delete handlers.onCmdMessage;
			}

			me.conn.listen(handlers);
		},

		handleHistory: function (chatHistory) {
			_.each(chatHistory, function (element, index) {
				var msgBody = element.body;
				var msg = utils.getDataByPath(msgBody, 'bodies.0');
				var isSelf = msgBody.from === config.user.username;

				if (!msg) return;
				if (isSelf) {
					//visitors' msg
					switch (msg.type) {
					case 'img':
						msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
						msg.to = msgBody.to;
						me.channel.sendImg(msg, true);
						break;
					case 'file':
						msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
						msg.to = msgBody.to;
						// 此处后端无法取得正确的文件大小，故不读取
						// msg.filesize = msg.file_length;
						me.channel.sendFile(msg, true);
						break;
					case 'txt':
						me.channel.sendText(msg.msg, true);
						break;
					}
				}
				//agents' msg
				else if (utils.getDataByPath(msgBody, 'ext.weichat.ctrlType') === 'inviteEnquiry') {
					// 满意度调查的消息，第二通道会重发此消息，需要msgId去重
					msgBody.msgId = element.msgId;
					me.receiveMsg(msgBody, '', true);
				}
				else if (
					utils.getDataByPath(msgBody, 'ext.msgtype.choice')
					|| utils.getDataByPath(msgBody, 'ext.weichat.ctrlType') === 'TransferToKfHint'
				) {
					// 机器人自定义菜单，机器人转人工
					me.receiveMsg(msgBody, '', true);
				}
				else if (utils.getDataByPath(msgBody, 'ext.weichat.recall_flag') === 1) {
					// 已撤回消息，不处理
					return;
				}
				else {
					me.receiveMsg({
						msgId: element.msgId,
						data: msg.type === 'txt' ? me.getSafeTextValue(msgBody) : msg.msg,
						filename: msg.filename,
						file_length: msg.file_length,
						url: /^http/.test(msg.url) ? msg.url : config.base + msg.url,
						from: msgBody.from,
						to: msgBody.to
					}, msg.type, true);
				}

				if (
					// 非cmd消息, 非空文本消息, 非重复消息，非撤回消息
					msg.type !== 'cmd'
					&& (msg.type !== 'txt' || msg.msg)
					&& !receiveMsgSite.get(element.msgId)
				) {
					me.appendDate(element.timestamp || msgBody.timestamp, isSelf ? msgBody.to : msgBody.from, true);
				}
			});
		},
		initSecondChannle: function () {
			me.receiveMsgTimer = setInterval(_receiveMsgChannel, _const.SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL);
		}
	};

	// 第二通道收消息
	function _receiveMsgChannel() {
		api('receiveMsgChannel', {
			orgName: config.orgName,
			appName: config.appName,
			easemobId: config.toUser,
			tenantId: config.tenantId,
			visitorEasemobId: config.user.username
		}, function (msg) {
			//处理收消息
			msg.data
				&& msg.data.status === 'OK'
				&& _.each(msg.data.entities, function (elem) {
					try {
						_obj.handleReceive(elem, elem.bodies[0].type, false);
					}
					catch (e) {}
				});
		});
	}

	// 第二通道发消息
	function _sendMsgChannle(msg, retryCount) {
		var count;
		var id = msg.id;

		if (typeof retryCount === 'number') {
			count = retryCount;
		}
		else {
			count = _const.SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT;
		}
		api('sendMsgChannel', {
			from: config.user.username,
			to: config.toUser,
			tenantId: config.tenantId,
			bodies: [{
				type: 'txt',
				msg: msg.value,
			}],
			ext: msg.body ? msg.body.ext : null,
			orgName: config.orgName,
			appName: config.appName,
			originType: 'webim'
		}, function () {
			//发送成功清除
			_clearTS(id);
		}, function () {
			//失败继续重试
			if (count > 0) {
				_sendMsgChannle(msg, --count);
			}
			else {
				utils.addClass(document.getElementById(id + '_loading'), 'hide');
				utils.removeClass(document.getElementById(id + '_failed'), 'hide');
			}
		});
	}

	//消息发送成功，清除timer
	function _clearTS(id) {
		clearTimeout(ackTS.get(id));
		ackTS.remove(id);

		utils.$Remove(document.getElementById(id + '_loading'));
		utils.$Remove(document.getElementById(id + '_failed'));

		if (sendMsgSite.get(id)) {
			me.handleEventStatus(null, null, sendMsgSite.get(id).value === '转人工' || sendMsgSite.get(id).value === '转人工客服');
		}

		sendMsgSite.remove(id);
	}

	//监听ack，超时则开启api通道, 发消息时调用
	function _detectSendMsgByApi(id) {
		ackTS.set(
			id,
			setTimeout(function () {
				//30s没收到ack使用api发送
				_sendMsgChannle(sendMsgSite.get(id));
			}, _const.FIRST_CHANNEL_MESSAGE_TIMEOUT)
		);
	}

	// 初始监听xmpp的timer, xmpp连接超时则按钮变为发送
	var firstTS = setTimeout(function () {
		me.handleReady();
	}, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

	return _obj;
};

// 视频邀请确认对话框
easemobim.ui = {};
easemobim.ui.videoConfirmDialog = Modernizr.peerconnection && (function () {
	var dialog = document.querySelector('div.em-dialog-video-confirm');
	var buttonPanel = dialog.querySelector('div.button-panel');
	var btnConfirm = dialog.querySelector('.btn-confirm');
	var btnCancel = dialog.querySelector('.btn-cancel');
	var confirmCallback = null;
	var cancelCallback = null;

	buttonPanel.addEventListener('click', function (evt) {
		var className = evt.target.className;

		if (~className.indexOf('btn-cancel')) {
			'function' === typeof cancelCallback && cancelCallback();
		}
		else if (~className.indexOf('btn-confirm')) {
			'function' === typeof confirmCallback && confirmCallback();
		}
		else {
			return;
		}
		confirmCallback = null;
		cancelCallback = null;
		_hide();
	}, false);

	function _show() {
		dialog.classList.remove('hide');
	}

	function _hide() {
		dialog.classList.add('hide');
	}

	function _init(confirm, cancel) {
		confirmCallback = confirm;
		cancelCallback = cancel;
		_show();
	}
	return {
		show: _show,
		hide: _hide,
		init: _init
	};
}());

easemobim.videoChat = (function (dialog) {
	var imChat = document.getElementById('em-kefu-webim-chat');
	var btnVideoInvite = document.querySelector('.em-video-invite');
	var videoWidget = document.querySelector('.em-widget-video');
	var dialBtn = videoWidget.querySelector('.btn-accept-call');
	var ctrlPanel = videoWidget.querySelector('.toolbar-control');
	var subVideoWrapper = videoWidget.querySelector('.sub-win');
	var mainVideo = videoWidget.querySelector('video.main');
	var subVideo = videoWidget.querySelector('video.sub');

	var config = null;
	var call = null;
	var sendMessageAPI = null;
	var localStream = null;
	var remoteStream = null;

	var statusTimer = {
		timer: null,
		counter: 0,
		prompt: videoWidget.querySelector('.status p.prompt'),
		timeSpan: videoWidget.querySelector('.status p.time-escape'),
		start: function (prompt) {
			var me = this;
			me.counter = 0;
			me.prompt.innerHTML = prompt;
			me.timeSpan.innerHTML = '00:00';
			me.timer = setInterval(function () {
				me.timeSpan.innerHTML = format(++me.counter);
			}, 1000);

			function format(second) {
				return (new Date(second * 1000))
					.toISOString()
					.slice(-'00:00.000Z'.length)
					.slice(0, '00:00'.length);
			}
		},
		stop: function () {
			var me = this;
			clearInterval(me.timer);
		}
	};

	var closingTimer = {
		isConnected: false,
		timer: null,
		delay: 3000,
		closingPrompt: videoWidget.querySelector('.full-screen-prompt'),
		timeSpan: videoWidget.querySelector('.full-screen-prompt p.time-escape'),
		show: function () {
			var me = this;
			if (me.isConnected) {
				me.timeSpan.innerHTML = statusTimer.timeSpan.innerHTML;
			}
			else {
				me.timeSpan.innerHTML = '00:00';
			}
			me.closingPrompt.classList.remove('hide');
			setTimeout(function () {
				imChat.classList.remove('has-video');
				me.closingPrompt.classList.add('hide');
			}, me.delay);
		}
	};

	var endCall = function () {
		statusTimer.stop();
		closingTimer.show();
		localStream && localStream.getTracks().forEach(function (track) {
			track.stop();
		});
		remoteStream && remoteStream.getTracks().forEach(function (track) {
			track.stop();
		});
		mainVideo.src = '';
		subVideo.src = '';
	};

	var events = {
		'btn-end-call': function () {
			try {
				call.endCall();
			}
			catch (e) {
				console.error('end call:', e);
			}
			finally {
				endCall();
			}
		},
		'btn-accept-call': function () {
			closingTimer.isConnected = true;
			dialBtn.classList.add('hide');
			ctrlPanel.classList.remove('hide');
			subVideoWrapper.classList.remove('hide');
			statusTimer.stop();
			statusTimer.start('视频通话中');
			call.acceptCall();
		},
		'btn-toggle': function () {
			localStream && localStream.getVideoTracks().forEach(function (track) {
				track.enabled = !track.enabled;
			});
		},
		'btn-change': function () {
			var tmp;

			tmp = subVideo.src;
			subVideo.src = mainVideo.src;
			mainVideo.src = tmp;
			subVideo.play();
			mainVideo.play();

			subVideo.muted = !subVideo.muted;
			mainVideo.muted = !mainVideo.muted;
		},
		'btn-minimize': function () {
			videoWidget.classList.add('minimized');
		},
		'btn-maximize': function () {
			videoWidget.classList.remove('minimized');
		}
	};


	function sendVideoInvite() {
		console.log('send video invite');
		sendMessageAPI('邀请客服进行实时视频', false, {
			ext: {
				type: 'rtcmedia/video',
				msgtype: {
					liveStreamInvitation: {
						msg: '邀请客服进行实时视频',
						orgName: config.orgName,
						appName: config.appName,
						userName: config.user.username,
						resource: 'webim'
					}
				}
			}
		});
	}

	function init(conn, sendMessage, cfg) {
		sendMessageAPI = sendMessage;
		config = cfg;

		// 视频组件初始化
		// 直接操作style是为了避免video标签在加载时一闪而过，影响体验
		videoWidget.style.display = '';
		// 按钮初始化
		btnVideoInvite.classList.remove('hide');
		btnVideoInvite.addEventListener('click', function () {
			dialog.init(sendVideoInvite);
		}, false);

		// 视频组件事件绑定
		videoWidget.addEventListener('click', function (evt) {
			var className = evt.target.className;

			Object.keys(events).forEach(function (key) {
				~className.indexOf(key) && events[key]();
			});
		}, false);

		call = new WebIM.WebRTC.Call({
			connection: conn,

			mediaStreamConstaints: {
				audio: true,
				video: true
			},

			listener: {
				onAcceptCall: function (from, options) {
					console.log('onAcceptCall', from, options);
				},
				onGotRemoteStream: function (stream) {
					// for debug
					console.log('onGotRemoteStream', stream);
					mainVideo.src = URL.createObjectURL(stream);
					remoteStream = stream;
					mainVideo.play();
				},
				onGotLocalStream: function (stream) {
					// for debug
					console.log('onGotLocalStream', stream);
					subVideo.src = URL.createObjectURL(stream);
					localStream = stream;
					subVideo.play();
				},
				onRinging: function (caller) {
					// for debug
					console.log('onRinging', caller);
					// init
					subVideo.muted = true;
					mainVideo.muted = false;
					closingTimer.isConnected = false;

					subVideoWrapper.classList.add('hide');
					ctrlPanel.classList.add('hide');
					imChat.classList.add('has-video');
					statusTimer.start('视频连接请求，等待你的确认');
					dialBtn.classList.remove('hide');
				},
				onTermCall: function () {
					// for debug
					console.log('onTermCall');
					endCall();
				},
				onError: function (e) {
					console.log(e && e.message ? e.message : 'An error occured when calling webrtc');
				}
			}
		});
	}

	return {
		init: init,
		onOffline: function () {
			// for debug
			console.log('onOffline');
			endCall();
		}
	};
}(easemobim.ui.videoConfirmDialog));

(function () {
	easemobim.chat = function (config) {
		var utils = easemobim.utils;
		var _const = easemobim._const;
		var api = easemobim.api;

		//DOM init
		easemobim.imBtn = document.getElementById('em-widgetPopBar');
		easemobim.imChat = document.getElementById('em-kefu-webim-chat');
		easemobim.imChatBody = document.getElementById('em-widgetBody');
		easemobim.send = document.getElementById('em-widgetSend');
		easemobim.textarea = easemobim.send.querySelector('.em-widget-textarea');
		easemobim.sendBtn = easemobim.send.querySelector('.em-widget-send');
		easemobim.sendImgBtn = easemobim.send.querySelector('.em-widget-img');
		easemobim.sendFileBtn = easemobim.send.querySelector('.em-widget-file');
		easemobim.noteBtn = document.querySelector('.em-widget-note');
		easemobim.dragHeader = document.getElementById('em-widgetDrag');
		easemobim.dragBar = easemobim.dragHeader.querySelector('.drag-bar');
		easemobim.avatar = document.querySelector('.em-widgetHeader-portrait');
		easemobim.swfupload = null; //flash 上传

		// todo: 把dom都移到里边
		var doms = {
			agentStatusText: document.querySelector('.em-header-status-text'),
			//待接入排队人数显示
			agentWaitNumber: document.querySelector('.em-header-status-text-queue-number'),
			agentStatusSymbol: document.getElementById('em-widgetAgentStatus'),
			nickname: document.querySelector('.em-widgetHeader-nickname'),
			imgInput: document.querySelector('.upload-img-container'),
			fileInput: document.querySelector('.upload-file-container'),
			emojiContainer: document.querySelector('.em-bar-emoji-container'),
			chatWrapper: document.querySelector('.em-widget-chat'),
			emojiWrapper: document.querySelector('.em-bar-emoji-wrapper'),
			emojiBtn: easemobim.send.querySelector('.em-bar-emoji'),
			block: null
		};

		easemobim.doms = doms;


		//cache current agent
		config.agentUserId = null;

		//chat window object
		return {
			init: function () {

				this.channel = easemobim.channel.call(this, config);

				//create & init connection
				this.conn = this.channel.getConnection();
				//sroll bottom timeout stamp
				this.scbT = 0;
				//just show date label once in 1 min
				this.msgTimeSpan = {};
				//chat window status
				this.opened = true;
				//init sound reminder
				this.soundReminder();

				this.initEmoji();
				//bind events on dom
				this.bindEvents();
			},
			handleReady: function (info) {
				var me = this;

				if (me.readyHandled) return;

				me.readyHandled = true;
				easemobim.sendBtn.innerHTML = '发送';
				utils.trigger(easemobim.textarea, 'change');

				// bug fix:
				// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
				if (config.minimum === false || config.eventCollector === true) {
					transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
				}
				if (info && config.user) {
					config.user.token = config.user.token || info.accessToken;
				}

				easemobim.leaveMessage && easemobim.leaveMessage.auth(me.token, config);

				// 发送用于回呼访客的命令消息
				if (this.cachedCommandMessage) {
					me.channel.sendText('', false, this.cachedCommandMessage);
					this.cachedCommandMessage = null;
				}
				if (utils.isTop) {
					//get visitor
					var visInfo = config.visitor;
					var prefix = (config.tenantId || '') + (config.emgroup || '');

					if (!visInfo) {
						visInfo = utils.getStore(prefix + 'visitor');
						try {
							config.visitor = JSON.parse(visInfo);
						}
						catch (e) {}
						utils.clearStore(config.tenantId + config.emgroup + 'visitor');
					}

					//get ext
					var ext = utils.getStore(prefix + 'ext');
					var parsed;
					try {
						parsed = JSON.parse(ext);
					}
					catch (e) {}
					if (parsed) {
						me.channel.sendText('', false, { ext: parsed });
						utils.clearStore(config.tenantId + config.emgroup + 'ext');
					}
				}
				else {
					transfer.send({ event: _const.EVENTS.ONREADY }, window.transfer.to);
				}
			},
			setExt: function (msg) {
				msg.body.ext = msg.body.ext || {};
				msg.body.ext.weichat = msg.body.ext.weichat || {};

				//bind skill group
				if (config.emgroup) {
					msg.body.ext.weichat.queueName = decodeURIComponent(config.emgroup);
				}

				//bind visitor
				if (config.visitor) {
					msg.body.ext.weichat.visitor = config.visitor;
				}

				//bind agent
				if (config.agentName) {
					msg.body.ext.weichat.agentUsername = config.agentName;
				}

				//set language
				if (config.language) {
					msg.body.ext.weichat.language = config.language;
				}

				//set growingio id
				if (config.grUserId) {
					msg.body.ext.weichat.visitor = msg.body.ext.weichat.visitor || {};
					msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
				}
			},
			ready: function () {
				var me = this;

				// 获取上下班状态
				getDutyStatusPromise = new Promise(function (resolve, reject) {
					api('getDutyStatus_2', {
						channelType: 'easemob',
						originType: 'webim',
						channelId: config.channelId,
						tenantId: config.tenantId,
						queueName: config.emgroup,
						agentUsername: config.agentName
					}, function (msg) {
						config.isInOfficehours = !msg.data.entity || config.offDutyType === 'chat';
						resolve();
					}, function (err) {
						reject(err);
					});
				});

				// 获取灰度开关
				getGrayListPromise = new Promise(function (resolve, reject) {
					api('graylist', {}, function (msg) {
						var grayList = {};
						var data = msg.data || {};
						_.each([
							'audioVideo',
							'msgPredictEnable',
							'waitListNumberEnable'
						], function (key) {
							grayList[key] = _.contains(data[key], +config.tenantId);
						});
						config.grayList = grayList;
						resolve();
					}, function (err) {
						reject(err);
					});
				});

				Promise.all([
					getDutyStatusPromise,
					getGrayListPromise
				]).then(function () {
					init();
				}, function (err) {
					throw err;
				});

				function init() {
					// 设置企业信息
					me.setEnterpriseInfo();

					// 显示广告条
					config.logo && me.setLogo();

					// 移动端输入框自动增长
					utils.isMobile && me.initAutoGrow();

					// 添加sdk回调，下班时不收消息
					me.channel.listen({ receiveMessage: config.isInOfficehours });

					// 连接xmpp server，下班留言需要获取token，同样需要连接xmpp server
					me.open();

					if (config.isInOfficehours) {
						// 设置信息栏
						me.setNotice();

						// get service serssion info
						me.getSession();

						// 获取坐席昵称设置
						me.getNickNameOption();

						// 拉取历史消息
						!config.isNewUser && !me.hasGotHistoryMsg && me.getHistory(function () {
							me.scrollBottom();
							me.hasGotHistoryMsg = true;
						});

						// 初始化历史消息拉取
						!config.isNewUser && me.initHistoryPuller();

						// 待接入排队人数显示
						me.waitListNumber.start();

						// 第二通道收消息初始化
						me.channel.initSecondChannle();
					}
					else {
						// 设置下班时间展示的页面
						me.setOffline();
					}
				}
			},
			initAutoGrow: function () {
				var me = this;
				var originHeight = easemobim.textarea.clientHeight;

				if (me.isAutoGrowInitialized) return;
				me.isAutoGrowInitialized = true;

				utils.on(easemobim.textarea, 'input change', update);

				function update() {
					var height = this.value ? this.scrollHeight : originHeight;
					this.style.height = height + 'px';
					this.scrollTop = 9999;
					callback();
				}

				function callback() {
					var height = easemobim.send.getBoundingClientRect().height;
					if (me.direction === 'up') {
						doms.emojiWrapper.style.top = 43 + height + 'px';
					}
					else {
						easemobim.imChatBody.style.bottom = height + 'px';
						doms.emojiWrapper.style.bottom = height + 'px';
					}
					me.scrollBottom(800);
				}
			},
			initHistoryPuller: function () {
				var me = this;
				//pc 和 wap 的上滑加载历史记录的方法
				(function () {
					var st;
					var _startY;
					var _y;
					var touch;

					//wap
					utils.live('div.em-widget-date', 'touchstart', function (ev) {
						var touch = ev.touches;

						if (ev.touches && ev.touches.length > 0) {
							_startY = touch[0].pageY;
						}
					});
					utils.live('div.em-widget-date', 'touchmove', function (ev) {
						var touch = ev.touches;

						if (ev.touches && ev.touches.length > 0) {
							_y = touch[0].pageY;
							if (_y - _startY > 8 && this.getBoundingClientRect().top >= 0) {
								clearTimeout(st);
								st = setTimeout(function () {
									me.getHistory();
								}, 100);
							}
						}
					});

					// pc端
					utils.on(doms.chatWrapper, 'mousewheel DOMMouseScroll', function (ev) {
						var that = this;

						if (ev.wheelDelta / 120 > 0 || ev.detail < 0) {
							clearTimeout(st);
							st = setTimeout(function () {
								if (that.getBoundingClientRect().top >= 0) {
									me.getHistory();
								}
							}, 400);
						}
					});
				}());
			},
			getHistory: function (callback) {
				var me = this;
				var groupid = me.groupId;
				var currHistoryMsgSeqId = me.currHistoryMsgSeqId || 0;

				if (me.hasHistoryMessage === false) return;
				if (groupid) {
					api('getHistory', {
						fromSeqId: currHistoryMsgSeqId,
						size: _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME,
						chatGroupId: groupid,
						tenantId: config.tenantId
					}, function (msg) {
						var historyMsg = msg.data || [];
						var earliestMsg = historyMsg[historyMsg.length - 1] || {};
						var nextMsgSeq = earliestMsg.chatGroupSeqId - 1;

						me.currHistoryMsgSeqId = nextMsgSeq;
						me.hasHistoryMessage = nextMsgSeq > 0;
						me.channel.handleHistory(historyMsg);
						typeof callback === 'function' && callback();
					});
				}
				else {
					api('getGroupNew', {
						id: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						imServiceNumber: config.toUser,
						tenantId: config.tenantId
					}, function (msg) {
						if (msg.data) {
							me.groupId = msg.data;
							me.getHistory(callback);
						}
					});
				}
			},
			getGreeting: function () {
				var me = this;

				if (me.greetingGetted) return;

				me.greetingGetted = true;

				//system greeting
				api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function (msg) {
					var systemGreetingText = msg.data;
					systemGreetingText && me.receiveMsg({
						ext: {
							weichat: {
								html_safe_body: {
									msg: systemGreetingText
								}
							}
						},
						type: 'txt',
						noprompt: true
					}, 'txt');

					//robert greeting
					api('getRobertGreeting_2', {
						channelType: 'easemob',
						originType: 'webim',
						channelId: config.channelId,
						tenantId: config.tenantId,
						agentUsername: config.agentName,
						queueName: config.emgroup,
						query: decodeURIComponent(utils.query('query')),
						size: decodeURIComponent(utils.query('size')),
					}, function (msg) {
						var greetingTextType = utils.getDataByPath(msg, 'data.entity.greetingTextType');
						var greetingText = utils.getDataByPath(msg, 'data.entity.greetingText');
						var greetingObj = {};
						if (typeof greetingTextType !== 'number') return;

						switch (greetingTextType) {
						case 0:
							// robert text greeting
							me.receiveMsg({
								ext: {
									weichat: {
										html_safe_body: {
											msg: greetingText
										}
									}
								},
								type: 'txt',
								noprompt: true
							}, 'txt');
							break;
						case 1:
							// robert list greeting
							try {
								greetingObj = JSON.parse(greetingText.replace(/&amp;quot;/g, '"'));
							}
							catch (e){
								console.warn('unexpected JSON string.', e);
							}

							if (greetingObj.ext) {
								me.receiveMsg({
									ext: greetingObj.ext,
									noprompt: true
								});
							}
							else {
								console.warn('The menu does not exist.');
							}
							break;
						default:
							console.warn('unknown greeting type.');
							break;
						}
					});
				});
			},
			getNickNameOption: function () {
				api('getNickNameOption', {
					tenantId: config.tenantId
				}, function (msg) {
					config.nickNameOption = utils.getDataByPath(msg, 'data.0.optionValue') === 'true';
				});
			},
			getSession: function () {
				var me = this;

				api('getExSession', {
					id: config.user.username,
					orgName: config.orgName,
					appName: config.appName,
					imServiceNumber: config.toUser,
					tenantId: config.tenantId
				}, function (msg) {
					var data = msg.data || {};
					var serviceSession = data.serviceSession;

					me.hasHumanAgentOnline = data.onlineHumanAgentCount > 0;
					me.hasAgentOnline = data.onlineHumanAgentCount + data.onlineRobotAgentCount > 0;

					if (serviceSession) {
						config.agentUserId = serviceSession.agentUserId;
						// 确保正在进行中的会话，刷新后还会继续轮询坐席状态
						me.startToGetAgentStatus();
						me.sendAttribute(msg);
					}
					else {
						// 仅当会话不存在时获取欢迎语
						me.getGreeting();
					}
				});
			},
			sendAttribute: function (msg) {
				var visitorUserId = utils.getDataByPath(msg, 'data.serviceSession.visitorUser.userId');
				if (!this.hasSentAttribute && visitorUserId) {
					this.hasSentAttribute = true;
					// 缓存 visitorUserId
					config.visitorUserId = visitorUserId;
					api('sendVisitorInfo', {
						tenantId: config.tenantId,
						visitorId: visitorUserId,
						referer: document.referrer
					});
				}
			},
			setEnterpriseInfo: function () {
				this.setAgentProfile({
					tenantName: config.defaultAgentName,
					avatar: config.tenantAvatar
				});
			},
			startToGetAgentStatus: function () {
				var me = this;

				if (config.agentStatusTimer) return;

				// start to poll
				config.agentStatusTimer = setInterval(function () {
					me.updateAgentStatus();
				}, 5000);
			},
			stopGettingAgentStatus: function () {
				config.agentStatusTimer = clearInterval(config.agentStatusTimer);
			},
			clearAgentStatus: function () {
				doms.agentStatusSymbol.className = 'hide';
				doms.agentStatusText.innerText = '';
			},
			updateAgentStatus: function () {
				var me = this;

				if (!config.agentUserId || !config.nickNameOption || !config.user.token) {
					me.stopGettingAgentStatus();
					return;
				}

				api('getAgentStatus', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					agentUserId: config.agentUserId,
					userName: config.user.username,
					token: config.user.token,
					imServiceNumber: config.toUser
				}, function (msg) {
					var state = utils.getDataByPath(msg, 'data.state');

					if (state) {
						doms.agentStatusText.innerText = _const.agentStatusText[state];
						doms.agentStatusSymbol.className = 'em-widget-agent-status ' + _const.agentStatusClassName[state];
					}
				});
			},
			waitListNumber: (function () {

				var isStarted = false;
				var timer = null;
				var prevTime = 0;

				function _start() {
					if (!config.grayList.waitListNumberEnable) return;

					isStarted = true;
					// 保证当前最多只有1个timer
					// 每次调用start都必须重新获取queueId
					clearInterval(timer);
					api('getSessionQueueId', {
						tenantId: config.tenantId,
						visitorUsername: config.user.username,
						techChannelInfo: config.orgName + '%23' + config.appName + '%23' + config.toUser
					}, function (resp) {
						var nowData = resp.data.entity;
						var queueId;
						var sessionId;

						if (nowData && nowData.state === 'Wait') {
							queueId = nowData.queueId;
							sessionId = nowData.serviceSessionId;
							// 避免请求在 轮询停止以后回来 而导致误开始
							// todo: use promise to optimize it
							if (isStarted) {
								timer = setInterval(function () {
									getWaitNumber(queueId, sessionId);
								}, 1000);
							}
						}
					});
				}

				function getWaitNumber(queueId, sessionId) {
					api('getWaitListNumber', {
						tenantId: config.tenantId,
						queueId: queueId,
						serviceSessionId: sessionId
					}, function (resp) {
						var nowData = resp.data.entity;
						if (nowData.visitorUserWaitingNumber === 'no') {
							utils.addClass(doms.agentWaitNumber, 'hide');
						}
						else if (nowData.visitorUserWaitingTimestamp > prevTime) {
							prevTime = nowData.visitorUserWaitingTimestamp;
							utils.removeClass(doms.agentWaitNumber, 'hide');
							doms.agentWaitNumber.querySelector('label').innerHTML = nowData.visitorUserWaitingNumber;
						}
						else {}
					});
				}

				function _stop() {
					clearInterval(timer);
					prevTime = 0;
					isStarted = false;
					utils.addClass(doms.agentWaitNumber, 'hide');
				}
				return {
					start: _start,
					stop: _stop
				};
			}()),
			setAgentProfile: function (info) {
				var avatarImg = info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.tenantAvatar ||
					config.defaultAvatar;

				if (info.tenantName) {
					// 更新企业头像和名称
					doms.nickname.innerText = info.tenantName;
					easemobim.avatar.src = avatarImg;
				}
				else if (
					info.userNickname
					// 昵称启用
					&& config.nickNameOption
					// fake: 默认不显示调度员昵称
					&& '调度员' !== info.userNickname
				) {
					//更新坐席昵称
					doms.nickname.innerText = info.userNickname;
					if (avatarImg) {
						easemobim.avatar.src = avatarImg;
					}
				}

				// 缓存头像地址
				this.currentAvatar = avatarImg;
			},
			setLogo: function () {
				utils.removeClass(document.querySelector('.em-widget-tenant-logo'), 'hide');
				document.querySelector('.em-widget-tenant-logo img').src = config.logo;
			},
			setNotice: function () {
				var me = this;

				if (me.sloganGot) return;
				me.sloganGot = true;

				api('getSlogan', {
					tenantId: config.tenantId
				}, function (msg) {
					var slogan = utils.getDataByPath(msg, 'data.0.optionValue');
					if (slogan) {
						// 设置信息栏内容
						document.querySelector('.em-widget-tip .content').innerHTML = WebIM.utils.parseLink(slogan);
						// 显示信息栏
						utils.addClass(easemobim.imChat, 'has-tip');

						// 隐藏信息栏按钮
						utils.on(
							document.querySelector('.em-widget-tip .tip-close'),
							utils.click,
							function () {
								// 隐藏信息栏
								utils.removeClass(easemobim.imChat, 'has-tip');
							}
						);
					}
				});
			},
			initEmoji: function () {
				var me = this;

				utils.on(doms.emojiBtn, utils.click, function () {
					easemobim.textarea.blur();
					utils.toggleClass(doms.emojiWrapper, 'hide');

					// 懒加载，打开表情面板时才初始化图标
					if (!me.isEmojiInitilized) {
						me.isEmojiInitilized = true;
						doms.emojiContainer.innerHTML = genHtml();
					}
				});

				// 表情的选中
				utils.live('img.emoji', utils.click, function (e) {
					!utils.isMobile && easemobim.textarea.focus();
					easemobim.textarea.value += this.getAttribute('data-value');
					utils.trigger(easemobim.textarea, 'change');
				}, doms.emojiWrapper);

				// todo: kill .e-face to make it more elegant
				// ie8 does not support stopPropagation -_-||
				// 点击别处时隐藏表情面板
				utils.on(document, utils.click, function (ev) {
					var e = window.event || ev;
					var target = e.srcElement || e.target;

					if (!utils.hasClass(target, 'e-face')) {
						utils.addClass(doms.emojiWrapper, 'hide');
					}
				});

				function genHtml() {
					var path = WebIM.Emoji.path;
					var EMOJI_COUNT_PER_LINE = 7;

					return _.chain(WebIM.Emoji.map)
						// 生成图标html
						.map(function (value, key) {
							return '<div class="em-bar-emoji-bg e-face">'
								+ '<img class="e-face emoji" src="'
								+ path + value
								+ '" data-value=' + key + ' />'
								+ '</div>';
						})
						// 按照下标分组
						.groupBy(function (elem, index) {
							return Math.floor(index / EMOJI_COUNT_PER_LINE);
						})
						// 增加wrapper
						.map(function (elem) {
							return '<li class="e-face">' + elem.join('') + '</li>';
						})
						// 结束链式调用
						.value()
						// 把数组拼接成字符串
						.join('');
				}
			},
			errorPrompt: function (msg, isAlive) { //暂时所有的提示都用这个方法
				var me = this;

				if (!me.ePrompt) me.ePrompt = document.querySelector('.em-widget-error-prompt');
				if (!me.ePromptContent) me.ePromptContent = me.ePrompt.querySelector('span');

				me.ePromptContent.innerHTML = msg;
				utils.removeClass(me.ePrompt, 'hide');
				isAlive || setTimeout(function () {
					utils.addClass(me.ePrompt, 'hide');
				}, 2000);
			},
			getSafeTextValue: function (msg) {
				return utils.getDataByPath(msg, 'ext.weichat.html_safe_body.msg')
					|| utils.getDataByPath(msg, 'bodies.0.msg')
					|| '';
			},
			setOffline: function () {
				switch (config.offDutyType) {
				case 'none':
					// 下班禁止留言、禁止接入会话
					var word = config.offDutyWord || '现在是下班时间。';

					// todo: move this code to fronter place
					try {
						word = decodeURIComponent(word);
					}
					catch (e) {}

					var msg = new WebIM.message.txt();
					msg.set({ msg: word });
					// 显示下班提示语
					this.appendMsg(config.toUser, config.user.username, msg);
					// 禁用工具栏
					utils.addClass(easemobim.send, 'em-widget-send-disable');
					// 发送按钮去掉连接中字样
					easemobim.sendBtn.innerHTML = '发送';
					break;
				default:
					// 只允许留言此时无法关闭留言页面
					easemobim.leaveMessage.show(!config.isInOfficehours);
					break;
				}
			},
			//close chat window
			close: function () {
				this.opened = false;

				if (!config.hide) {
					utils.addClass(easemobim.imChat, 'hide');
					utils.removeClass(easemobim.imBtn, 'hide');
				}
			},
			//show chat window
			show: function () {
				var me = this;

				me.opened = true;
				me.scrollBottom(50);
				utils.addClass(easemobim.imBtn, 'hide');
				utils.removeClass(easemobim.imChat, 'hide');
				if (
					config.isInOfficehours
					// IE 8 will throw an error when focus an invisible element
					&& easemobim.textarea.offsetHeight > 0
				) {
					easemobim.textarea.focus();
				}
				!utils.isTop && transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
			},
			appendDate: function (date, to, isHistory) {
				var chatWrapper = doms.chatWrapper;
				var dom = document.createElement('div');

				dom.innerHTML = utils.formatDate(date);
				utils.addClass(dom, 'em-widget-date');

				if (!isHistory) {
					if (to) {
						if (this.msgTimeSpan[to] && (date - this.msgTimeSpan[to] > 60000)) { //间隔大于1min  show
							chatWrapper.appendChild(dom);
						}
						this.resetSpan(to);
					}
					else {
						chatWrapper.appendChild(dom);
					}
				}
				else {
					chatWrapper.insertBefore(dom, chatWrapper.firstChild);
				}
			},
			resetSpan: function (id) {
				this.msgTimeSpan[id] = new Date().getTime();
			},
			open: function () {
				var me = this;

				var op = {
					user: config.user.username,
					appKey: config.appKey,
					apiUrl: location.protocol + '//' + config.restServer
				};

				if (config.user.token) {
					op.accessToken = config.user.token;
				}
				else {
					op.pwd = config.user.password;
				}

				me.conn.open(op);

				Modernizr.peerconnection
					&& config.grayList.audioVideo
					&& easemobim.videoChat.init(me.conn, me.channel.sendText, config);
			},
			soundReminder: function () {
				if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
					return;
				}

				var me = this;
				var audioDom = document.createElement('audio');
				var slienceSwitch = document.querySelector('.em-widgetHeader-audio');
				var isSlienceEnable = false;
				var play = _.throttle(function () {
					audioDom.play();
				}, 3000, { trailing: false });

				audioDom.src = config.staticPath + '/mp3/msg.m4a';

				//音频按钮静音
				utils.on(slienceSwitch, 'click', function () {
					isSlienceEnable = !isSlienceEnable;
					utils.toggleClass(slienceSwitch, 'icon-slience', isSlienceEnable);
					utils.toggleClass(slienceSwitch, 'icon-bell', !isSlienceEnable);
				});

				me.soundReminder = function () {
					if (!isSlienceEnable && (utils.isMin() || !me.opened)) {
						play();
					}
				};
			},
			bindEvents: function () {
				var me = this;

				if (!utils.isTop) {
					// 最小化按钮
					utils.on(document.querySelector('.em-widgetHeader-min'), 'click', function () {
						transfer.send({ event: _const.EVENTS.CLOSE }, window.transfer.to);
					});

					utils.on(easemobim.imBtn, utils.click, function () {
						transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
					});

					utils.on(document, 'mouseover', function () {
						transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
					});
				}

				utils.on(easemobim.imChatBody, 'click', function () {
					easemobim.textarea.blur();
				});

				utils.live('img.em-widget-imgview', 'click', function () {
					easemobim.imgView.show(this.getAttribute('src'));
				});

				if (config.dragenable && !utils.isTop) {

					easemobim.dragBar.style.cursor = 'move';

					utils.on(easemobim.dragBar, 'mousedown', function (ev) {
						var e = window.event || ev;
						easemobim.textarea.blur(); //ie a  ie...
						transfer.send({
							event: _const.EVENTS.DRAGREADY,
							data: {
								x: e.clientX,
								y: e.clientY
							}
						}, window.transfer.to);
						return false;
					}, false);
				}

				//resend
				utils.live('div.em-widget-msg-status', utils.click, function () {
					var id = this.getAttribute('id').slice(0, -'_failed'.length);

					utils.addClass(this, 'hide');
					utils.removeClass(document.getElementById(id + '_loading'), 'hide');
					if (this.getAttribute('data-type') === 'txt') {
						me.channel.reSend('txt', id);
					}
					else {
						me.conn.send(id);
					}
				});

				utils.live('button.js_robotTransferBtn', utils.click, function () {
					var id = this.getAttribute('data-id');
					var ssid = this.getAttribute('data-sessionid');

					// 只能评价1次
					if (!this.clicked) {
						this.clicked = true;
						me.channel.sendTransferToKf(id, ssid);
					}
				});

				//机器人列表
				utils.live('button.js_robotbtn', utils.click, function () {
					me.channel.sendText(this.innerText, null, {
						ext: {
							msgtype: {
								choice: {
									menuid: this.getAttribute('data-id')
								}
							}
						}
					});
				});

				function getStatisfyYes(robotAgentId, satisfactionCommentKey){
					return new Promise(function(resolve, reject){
						easemobim.emajax({
							url: "/v1/webimplugin/tenants/" + config.tenantId + "/robot-agents/" + robotAgentId + "/satisfaction-comment",
							data: {
								satisfactionCommentKey: satisfactionCommentKey,
								type: 1
							},
							type: "POST",
							success: function(resp){
								var parsed;

								try{
									parsed = JSON.parse(resp);
								}
								catch(e){}

								if((parsed && parsed.status) === "OK"){
									resolve(parsed.entity);
								}
								else{
									reject(parsed);
								}
							},
							error: function(e){
								reject(e);
							}
						});
					});
				}

				function getStatisfyNo(robotAgentId, satisfactionCommentKey){
					return new Promise(function(resolve, reject){
						easemobim.emajax({
							url: "/v1/webimplugin/tenants/" + config.tenantId + "/robot-agents/" + robotAgentId + "/satisfaction-comment",
							data: {
								satisfactionCommentKey: satisfactionCommentKey,
								type: 2
							},
							type: "POST",
							success: function(resp){
								var parsed;

								try{
									parsed = JSON.parse(resp);
								}
								catch(e){}

								if((parsed && parsed.status) === "OK"){
									resolve(parsed.entity);
								}
								else{
									reject(parsed);
								}
							},
							error: function(e){
								reject(e);
							}
						});
					});
				}

				// 解决
				utils.live("a.statisfyYes", "click", function(){
					var satisfactionCommentKey = this.getAttribute("data-satisfactionCommentInfo");
					var robotAgentId = this.getAttribute("data-agentId");
					apiHelper.getStatisfyYes(robotAgentId, satisfactionCommentKey).then(function(data){
						uikit.tip("谢谢");
					}, function(err){
						if(err.errorCode === "KEFU_ROBOT_INTEGRATION_0207"){
							uikit.tip("已评价");
						}
					});
				});

				// 未解决
				utils.live("a.statisfyNo", "click", function(){
					var satisfactionCommentKey = this.getAttribute("data-satisfactionCommentInfo");
					var robotAgentId = this.getAttribute("data-agentId");
					apiHelper.getStatisfyNo(robotAgentId, satisfactionCommentKey).then(function(data){
						uikit.tip("谢谢");
					}, function(err){
						if(err.errorCode === "KEFU_ROBOT_INTEGRATION_0207"){
							uikit.tip("已评价");
						}
					});
				});

				var messagePredict = _.throttle(function (msg) {
					config.agentUserId
						&& config.visitorUserId
						&& api('messagePredict', {
							tenantId: config.tenantId,
							visitor_user_id: config.visitorUserId,
							agentId: config.agentUserId,
							content: msg.slice(0, _const.MESSAGE_PREDICT_MAX_LENGTH),
							timestamp: _.now(),
						});
				}, 1000);

				function handleSendBtn() {
					var isEmpty = !easemobim.textarea.value.trim();

					utils.toggleClass(
						easemobim.sendBtn,
						'disabled', !me.readyHandled || isEmpty
					);
					config.grayList.msgPredictEnable
						&& !isEmpty
						&& messagePredict(easemobim.textarea.value);
				}

				if (Modernizr.oninput) {
					utils.on(easemobim.textarea, 'input change', handleSendBtn);
				}
				else {
					utils.on(easemobim.textarea, 'keyup change', handleSendBtn);
				}

				if (utils.isMobile) {
					var handleFocus = function () {
						easemobim.textarea.style.overflowY = 'auto';
						me.scrollBottom(800);
						// todo: kill focusText
						clearInterval(me.focusText);
						me.focusText = setInterval(function () {
							document.body.scrollTop = 10000;
						}, 100);
					};
					utils.on(easemobim.textarea, 'focus', handleFocus);
					utils.one(easemobim.textarea, 'touchstart', handleFocus);
					utils.on(easemobim.textarea, 'blur', function () {
						clearInterval(me.focusText);
					});

					// 键盘上下切换按钮
					utils.on(
						document.querySelector('.em-widgetHeader-keyboard'),
						utils.click,
						function () {
							var status = utils.hasClass(this, 'icon-keyboard-down');
							var height = easemobim.send.getBoundingClientRect().height;
							me.direction = status ? 'down' : 'up';

							utils.toggleClass(this, 'icon-keyboard-up', status);
							utils.toggleClass(this, 'icon-keyboard-down', !status);

							switch (me.direction) {
							case 'up':
								easemobim.send.style.bottom = 'auto';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = '43px';
								easemobim.imChatBody.style.bottom = '0';
								doms.emojiWrapper.style.bottom = 'auto';
								doms.emojiWrapper.style.top = 43 + height + 'px';
								break;
							case 'down':
								easemobim.send.style.bottom = '0';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = 'auto';
								easemobim.imChatBody.style.bottom = height + 'px';
								doms.emojiWrapper.style.bottom = height + 'px';
								doms.emojiWrapper.style.top = 'auto';
								me.scrollBottom(50);
								break;
							}
						}
					);
				}

				// 发送文件
				utils.on(doms.fileInput, 'change', function () {
					var fileInput = doms.fileInput;
					var filesize = utils.getDataByPath(fileInput, 'files.0.size');

					if (!fileInput.value) {
						// 未选择文件
					}
					else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
						me.errorPrompt('文件大小不能超过10MB');
					}
					else {
						me.channel.sendFile(WebIM.utils.getFileUrl(fileInput), false, fileInput);
					}
				});

				// 发送图片
				utils.on(doms.imgInput, 'change', function () {
					var fileInput = doms.imgInput;
					// ie8-9 do not support multifiles, so you can not get files
					var filesize = utils.getDataByPath(fileInput, 'files.0.size');

					if (!fileInput.value) {
						// 未选择文件
					}
					// 某些浏览器不能获取到正确的文件名，所以放弃文件类型检测
					// else if (!/\.(png|jpg|jpeg|gif)$/i.test(fileInput.value)) {
						// me.errorPrompt('不支持的图片格式');
					// }
					// 某些浏览器无法获取文件大小, 忽略
					else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
						me.errorPrompt('文件大小不能超过10MB');
						fileInput.value = '';
					}
					else {
						me.channel.sendImg(WebIM.utils.getFileUrl(fileInput), false, fileInput);
					}
				});

				//弹出文件选择框
				utils.on(easemobim.sendFileBtn, 'click', function () {
					// 发送文件是后来加的功能，无需考虑IE兼容
					if (!me.readyHandled) {
						me.errorPrompt('正在连接中...');
					}
					else {
						doms.fileInput.click();
					}
				});

				utils.on(easemobim.sendImgBtn, 'click', function () {
					if (!me.readyHandled) {
						me.errorPrompt('正在连接中...');
					}
					else {
						doms.imgInput.click();
					}
				});

				//显示留言界面
				utils.on(easemobim.noteBtn, 'click', function () {
					easemobim.leaveMessage.show();
				});

				// 回车发送消息
				utils.on(easemobim.textarea, 'keydown', function (evt) {
					if (
						evt.keyCode === 13
						&& !utils.isMobile
						&& !evt.ctrlKey
						&& !evt.shiftKey
					) {
						// ie8 does not support preventDefault & stopPropagation
						if (evt.preventDefault) {
							evt.preventDefault();
						}
						utils.trigger(easemobim.sendBtn, 'click');
					}
				});

				utils.on(easemobim.sendBtn, 'click', function () {
					var textMsg = easemobim.textarea.value;

					if (utils.hasClass(this, 'disabled')) {
						// 禁止发送
					}
					else if (textMsg.length > _const.MAX_TEXT_MESSAGE_LENGTH) {
						me.errorPrompt('输入字数过多');
					}
					else {
						me.channel.sendText(textMsg);
						easemobim.textarea.value = '';
						utils.trigger(easemobim.textarea, 'change');
					}
				});
			},
			scrollBottom: function (wait) {
				var ocw = easemobim.imChatBody;

				if (wait) {
					clearTimeout(this.scbT);
					this.scbT = setTimeout(function () {
						ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 9999;
					}, wait);
				}
				else {
					ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 9999;
				}
			},
			handleEventStatus: function (action, info, robertToHubman) {
					var res = robertToHubman ? this.hasHumanAgentOnline : this.hasAgentOnline;
					if (!res) {
						// 显示无坐席在线
						// 每次激活只显示一次
						if (!this.noteShow) {
							this.noteShow = true;
							this.appendEventMsg(_const.eventMessageText.NOTE);
						}
					}

					if (action === 'reply' && info) {

						if (config.agentUserId) {
							this.startToGetAgentStatus();
						}

						this.setAgentProfile({
							userNickname: info.userNickname,
							avatar: info.avatar
						});
					}
					else if (action === 'create') { //显示会话创建
						this.appendEventMsg(_const.eventMessageText.CREATE);
					}
					else if (action === 'close') { //显示会话关闭
						this.appendEventMsg(_const.eventMessageText.CLOSED);
					}
					else if (action === 'transferd') { //显示转接到客服
						this.appendEventMsg(_const.eventMessageText.TRANSFER);
					}
					else if (action === 'transfering') { //显示转接中
						this.appendEventMsg(_const.eventMessageText.TRANSFERING);
					}
					else if (action === 'linked') { //接入成功
						this.appendEventMsg(_const.eventMessageText.LINKED);
					}

					if (action === 'transferd' || action === 'linked') {
						//坐席发生改变
						this.handleAgentStatusChanged(info);
					}
				}
				//坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
				,
			handleAgentStatusChanged: function (info) {
					if (!info) return;

					config.agentUserId = info.userId;

					this.updateAgentStatus();
					this.startToGetAgentStatus();

					//更新头像和昵称
					this.setAgentProfile({
						userNickname: info.agentUserNiceName,
						avatar: info.avatar
					});
				}
				//转接中排队中等提示上屏
				,
			appendEventMsg: function (msg) {
					//如果设置了hideStatus, 不显示转接中排队中等提示
					if (config.hideStatus) return;

					var dom = document.createElement('div');

					dom.innerText = msg;
					dom.className = 'em-widget-event';

					this.appendDate(new Date().getTime());
					doms.chatWrapper.appendChild(dom);
					this.scrollBottom(utils.isMobile ? 800 : null);
				}
				//消息上屏
				,
			appendMsg: function (from, to, msg, isHistory) {
				var me = this;
				var isReceived = !(
					from
					&& config.user.username
					&& (from === config.user.username)
				);
				var curWrapper = doms.chatWrapper;
				var dom = easemobim.genDomFromMsg(msg, isReceived);
				var img = dom.querySelector('.em-widget-imgview');

				if (isHistory) {
					curWrapper.insertBefore(dom, curWrapper.firstChild);
				}
				else if (img) {
					// 如果包含图片，则需要等待图片加载后再滚动消息
					curWrapper.appendChild(dom);
					me.scrollBottom(utils.isMobile ? 800 : null);
					utils.one(img, 'load', function () {
						me.scrollBottom();
					});
				}
				else {
					// 非图片消息直接滚到底
					curWrapper.appendChild(dom);
					me.scrollBottom(utils.isMobile ? 800 : null);
				}
			},
			messagePrompt: function (message) {
					if (utils.isTop) return;

					var me = this;
					var tmpVal;
					var brief;
					switch (message.type) {
					case 'txt':
					case 'list':
						tmpVal = message.value.replace(/\n/mg, '');
						brief = tmpVal.length > 15 ? tmpVal.slice(0, 15) + '...' : tmpVal;
						break;
					case 'img':
						brief = '[图片]';
						break;
					case 'file':
						brief = '[文件]';
						break;
					default:
						brief = '';
					}

					if (me.opened) {
						transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
					}

					if (utils.isMin() || !me.opened) {
						me.soundReminder();
						transfer.send({ event: _const.EVENTS.SLIDE }, window.transfer.to);
						transfer.send({
							event: _const.EVENTS.NOTIFY,
							data: {
								avatar: this.currentAvatar,
								title: '新消息',
								brief: brief
							}
						}, window.transfer.to);
					}
				}
				//receive message function
				,
			receiveMsg: function (msg, type, isHistory) {
				this.channel.handleReceive(msg, type, isHistory);
			}
		};
	};
}());

(function () {
	easemobim.api = function (apiName, data, success, error) {
		//cache
		easemobim.api[apiName] = easemobim.api[apiName] || {};

		var ts = new Date().getTime();
		easemobim.api[apiName][ts] = {
			success: success,
			error: error
		};
		easemobim.getData
			.send({
				api: apiName,
				data: data,
				timespan: ts
			})
			.listen(function (msg) {
				if (easemobim.api[msg.call] && easemobim.api[msg.call][msg.timespan]) {

					var callback = easemobim.api[msg.call][msg.timespan];
					delete easemobim.api[msg.call][msg.timespan];

					if (msg.status !== 0) {
						typeof callback.error === 'function' && callback.error(msg);
					}
					else {
						typeof callback.success === 'function' && callback.success(msg);
					}
				}
			}, ['api']);
	};
}());

(function (Polling, utils, api, _const) {
	var POLLING_INTERVAL = 5000;

	var _polling;
	var _callback;
	var _config;
	var _gid;
	var _url;

	function _reportData(userType, userId) {
		transfer.send({ event: _const.EVENTS.REQUIRE_URL }, window.transfer.to);

		_url && easemobim.api('reportEvent', {
			type: 'VISIT_URL',
			// 第一次轮询时URL还未传过来，所以使用origin
			url: _url,
			// for debug
			// url: 'http://172.17.3.86',
			// 时间戳不传，以服务器时间为准
			// timestamp: 0,
			userId: {
				type: userType,
				id: userId
			}
		}, function (res) {
			var data = res.data;

			switch (data && data.type) {
				// 没有坐席呼叫，什么都不做
			case 'OK':
				break;
				// 有坐席呼叫
			case 'INIT_CALL':
				if (_isStarted()) {
					// 回呼游客，游客身份变为访客
					if (data.userName) {
						_gid = data.orgName + '#' + data.appName + '_' + data.userName;
						_polling.stop();
						_polling = new Polling(function () {
							_reportData('VISITOR', _gid);
						}, POLLING_INTERVAL);
					}
					_stopReporting();
					_callback(data);
				}
				// 已停止轮询 （被呼叫的访客/游客 已经创建会话），不回呼
				else {}
				break;
			default:
				break;
			}
		});
	}

	function _deleteEvent() {
		_gid && api('deleteEvent', { userId: _gid });
		// _gid = '';
	}

	function _startToReoprt(config, callback) {
		_callback || (_callback = callback);
		_config || (_config = config);

		// h5 方式屏蔽访客回呼功能
		if (utils.isTop) return;

		// 要求外部页面更新URL
		transfer.send({ event: _const.EVENTS.REQUIRE_URL }, window.transfer.to);

		// 用户点击联系客服弹出的窗口，结束会话后调用的startToReport没有传入参数
		if (!_config) {
			console.log('not config yet.');
		}
		else if (_polling) {
			_polling.start();
		}
		else if (_config.user.username) {
			_reportVisitor(_config.user.username);
		}
		else {
			_reportGuest();
		}
	}

	function _reportGuest() {
		var guestId = _config.guestId || utils.uuid();

		// 缓存guestId
		transfer.send({
			event: _const.EVENTS.SET_ITEM,
			data: {
				key: 'guestId',
				value: guestId
			}
		}, window.transfer.to);

		_polling = new Polling(function () {
			_reportData('GUEST', guestId);
		}, POLLING_INTERVAL);

		_polling.start();
	}

	function _reportVisitor(username) {
		// 获取关联信息
		api('getRelevanceList', {
			tenantId: _config.tenantId
		}, function (msg) {
			if (!msg.data.length) {
				throw '未创建关联';
			}
			var splited = _config.appKey.split('#');
			var relevanceList = msg.data[0];
			var orgName = splited[0] || relevanceList.orgName;
			var appName = splited[1] || relevanceList.appName;
			var imServiceNumber = relevanceList.imServiceNumber;

			_config.restServer = _config.restServer || relevanceList.restDomain;
			var cluster = _config.restServer ? _config.restServer.match(/vip\d/) : '';
			cluster = cluster && cluster.length ? '-' + cluster[0] : '';
			_config.xmppServer = _config.xmppServer || 'im-api' + cluster + '.easemob.com';

			_gid = orgName + '#' + appName + '_' + username;

			_polling = new Polling(function () {
				_reportData('VISITOR', _gid);
			}, POLLING_INTERVAL);

			// 获取当前会话信息
			api('getCurrentServiceSession', {
				tenantId: _config.tenantId,
				orgName: orgName,
				appName: appName,
				imServiceNumber: imServiceNumber,
				id: username
			}, function (msg) {
				// 没有会话数据，则开始轮询
				if (!msg.data) {
					_polling.start();
				}
			});
		});
	}

	function _stopReporting() {
		_polling && _polling.stop();
		_deleteEvent();
	}

	function _isStarted() {
		return _polling && _polling.isStarted;
	}

	easemobim.eventCollector = {
		startToReport: _startToReoprt,
		stopReporting: _stopReporting,
		isStarted: _isStarted,
		updateURL: function (url) {
			_url = url;
		}
	};
}(
	easemobim.Polling,
	easemobim.utils,
	easemobim.api,
	easemobim._const
));

(function (window, undefined) {
	'use strict';

	var utils = easemobim.utils;
	var _const = easemobim._const;
	var api = easemobim.api;
	var eventCollector = easemobim.eventCollector;
	var chat;
	var config;

	getConfig();

	function getConfig() {
		if (utils.isTop) {
			var tenantId = utils.query('tenantId');
			config = {};
			//get config from referrer's config
			try {
				config = JSON.parse(utils.code.decode(utils.getStore('emconfig' + tenantId)));
			}
			catch (e) {}

			config.tenantId = tenantId;
			config.hide = true;
			config.offDutyType = utils.query('offDutyType');
			config.grUserId = utils.query('grUserId');

			// H5 方式集成时不支持eventCollector配置
			config.to = utils.convertFalse(utils.query('to'));
			config.xmppServer = utils.convertFalse(utils.query('xmppServer'));
			config.restServer = utils.convertFalse(utils.query('restServer'));
			config.agentName = utils.convertFalse(utils.query('agentName'));
			config.resources = utils.convertFalse(utils.query('resources'));
			config.hideStatus = utils.convertFalse(utils.query('hideStatus'));
			config.satisfaction = utils.convertFalse(utils.query('sat'));
			config.wechatAuth = utils.convertFalse(utils.query('wechatAuth'));
			config.hideKeyboard = utils.convertFalse(utils.query('hideKeyboard'));

			config.appKey = utils.convertFalse(decodeURIComponent(utils.query('appKey')));
			config.domain = config.domain || '//' + location.host;
			config.offDutyWord = decodeURIComponent(utils.query('offDutyWord'));
			config.language = utils.query('language') || 'zh_CN';
			config.ticket = utils.query('ticket') === '' ? true : utils.convertFalse(utils.query('ticket')); //true default
			try {
				config.emgroup = decodeURIComponent(utils.query('emgroup'));
			}
			catch (e) {
				config.emgroup = utils.query('emgroup');
			}

			config.user = config.user || {};
			var usernameFromUrl = utils.query('user');
			var usernameFromCookie = utils.get('root' + config.tenantId + config.emgroup);
			var usernameFromConfig = config.user.username;

			if (usernameFromUrl && usernameFromUrl === usernameFromConfig) {
				// H5模式下，考虑到多租户情景或者是localstorage没清理
				// 故仅当url和localstorage中的用户名匹配时才认为指定的用户有效
				// 此时什么都不用做，自动使用从localstorage里取出的 username 和 password
			}
			else if (usernameFromUrl) {
				// 用户不匹配时，以url中的用户名为准
				config.user = { username: usernameFromUrl };
			}
			else if (usernameFromCookie) {
				// 未指定用户时，从cookie中取得用户名
				config.user = { username: usernameFromCookie };
				config.isUsernameFromCookie = true;
			}
			else {
				// 以上均不匹配时，需要重新创建用户
				config.user = {};
			}

			chat = easemobim.chat(config);
			initUI(config, initAfterUI);
		}
		else {
			window.transfer = new easemobim.Transfer(null, 'main').listen(function (msg) {
				switch (msg.event) {
				case _const.EVENTS.SHOW:
					if (eventCollector.isStarted()) {
						// 停止上报访客
						eventCollector.stopReporting();
						chatEntry.init(config);
						chatEntry.open();
					}
					else {
						chatEntry.open();
					}
					break;
				case _const.EVENTS.CLOSE:
					chatEntry.close();
					break;
				case _const.EVENTS.EXT:
					chat.channel.sendText('', false, msg.data.ext);
					break;
				case _const.EVENTS.TEXTMSG:
					chat.channel.sendText(msg.data.data, false, msg.data.ext);
					break;
				case _const.EVENTS.UPDATE_URL:
					easemobim.eventCollector.updateURL(msg.data);
					break;
				case _const.EVENTS.INIT_CONFIG:
					chat = easemobim.chat(msg.data);
					window.transfer.to = msg.data.parentId;
					initUI(msg.data, initAfterUI);
					// cache config
					config = msg.data;
					break;
				default:
					break;
				}
			}, ['easemob']);
		}
	}

	function initAfterUI(config) {
		config.base = location.protocol + config.domain;

		//load modules
		easemobim.leaveMessage = easemobim.leaveMessage(chat, config.tenantId);
		easemobim.paste(chat).init();
		easemobim.satisfaction(chat);

		// 访客回呼功能
		if (config.eventCollector && !eventCollector.isStarted()) {
			eventCollector.startToReport(config, function (targetUserInfo) {
				chatEntry.init(config, targetUserInfo);
			});
			// 增加访客主动联系客服逻辑
			utils.one(easemobim.imBtn, 'click', function () {
				chatEntry.init(config);
				chatEntry.open();
			});
		}
		else {
			// 获取关联，创建访客，调用聊天窗口
			chatEntry.init(config);
		}

		// 获取主题颜色设置
		api('getTheme', {
			tenantId: config.tenantId
		}, function (msg) {
			var themeName = utils.getDataByPath(msg, 'data.0.optionValue');
			var className = _const.themeMap[themeName];

			className && utils.addClass(document.body, className);
		});
	}

	function initUI(config, callback) {
		var iframe = document.getElementById('cross-origin-iframe');

		iframe.src = config.domain + '/webim/transfer.html?v=citic.43.15.12';
		utils.on(iframe, 'load', function () {
			easemobim.getData = new easemobim.Transfer('cross-origin-iframe', 'data');
			callback(config);
		});

		// em-widgetPopBar
		utils.toggleClass(
			document.getElementById('em-widgetPopBar'),
			'hide',
			(utils.isTop || !config.minimum || config.hide)
		);

		// em-kefu-webim-chat
		utils.toggleClass(
			document.getElementById('em-kefu-webim-chat'),
			'hide', !(utils.isTop || !config.minimum)
		);

		// 设置联系客服按钮文字
		document.querySelector('.em-widget-pop-bar').innerText = config.buttonText;

		// 添加移动端样式类
		if (utils.isMobile) {
			utils.addClass(document.body, 'em-mobile');
		}

		// 留言按钮
		utils.toggleClass(
			document.querySelector('.em-widget-note'),
			'hide', !config.ticket
		);

		// 最小化按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-min'),
			'hide', !config.minimum || utils.isTop
		);

		// 低版本浏览器不支持上传文件/图片
		utils.toggleClass(
			document.querySelector('.em-widget-file'),
			'hide', !WebIM.utils.isCanUploadFileAsync
		);
		utils.toggleClass(
			document.querySelector('.em-widget-img'),
			'hide', !WebIM.utils.isCanUploadFileAsync
		);

		// 静音按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-audio'),
			'hide', !window.HTMLAudioElement || utils.isMobile || !config.soundReminder
		);

		// 输入框位置开关
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-keyboard'),
			'hide', !utils.isMobile || config.hideKeyboard
		);

		// 满意度评价按钮
		utils.toggleClass(
			document.querySelector('.em-widget-satisfaction'),
			'hide', !config.satisfaction
		);
	}

	var chatEntry = {
		init: function (config, targetUserInfo) {
			var me = this;

			//获取关联信息
			api('getRelevanceList', {
				tenantId: config.tenantId
			}, function (msg) {
				var relevanceList = msg.data;
				var targetItem;
				var appKey = config.appKey;
				var splited = appKey.split('#');
				var orgName = splited[0];
				var appName = splited[1];
				var toUser = config.toUser || config.to;

				// toUser 转为字符串， todo: move it to handle config
				'number' === typeof toUser && (toUser = toUser.toString(10));

				if (!relevanceList.length) {
					chat.errorPrompt('未创建关联', true);
					return;
				}

				if (appKey && toUser) {
					// appKey，imServiceNumber 都指定了
					targetItem = _.where(relevanceList, {
						orgName: orgName,
						appName: appName,
						imServiceNumber: toUser
					})[0];
				}

				// 未指定appKey, toUser时，或未找到符合条件的关联时，默认使用关联列表中的第一项
				if (!targetItem){
					targetItem = targetItem || relevanceList[0];
					console.log('mismatched channel, use default.');
				}

				// 获取企业头像和名称
				// todo：move to handle config (defaultAvatar)
				// todo: rename to tenantName
				config.tenantAvatar = utils.getAvatarsFullPath(targetItem.tenantAvatar, config.domain);
				config.defaultAvatar = config.staticPath ? config.staticPath + '/img/default_avatar.png' : 'static/img/default_avatar.png';
				config.defaultAgentName = targetItem.tenantName;

				config.logo = config.logo || targetItem.tenantLogo;
				config.toUser = targetItem.imServiceNumber;
				config.orgName = targetItem.orgName;
				config.appName = targetItem.appName;
				config.channelId = targetItem.channelId;

				config.appKey = config.orgName + '#' + config.appName;
				config.restServer = config.restServer || targetItem.restDomain;
				config.xmppServer = config.xmppServer || targetItem.xmppServer;

				chat.init();

				if (targetUserInfo) {

					config.toUser = targetUserInfo.agentImName;

					// 游客回呼
					if (targetUserInfo.userName) {
						config.user = {
							username: targetUserInfo.userName,
							password: targetUserInfo.userPassword
						};

						// 发送空的ext消息，延迟发送
						chat.cachedCommandMessage = { ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } };
						chat.ready();
						chat.show();
						transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
						transfer.send({
							event: _const.EVENTS.CACHEUSER,
							data: {
								username: targetUserInfo.userName,
								// todo: check if need emgroup
								group: config.user.emgroup
							}
						}, window.transfer.to);
					}
					// 访客回呼
					else {
						api('getPassword', {
							userId: config.user.username,
							tenantId: config.tenantId
						}, function (msg) {
							var password = msg.data;
							if (!password) {
								// todo: 用户不存在自动降级，重新创建
								console.warn('用户不存在！');
							}
							else {
								config.user.password = password;

								// 发送空的ext消息，延迟发送
								chat.cachedCommandMessage = { ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } };
								chat.ready();
								chat.show();
								transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
							}
						});
					}
				}
				else if (config.user.username && (config.user.password || config.user.token)) {
					chat.ready();
				}
				//检测微信网页授权
				else if (config.wechatAuth) {
					easemobim.wechat(function (data) {
						try {
							data = JSON.parse(data);
						}
						catch (e) {
							data = null;
						}
						if (!data) { //失败自动降级，随机创建访客
							me.go(config);
						}
						else {
							config.visitor = config.visitor || {};
							config.visitor.userNickname = data.nickname;
							var oid = config.tenantId + '_' + config.orgName + '_' + config.appName + '_' + config.toUser + '_' +
								data.openid;
							easemobim.emajax({
								url: '/v1/webimplugin/visitors/wechat/' + oid + '?tenantId=' + config.tenantId,
								data: {
									orgName: config.orgName,
									appName: config.appName,
									imServiceNumber: config.toUser
								},
								type: 'POST',
								success: function (info) {
									try {
										info = JSON.parse(info);
									}
									catch (e) {
										info = null;
									}
									if (info && info.status === 'OK') {
										config.user.username = info.entity.userId;
										config.user.password = info.entity.userPassword;
										chat.ready();
									}
									else {
										me.go(config);
									}

								},
								error: function (e) {
									//失败自动降级，随机创建访客
									me.go(config);
								}
							});
						}
					});
				}
				else if (config.user.username) {
					api('getPassword', {
						userId: config.user.username,
						tenantId: config.tenantId
					}, function (msg) {
						if (!msg.data) {
							me.go(config);
						}
						else {
							config.user.password = msg.data;
							chat.ready();
						}
					});
				}
				else {
					me.go(config);
				}
			});
		},
		go: function (config) {
			api('createVisitor', {
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				tenantId: config.tenantId
			}, function (msg) {
				config.isNewUser = true;
				config.user.username = msg.data.userId;
				config.user.password = msg.data.userPassword;
				if (utils.isTop) {
					utils.set('root' + config.tenantId + config.emgroup, config.user.username);
				}
				else {
					transfer.send({
						event: _const.EVENTS.CACHEUSER,
						data: {
							username: config.user.username,
							group: config.user.emgroup
						}
					}, window.transfer.to);
				}
				chat.ready();
			});
		},
		open: function () {
			chat.show();
		},
		close: function () {
			chat.close();
		}
	};

	easemobim.reCreateImUser = _.once(function () {
		api('createVisitor', {
			orgName: config.orgName,
			appName: config.appName,
			imServiceNumber: config.toUser,
			tenantId: config.tenantId
		}, function (msg) {
			config.isNewUser = true;
			config.user.username = msg.data.userId;
			config.user.password = msg.data.userPassword;
			if (utils.isTop) {
				utils.set('root' + config.tenantId + config.emgroup, config.user.username);
			}
			else {
				// todo: directly transfer key & value to write cookies
				transfer.send({
					event: _const.EVENTS.CACHEUSER,
					data: {
						username: config.user.username,
						group: config.user.emgroup
					}
				}, window.transfer.to);
			}
			chat.open();
		});
	});
}(window, undefined));
