Astro.createType({
  name: 'boolean',
  constructor: function BooleanField() {
    Astro.Field.apply(this, arguments);
  },
  needsCast: function(value) {
    return !_.isBoolean(value);
  },
  cast: function(value) {
    if (_.isString(value) && value.toLowerCase() === 'false' || value === '0') {
      value = false;
    }
    return Boolean(value);
  }
});
