/*

 tutto è un espressione, ossia può essere:
 - variabile     | qualsiasi carettere che non sia spazio vuoto o abbia significato speciale
 - numero        | sequenze di cifre
 - stringa       | sequenze di caratteri racchiuso tra ""
 - applicazione  | usato per chiamate di funzione o costrutti if o while

 type      : value  | stringhe, lettere, numeri
 value     :        | stringa o numero che rappresentano

 type      : word   | identificatori(nomi)
 name      :        | nome identificatore come stringa

 type      : apply  | applicazioni
 operator  :        | riferimento all'espressione che viene applicata
 args      :        | un array di espressioni argomento

 */




///// PRIMA PARTE - IL PARSER
//    (analizza il codice e crea la struttura dati)

// funzione che accetta una stringa e restituisce un oggetto
// contenente la struttura dati
function parseExpression(program) {
  program = skipSpace(program); // pulisce la stringa dagli spazi bianchi
  
  var match, expr;

  // faccio un controllo per capire cos'è l'espressione
  if (match = /^"([^"]*)"/.exec(program)) //stringa
    expr = {type: "value", value: match[1]};
  else if (match = /^\d+\b/.exec(program)) //numero
    expr = {type: "value", value: Number(match[0])};
  else if (match = /^[^\s(),"]+/.exec(program)) // parola
    expr = {type: "word", name: match[0]};
  else
    // se non è nessuna delle 3 faccio scattare un eccezzione
    throw new SyntaxError("Unexpected syntax: " + program);

  // passo sempre dalla parse apply per capire se l'espressione è una funzione
  // passo la porzione di espressione e il resto del programma dalla fine dell
  // espressione salvata in expr in poi
  return parseApply(expr, program.slice(match[0].length));
}

function skipSpace(string) {
  var skippable = string.match(/^(\s|#.*)*/);
  return string.slice(skippable[0].length);
}

// funzione che verifica se l'espressione è una funzione, in tal caso analizza il contenuto tra parentesi
function parseApply(expr, program) {
  // expr è l'espressione matchata e program è il resto dell'espressione
  program = skipSpace(program);
  if (program[0] != "("){ // se il carattere che segue non è una parentesi aperta non si tratta di una funzione e torno l'espressione
    return {expr: expr, rest: program};
  }

  // se arrivo qui vuol dire che ho trovato una parentesi, la salto e analizzo il contenuto della funzione */
  program = skipSpace(program.slice(1));

  expr = {type: "apply", operator: expr, args: []};

  while (program[0] != ")") { // finchè non trovo una parentesi chiusa continuo ad analizzare il contenuto
    var arg = parseExpression(program); // mi viene tornato l'oggetto di ogni argomento
    expr.args.push(arg.expr); // e lo aggiungo all'array args
    program = skipSpace(arg.rest); // valorizzo program con il resto degli argomenti
    if (program[0] == ",")
      program = skipSpace(program.slice(1));
    else if (program[0] != ")")
      throw new SyntaxError("Expected ',' or ')'");
  }
  // passo program.slice(1) perchè devo saltare via la parentesi di chiusura funzione
  // dato che si può applicare anche un'espressione applicazione es: multipler(2)(1)
  // dopo aver analizzato l'applicazione, deve richiamarsi di nuovo per verificare
  // se trova un altra coppia di parentesi.
  return parseApply(expr, program.slice(1));
}

function parse(program) {
  var result = parseExpression(program);
  // se arrivo qui e c'è ancora qualcosa da analizzare in result.rest torno un arrore
  if (skipSpace(result.rest).length > 0)
    throw new SyntaxError("Unexpected text after program");
  return result.expr;
}

// struttura dell'oggetto result
// { expr:
// { type: 'apply',
//    operator: { type: 'word', name: '+' },
//  args: [ [Object], [Object] ] },
//  rest: '' }

//console.log(parse("+(a,10)"));









///// SECONDA PARTE - L'INTERPRETE (riceve la struttura dati, la interpresa e restituisce dei risultati)
// l'interprete si aspetta:
// un albero sintattico (expr)
// un oggetto ambiente (env) che associa nomi e valori: un oggetto con proprietà i cui nomi corrispondono a nomi di variabili e i cui valori corrispondono ai nomi legati a quelle variabili

// fa semplicemente uno switch in base al tipo di espressione che trova.

function evaluate(expr, env) {
  //expr: albero sintattico, programma da eseguire
  //env: oggetto ambiente che associa nomi e valori,
  // un oggetto che contiene il valore di ogni variabile (paragona oggetto window).

  // switch sul tipo di espressione e torna il valore dell'espressione

  switch(expr.type) {
    // se è un valore letterale torno semplicemente la stringa
    case "value":
      return expr.value;

    case "word":
      // ad esempio per le variabili dobbiamo prima verificare se sono presenti nell'ambiete e in caso tornarne il valore
      if (expr.name in env) {
        // se il nome della variabile è già incluso nell oggetto env ne torno il
        // valore altrimenti lancio un eccezzione
        return env[expr.name];
      }else
        throw new ReferenceError("Undefined variable: " + expr.name);
    case "apply":

      //console.log(expr);

      // se l'applicazione fa parte di un modello form speciale (do,if,while,...)  non le elaboriamo
      // ma passiamo solo gli argomenti e l'oggetto ambiente alla relativa funzione
      if (expr.operator.type == "word" && expr.operator.name in specialForms) {
        //console.log("expr.args: ", expr.args);
        //console.log("env: ", env);
        return specialForms[expr.operator.name](expr.args, env);
      }

      // se l'applicazione è una chiamata normale,
      //calcoliamo l'operatore
      var op = evaluate(expr.operator, env);

      //verifichiamo che sia una funzione
      if (typeof op != "function")
        throw new TypeError("Applying a non-function.");

      // e la richiamiamo col risultato del calcolo degli argomenti
      return op.apply(null, expr.args.map(function(arg) {
        return evaluate(arg, env);
      }));
  }
}




var specialForms = Object.create(null);

// Costrutto che elabora una condizione if (sottoforma di ternario)
specialForms["if"] = function(args, env) {
  if (args.length != 3)
    throw new SyntaxError("Bad number of args to if");

  if (evaluate(args[0], env) !== false)
    return evaluate(args[1], env);
  else
    return evaluate(args[2], env);
};

// Costrutto che elabora un ciclo while
specialForms["while"] = function(args, env) {
  if (args.length != 2)
    throw new SyntaxError("Bad number of args to while");

  while (evaluate(args[0], env) !== false)
    evaluate(args[1], env);

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

// Costrutto che elabora un ciclo do...while(=credo)
specialForms["do"] = function(args, env) {
  var value = false;
  args.forEach(function(arg) {
    value = evaluate(arg, env);
  });
  return value;
};

// costrutto per elaborare le variabili
specialForms["define"] = function(args, env) {
  // accetto un valore word come primo argomento e un'espressione che produce il valore da
  // assegnare a word
  // env è sempre l'oggetto globale che arriva da evaluate
  if (args.length != 2 || args[0].type != "word")
    throw new SyntaxError("Bad use of define");
  var value = evaluate(args[1], env);
  env[args[0].name] = value;
  return value;
};

specialForms["set"] = function(args, env) {  
  if (args.length != 2 || args[0].type != "word")    ù
    throw new SyntaxError("Bad use of set");  
  var varName = args[0].name;  
  var value = evaluate(args[1], env);  
  
  for (var scope = env; scope; scope = Object.getPrototypeOf(scope)) {    
    if (Object.prototype.hasOwnProperty.call(scope, varName)) {      
      scope[varName] = value;      
      return value;    
    }  
  }  
  
  throw new ReferenceError("Setting undefined variable " + varName);
};

specialForms["fun"] = function(args, env) {
  // in args ci sono tutti gli argomenti e l'ultimo è il corpo della funzione.
  
  if (!args.length) // se non ci sono argomenti sollevo un eccezzione
    throw new SyntaxError("Functions need a body");
  
  // funzione che controlla se l'oggetto è di tipo "word"
  function name(expr) {
    if (expr.type != "word")
      throw new SyntaxError("Arg names must be words");
    return expr.name;
  }
  
  // viene fatto un array con gli argomenti della funzione
  var argNames = args.slice(0, args.length - 1).map(name);
  var body = args[args.length - 1]; // l'ultimo elemento dell'array è il body della funzione

  return function() {
    if (arguments.length != argNames.length)
    // se ho +/- argomenti di quanto mi aspetto solleva un eccezzione
      throw new TypeError("Wrong number of arguments");
    
      var localEnv = Object.create(env);
    //console.log("localEnv", localEnv);
    for (var i = 0; i < arguments.length; i++)
      localEnv[argNames[i]] = arguments[i];
    
    return evaluate(body, localEnv);
  };
};




// topEnv  è l'oggetto ambiente che viene passato alla funzione evaluate
var topEnv = Object.create(null);
topEnv["true"] = true;
topEnv["false"] = false;

["+", "-", "*", "/", "==", "<", ">"].forEach(function(op) {
  topEnv[op] = new Function("a, b", "return a " + op + " b;");
});
topEnv["print"] = function(value) {
  console.log(value);
  return value;
};

topEnv["array"] = function(){
  return Array.prototype.slice.call(arguments);
};

topEnv["length"] = function(myarr){
  return myarr.length;
};

topEnv["element"] = function(myarr, i){
  return myarr[i];
};



// la funzione run offre una strada comoda per scrivere ed eseguire programmi
// Crea un nuovo ambiente e analizza e interpreta le stringhe che passiamo
function run() {
  var env = Object.create(topEnv);
  var program = Array.prototype.slice.call(arguments, 0).join("\n");

  //console.log(program);

  //program: albero sintattico, programma da eseguire
  //env: oggetto ambiente che associa nomi e valori

  var parseProgram = parse(program);

  return evaluate(parseProgram, env);
}


/*run("do(define(plusOne, fun(a, +(a, 1))),",
    "   print(plusOne(10)))");

run("do(define(total, 0),",
 "   define(count, 1),",
 "   while(<(count, 11),",
 "         do(define(total, +(total, count)),",
 "            define(count, +(count, 1)))),",
 "   print(total))");

run("do(define(pow, fun(base, exp,",
    "     if(==(exp, 0),",
    "        1,",
    "        *(base, pow(base, -(exp, 1)))))),",
    "   print(pow(2, 10)))");
*/

/* ESERCIZIO 1 */
/*run("do(define(sum, fun(array,",
    "     do(define(i, 0),",
    "        define(sum, 0),",
    "        while(<(i, length(array)),",
    "          do(define(sum, +(sum, element(array, i))),",
    "             define(i, +(i, 1)))),",
    "        sum))),",
    "   print(sum(array(1, 2, 3))))");
// → 6
*/

/* ESERCIZIO 2 */
run("do(define(f, fun(a, fun(b, +(a,b)))),",
    "   print(f(4)(5)))");


/* ESERCIZIO 3 */
//console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

//console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}


/* ESERCIZIO 4 */
run("do(define(x, 4),",    
    "   define(setx, fun(val, set(x, val))),",
    "   setx(50),",    
    "   print(x))");

// → 50

//run("set(quux, true)");
// → Some kind of ReferenceError