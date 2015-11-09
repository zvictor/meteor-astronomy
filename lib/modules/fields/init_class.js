var classMethods = {};

classMethods.getFieldsNames = function(fieldPattern) {
  if (_.isUndefined(fieldPattern)) {
    return _.keys(this.schema.fieldsNames);
  }

  var nestedFieldsNames;
  Astro.utils.fields.traverseObject({
    object: this.schema.fieldsNames,
    pattern: fieldPattern,
    callback: function(nestedObject, segment, segments) {
      if (_.isObject(nestedObject[segment])) {
        nestedFieldsNames = _.keys(nestedObject[segment]);
      } else {
        nestedFieldsNames = [];
      }
    }
  });

  return nestedFieldsNames;
};

classMethods.hasField = function(fieldPattern) {
  return _.has(this.schema.fields, fieldPattern);
};

classMethods.getField = function(fieldPattern) {
  return this.schema.fields[fieldPattern];
};

classMethods.getFields = function() {
  return this.schema.fields;
};

Astro.eventManager.on(
  'initClass', function onInitClassFields(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;

    // Add fields methods to the class.
    _.extend(Class, classMethods);

    schema.fields = schema.fields || {};
    schema.fieldsNames = schema.fieldsNames || {};
  }
);
