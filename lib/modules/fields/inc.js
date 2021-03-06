var proto = Astro.BaseClass.prototype;

// Overloaded functions.

proto._incOne = function(fieldName, incValue, options) {
  var doc = this;
  var Class = doc.constructor;
  var event;

  // Cast the "incValue" argument to a number.
  incValue = Number(incValue);

  // Don not allow incrementing by non number value or by 0.
  if (_.isNaN(incValue) || incValue === 0) {
    return;
  }

  // Trigger the "beforeChange" event handlers.
  event = new Astro.Event('beforeChange', {
    fieldName: fieldName,
    operation: 'inc'
  });
  event.target = doc;
  Class.emitEvent(event);
  // If an event was prevented from the execution, then we stop here.
  if (event.defaultPrevented) {
    return;
  }

  // Trigger the "beforeInc" event handlers.
  event = new Astro.Event('beforeInc', {
    fieldName: fieldName,
    incValue: incValue
  });
  event.target = doc;
  Class.emitEvent(event);
  // If an event was prevented from the execution, then we stop here.
  if (event.defaultPrevented) {
    return;
  }

  // Set default options of the function.
  options = _.extend({
    modifier: true,
    mutable: false
  }, options);

  // An indicator for detecting whether a change of a value was necessary.
  var changed = false;

  Astro.utils.fields.traverseNestedDocs(
    doc,
    fieldName,
    function(nestedDoc, nestedFieldName, Class, field, index) {
      // Get a current value of the field.
      var currFieldValue = _.isUndefined(index) ?
        nestedDoc[nestedFieldName] : nestedDoc[nestedFieldName][index];

      // If we try to increment non number value, then we stop execution.
      if (!_.isNumber(currFieldValue)) {
        return;
      }

      if (field) {
        // Check whether the field is immutable, so we can not update it and
        // should stop execution.
        if (
          field.immutable && !options.mutable &&
          !doc._isNew && !_.isNull(currFieldValue)
        ) {
          return;
        }

        // If the field has the "transient" flag set to true, then we have to
        // modify options and turn off the "modifier" flag.
        if (field.transient) {
          options.modifier = false;
        }
      } else if (Class) {
        Astro.utils.warn(
          'Trying to increment a value of the "' + nestedFieldName +
          '" field that does not exist in the "' + Class.getName() + '" class'
        );
        return;
      }

      // Add modifier.
      if (options.modifier) {
        if (nestedDoc instanceof Astro.BaseClass) {
          if (_.isUndefined(index)) {
            changed = nestedDoc._addModifier(
              '$inc', nestedFieldName, incValue
            );
          } else {
            changed = nestedDoc._addModifier(
              '$inc', nestedFieldName + '.' + index, incValue
            );
          }
        } else {
          changed = doc._addModifier('$inc', fieldName, incValue);
        }
      } else {
        // If the "modifier" option is not set it means that we just want a
        // given value to be set without checking if it is possible.
        changed = true;
      }

      // If a value change was not possible, then we stop here.
      if (!changed) {
        return;
      }

      // Increment a value of the field by a given amount.
      if (_.isUndefined(index)) {
        nestedDoc[nestedFieldName] += incValue;
      } else {
        nestedDoc[nestedFieldName][index] += incValue;
      }
    }
  );

  // If a value change did not take place, then we stop here and the following
  // events will not be triggered.
  if (!changed) {
    return;
  }

  // Trigger the "afterInc" event handlers.
  event = new Astro.Event('afterInc', {
    fieldName: fieldName,
    incValue: incValue
  });
  event.target = doc;
  Class.emitEvent(event);

  // Trigger the "afterChange" event handlers.
  event = new Astro.Event('afterChange', {
    fieldName: fieldName,
    operation: 'inc'
  });
  event.target = doc;
  Class.emitEvent(event);
};

proto._incMany = function(fieldsValues, options) {
  var doc = this;

  // Set multiple fields.
  _.each(fieldsValues, function(incValue, fieldName) {
    doc._incOne(fieldName, incValue, options);
  });
};

// Public.

proto.inc = function(/* arguments */) {
  var doc = this;
  var args = arguments;

  if (args.length === 1 && _.isObject(args[0])) {
    doc._incMany(args[0]);
  } else if (args.length === 2) {
    doc._incOne(args[0], args[1]);
  }
};
