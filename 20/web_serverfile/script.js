function request(url,method,body){
  return new Promise(function(succeed, fail){
    var req = new XMLHttpRequest();
    req.open(method, url, true);
    req.addEventListener("load", function(){
      if(req.status < 400){
        succeed(req.responseText);
      }else{
        fail(new Error("Request failed: " + req.statusText));  
      }
    });
    req.addEventListener("error", function(){
      fail(new Error("Network error"));
    });
    req.send(body);
  });
}

var listElement = document.querySelector("#filelist");
var textarea = document.querySelector("#file");

request("/httpdocs/", "GET").then(function(message){
  var fileList = message.split("\n");
  if(fileList.length){
    fileList.forEach(function(element) {
      var option = document.createElement("option");
      option.text = element;
      listElement.add(option);
    }, this);
  }
  loadCurrentFile();
}).catch(function(error){
  console.log(error)
});

function loadCurrentFile(){
  request("/httpdocs/" + listElement.value, "GET").then(function(message){
    textarea.value = message;
  }).catch(function(error){
    console.log(error)
  });
}

listElement.addEventListener("change", loadCurrentFile);

function saveFile(){
  request("/httpdocs/" + listElement.value, "PUT", textarea.value).then(function(){
    alert("File scritto correttamente!");
  }).catch(function(error){
    console.log(error)
  });
}