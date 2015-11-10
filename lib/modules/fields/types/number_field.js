Astro.createType({
  name: 'number',
  constructor: function NumberField() {
    Astro.Field.apply(this, arguments);
  },
  needsCast: function(value) {
    return !_.isNumber(value);
  },
  cast: function(value) {
    return Number(value);
  }
});
