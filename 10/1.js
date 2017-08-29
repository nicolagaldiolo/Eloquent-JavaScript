function readFile(name) {
    return readFile.files[name] || "";
}
readFile.files = {
  "weekDay":  'var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];\
              exports.name = function(number) { return names[number]; };\
              exports.number = function(name) { return names.indexOf(name); };',
  "today":    'exports.dayNumber = function() { return (new Date).getDay(); };'
};

var exports = {};

function require(name){
    var code = new Function("exports", readFile(name));

    // exports = argomenti passati alla funzione (serve solo per valorizzare exports all'interno del modulo)
    // readFile(name) = corpo della funzione
    // code è semplicemente la funzione anonima che contiene il modulo
    var exports = {}; // definisco exports, ossia un oggetto vuoto
    code(exports); // eseguo la funzione anonima passando l'oggetto exports vuoi così da valorizzare esports
    
    return exports; // torno l'oggetto richiesto
}

var weekDay = require("weekDay"); // carico il modulo weekDay
var today = require("today"); // carico il modulo today

console.log(weekDay.name(today.dayNumber()));