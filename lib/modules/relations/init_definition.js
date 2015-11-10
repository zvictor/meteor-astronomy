var checkNestedFieldDefinition = function() {
};

Astro.eventManager.on(
  'initDefinition', function onInitDefinitionFields(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;

    var nestedFieldsDefinitions = {};
    if (_.has(schemaDefinition, 'nested')) {
      if (_.isObject(schemaDefinition.nested)) {

        _.each(
          schemaDefinition.nested,
          function(nestedFieldDefinition, nestedFieldName) {
            var nestedFieldDefinition = _.extend(nestedFieldDefinition, {
              name: nestedFieldName
            });

            // Check validity of the field definition.
            checkNestedFieldDefinition(nestedFieldDefinition, Class.getName());
            nestedFieldsDefinitions[nestedFieldDefinition.name] =
              nestedFieldDefinition;
          }
        );

      }
    }
    _.each(
      nestedFieldsDefinitions,
      function(nestedFieldDefinition, nestedFieldName) {
        // Get a field class from the type.
        var NestedField = Astro.nestedFields[nestedFieldDefinition.count];
        // Create a new field.
        var nestedField = new NestedField(nestedFieldDefinition);
        // Add a field object to the fields list.
        schema.nestedFields[nestedFieldName] = nestedField;
        schema.nestedFieldsNames.push(nestedFieldName);
      }
    );
  }
);
