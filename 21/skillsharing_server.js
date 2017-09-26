var http = require("http");
var Router = require("./router");
var ecstatic = require("ecstatic");

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
  respond(response, status, JSON.stringify(data),
          "application/json");
}

var talks = Object.create(null);

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
  var query = require("url").parse(request.url, true).query;
  if (query.changesSince == null) {
    var list = [];
    for (var title in talks)
      list.push(talks[title]);
    sendTalks(list, response);
  } else {
    var since = Number(query.changesSince);
    if (isNaN(since)) {
      respond(response, 400, "Invalid parameter");
    } else {
      var changed = getChangedTalks(since);
      if (changed.length > 0)
         sendTalks(changed, response);
      else
        waitForChanges(since, response);
    }
  }
});