Astro.utils.fields = {};

Astro.utils.fields.isNestedFieldName =
Astro.utils.fields.isNestedPattern = function(fieldPattern) {
  return fieldPattern.indexOf('.') !== -1;
};

/**
 * @summary Traverse a nested object
 * @locus Anywhere
 * @method traverseObject
 * @memberOf Astro.utils.fields
 * @class
 * @param {Object} [params] A param object
 * @param {Object} [params.object] An object containing nested objects
 * @param {String} [params.pattern] A nested pattern to traverse
 * @param {Object} [params.options] Options
 * @param {Function} [params.callback] A callback function to execute on traverse end. Receives the following arguments: nested object, segment name, segments list.
 */
Astro.utils.fields.traverseObject = function(params) {
  let self = this;
  let object = params.object;
  let pattern = params.pattern;
  let options = _.extend({
    create: false
  }, params.options);
  let callback = params.callback;

  if (!self.isNestedPattern(pattern)) {
    callback(object, pattern, [pattern]);
  }

  let segments = pattern.split('.');
  let lastIndex = segments.length - 1;

  let next = function(nestedObject, segmentIndex) {
    segmentIndex = segmentIndex || 0;

    let segment = segments[segmentIndex];
    if (segmentIndex === lastIndex) {
      callback(nestedObject, segment, segments);
    } else if (_.isObject(nestedObject[segment])) {
      next(nestedObject[segment], segmentIndex + 1);
    } else if (options.create) {
      nestedObject[segment] = {};
      next(nestedObject[segment], segmentIndex + 1);
    }
  };

  next(object);
};

Astro.utils.fields.traverseNestedDocs = function(doc, fieldPattern, callback) {
  let self = this;

  // A helper for running a callback function to not repeat the same code.
  let runCallback = function(nestedDoc, segment, fieldName) {
    // Get a class.
    let Class = doc.constructor;
    // Get a field definition.
    let field = Class.getField(fieldName);
    // Execute the callback function passing the last nested document, the last
    // segment name and a field definition.
    callback(nestedDoc, segment, field);
  };

  // Check whether the given field name is a nested field name.
  if (!self.isNestedPattern(fieldPattern)) {
    // If it's not a nested field pattern, then just execute the callback
    // function. A value of the fieldPattern variable is a field name.
    runCallback(doc, fieldPattern, fieldPattern);
    return;
  }

  // Split the nested field pattern name by the "." character.
  let segments = fieldPattern.split('.');
  // Get the last and one before the last index.
  let lastIndex = segments.length - 1;

  // Traverse nested fields until reaching the last one from the pattern.
  let next = function(nestedDoc, segmentIndex) {
    segmentIndex = segmentIndex || 0;
    // Get a nested field name under the given index.
    let segment = segments[segmentIndex];
    if (segmentIndex === lastIndex) {
      // The regular expression for detecting if a segment is a number.
      let re = /^\d+$/;
      // Generate a field name from the field pattern. The field name does not
      // contain pattern specific characters like digits or the "$" character.
      let fieldName = _.reduce(segments, function(memo, segment) {
        if (re.test(segment)) {
          return memo;
        } else {
          return memo + '.' + segment;
        }
      });
      // Execute the callback function, if we reached the last nested document.
      runCallback(nestedDoc, segment, fieldName);
    } else if (_.isObject(nestedDoc[segment])) {
      // Go deeper if a value of the current nested document is an object.
      next(nestedDoc[segment], segmentIndex + 1);
    }
  };

  // Start traversing nested fields.
  next(doc);
};
