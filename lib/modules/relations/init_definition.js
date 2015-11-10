var checkRelationDefinition = function() {
};

Astro.eventManager.on(
  'initDefinition', function onInitDefinitionFields(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;

    var relationsDefinitions = {};
    if (_.has(schemaDefinition, 'relations')) {
      if (_.isObject(schemaDefinition.relations)) {

        _.each(
          schemaDefinition.relations,
          function(relationDefinition, relationName) {
            var relationDefinition = _.extend(relationDefinition, {
              name: relationName
            });

            // Check validity of the field definition.
            checkRelationDefinition(relationDefinition, Class.getName());
            relationsDefinitions[relationDefinition.name] = relationDefinition;
          }
        );

      }
    }
    _.each(relationsDefinitions, function(relationDefinition, relationName) {
      schema.relations[relationName] = relationDefinition;
      schema.relationsNames.push(relationName);
    });
  }
);
