var http = require("http");
http.createServer(function(request, response){
  response.writeHead(200, {"Content-Type": "text/plain"});
  request.on("data", function(chunk){ // gestori di eventi di node simili a addEventListner
    response.write(chunk.toString().toUpperCase());
  });
  request.on("end", function(){ // gestori di eventi di node simili a addEventListner
    response.end();
  });
}).listen(8000);