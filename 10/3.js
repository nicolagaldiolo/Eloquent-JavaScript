function require(name) {
  if (name in require.cache)
    return require.cache[name];

  var code = new Function("exports, module", readFile(name));
  var exports = {}, module = {exports: exports};
  code(exports, module);

  require.cache[name] = module.exports;
  return module.exports;
}
require.cache = Object.create(null);

var defineCache = Object.create(null);
var currentMod = null;

function getModule(name) {
  if (name in defineCache)
    return defineCache[name];

  var module = {exports: null,
                loaded: false,
                onLoad: []};
  defineCache[name] = module;
  backgroundReadFile(name, function(code) {
    currentMod = module;
    new Function("", code)();
  });
  return module;
}

function define(depNames, moduleFunction) {
  var myMod = currentMod;
  var deps = depNames.map(getModule);

  deps.forEach(function(mod) {
    if (!mod.loaded)
      mod.onLoad.push(whenDepsLoaded);
  });

  function whenDepsLoaded() {
    if (!deps.every(function(m) { return m.loaded; }))
      return;

    var args = deps.map(function(m) { return m.exports; });
    var exports = moduleFunction.apply(null, args);
    if (myMod) {
      myMod.exports = exports;
      myMod.loaded = true;
      myMod.onLoad.forEach(function(f) { f(); });
    }
  }
  whenDepsLoaded();
}


function readFile(name) {
  return readFile.files[name] || "";
}
readFile.files = {
  "weekDay": 'var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];\
exports.name = function(number) { return names[number]; };\
exports.number = function(name) { return names.indexOf(name); };',
  "today": 'exports.dayNumber = function() { return (new Date).getDay(); };'
};

function backgroundReadFile(name, c) {
  setTimeout(function() {
    c(backgroundReadFile.files[name] || "");
  }, 200 * Math.random());
}
backgroundReadFile.files = {
  "weekDay": 'define([], function() {\
  var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];\
  return { name: function(number) { return names[number]; }, number: function(name) { return names.indexOf(name); }};\
});',
  "today": 'define([], function() { return {dayNumber: function() { return (new Date).getDay(); }}; });'
};

var exports = {};


define(["weekDay", "today"], function(weekDay, today) {
  console.log(weekDay.name(today.dayNumber()));
});