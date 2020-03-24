const express = require("express");
const mysql   = require("mysql");
const app = express();
const {Client} = require('pg');
//const session = require('express-session');

app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method

app.get("/", async function(req, res){
    res.render("index");
}); //root

app.get("/login", async function(req, res){
    res.render("login");
    
}); // login

app.get("/search", async function(req, res){
    res.render("search");
}); // search

/*
app.get("/cart", async function(req, res){
    let rows = await getCartShoes();
    //let rowsSecond = await getCartNonPlanets();
    //res.render("cart", {"cartPlanets":rows, "cartNonPlanets":rowsSecond});
    res.render("cart", {"cartShoes":rows})
});

app.get("/clearCart", async function(req, res){
    clearCart();
    let rows = await getCartShoes();
    res.render("cart", {"cartShoes":rows});
});
*/

//values in red must be updated
function dbConnection(){

   let conn = mysql.createConnection({
                 host: "ec2-18-213-176-229.compute-1.amazonaws.com",
                 user: "hptikosghjykbf",
             password: "78470a52c982fe07849cb7585b2aa82144e535734f330c003241e864cc9995e1",
             database: "ddgvmc8jol14f9"
       }); //createConnection

return conn;

}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});
