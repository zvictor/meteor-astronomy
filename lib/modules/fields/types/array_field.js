Astro.createType({
  name: 'array',
  constructor: function ArrayField(definition) {
    Astro.BaseField.apply(this, arguments);
  },
  cast: function(value) {
    return _.toArray(EJSON.clone(value));
  }
});
