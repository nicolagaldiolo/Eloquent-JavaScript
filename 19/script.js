// funziona ausiliaria per la creazione degli elementi del DOM.
function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

var controls = Object.create(null);

function createPaint(parent) {
  var canvas = elt("canvas", {width: 800, height: 500});
  var cx = canvas.getContext("2d");
  var toolbar = elt("div", {class: "toolbar"});
  //console.log(controls);
  for (var name in controls)
    toolbar.appendChild(controls[name](cx));

  var panel = elt("div", {class: "picturepanel"}, canvas);
  parent.appendChild(elt("div", null, panel, toolbar));
}

var tools = Object.create(null);

controls.tool = function(cx) {
  var select = elt("select");
  for (var name in tools){
    select.appendChild(elt("option", null, name)); 
  }

  cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      tools[select.value](event, cx);
      event.preventDefault();
    }
  });

  return elt("span", null, "Tool: ", select);
};

function relativePos(event, element) {
  var rect = element.getBoundingClientRect(); // modo + efficace per trovare la posizione precisa dell'elemento sullo schermo 
  // mi torna un oggetto con le proprietà top right bottom left che indicano le posizioni dei lati dell'elemento relative all'angolo superiore sx dello schermo.

  // event.clientX e event.clientY fanno riferimento all'oggetto window però a noi servono relative all'oggetto canvas quindi noi sottraiamo la posizione del mouse alla posizione dell'oggetto canvas per 
  // avere la posizione del mouse relativa all'oggetto canvas.
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}

function absolutePos(event) {
  return {x: event.clientX,
          y: event.clientY};
}

