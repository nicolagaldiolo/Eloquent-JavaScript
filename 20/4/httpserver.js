// CREAZIONE DI UN PICCOLO SERVER WEB CHE RICEVE UNA RICHIESTA E INVIA UNA RISPOSTA

var http = require("http");
var server = http.createServer(function(request, response){
  // QUESTA FUNZIONE ANONIMA VIENE ESEGUITA OGNI VOLTA CHE VIENE FATTA UNA RICHIESTA HTTP SULLA PORTA 8000
  // REQUEST è l'oggetto dove sono contenute le informazioni inviate dal cliente (INPUT)
  // response è l'oggetto con il quale inviamo risposte al client (OUTPUT)
  response.writeHead(200, {"Content-Type" : "text/html"}); // prepariamo l'header da mandare al client dicendo che lo stato della richiesta è ok e un oggetto che contiene i valori dell'header, in questo caso un documento HTML.
  // ora possiamo inviare la risposta con metodo response.write
  response.write("<h1>Hello!</h1>"); 
  response.write("<p>You asked for <code>" + request.url + "</code></p>"); 

  response.end(); // metodo che segnala la fine della risposta

});

server.listen(8000);
