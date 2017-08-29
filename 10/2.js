function readFile(name) {
    return readFile.files[name] || "";
}
readFile.files = {
  "weekDay":  'var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];\
              exports.name = function(number) { return names[number]; };\
              exports.number = function(name) { return names.indexOf(name); };',
  "today":    'exports.dayNumber = function() { return (new Date).getDay(); };'
};

function require(name){
    if (name in require.cache) // serve a evitare che il modulo venga importato inutilmente + volte
      return require.cache[name];
    
    var code = new Function("exports, module", readFile(name));

    // exports = argomenti passati alla funzione (serve solo per valorizzare exports all'interno del modulo)
    // readFile(name) = corpo della funzione
    // code è semplicemente la funzione anonima che contiene il modulo
    var exports = {}, module = {exports: exports}; // definisco exports, ossia un oggetto vuoto
    code(exports, module); // eseguo la funzione anonima passando l'oggetto exports vuoi così da valorizzare esports

    require.cache[name] = module.exports;
    return module.exports; // torno l'oggetto richiesto
}
require.cache = Object.create(null);

var weekDay = require("weekDay"); // carico il modulo weekDay
var today = require("today"); // carico il modulo today

console.log(weekDay.name(today.dayNumber()));