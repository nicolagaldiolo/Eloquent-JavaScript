var http      = require("http");
var Router    = require("./router");
var ecstatic  = require("ecstatic");
var fs        = require("fs")

var fileServer = ecstatic({root: "./public"});
var router = new Router();

http.createServer(function(request, response) {
  if (!router.resolve(request, response))
    fileServer(request, response);
}).listen(8000);

function respond(response, status, data, type) {
  response.writeHead(status, {"Content-Type": type || "text/plain"});
  response.end(data);
}

function respondJSON(response, status, data) {
  respond(response, status, JSON.stringify(data), "application/json");
}

var talks = loadTalks();

function loadTalks(){
  var result = Object.create(null), json;
  try{
    json = JSON.parse(fs.readFileSync("./talks.json", "utf8"));
  }catch(e){
    json = {};
  }
  for(var title in json)
    result[title] = json[title];
  return result;
}



// funzione di gestione per visualizzare le presentazioni
router.add("GET", /^\/talks\/([^\/]+)$/, function(request, response, title) {
  if (title in talks)
    respondJSON(response, 200, talks[title]);
  else
    respond(response, 404, "No talk '" + title + "' found");
});

// funzione di gestione per eliminare le presentazioni
router.add("DELETE", /^\/talks\/([^\/]+)$/, function(request, response, title) {
  if (title in talks) {
    delete talks[title];
    registerChange(title);
  }
  respond(response, 204, null);
});

// funzione con lo scopo di recuperare il contenuto dei corpi delle richieste in formato JSON
function readStreamAsJSON(stream, callback) {
  var data = "";
  stream.on("data", function(chunk) {
    data += chunk;
  });
  stream.on("end", function() {
    var result, error;
    try { result = JSON.parse(data); }
    catch (e) { error = e; }
    callback(error, result);
  });
  stream.on("error", function(error) {
    callback(error);
  });
}

// funzione di gestione per creare nuove presentazioni
router.add("PUT", /^\/talks\/([^\/]+)$/, function(request, response, title) {
  readStreamAsJSON(request, function(error, talk) {
    if (error) {
      respond(response, 400, error.toString());
    // Per ragioni di sicurezza mi assicuro che talk.presenter e talk.summary mi vengano passati come stringhe
    } else if (!talk || typeof talk.presenter != "string" || typeof talk.summary != "string") {
      respond(response, 400, "Bad talk data");
    } else {
      talks[title] = {title: title,
                      presenter: talk.presenter,
                      summary: talk.summary,
                      comments: []};
      registerChange(title);
      respond(response, 204, null);
    }
  });
});

// funzione di gestione per aggiungere commenti 
router.add("POST", /^\/talks\/([^\/]+)\/comments$/, function(request, response, title) {
  readStreamAsJSON(request, function(error, comment) {
    if (error) {
      respond(response, 400, error.toString());
    // Per ragioni di sicurezza mi assicuro che comment.author e comment.message mi vengano passati come stringhe
    } else if (!comment || typeof comment.author != "string" || typeof comment.message != "string") {
      respond(response, 400, "Bad comment data");
    } else if (title in talks) {
      talks[title].comments.push(comment);
      registerChange(title);
      respond(response, 204, null);
    } else {
      respond(response, 404, "No talk '" + title + "' found");
    }
  });
});

// funzione ausiliaria che aggiunge il campo server time alle risposte
function sendTalks(talks, response){
  respondJSON(response, 200, {
    serverTime: Date.now(),
    talks: talks
  });
}

router.add("GET", /^\/talks$/, function(request, response) {
  var query = require("url").parse(request.url, true).query; // se alla funzione parse passo true come 2° parametro verranno analizzati anche i parametri "query" dell'url e l'ggetto tornato avrà anche la proprietà string con a sua 
  // volta un oggetto con nome dei poarametri e rispettivi valori.
  if (query.changesSince == null) { // se non ho ancora passato una data torno tutti i talk
    var list = [];
    for (var title in talks)
      list.push(talks[title]);
    sendTalks(list, response);
  } else { // altrimenti analizzo query.changesSince
    var since = Number(query.changesSince);
    if (isNaN(since)) { // se query.changesSince non è un numero torno un errore
      respond(response, 400, "Invalid parameter");
    } else { // altrimenti torno i talk 
      var changed = getChangedTalks(since); // la funzione torna un array di presentazioni che sono state modificate da un certo orario.
      if (changed.length > 0) // se ce ne sono le torno
        sendTalks(changed, response);
      else // altrimenti non ho niente da trasmettere e resto in attesa
        waitForChanges(since, response);
    }
  }
});

var waiting = [];

function waitForChanges(since, response) {
  var waiter = {since: since, response: response};
  waiting.push(waiter);
  setTimeout(function() {
    var found = waiting.indexOf(waiter);
    if (found > -1) {
      waiting.splice(found, 1);
      sendTalks([], response);
    }
  }, 90 * 1000);
}

var changes = [];

function registerChange(title) {
  changes.push({title: title, time: Date.now()});
  waiting.forEach(function(waiter) {
    sendTalks(getChangedTalks(waiter.since), waiter.response);
  });
  waiting = [];

  fs.writeFile("./talks.json", JSON.stringify(talks), function(err){
    if(err)
      console.log("Failed to write file:", err);
  });
}
 
// Funzione che restituisce un array di presentazioni che sono state modificate da un certo orario
function getChangedTalks(since) {
  var found = [];
  function alreadySeen(title) {
    return found.some(function(f) {return f.title == title;});
  }
  for (var i = changes.length - 1; i >= 0; i--) {
    var change = changes[i];
    if (change.time <= since)
      break;
    else if (alreadySeen(change.title))
      continue;
    else if (change.title in talks)
      found.push(talks[change.title]);
    else
      found.push({title: change.title, deleted: true});
  }
  return found;
}