const express = require("express");
const mysql   = require("mysql");
const app = express();
const session = require('express-session');


app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 1000 * 60 * 5 }}));
app.use(function(req, res, next) {
   res.locals.isAuthenticated = req.session.authenticated; 
   next();
});

app.get("/", async function(req, res){
    if (req.isAuthenticated) {
        console.log("AUTHENTICATED!");
    }
    let prodList = await getProdList();
    res.render("index", {"prodList":prodList});
});//root


app.get("/productPage", async function(req, res){
    let prodReviews = await getReviews();
    res.render("productPage", {"prodReviews":prodReviews});
});

app.get("/productView", async function(req, res){
    let product = await getProdInfo(req.query.name);
    let prodReviews = await getReviews(req.query.name);
    res.render("productView", {"prodReviews":prodReviews, "product":product});
});


app.get("/orders", async function(req, res){
    let orders = await getTransactions(req.query.username);
    res.render("orders", {"orders":orders});
});

app.get("/login", function(req, res){
    res.render("login");
    
}); // login

app.get("/search", async function(req, res){
    res.render("search");
}); // search

app.get("/cart", isAuthenticated, async function(req, res){
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

app.get("/clearCart", isAuthenticated, async function(req, res){
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

<<<<<<< HEAD
app.get("/addReview", async function(req, res){
    let product = await getProdInfo(req.query.name);
    let prodReviews = await getReviews(req.query.name);
    res.render("productView", {"prodReviews":prodReviews, "product":product});
}); // results
=======
app.get("/transactions", async function(req, res){
    let transactionsList = await getTransactions();
    res.render("transactions", {"transactionsList": transactionsList});
});
>>>>>>> 716149c596c260b4b30087870e3d1df7a38de2dc

app.post("/addReview", async function(req, res){
    insertReview(req.body.name, req.body.rating, req.body.username, req.body.review);
    res.send(true);
}); // results

app.get("/admin", isAuthenticated, async function(req, res){
    
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
        req.session.user = users[i].id;
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
    } // old code */

    
}); // loginProcess

app.get("/profile", isAuthenticated, async function(req, res) {
    var userID = req.session.user;
    var user = await getUsersByID(userID);
    console.log(user[0]);
    let uFistName = user[0].firstname;
    let uEmail = user[0].email;
    let uUsername = user[0].username;
    let uNumberOfPurchases = user[0].purchases;
    res.render("profile", {"firstname":uFistName,
                           "email":uEmail,
                           "numberOfPurchases":uNumberOfPurchases,
                           "username":uUsername
    });
});

app.get("/logout", async function(req, res){    
    if (req.session) {
        req.session.destroy();
        res.render("login");
  }
}); // logout

app.get("/addProd", isAuthenticated, function(req, res){
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

app.get("/updateProd", isAuthenticated, async function(req, res){

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

app.get("/updateProf", isAuthenticated, async function(req, res){

  let profInfo = await getProfInfo(req.query.username);    
  res.render("updateProf", {"profInfo":profInfo});
});

app.post("/updateProf", async function(req, res){
  let rows = await updateProf(req.body);
  
  let profInfo = req.body;
  console.log(rows);

  let message = "Profile WAS NOT updated!";
  if (rows.affectedRows > 0) {
      message= "Profile successfully updated!";
  }
  res.render("updateProf", {"message":message, "profInfo":profInfo});
    
});

app.get("/deleteProd", isAuthenticated, async function(req, res){
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



//-----------------------reviews-------------------------///




//-----------------------reviews-------------------------///





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

function getUsersByID(userID) {
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            let stmt = 'SELECT * FROM users WHERE id=' + String(userID);
            console.log(stmt);
           conn.query(stmt, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        }); //connect
    }); //promise
}

function updateProf(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `UPDATE users
                      SET picture = ?, 
                      email = ?, 
                      password = ?
                      
                      WHERE username = ?`;
        
           let params = [body.picture, body.email, body.password, body.username];
        
           console.log(sql);
           
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
} // updateProfile


function getProfInfo(username){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM users
                      WHERE username = ?`;
        
           conn.query(sql, [username], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        });//connect
    });//promise 
} // getProfInfo


//----------------------product functions---------------------------//

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

function insertReview(name, rating, username, review){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO reviews
                        (name, rating, username, review)
                         VALUES (?,?,?,?)`;
        
           let params = [name, rating, username, review];
        
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

function getTransactions(){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
       conn.connect(function(err){
           if (err) throw err;
           console.log("Connected!");
           
           let sql = 'SELECT * FROM transactions NATURAL JOIN inventory NATURAL JOIN users ORDER BY id';
           conn.query(sql, function (err, rows, fields){
               if (err) throw err;
               conn.end();
               resolve(rows);
           });
       });
    });
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

function getReviews(name){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT * FROM reviews NATURAL JOIN inventory WHERE name = ?`;
        
           console.log("SQL:", sql);
           conn.query(sql, [name], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        
        });//connect
    });//promise
    
}

function getTransactions(username){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
            
            let params = [];
            
           let sql = `SELECT * FROM transactions WHERE id = ?`;
        
           console.log("SQL:", sql);
           conn.query(sql, [username], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
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

function isAuthenticated(req, res, next){
    if(!req.session.authenticated) res.redirect('/login');
    else next();
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