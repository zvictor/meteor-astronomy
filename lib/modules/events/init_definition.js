var events = {};

events.afterInit = function(attrs) {
  var doc = this;
  var Class = doc.constructor;

  doc.set(Class.getTypeField(), Class.getName());
};

var checkEventDefinition = function(eventDefinition, eventName, className) {
  // Check if the event name is a string.
  if (!Match.test(eventName, String)) {
    throw new Error(
      'The event name in the "' + className +
      '" class has to be a string'
    );
  }
  // Check if the event definition is an array of functions.
  if (!Match.test(eventDefinition, [Function])) {
    throw new Error(
      'The event handler for the "' + eventName + '" event in the "' +
      className + '" class has to be a function'
    );
  }
};

Astro.eventManager.on(
  'initDefinition', function onInitDefinitionEvents(schemaDefinition) {
    var Class = this;
    var schema = Class.schema;
    var eventsDefinitions = {};

    if (_.has(schemaDefinition, 'events')) {
      _.each(schemaDefinition.events, function(eventHandlers, eventName) {
        var eventDefinition;

        if (_.isArray(eventHandlers)) {
          eventDefinition = eventHandlers;
        } else if (_.isFunction(eventHandlers)) {
          eventDefinition = [eventHandlers];
        }

        if (eventDefinition) {
          // Check validity of the event definition.
          checkEventDefinition(eventDefinition, eventName, Class.getName());
          eventsDefinitions[eventName] = eventDefinition;
        }
      });
    }

    if (_.size(eventsDefinitions) > 0) {
      // Add events to the event manager in a schema.
      _.each(eventsDefinitions, function(eventHandlers, eventName) {
        _.each(eventHandlers, function(eventHandler) {
          schema.eventManager.on(eventName, eventHandler);
        });
      });
    }

    // Add the "type" field, to distinguish to what class we have to cast a
    // document fetched from the collection.
    var typeField = schemaDefinition.typeField;
    if (typeField) {
      Class.schema.typeField = typeField;

      // Prepare an object for storing fields definitions and events list that
      // will extend the current schema.
      var extendDefinition = {
        fields: {},
        events: {}
      };

      extendDefinition.fields[typeField] = {
        type: 'string'
      };

      // Add the "afterInit" event handler that sets a type field.
      extendDefinition.events = {
        afterInit: [events.afterInit]
      };

      Class.extend(extendDefinition);
    }
  }
);
