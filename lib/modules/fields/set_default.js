var proto = Astro.BaseClass.prototype;

proto._setDefault = function(fieldPattern) {
  var doc = this;
  var Class = doc.constructor;

  Astro.utils.fields.traverseNestedDocs(
    doc,
    fieldPattern,
    function(nestedDoc, nestedFieldName, field) {
      if (field) {
        // Set a default value of a field.
        nestedDoc[nestedFieldName] = field.getDefault();
      }
    }
  );
};
