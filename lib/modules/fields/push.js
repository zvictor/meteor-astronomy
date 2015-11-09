var proto = Astro.BaseClass.prototype;

// Overloaded functions.

proto._pushOne = function(fieldPattern, pushValue, options) {
  let doc = this;
  let Class = doc.constructor;
  let event;
  let returnValue;

  // Don't allow pushing an undefined value.
  if (_.isUndefined(pushValue)) {
    return doc;
  }

  // Set default options of the function. By default we cast a value being set.
  options = _.extend({
    cast: true,
    mutable: false
  }, options);

  Astro.utils.fields.traverseNestedDocs(
    doc,
    fieldPattern,
    function(nestedDoc, nestedFieldName, field) {
      // If we try to push an element not into an array, then we stop execution.
      if (!_.isArray(nestedDoc[nestedFieldName])) {
        return;
      }

      if (field) {
        var fieldName = field.name;
        // Check whether the field is immutable, so we can not update it and
        // should stop execution.
        if (
          (field.immutable && !options.mutable) &&
          (!doc._isNew && !_.isNull(nestedDoc[nestedFieldName]))
        ) {
          return;
        }

        // Try casting the value to the proper type.
        if (options.cast) {
          pushValue = field.cast(pushValue);
        }
      } else {
        Astro.utils.warn(
          'Trying to push a value into the "' + fieldPattern +
          '" field that does not exist in the "' + Class.getName() + '" class'
        );
        return;
      }

      // Trigger the "beforeChange" event handlers.
      event = new Astro.Event('beforeChange', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        operation: 'push'
      });
      event.target = doc;
      Class.emitEvent(event);

      // If an event was prevented, then we stop here.
      if (event.defaultPrevented) {
        return;
      }

      // Trigger the "beforePush" event handlers.
      event = new Astro.Event('beforePush', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        pushValue: pushValue
      });
      event.target = doc;
      Class.emitEvent(event);

      // If an event was prevented, then we stop here.
      if (event.defaultPrevented) {
        return;
      }

      // TODO: The code fragment "pushValue.constructor === Object" checks if a
      // value is a plain object. It should use "_.isPlainObject" from lodash
      // after merging with underscore.
      if (_.isObject(pushValue) && pushValue.constructor === Object) {
        // If a value being push is an object or an array then first push an
        // empty array or object and set all nested values in separate calls.
        let index;
        if (_.isArray(pushValue)) {
          index = nestedDoc[nestedFieldName].push([]) - 1;
        } else {
          index = nestedDoc[nestedFieldName].push({}) - 1;
          // Set default values of an object being set.
          let nestedFieldsNames = Class.getFieldsNames(fieldPattern);
          _.each(nestedFieldsNames, function(nestedFieldName) {
            doc._setDefault(fieldPattern + '.' + index + '.' + nestedFieldName);
          });
        }
        // Set each value of an object or array in an individual call.
        _.each(pushValue, function(value, key) {
          doc._setOne(fieldPattern + '.' + index + '.' + key, value);
        });
      } else {
        // Push the given value.
        nestedDoc[nestedFieldName].push(pushValue);
      }

      // Trigger the "afterPush" event handlers.
      event = new Astro.Event('afterPush', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        pushValue: pushValue
      });
      event.target = doc;
      Class.emitEvent(event);

      // Trigger the "afterChange" event handlers.
      event = new Astro.Event('afterChange', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        operation: 'push'
      });
      event.target = doc;
      Class.emitEvent(event);

      // Prepare a value to return from the "_setOne" method.
      returnValue = nestedDoc[nestedFieldName].length;
    }
  );

  return returnValue;
};

proto._pushMany = function(pushValues, options) {
  var doc = this;

  // Set multiple fields.
  _.each(pushValues, function(pushValue, fieldName) {
    doc._pushOne(fieldName, pushValue, options);
  });

  return doc;
};

// Public.

proto.push = function(/* arguments */) {
  var doc = this;
  var args = arguments;

  if (args.length === 1 && _.isObject(args[0])) {
    doc._pushMany(args[0]);
  } else if (args.length === 2) {
    doc._pushOne(args[0], args[1]);
  }

  return doc;
};
