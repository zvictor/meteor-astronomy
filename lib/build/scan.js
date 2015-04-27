Plugin.registerSourceHandler(
  'json', {
    isTemplate: false,
    archMatching: 'web'
  },
  function(compileStep) {
    build(compileStep);
  }
);
