Astro.createType({
  name: 'null',
  constructor: function NullField() {
    Astro.Field.apply(this, arguments);
  }
});
