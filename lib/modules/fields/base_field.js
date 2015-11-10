Astro.Field = class Field {
  constructor(definition) {
    definition = _.isUndefined(definition) ? {} : definition;

    this.type = _.isUndefined(definition.type) ?
      null : definition.type;
    this.name = _.isUndefined(definition.name) ?
      null : definition.name;
    this.default = _.isUndefined(definition.default) ?
      null : definition.default;
    this.optional = _.isUndefined(definition.optional) ?
      false : definition.optional;
    this.immutable = _.isUndefined(definition.immutable) ?
      false : definition.immutable;
    this.transient = _.isUndefined(definition.transient) ?
      false : definition.transient;
  }

  _needsCast(value) {
    return value !== undefined && value !== null;
  }

  _cast(value) {
    if (this._needsCast(value)) {
      return this.cast(value);
    }
    return value;
  }

  cast(value) {
    return value;
  }

  getDefault() {
    // Get a default value.
    var value;

    if (_.isFunction(this.default)) {
      value = this.default();
    } else if (_.isNull(this.default)) {
      return null;
    } else {
      value = this.default;
    }

    if (_.isFunction(this._getDefault)) {
      // User defined "getDefault" method is responsible for casting a value.
      return this._getDefault(value);
    }

    return this.cast(value);
  }
};

Astro.NestedField = class NestedField extends Astro.Field {
  constructor(definition) {
    super(definition);

    this.class = _.isUndefined(definition.class) ?
      null : definition.class;
  }
};

Astro.nestedFields = {};

Astro.nestedFields.one =
class OneField extends Astro.NestedField {
  cast(value) {
    if (this.class) {
      let Class = Astro.getClass(this.class);
      return new Class(value);
    } else if (this.type) {
      let Field = Astro.fields[this.type];
      return;
    }
  }
};

Astro.nestedFields.many =
class ManyField extends Astro.NestedField {
};