function trackDrag(onMove, onEnd) {
  function end(event) {
    removeEventListener("mousemove", onMove);
    removeEventListener("mouseup", end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener("mousemove", onMove);
  addEventListener("mouseup", end);
}

tools.Line = function(event, cx, onEnd) {
  cx.lineCap = "round"; // proprietà che permette di tracciare linee arrotondate e non squadrate.

  var pos = relativePos(event, cx.canvas);
  trackDrag(function(event) {
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
  }, onEnd);
};

tools.Erase = function(event, cx) {
  cx.globalCompositeOperation = "destination-out";
  tools.Line(event, cx, function() {
    cx.globalCompositeOperation = "source-over";
  });
};

var colorPicker = elt("input", {type: "color"});
controls.color = function(cx){

  colorPicker.addEventListener("change", function(){
    cx.fillStyle = colorPicker.value; //fillStyle colore di riempimento
    cx.strokeStyle = colorPicker.value; //strokeStyle colore del bordo
  });
  return elt("span", null, "Color: ", colorPicker);
}

controls.brushSize = function(cx) {
  var select = elt("select");
  var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
  sizes.forEach(function(size, index) {
    var attr = index === 2 ? {value: size, selected:""} : {value: size};
    select.appendChild(elt("option", attr, size + " pixels"));
  });
  select.addEventListener("change", function() {
    cx.lineWidth = select.value;
  });
  return elt("span", null, "Brush size: ", select);
};

controls.save = function(cx) {
  var link = elt("a", {href: "/"}, "Save");
  function update() {
    try {
      link.href = cx.canvas.toDataURL();
    } catch (e) {
      if (e instanceof SecurityError)
        link.href = "javascript:alert(" +
          JSON.stringify("Can't save: " + e.toString()) + ")";
      else
        throw e;
    }
  }
  link.addEventListener("mouseover", update);
  link.addEventListener("focus", update);
  return link;
};

function loadImageURL(cx, url) {
  var image = document.createElement("img");
  image.addEventListener("load", function() {
    var color = cx.fillStyle, size = cx.lineWidth;
    cx.canvas.width = image.width;
    cx.canvas.height = image.height;
    cx.drawImage(image, 0, 0);
    cx.fillStyle = color;
    cx.strokeStyle = color;
    cx.lineWidth = size;
  });
  image.src = url;
}

controls.openFile = function(cx){
  var input = elt("input", {type: "file"});
  input.addEventListener("change", function(){
    if(input.files.length == 0)
      return;
    var reader = new FileReader();
    reader.addEventListener("load", function(){
      loadImageURL(cx, reader.result);
    });
    reader.readAsDataURL(input.files[0]);
    //FileReader.readAsDataURL() - Starts reading the contents of the specified Blob, once finished, the result attribute contains a data: URL representing the file's data.
    //FileReader.readAsText() - Starts reading the contents of the specified Blob, once finished, the result attribute contains the contents of the file as a text string.
  });
  return elt("div", null, "Open file: ", input);
};

controls.openURL = function(cx){
  var input = elt("input", {type: "text"});
  var form = elt("form", null, "Open URL: ", input, elt("button", {type:"submit"}, "load"));
  form.addEventListener("submit", function(event){
    event.preventDefault();
    loadImageURL(cx, input.value);
  });
  return form;
}

tools.text = function(event, cx){
  var text = prompt("Text:", "");
  if(text){
    var pos = relativePos(event, cx.canvas);
    cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
    cx.fillText(text, pos.x, pos.y);
  }
}

tools.Spray = function(event, cx) {
  var radius = cx.lineWidth / 2;
  var area = radius * radius * Math.PI;
  var dotsPerTick = Math.ceil(area / 30); // calcolo l'area del cerchio (raggio * raggio * pigreco)

  var currentPos = relativePos(event, cx.canvas);
  var spray = setInterval(function() {
    for (var i = 0; i < dotsPerTick; i++) {
      var offset = randomPointInRadius(radius);
      cx.fillRect(currentPos.x + offset.x,
                  currentPos.y + offset.y, 1, 1);
    }
  }, 25);
  trackDrag(function(event) {
    currentPos = relativePos(event, cx.canvas);
  }, function() {
    clearInterval(spray);
  });
};

function randomPointInRadius(radius) {
  for (;;) { // il ciclo viene inizializato senza condizioni, andrebbe all'infinito fino che non viene ritornato.
    var x = Math.random() * 2 - 1;
    var y = Math.random() * 2 - 1;
    if (x * x + y * y <= 1)
      return {x: x * radius, y: y * radius};
  }
}

// Add Rectangle Tool
function rectangleFrom(a, b) {
  return {left: Math.min(a.x, b.x),
          top: Math.min(a.y, b.y),
          width: Math.abs(a.x - b.x),
          height: Math.abs(a.y - b.y)};
}

tools.Rectangle = function(event, cx) {
  var relativeStart = relativePos(event, cx.canvas);
  var pageStart = absolutePos(event);  
  var trackingNode = document.createElement("div");
  trackingNode.style.position = "absolute";
  trackingNode.style.background = "rgba(219, 219, 219,.8)";
  document.body.appendChild(trackingNode);

  trackDrag(function(event) {    
    var rect = rectangleFrom(pageStart, absolutePos(event));
    trackingNode.style.left = rect.left + "px";
    trackingNode.style.top = rect.top + "px";
    trackingNode.style.width = rect.width + "px";
    trackingNode.style.height = rect.height + "px";

  }, function(event){
    var rect = rectangleFrom(relativeStart, relativePos(event, cx.canvas));
    cx.fillRect(rect.left, rect.top, rect.width, rect.height);
    document.body.removeChild(trackingNode);
  });
};

function colorAt(cx, x, y){
  var data = cx.getImageData(x, y, 1, 1).data;
  //console.log(data);
  var color = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
  return rgb2hex(color);
}

function rgb2hex(rgb){
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

tools["Pick color"] = function(event, cx) {
  var pos = relativePos(event, cx.canvas);

  try {
    var color = colorAt(cx, pos.x, pos.y);
  } catch(e) {
    if (e instanceof SecurityError) {
      alert("Unable to access your picture's pixel data");
      return;
    } else {
      throw e;
    }
  }

  cx.fillStyle = color;
  cx.strokeStyle = color;
  colorPicker.value = color;

};

// Call a given function for all horizontal and vertical neighbors of the given point.
function forAllNeighbors(point, fn) {
  fn({x: point.x, y: point.y + 1});
  fn({x: point.x, y: point.y - 1});
  fn({x: point.x + 1, y: point.y});
  fn({x: point.x - 1, y: point.y});
}

function isSameColor(data, pos1, pos2){
  // funzione che controlla 2 pixel vicini e mi torna se sono uguali
  var offset1 = (pos1.x + pos1.y * data.width) * 4;
  var offset2 = (pos2.x + pos2.y * data.width) * 4;
  for(var i = 0; i < 4; i++){
    if(data.data[offset1 + i] !== data.data[offset2 + i])
      return false;
  }
  return true;
}


tools["Flood fill"] = function(event, cx) {
  var startPos = relativePos(event, cx.canvas);
  var data = cx.getImageData(0,0,cx.canvas.width, cx.canvas.height);
  
  // An array with one place for each pixel in the image.
  var alreadyFilled = new Array(data.width * data.height);
  
  // This is a list of same-colored pixel coordinates that we have not handled yet.
  var workList = [startPos];
  
  while(workList.length){
    var pos = workList.pop();
    var offset = pos.x + data.width * pos.y;
    if(alreadyFilled[offset]){
      continue;
    }else{
      cx.fillRect(pos.x, pos.y, 1, 1);
      alreadyFilled[offset] = true;
      
      forAllNeighbors(pos, function(neighbor){
        if (neighbor.x >= 0 && neighbor.x < data.width && neighbor.y >= 0 && neighbor.y < data.height && isSameColor(data, pos, neighbor))
          workList.push(neighbor);
      });
    }
  }

};
