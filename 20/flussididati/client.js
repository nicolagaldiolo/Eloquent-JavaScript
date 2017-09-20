var http = require("http");
var request = http.request({
  hostname: "localhost",
  port: 8000,
  method: "POST"
}, function(response){
  response.on("data", function(chunk){ // gestori di eventi di node simili a addEventListner
    process.stdout.write(chunk.toString());
  });
});
request.write("Test"); // posso trasmettere dei dati col metodo write
request.end("Hello server"); // ma posso anche passare d0ei dati quando chiudo la richiesta