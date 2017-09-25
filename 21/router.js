var Router = module.exports = function() {
  this.routes = [];
};

// Metodo che permette all'oggetto router di registrare nuove funzioni di gestione
Router.prototype.add = function(method, url, handler) {
  this.routes.push({method: method, url: url, handler: handler});
};

// Metodo che permette all'oggetto router di risolvere richieste
Router.prototype.resolve = function(request, response) {
  var path = require("url").parse(request.url).pathname;

  return this.routes.some(function(route) { // il metodo some cicla un array e esegue la funzione per ogni elemento dell'array e torna TRUE alla prima adatta
    var match = route.url.exec(path);
    if (!match || route.method != request.method)
      return false;

    var urlParts = match.slice(1).map(decodeURIComponent);
    route.handler.apply(null, [request, response].concat(urlParts));
    return true;
  });
};
