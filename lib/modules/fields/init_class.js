var classMethods = {};

classMethods.getFieldsNames = function() {
  return this.schema.fieldsNames.concat(this.schema.nestedFieldsNames);
};

classMethods.hasField = function(fieldName) {
  return _.has(this.schema.fields, fieldName) ||
    _.has(this.schema.nestedFields, fieldName);
};

classMethods.getField = function(fieldName) {
  return this.schema.fields[fieldName] ||
    this.schema.nestedFields[fieldName];
};

classMethods.getFields = function() {
  return _.extend({}, this.schema.fields, this.schema.nestedFields);
};

Astro.eventManager.on(
  'initClass', function onInitClassFields(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;

    // Add fields methods to the class.
    _.extend(Class, classMethods);

    schema.fields = schema.fields || {};
    schema.fieldsNames = schema.fieldsNames || [];
    schema.nestedFields = schema.nestedFields || {};
    schema.nestedFieldsNames = schema.nestedFieldsNames || [];
  }
);
