var http = require("http"), fs = require("fs"); // includo i moduli che mi servono

var methods = Object.create(null); // definisco un oggetto vuoto che poi conterrà i vari metodi funzioni

http.createServer(function(request, response) { // creo il server node
  function respond(code, body, type) { // funzione che viene passata come callback alle funzioni che gestiscono i vari metodi per concludere una richiesta con una risposta.
    //args: codice di stato HTTP | un corpo (messaggio) | e un tipo di contenuti (mime)
    if (!type) type = "text/plain";
    response.writeHead(code, {"Content-Type": type});
    // se il corpo è un flusso in lettura uso il metodo pipe per trasferire un flusso in lettura a uno in scrittura
    if (body && body.pipe)
      body.pipe(response);
    else // altrimenti se il corpo è null o una stringa lo ritorno al metodo end della risposta
      response.end(body);
  }
  if (request.method in methods){ // se il metodo della richiesta è tra quelli permessi/gestiti lancio quel metodo altrimenti 
    methods[request.method](urlToPath(request.url), respond, request);
  }else{ // rispondo dicendo che il metodo non è gestito
    respond(405, "Method " + request.method + " not allowed.");
  }

}).listen(8000);

// funzione che converte l'url della richiesta per creare un path alla "document root".
function urlToPath(url) { // accetta un url es: /file.txt
  var path = require("url").parse(url).pathname; // crea il path
  return "." + decodeURIComponent(path); // lo decodifica per eliminare eventuali spazi (es: %20) e aggiunge all'inizio un solo punto per ottenere un percorso relativo alla directory corrente.
}

// il metodo restituisce un elenco di file quando trova una directory o il contenuto del file quando trova un solo file.
methods.GET = function(path, respond) {
  fs.stat(path, function(error, stats) { // fs.stat esamina le informazioni sui file per scoprire se il file esiste e se è una directory (è un operazione asincrona in quanto fs.stat deve interagire col server).
    if (error && error.code == "ENOENT"){ // se il file non esiste la funzione di callback torna un oggetto error con proprietà "ENOENT"
      respond(404, "File not found");
    }else if (error){ // tutti gli altri tipi di errore li ritorniamo com errore 500
      respond(500, error.toString());
    
      // se il file esiste la funzione di callback torna un oggetto stats (stats contiene tante info sul file come dimensioni, data modifica ecc).
    }else if (stats.isDirectory()){ // controllo se è una directory
      fs.readdir(path, function(error, files) { // funzione che restituisce un array di stringhe con l'elendo dei files
        if (error) // se ci sono errori torno l'errore chiamando la mia funzione respond
          respond(500, error.toString());
        else // altrimenti torno l'elenco dei file
          respond(200, files.join("\n"));
      });
    }else{ // altrimenti è un file
      respond(200, fs.createReadStream(path), require("mime").getType(path)); // torno 200 perchè il file esiste, con la funzione createReadStream torno il contenuto del file (operazione asincrona perchè può metterci un pò), e torno il mimetype
    }
  });
};

methods.DELETE = function(path, respond) {
  fs.stat(path, function(error, stats) {
    if (error && error.code == "ENOENT")
      respond(204);
    else if (error)
      respond(500, error.toString());
    else if (stats.isDirectory())
      fs.rmdir(path, respondErrorOrNothing(respond));
    else
      fs.unlink(path, respondErrorOrNothing(respond));
  });
};

function respondErrorOrNothing(respond) {
  return function(error) {
    if (error)
      respond(500, error.toString());
    else
      respond(204);
  };
}

methods.PUT = function(path, respond, request) {
  var outStream = fs.createWriteStream(path);
  outStream.on("error", function(error) {
    respond(500, error.toString());
  });
  outStream.on("finish", function() {
    respond(204);
  });
  request.pipe(outStream);
};