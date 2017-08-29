// stampa un oggetto di tipo [object NodeList] contenente l'albero sintattico
console.log(document.body.childNodes); 
console.log(Object.prototype.toString.call( document.body.childNodes ));

console.log(document.body.firstChild); // Si riferisce al primo elemento contenuto dentro il body
console.log(document.body.firstChild.parentNode); // Si riferisce al padre del primo figlio dell'elemento body ossia sè stesso: body

// ogni nodo può avere al suo interno 3 oggetti identificati da un numero:
//  un tag: document.ELEMENT_NODE (1)
//  una stringa di testo: document.TEXT_NODE (3)
//  un commento: document.COMMENT_NODE (8)

console.log("---SCORRERE I NODI DEL DOM------------------------------------------");

function talkAbout(node, string){
  if(node.nodeType === document.ELEMENT_NODE){
    for(var i = 0; i < node.childNodes.length; i++){
      if(talkAbout(node.childNodes[i], string)){
        return true;
      }
    }
    return false;
  }else if(node.nodeType === document.TEXT_NODE){
    return node.nodeValue.indexOf(string) > -1;
  }
}

console.log(talkAbout(document.body, "book"));


console.log("---SELEZIONARE NODI DEL DOM------------------------------------------");

var link = document.body.getElementsByTagName("a")[0]; // recupero il primo link presente nel nodo
console.log(link.href);

var link2 = document.body.getElementsByClassName("secondo")[0]; // recupero il primo link con classe "secondo" presente nel nodo
console.log(link2.href);

var link3 = document.getElementById("terzo"); // recupero un elemento univoco presente nel nodo utilizzando ID
console.log(link3.href);

console.log("---RIMUOVERE ELEMENTI DAL DOM------------------------------------------");

var mySelector = document.body.getElementsByClassName("myContent")[0];
mySelector.removeChild(mySelector.childNodes[1]); //occhio che il selettore 0 fa riferimento al nodo testo incluso in myContent che è vuoto

console.log("---SPOSTARE/AGGIUNGERE ELEMENTI NEL DOM------------------------------------------");

var mySelector2 = document.body.getElementsByClassName("myContent2")[0];
var paragraphs = mySelector2.getElementsByTagName("p");

mySelector2.insertBefore(paragraphs[2], paragraphs[0]);
mySelector2.appendChild(paragraphs[1]);
mySelector2.appendChild(paragraphs[1]);
mySelector2.replaceChild(paragraphs[5], paragraphs[3]);


console.log("---CREARE NODI------------------------------------------");
function replaceImages(){
  // il ciclo che analizza le immagini deve partire dal fondo perchè l'elenco dei nodi restituito da un metodo come 
  // getElementsByTagName o proprietà come childNodes è vivo e cambia man mano che viene aggiornato il documento.
  // Se partissimo dall'inizio, togliere la prima immagine eliminerebbe il primo elemento dell'elenco e al secondo ciclo
  // i è 1 e si ferma perchè anche la lunghezza dell'elenco nel frattempo è diventata 1.
  var images = document.body.getElementsByTagName("img");
  for(var i = images.length -1; i >= 0; i--){
    var image = images[i];
    if(image.alt){
      var text = document.createTextNode(image.alt);
      image.parentNode.replaceChild(text, image);
    }
  }
}
function replaceImages2(){
  // una possibile alternativa sarebbe di salvare la lunghezza dell'array delle immagini in una variabile TEST così che non venga cambiata
  // e nel ciclo quindi non chiamo + images.length che ovviamente ad ogni ciclo si accorcia ma chiamo TEST che ha il valore iniziale
  // siccome ad ogni ciclo elimino la prima immagine l'immagine da analizzare è sempre la prima ossia images[0]
  var images = document.body.getElementsByTagName("img");
  var test = images.length;
  for(var i = 0; i < test; i++){
    if(images[0].alt){
      var text = document.createTextNode(images[0].alt);
      images[0].parentNode.replaceChild(text, images[0]);
    }
  }
}

function customTag(node){
  var element = document.createElement(node);
  // dato che ho l'esigenza di partire dal secondo parametro passato alla funzione customTag o due modi per farlo:
  // 1: valorizzo var i=1 in modo che parta già dal secondo elemento e faccio quindi a meno della var args
  // 2: mi creo un nuovo array solo dal secondo elemento in poi però dato che arguments è un oggetto lo devo prima trasformare in array 
  // e poi fare lo slice dall'elemento con id 1 (2° elemento)
  
  var args = [].slice.call(arguments, 1); // alternativa sintattica: Array.prototype.slice.call(arguments, 1);
  for( var i = 0; i<args.length; i++){
    child = args[i];
    if(typeof child === "string")
      child = document.createTextNode(child);
    element.appendChild(child);
  }
  return element;
}

document.getElementById("quote").appendChild(
  customTag("footer", "-",
    customTag("strong", "Karl Popper"),
    ", preface to the second edition of ",
    customTag("em", "The Open Society and Its Enemies"),
    ", 1950"));