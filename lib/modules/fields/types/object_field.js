Astro.createType({
  name: 'object',
  constructor: function ObjectField(definition) {
    Astro.BaseField.apply(this, arguments);
  },
  cast: function(value) {
    return Object(EJSON.clone(value));
  }
});
