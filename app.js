const express = require("express");
const mysql   = require("mysql");
const app = express();
//const session = require('express-session');

app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method

app.get("/", async function(req, res){
    res.render("index");
}); //root





//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});