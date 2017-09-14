var figlet = require("figlet");
figlet.text("Milkshake Themes!", function(error, data){
  if(error)
    console.log(error);
  else
    console.log(data);
});