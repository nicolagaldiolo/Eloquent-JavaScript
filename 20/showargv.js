// prova a chiamare questo file da riga di comando così: node showargv.js one ---and two
// verrà tornato un array di stringhe contenente il comando node, il percorso allo script + tutti gli argomenti passati
console.log(process.argv);

// se vogliamo solo i parametri passati dobbiamo tornare solo dal secondo indice in poi
console.log(process.argv.slice(2));

console.log(global);