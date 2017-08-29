// array di stringhe che rappresenta la griglia di un livello
var simpleLevelPlan = [
  "                      ",
  "                      ",
  "  x              = x  ",
  "  x         o o    x  ",
  "  x @      xxxxx   x  ",
  "  xxxxx            x  ",
  "      x!!!!!!!!!!!!x  ",
  "      xxxxxxxxxxxxxx  ",
  "                      "
];


// funzione costruttore di un livello, si aspetta un parametro plan e disegna il livello
function Level(plan) {
  this.width = plan[0].length; // lunghezza del piano (conto quanto è lungo il primo elemento dell'array)
  this.height = plan.length; // altezza del piano (conto di quanto elementi è composto l'array)
  this.grid = []; // array di array che contiene ogni singolo elemento (statico) della griglia
  this.actors = []; // array che contiene gli attori (elementi dinamici)

  for (var y = 0; y < this.height; y++) { // mi giro tutti gli elementi dell'array
    var line = plan[y] // mi definisco una variabile che identifica ogni linea
    var gridLine = []; // mi definisco un array che identifica ogni elemento di una riga
    for (var x = 0; x < this.width; x++) { // mi giro in dettaglio da cosa è composto ogni elemento dell'array
      
      // per ogni elemento mi definisco 3 variabili che identificano il tipo di elemento:
      var ch = line[x];
      var fieldType = null; 
      var Actor = actorChars[ch];
      
      if (Actor) // Per actor è inteso tutto ciò che si muove (Player, Coin, Lava) che vado a salvare in un array a parte.
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x") // Elementi statici
        fieldType = "wall";
      else if (ch == "!") // Elementi statici (occhio che la lava è di 4 tipi, 3 sono elementi mobili mentre questo è statico)
        fieldType = "lava";

      gridLine.push(fieldType); // ad ogni passaggio aggiunto all'array gridLine il tipo di carattere che ho trovato (es: player, coin, lava, ecc...)
    }
    this.grid.push(gridLine); // aggiungo l'array di ogni riga
  }

  // mi salvo l'oggetto attore che rappresenta il player
  this.player = this.actors.filter(function(actor) {
    return actor.type == "player";
  })[0];

  // setto la proprietà status (informazione che mi dice se il giocatore a vinto o perso) e finishDelay (variabile che mi viene valorizzata se il giocatore vince o perde con lo scopo di mostrare un'animazione) a null
  this.status = this.finishDelay = null;
}

// metodo che mi permette di sapere se il livello è terminato:
Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};


// Oggetto per calcolare le posizioni
function Vector(x, y) {
  this.x = x; 
  this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};
// Oggetto per calcolare le posizioni




var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava, "|": Lava, "v": Lava
};

// Definizione della classe Player
function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";

// Definizione della classe Coin
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2; // ????????? // Per movimentare un po il gioco diamo un effetto di ondulamento con piccoli movimento su e giù
}
Coin.prototype.type = "coin";

// Definizione della classe Lava
function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";



// funzione ausiliaria che dato un parmetro name e una classe crea un oggetto del dom e gli assegna la classe (se passata).
function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

var scale = 20; // valore che stabilisce la scala di grandezza del gioco, tutte le dimensioni sono fatte relative a questo valore.

// Funzione che crea la tabella basandosi sulle dimensioni del livello.
// fa un doppio foreach girandosi layer creando tr e td.
// per ogni td semplicemente assegna una classe con il nome dell'oggetto corrispettivo (wall, )
DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};

// metodo che mi permette di creare tutti gli attori e dare loro una dimensione e posizione in base alle loro proprietà.
DOMDisplay.prototype.drawActors = function() {
  var wrap = elt("div");
  this.level.actors.forEach(function(actor) {
    var rect = wrap.appendChild(elt("div", "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer) // elimino eventuali attori e successivamente li ridisegno nella nuova posizione
    this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || "");
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth; // larghezza interna dell'elemento game (escluso bordo e margin)
  var height = this.wrap.clientHeight; // altezza interna dell'elemento game (escluso bordo e margin)
  var margin = width / 3; // 1/3 della larghezza

  // The viewport
  var left = this.wrap.scrollLeft; // eventuali pixel scrollati da sinistra
  var right = left + width;
  var top = this.wrap.scrollTop;
  var bottom = top + height; // eventuali pixel scrollati dall'alto

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5)).times(scale); // posizione del giocatore

  // lo scopo è fare in modo che il player sia sempre al centro dello schermo
  if (center.x < left + margin){
    this.wrap.scrollLeft = center.x - margin; 
  }else if (center.x > right - margin){
    this.wrap.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin){
    this.wrap.scrollTop = center.y - margin;
  }else if (center.y > bottom - margin){
    this.wrap.scrollTop = center.y + margin - height;
  }
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

Level.prototype.obstacleAt = function(pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return "wall";
  if (yEnd > this.height)
    return "lava";
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};

Level.prototype.actorAt = function(actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};

var maxStep = 0.05;

Level.prototype.animate = function(step, keys) {
  if (this.status != null)
    this.finishDelay -= step;

  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

var wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

var playerXSpeed = 7;

Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
};

var gravity = 30;
var jumpSpeed = 17;

Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);

  // Losing animation
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

Level.prototype.playerTouched = function(type, actor) {
  if (type == "lava" && this.status == null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type == "coin") {
    this.actors = this.actors.filter(function(other) {
      return other != actor;
    });
    if (!this.actors.some(function(actor) {
      return actor.type == "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};

var arrowCodes = {37: "left", 38: "up", 39: "right"};

function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (andThen)
        andThen(level.status);
      return false;
    }
  });
}

function runGame(plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function(status) {
      if (status == "lost")
        startLevel(n);
      else if (n < plans.length - 1)
        startLevel(n + 1);
      else
        console.log("You win!");
    });
  }
  startLevel(0);
}


//var simpleLevel = new Level(simpleLevelPlan);
//var display = new DOMDisplay(window.document.body, simpleLevel);
