// prova a chiamare questo file da riga di comando così: node main.js Javascript

var garble = require("./garble");

var argument = process.argv[2]; // la posizione 2 riporta il primo argomento di riga di comando.

console.log(garble(argument));