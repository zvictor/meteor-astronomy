var path = Npm.require('path');

BaseClass = function() {

};



build = function(compileStep) {
  // console.log(compileStep);
  var contents = compileStep.read().toString('utf8');
  var schemaDefinition = JSON.parse(contents);

  // var asset = Assets.getText('base');
  console.log(compileStep);

  var pathPart = path.dirname(compileStep.inputPath);

  var extension = path.extname(compileStep.inputPath);
  var baseName = path.basename(compileStep.inputPath, extension);

  var options = {
    path: path.join(pathPart, baseName + '.js'),
    sourcePath: compileStep.inputPath,
    data: 'Dupa = function() {};'
  };

  console.log(options);

  compileStep.addJavaScript(options);
};
