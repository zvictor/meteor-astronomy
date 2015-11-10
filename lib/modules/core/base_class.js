var BaseClass = Astro.BaseClass = function BaseClass(attrs) {
  var doc = this;
  var Class = doc.constructor;
  attrs = attrs || {};

  // Add the private "_modifiers" property to track changes made on the document.
  doc._modifiers = {};
  // Add the private "_original" property to store the original document before
  // modifications.
  doc._original = {};

  // Trigger the "beforeInit" event handlers.
  event = new Astro.Event('beforeInit', attrs);
  event.target = doc;
  Class.emitEvent(event);
  // If an event was prevented from the execution, then we stop here.
  if (event.defaultPrevented) {
    return;
  }

  var allFieldsNames = Class.getFieldsNames();
  _.each(allFieldsNames, function(fieldName) {
    var fieldValue = attrs[fieldName];
    if (_.isUndefined(fieldValue)) {
      // Set a default value.
      doc._setDefault(fieldName);
    } else {
      // Set a value.
      doc._setOne(fieldName, fieldValue);
    }
    // Copy values to the "_original" property.
    doc._original[fieldName] = EJSON.clone(doc[fieldName]);
  });

  // Set the "_isNew" flag indicating if an object had been persisted in the
  // collection.
  doc._isNew = true;

  // Trigger the "afterInit" event handlers.
  event = new Astro.Event('afterInit', attrs);
  event.target = doc;
  Class.emitEvent(event);
};
