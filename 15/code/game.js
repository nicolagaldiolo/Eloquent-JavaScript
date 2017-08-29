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
  console.log(this.wobble);
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
  console.log(level);
  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

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
      console.log(type);
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};

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
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5))
                 .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};


var scale = 20; // valore che stabilisce la scala di grandezza del gioco, tutte le dimensioni sono fatte relative a questo valore.
var simpleLevel = new Level(simpleLevelPlan);
var display = new DOMDisplay(window.document.body, simpleLevel);
console.log(simpleLevel.actors);