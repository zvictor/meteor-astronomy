var classMethods = {};

classMethods.getRelationsNames = function() {
  return this.schema.relationsNames;
};

classMethods.hasRelation = function(relationName) {
  return _.has(this.schema.relations, relationName);
};

classMethods.getRelation = function(relationName) {
  return this.schema.relations[relationName];
};

classMethods.getRelations = function() {
  return this.schema.relations;
};

Astro.eventManager.on(
  'initClass', function onInitClassRelations(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;

    // Add fields methods to the class.
    _.extend(Class, classMethods);

    schema.relations = schema.relations || {};
    schema.relationsNames = schema.relationsNames || [];
  }
);
