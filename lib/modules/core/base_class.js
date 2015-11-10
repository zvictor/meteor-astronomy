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

  var fieldsNames = Class.getFieldsNames();
  _.each(fieldsNames, function(fieldName) {
    var fieldValue = attrs[fieldName];
    if (_.isUndefined(fieldValue)) {
      // Set a default value.
      doc._setDefault(fieldName);
    } else {
      // Set a value.
      doc._setOne(fieldName, fieldValue, {
        cast: true,
        modifier: false,
        mutable: true
      });
    }
    // Copy values to the "_original" property.
    doc._original[fieldName] = EJSON.clone(doc[fieldName]);
  });

  var nestedFieldsNames = Class.getRelationsNames();
  _.each(nestedFieldsNames, function(relationName) {
    var relation = Class.getRelation(relationName);
    console.log(relation);
    var fieldValue = attrs[relationName];
    if (_.isUndefined(fieldValue)) {
      // Set a default value.
      doc._setDefault(relationName);
    } else {
      // Set a value.
      doc._setOne(relationName, fieldValue, {
        cast: true,
        modifier: false,
        mutable: true
      });
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
