var checkFieldDefinition = function(fieldDefinition, className) {
  var fieldName = fieldDefinition.name;

  // FIELD NAME.
  // Field name has to be a string.
  if (!_.isString(fieldName)) {
    throw new TypeError(
      'The field name in the "' + className + '" class has to be a string'
    );
  }
  // Check field validity.
  if (!/^[a-zA-Z_][a-zA-Z0-9_\.]*$/.test(fieldName)) {
    throw new Error(
      'The "' + fieldName + '" field name in the "' + className +
      '" class contains not allowed characters'
    );
  }

  // FIELD TYPE.
  if (!Astro.fields[fieldDefinition.type]) {
    throw new Error(
      'The type provided in the definition of the "' + fieldName +
      '" field in the "' + className + '" class does not exist'
    );
  }

  // DEFAULT VALUE.
  // Check if a default value of field have been properly defined.
  if (
    !_.isFunction(fieldDefinition.default) &&
    _.isObject(fieldDefinition.default)
  ) {
    Astro.utils.warn(
      'A non plain default value for the "' + fieldName +
      '" field in the "' + className +
      '" class should be defined and returned in a function'
    );
  }
};

Astro.eventManager.on(
  'initDefinition', function onInitDefinitionFields(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;

    var fieldsDefinitions = {};
    if (_.has(schemaDefinition, 'fields')) {
      if (_.isArray(schemaDefinition.fields)) {
        _.each(schemaDefinition.fields, function(fieldName) {
          var fieldDefinition;

          if (_.isString(fieldName)) {
            fieldDefinition = {
              name: fieldName,
              type: 'null'
            };
          }

          if (fieldDefinition) {
            // Check validity of the field definition.
            checkFieldDefinition(fieldDefinition, Class.getName());
            fieldsDefinitions[fieldDefinition.name] = fieldDefinition;
          }
        });

      } else if (_.isObject(schemaDefinition.fields)) {

        _.each(schemaDefinition.fields, function(fieldDefinition, fieldName) {
          var fieldDefinition;

          if (_.isString(fieldDefinition)) {
            fieldDefinition = {
              name: fieldName,
              type: fieldDefinition
            };
          } else if (_.isObject(fieldDefinition)) {
            fieldDefinition = _.extend({
              type: 'null'
            }, fieldDefinition, {
              name: fieldName
            });
          }

          if (fieldDefinition) {
            // Check validity of the field definition.
            checkFieldDefinition(fieldDefinition, Class.getName());
            fieldsDefinitions[fieldDefinition.name] = fieldDefinition;
          }
        });

      }
    }
    _.each(fieldsDefinitions, function(fieldDefinition, fieldName) {
      // Get a field class from the type.
      var Field = Astro.fields[fieldDefinition.type];
      // Create a new field.
      var field = new Field(fieldDefinition);
      // Add a field object to the fields list.
      schema.fields[fieldName] = field;
      schema.fieldsNames.push(fieldName);
    });
  }
);
