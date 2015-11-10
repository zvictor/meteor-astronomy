Astro.createType({
  name: 'date',
  constructor: function DateField() {
    Astro.Field.apply(this, arguments);
  },
  needsCast: function(value) {
    return !_.isDate(value);
  },
  cast: function(value) {
    return new Date(value);
  },
  plain: function(value) {
    return value;
  }
});
