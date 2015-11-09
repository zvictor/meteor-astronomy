var proto = Astro.BaseClass.prototype;

// Overloaded functions.

proto._setOne = function(fieldPattern, setValue, options) {
  let doc = this;
  let Class = doc.constructor;
  let event;
  let returnValue;

  // Don't allow setting an undefined value.
  if (_.isUndefined(setValue)) {
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
          setValue = field.cast(setValue);
        }
      } else {
        Astro.utils.warn(
          'Trying to set a value of the "' + fieldPattern +
          '" field that does not exist in the "' + Class.getName() + '" class'
        );
        return;
      }

      // Trigger the "beforeChange" event handlers.
      event = new Astro.Event('beforeChange', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        operation: 'set'
      });
      event.target = doc;
      Class.emitEvent(event);

      // If an event was prevented, then we stop here.
      if (event.defaultPrevented) {
        return;
      }

      // Trigger the "beforeSet" event handlers.
      event = new Astro.Event('beforeSet', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        setValue: setValue
      });
      event.target = doc;
      Class.emitEvent(event);

      // If an event was prevented, then we stop here.
      if (event.defaultPrevented) {
        return;
      }

      // TODO: The code fragment "setValue.constructor === Object" checks if a
      // value is a plain object. It should use "_.isPlainObject" from lodash
      // after merging with underscore.
      if (_.isObject(setValue) && setValue.constructor === Object) {
        // If a value being set is an object or an array then first set an empty
        // array or object and set all nested values in separate calls.
        if (_.isArray(setValue)) {
          nestedDoc[nestedFieldName] = [];
        } else {
          nestedDoc[nestedFieldName] = {};
          // Set default values of an object being set.
          let nestedFieldsNames = Class.getFieldsNames(fieldPattern);
          _.each(nestedFieldsNames, function(nestedFieldName) {
            doc._setDefault(fieldPattern + '.' + nestedFieldName);
          });
        }
        // Set each value of an object or array in an individual call.
        _.each(setValue, function(value, key) {
          doc._setOne(fieldPattern + '.' + key, value);
        });
      } else {
        // Set the given value.
        nestedDoc[nestedFieldName] = setValue;
      }

      // Trigger the "afterSet" event handlers.
      event = new Astro.Event('afterSet', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        setValue: setValue
      });
      event.target = doc;
      Class.emitEvent(event);

      // Trigger the "afterChange" event handlers.
      event = new Astro.Event('afterChange', {
        fieldName: fieldName,
        fieldPattern: fieldPattern,
        operation: 'set'
      });
      event.target = doc;
      Class.emitEvent(event);

      // Prepare a value to return from the "_setOne" method.
      returnValue = nestedDoc[nestedFieldName];
    }
  );

  return returnValue;
};

proto._setMany = function(fieldsValues, options) {
  var doc = this;

  // Set multiple fields.
  _.each(fieldsValues, function(setValue, fieldName) {
    doc._setOne(fieldName, setValue, options);
  });

  return doc;
};

// Public.

proto.set = function(/* arguments */) {
  var doc = this;

  if (arguments.length === 1 && _.isObject(arguments[0])) {
    doc._setMany(arguments[0]);
  } else if (arguments.length === 2 && _.isString(arguments[0])) {
    doc._setOne(arguments[0], arguments[1]);
  }

  return doc;
};
