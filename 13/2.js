console.log("---ATTRIBUTI------------------------------------------");
var myElement = document.getElementById("idLink");
console.log("----attributi standard----");
console.log(myElement);
console.log(myElement.target);
console.log(myElement.href);
console.log(myElement.id);
console.log(myElement.className);
console.log("----attributi custom----");
console.log(myElement.getAttribute("data-attribute"));

// list elenco attributi disponibili: https://www.w3schools.com/jsref/dom_obj_all.asp

var paras = document.body.getElementsByClassName("attribute");
Array.prototype.forEach.call(paras, function(para){
  if( para.getAttribute("data-classified") === "secret")
    para.parentNode.removeChild(para);
  });



function highlightCode(node, keywords){
  // node p il blocco di codice incluso nel pre
  // keyword è l'espressione regolare da analizzare
  var text = node.textContent; 
  //salvo il contenuto del nodo (pre) in una variabile in modo da poterla svuotare senza bruciarmi il contenuto
  node.textContent = ""; //svuoto il nodo così posso inserirci il nuovo contenuto 

  var match, pos = 0;
  var count = 1;
  while (match = keywords.exec(text)){
    
    // salvo in before tutto ciò che ce tra l'inizio della stringa e il primo match
    var before = text.slice(pos, match.index);
    
    //creo un nodo di testo con il contenuto di before e lo appendo al mio nodo
    node.appendChild(document.createTextNode(before));
    
    // creo un tag strong, gli inserisco il contenuto del primo match trovato e lo aggiungo al nodo
    var strong = document.createElement("strong");
    strong.appendChild(document.createTextNode(match[0]));
    node.appendChild(strong);
    
    // aggiorno la posizione con l'indice dell'ultima occorrenza trovata in modo da ripartire da li 
    // quando ricomincio il ciclo
    pos = keywords.lastIndex; 

  }
  var after = text.slice(pos);
  node.appendChild(document.createTextNode(after));
}

var languages = {
  javascript: /\b(function|return|var)\b/g
};

function highlightAllCode(){
  var pres = document.body.getElementsByTagName("pre");
  for (var i=0; i< pres.length; i++){
    var pre = pres[i];
    var lang = pre.getAttribute("data-language");
    if(languages.hasOwnProperty(lang))
      highlightCode(pre, languages[lang]);
  }
}

highlightAllCode();


console.log("---Layout------------------------------------------");
var myTitle = document.getElementById("myTitle");
console.log(myTitle);
console.log(myTitle.offsetWidth); //indica la larghezza interna dell'elemento (margine escluso)
console.log(myTitle.offsetHeight); //indica l'altezzza interna dell'elemento (margine escluso)
console.log(myTitle.clientWidth); //indica la larghezza interna dell'elemento (margine e bordo escluso)
console.log(myTitle.clientHeight); //indica l'altezzza interna dell'elemento (margine e bordo escluso)
console.log(myTitle.getBoundingClientRect()); // torna un oggetto con le proprietà top, bottom, left, right 
//che indicano le posizioni dei lati dell'elemento rispetto al punto  0.0 in alto a sinistra.

console.log(pageXOffset);
console.log(pageYOffset);

function time(name, action){
  var start = Date.now(); // Current time in milliseconds
  action();
  console.log(name, "took", Date.now() - start, "ms");
}

time("naive", function(){
  var target = document.getElementById("one");
  while(target.offsetWidth < 2000)
    target.appendChild(document.createTextNode("X"));
});

time("clever", function(){
  var target = document.getElementById("two");
  target.appendChild(document.createTextNode("XXXXX"));
  var total = Math.ceil(2000 / (target.offsetWidth / 5));
  for(var i = 5; i <= total; i++)
    target.appendChild(document.createTextNode("X"));
});