var fs = require("fs"); // modulo integrato di node per lavorare con il filesystem

// TUTTE QUESTE FUNZIONI FANNO DELLE CHIAMATE ASINCRONE, NON SAPENDO QUANDO ARRIVA LA RISPOSTA DI OGNUNA I VARI CONSOLE LOG CAMBIANO L'ORDINE IN BASE A QUANDO ARRIVANO LE RISPOSTE.
// QUASI TUTTE LE FUNZIONI DEL MODULO FS HANNO ANCHE UNA VERSIONE SINCRONA (VEDI ESEMPIO SOTTO)

// PER LEGGERE UN FILE
fs.readFile("file.txt", "utf8", function(error, text){ // il secondo argomento specifica la codifica del file, stiamo definendo utf8
  if(error)
    throw error;
  console.log("(ASINC) The file contained:", text, "\n\n");
});

fs.readFile("file.txt", function(error, buffer){ // se il secondo argomento non viene specificato node ci ritorna i dati binari.
  if(error)
    throw error;
  console.log("The file contained", buffer.length, "bytes.",
              "The first byte is:", buffer[0]);
});

// PER SCRIVERE UN FILE
fs.writeFile("graffiti.txt", "Node was here", function(err){
  if(err)
    console.log("Failed to write file:", err);
  else
    console.log("File written");
});


// PER LEGGERE UNA DIRECTORY
fs.readdir("./", function(err, files){
  if(err)
    throw err;
  console.log(files);
});

// PER RECUPERARE INFORMAZIONI SU UN FILE
fs.stat("./file.txt", function(err, stats){
  if(err)
    throw err;
  console.log(stats);
});


// PER RINOMINARE UN FILE
fs.rename("rename.txt", "renameNEW.txt", function(err){
  if(err)
    console.log("Failed to rename file:", err);
  else
    console.log("File renaimed");
});

// MODALITA' SINCRONA
// Attenzione che la modalità sincrona fa si che il programma si interrompe completamente finche non arriva la risposta, le la risposta tarda ad arrivare tutto resta in attesa che questa arrivi per procedere.

// PER LEGGERE UN FILE
console.log("(SINC) The file contained:", fs.readFileSync("file.txt", "utf8"));