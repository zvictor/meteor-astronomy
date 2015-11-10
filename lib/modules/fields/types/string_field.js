Astro.createType({
  name: 'string',
  constructor: function StringField() {
    Astro.Field.apply(this, arguments);
  },
  needsCast: function(value) {
    return !_.isString(value);
  },
  cast: function(value) {
    return String(value);
  }
});
