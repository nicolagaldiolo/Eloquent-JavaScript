// CREAZIONE DI UNA RICHIESTA AL SERVER COME CLIENT HTTP

var http = require("http");
var request = http.request({ // il primo argomento configura la richiesta
  hostname: "eloquentjavascript.net", // specifica il server a cui vuole parlare
  path: "/20_node.html", // il percorso da richiedere
  method: "GET", // il metodo da usare
  headers: {
    Accept: "text/html"
  } 
}, function(response) { // il secondo argomento è la funzione da chiamare quando arriva una risposta
    console.log("Server responded with status code", response.statusCode);
});

request.end();