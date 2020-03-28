{"filter":false,"title":"app.js","tooltip":"/app.js","undoManager":{"mark":-1,"position":-1,"stack":[]},"ace":{"folds":[],"scrolltop":3909.5,"scrollleft":0,"selection":{"start":{"row":32,"column":27},"end":{"row":32,"column":27},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":243,"state":"start","mode":"ace/mode/javascript"}},"timestamp":1585352783938,"hash":"73b8f1f4eb980687c296fa3125bd17affca6b780"}}));\n\napp.get(\"/\", async function(req, res){\n    res.render(\"index\");\n});//root\n\napp.get(\"/login\", async function(req, res){\n    res.render(\"login\");\n    \n}); // login\n\napp.get(\"/search\", async function(req, res){\n    res.render(\"search\");\n}); // search\n\napp.get(\"/cart\", async function(req, res){\n    let rows = await getCartProd();\n    res.render(\"cart\", {\"cartProds\":rows});\n});\n\napp.get(\"/clearCart\", async function(req, res){\n    clearCart();\n    let rows = await getCartProd();\n    res.render(\"cart\", {\"cartProds\":rows});\n});\n\napp.get(\"/results\", async function(req, res){\n    let rows = await getProds(req.query);\n    res.render(\"results\", {\"products\":rows});\n}); // results\n\n\napp.post(\"/addToCart\", async function(req, res){\n    insertToCart(req.body.prodName, req.body.prodPrice);\n    res.send(true);\n}); // results\n\n\napp.get(\"/admin\", async function(req, res){\n    \n   console.log(\"authenticated: \", req.session.authenticated);    \n   \n   if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen\n       \n     let prodList = await getProdList();  \n       res.render(\"admin\", {\"prodList\":prodList});  \n       \n   }  else { \n    \n       res.render(\"login\"); \n   \n   }\n});\n\napp.post(\"/loginProcess\", function(req, res) {\n    if ( req.body.username == \"admin\" && req.body.password == \"password\") {\n       req.session.authenticated = true;\n       res.send({\"loginSuccess\":true});\n    } \n    else {\n       res.send(false);\n    }\n\n    \n}); // loginProcess\n\napp.get(\"/logout\", async function(req, res){    \n    if (req.session) {\n        res.render(\"login\");\n  }\n}); // logout\n\napp.get(\"/addProd\", function(req, res){\n  res.render(\"newProd\");\n});\n\napp.post(\"/addProd\", async function(req, res){\n  let rows = await insertProd(req.body);\n  console.log(rows);\n  \n  let message = \"Product WAS NOT added to the database!\";\n  if (rows.affectedRows > 0) {\n      message= \"Product successfully added!\";\n  }\n  res.render(\"newProd\", {\"message\":message});\n    \n});\n\napp.get(\"/updateProd\", async function(req, res){\n\n  let prodInfo = await getProdInfo(req.query.name);    \n  res.render(\"updateProd\", {\"prodInfo\":prodInfo});\n});\n\napp.post(\"/updateProd\", async function(req, res){\n  let rows = await updateProd(req.body);\n  \n  let prodInfo = req.body;\n  console.log(rows);\n\n  let message = \"Product WAS NOT updated!\";\n  if (rows.affectedRows > 0) {\n      message= \"Product successfully updated!\";\n  }\n  res.render(\"updateProd\", {\"message\":message, \"prodInfo\":prodInfo});\n    \n});\n\napp.get(\"/deleteProd\", async function(req, res){\n let rows = await deleteProd(req.query.name);\n console.log(rows);\n  let message = \"Product WAS NOT deleted!\";\n  \n  if (rows.affectedRows > 0) {\n      message= \"Product successfully deleted!\";\n  }    \n    \n   let prodList = await getProdList();  \n   res.render(\"admin\", {\"prodList\":prodList});\n});\n\n\n\n// functions //\n\nfunction insertProd(body){\n   \n   let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n        \n           let sql = `INSERT INTO inventory\n                        (name, price, quantity, image, color)\n                         VALUES (?,?,?,?,?)`;\n        \n           let params = [body.name, body.price, body.quantity, body.image, body.color];\n        \n           conn.query(sql, params, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise \n} // insertProd\n\nfunction updateProd(body){\n   \n   let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n        \n           let sql = `UPDATE inventory\n                      SET price = ?,\n                      image = ?, \n                      quantity = ?, \n                      color = ?\n                      \n                     WHERE name = ?`;\n        \n           let params = [body.price, body.image, body.quantity, body.color, body.name];\n        \n           console.log(sql);\n           \n           conn.query(sql, params, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise \n} // updateProduct\n\n\nfunction deleteProd(name){\n   \n   let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n        \n           let sql = `DELETE FROM inventory\n                      WHERE name = ?`;\n        \n           conn.query(sql, [name], function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise \n}\n\n\nfunction insertToCart(name, price){\n   \n   let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n        \n           let sql = `INSERT INTO cart\n                        (name, price)\n                         VALUES (?,?)`;\n        \n           let params = [name, price];\n        \n           conn.query(sql, params, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise \n}\n\nfunction getProdInfo(name){\n   \n   let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n        \n           let sql = `SELECT * \n                      FROM inventory\n                      WHERE name = ?`;\n        \n           conn.query(sql, [name], function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows[0]); //Query returns only ONE record\n           });\n        \n        });//connect\n    });//promise \n} // getProdInfo\n\nfunction getProdList(){\n   \n   let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n        \n           let sql = `SELECT *\n                        FROM inventory\n                        ORDER BY name`;\n        \n           conn.query(sql, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise \n}\n\n\nfunction getProds(query){\n    \n    let keyword = query.keyword;\n    \n    let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n            \n            let params = [];\n            \n           let sql = `SELECT *\n                      FROM inventory\n                      WHERE \n                      name LIKE '%${keyword}%' `;\n        \n           console.log(\"SQL:\", sql);\n           conn.query(sql, params, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise\n    \n}\n\n\nfunction getCartProd(){\n    \n    let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n            \n            let params = [];\n            \n           let sql = `SELECT * FROM cart NATURAL JOIN inventory`;\n\n           console.log(\"SQL:\", sql);\n           conn.query(sql, params, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise\n    \n}\n\n\nfunction clearCart(){\n    \n    let conn = dbConnection();\n    \n    return new Promise(function(resolve, reject){\n        conn.connect(function(err) {\n           if (err) throw err;\n           console.log(\"Connected!\");\n            \n            let params = [];\n            \n           let sql = `DELETE FROM cart`;\n        \n           console.log(\"SQL:\", sql);\n           conn.query(sql, params, function (err, rows, fields) {\n              if (err) throw err;\n              conn.end();\n              resolve(rows);\n           });\n        \n        });//connect\n    });//promise\n    \n}\n\nfunction dbConnection(){\n\n   let conn = mysql.createConnection({\n                 host: \"cst336db.space\",\n                 user: \"cst336_dbUser34\",\n             password: \"r8gttw\",\n             database: \"cst336_db34\"\n       });\n\nreturn conn;\n\n}\n\n\n//starting server\napp.listen(process.env.PORT, process.env.IP, function(){\nconsole.log(\"Express server is running...\");\n});","undoManager":{"mark":-2,"position":1,"stack":[[{"start":{"row":271,"column":32},"end":{"row":271,"column":33},"action":"remove","lines":["e"],"id":1},{"start":{"row":271,"column":31},"end":{"row":271,"column":32},"action":"remove","lines":["m"]},{"start":{"row":271,"column":30},"end":{"row":271,"column":31},"action":"remove","lines":["a"]},{"start":{"row":271,"column":29},"end":{"row":271,"column":30},"action":"remove","lines":["n"]}],[{"start":{"row":271,"column":29},"end":{"row":271,"column":30},"action":"insert","lines":["*"],"id":2}]]},"ace":{"folds":[],"scrolltop":3909.5,"scrollleft":0,"selection":{"start":{"row":271,"column":30},"end":{"row":271,"column":30},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":243,"state":"start","mode":"ace/mode/javascript"}},"timestamp":1585352783938}