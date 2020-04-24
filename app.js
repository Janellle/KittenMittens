const express = require("express");
const mysql   = require("mysql");
const app = express();
const session = require('express-session');


app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 60000 }}));

app.get("/", async function(req, res){
    let prodList = await getProdList();  
    res.render("index", {"prodList":prodList});
});//root

app.get("/productPage", async function(req, res){
    res.render("productPage");
});

app.get("/productView", async function(req, res){
    res.render("productView");
});

app.get("/login", function(req, res){
    res.render("login");
    
}); // login

app.get("/search", async function(req, res){
    res.render("search");
}); // search

app.get("/cart", async function(req, res){
    let rows = await getCartProd();
    res.render("cart", {"cartProds":rows});
}); // cart

app.get("/signUp", async function(req, res){
   res.render("signUp"); 
}); // sign up

app.post("/signUp", async function(req, res){
  let rows = await addAcc(req.body);
  console.log(rows);
  
  let message = "Account was not created!";
  if (rows.affectedRows > 0) {
      message = "Account successfully created!";
  }
  res.render("login", {"message":message});
    
});

app.get("/clearCart", async function(req, res){
    clearCart();
    let rows = await getCartProd();
    res.render("cart", {"cartProds":rows});
});

app.get("/results", async function(req, res){
    let rows = await getProds(req.query);
    res.render("results", {"products":rows});
}); // results


app.post("/addToCart", async function(req, res){
    insertToCart(req.body.prodName, req.body.prodPrice);
    res.send(true);
}); // results

app.get("/admin", async function(req, res){
    
   console.log("authenticated: ", req.session.authenticated);    
   
   if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
       
     let prodList = await getProdList();  
     res.render("admin", {"prodList":prodList});  
       
   }  else { 
    
       res.render("login"); 
   
   }
});

app.post("/loginProcess", async function(req, res) {
    
    let users = await getUsers();
    var validAcc = false;
    var validPass = false;
    var isAdmin = false;
    
    for (var i = 0; i < users.length; i++) {

        if (req.body.username == users[i].username) {
            validAcc = true;
        }
        
        if (validAcc) {
            if (req.body.password == users[i].password){
                validPass = true;
                if (users[i].admin == 1) {
                    isAdmin = true;
                }
                break;
                
            }
        }
    }
    
    //console.log(isAdmin, validAcc, validPass);
    
    if (validAcc && validPass) {
        req.session.authenticated = true;
        res.send({"loginSuccess":true, "admin":isAdmin});
       
       
    } else {
       res.send(false);
    }
    
    
/*    if ( req.body.username == "admin" && req.body.password == "password") {
       req.session.authenticated = true;
       res.send({"loginSuccess":true});
    } 
    else {
       res.send(false);
    }*/

    
}); // loginProcess

app.get("/logout", async function(req, res){    
    if (req.session) {
        res.render("login");
  }
}); // logout

app.get("/addProd", function(req, res){
  res.render("newProd");
});

app.post("/addProd", async function(req, res){
  let rows = await insertProd(req.body);
  console.log(rows);
  
  let message = "Product WAS NOT added to the database!";
  if (rows.affectedRows > 0) {
      message= "Product successfully added!";
  }
  res.render("newProd", {"message":message});
    
});

app.get("/updateProd", async function(req, res){

  let prodInfo = await getProdInfo(req.query.name);    
  res.render("updateProd", {"prodInfo":prodInfo});
});

app.post("/updateProd", async function(req, res){
  let rows = await updateProd(req.body);
  
  let prodInfo = req.body;
  console.log(rows);

  let message = "Product WAS NOT updated!";
  if (rows.affectedRows > 0) {
      message= "Product successfully updated!";
  }
  res.render("updateProd", {"message":message, "prodInfo":prodInfo});
    
});

app.get("/deleteProd", async function(req, res){
 let rows = await deleteProd(req.query.name);
 console.log(rows);
  let message = "Product WAS NOT deleted!";
  
  if (rows.affectedRows > 0) {
      message= "Product successfully deleted!";
  }    
    
   let prodList = await getProdList();  
   res.render("admin", {"prodList":prodList});
});



// functions //

function addAcc(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO users
                        (firstname, lastname, username, email, password)
                         VALUES (?,?,?,?,?)`;
        
           let params = [body.firstname, body.lastname, body.username, body.email, body.password];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
} // addAcc

function getUsers() {
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * FROM users`;
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        }); //connect
    }); //promise
}

function insertProd(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO inventory
                        (name, price, quantity, image, color)
                         VALUES (?,?,?,?,?)`;
        
           let params = [body.name, body.price, body.quantity, body.image, body.color];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
} // insertProd

function updateProd(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `UPDATE inventory
                      SET price = ?,
                      image = ?, 
                      quantity = ?, 
                      color = ?
                      
                     WHERE name = ?`;
        
           let params = [body.price, body.image, body.quantity, body.color, body.name];
        
           console.log(sql);
           
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
} // updateProduct


function deleteProd(name){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM inventory
                      WHERE name = ?`;
        
           conn.query(sql, [name], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}


function insertToCart(name, price){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO cart
                        (name, price)
                         VALUES (?,?)`;
        
           let params = [name, price];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getProdInfo(name){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM inventory
                      WHERE name = ?`;
        
           conn.query(sql, [name], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        });//connect
    });//promise 
} // getProdInfo

function getProdList(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                        FROM inventory
                        ORDER BY name`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}


function getProds(query){
    
    let keyword = query.keyword;
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT *
                      FROM inventory
                      WHERE 
                      name LIKE '%${keyword}%' `;
        
           console.log("SQL:", sql);
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}


function getCartProd(){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT * FROM cart NATURAL JOIN inventory`;

           console.log("SQL:", sql);
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}


function clearCart(){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `DELETE FROM cart`;
        
           console.log("SQL:", sql);
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}

function dbConnection(){

   let conn = mysql.createConnection({
                 host: "us-cdbr-iron-east-01.cleardb.net",
                 user: "b7e06ef97d1c7b",
             password: "08496ced",
             database: "heroku_eeffc7f196aa5e6"
       });

return conn;

}


//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});