// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    res.json("/members");
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    console.log(req.body);
    db.User.create({
      email: req.body.email,
      password: req.body.password
    }).then(function () {
      res.redirect(307, "/api/login");
    }).catch(function (err) {
      console.log(err);
      res.json(err);
      // res.status(422).json(err.errors[0].message);
    });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    }
    else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  /*
  API Product routes! 
    app.get:  get listing of all products
    app.post:  to add a product
    app.delete:  to delete a product
    app.put: to update a product
  */

  // get request to return JSON of all products
  app.get("/api/products", function (req, res) {
    if (req.user) {
      console.log("AUTHENTICATED get products API called")
      res.json(testData)
    } else {
      console.log("unauthenticated get products API called")
      res.json(testData)
    }
  });

  // get request to return JSON of specific product
  app.get("/api/product/:id", function (req, res) {
    if (req.user) {
      console.log("AUTHENTICATED get specific product API called")
      res.json(testOneProduct)
    } else {
      console.log("unauthenticated get specific product API called")
      res.json(testOneProduct)
    }
  });

  // post request to add a new product
  app.post("/api/product", function (req, res) {
    if (req.user) {
      console.log("AUTHENTICATED POST add products API called")
      res.json({ "status": true, "user": req.user, "action": "post" })
    } else {
      console.log("unauthenticated POST add products API called")
      res.json({ "status": true, "user": "Unauthenticated", 'action': "post" })
    }
  });

  // delete request to remove a product
  app.delete("/api/product/:id", function (req, res) {

    if (req.user) {
      console.log("AUTHENTICATED DELETE product API called")
      res.json({ "status": true, "user": req.user, "action": "delete" })
    } else {
      console.log("unauthenticated DELETE product API called")
      res.json({ "status": true, "user": "Unauthenticated", 'action': "delete" })
    }
  });


  app.put("/api/product/:id", function (req, res) {
    // If the user already has an account send them to the members page
    if (req.user) {
      console.log("AUTHENTICATED PUT update product API called")
      res.json({ "status": true, "user": req.user, 'action': "update" })
    } else {
      console.log("unauthenticated PUT update product API called")
      res.json({ "status": true, "user": "Unauthenticated", 'action': "update" })
    }
  });

  /* 
  API2 Product routes! 
    app.get:  get listing of all products
    app.post:  to add a product
    app.delete:  to delete a product
    app.put: to update a product
  */

  // get request to return JSON of all products
  app.get("/api/v2/product", function (req, res) {
    // list all products
    var query = {};
    if (req.user) {
      db.Product.findAll({
        where: { 'UserId': req.user.id },
        include: [db.User]
      }).then(function (dbProduct) {
        res.json(dbProduct);
      });
    } else {
      // return nothing if not logged in
      res.json([])
    }
  });

  // get request to return JSON of all products
  // put it in a object referenced by key "data"
  // to be complient with datatables
  app.get("/api/v2/productdata", function (req, res) {
    // list all products
    var query = {};
    if (req.user) {
      db.Product.findAll({
        where: { 'UserId': req.user.id },
        include: [db.User]
      }).then(function (dbProduct) {
        let table = {}
        table['data'] = dbProduct
        res.json(table);
      });
    } else {
      // return nothing if not logged in
      res.json({})
    }
  });


  // get request to return JSON of specific product
  app.get("/api/v2/product/:id", function (req, res) {
    // Here we add an "include" property to our options in our findOne query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.User
    if (req.user) {
      db.Product.findOne({
        where: {
          id: req.params.id
        },
        include: [db.User]
      }).then(function (dbProduct) {
        res.json(dbProduct);
      });
    } else {
      // return noting if not logged in
      res.json({})
    }
  })

  // post request to add a new product
  app.post("/api/v2/product", function (req, res) {
    if (req.user) {
      // json body created
      let productEntry = req.body
      productEntry['UserId'] = req.user.id
      console.log(productEntry)
      console.log("AUTHENTICATED POST add products API called")
      db.Product.create(productEntry).then(function(productEntry){
        res.json(productEntry)
      });
      // res.json({ "status": true, "user": req.user, "action": "post" })
    } else {
      console.log("unauthenticated POST add products API called")
      // res.json({ "status": true, "user": "Unauthenticated", 'action': "post" })
      res.json({})
    }
  });

  // delete request to remove a product
  app.delete("/api/v2/product/:id", function (req, res) {
    if (req.user) {
      console.log("AUTHENTICATED DELETE product API called")
      db.Product.destroy({
        where: {
          id: req.params.id
        }
      }).then(function(productDelete){
        console.log("did I make it here to completed deleting?")
        res.json(productDelete)
      });
    } else {
      console.log("unauthenticated DELETE product API called")
      res.json({})
    }
  });


  app.put("/api/v2/product", function (req, res) {
    if (req.user) {
      // json body created
      let productUpdate = req.body
      console.log(productUpdate)
      console.log("AUTHENTICATED POST add products API called")
      db.Product.update(
        productUpdate,{
          where: {
            id: req.body.id
          }
        }).then(function(productUpdate){
        res.json(productUpdate)
      });
      // res.json({ "status": true, "user": req.user, "action": "post" })
    } else {
      console.log("unauthenticated POST add products API called")
      // res.json({ "status": true, "user": "Unauthenticated", 'action': "post" })
      res.json({})
    }
  });



  var testOneProduct = {
    "date": "1/1/2015",
    "product": "Oven",
    "price": 12.25,
    "Warranty Expire": "1/1/2017",
    "Store": "Best Buy"
  }

  var testData = {
    "data": [
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"],
      ["1/1/2015", " Oven", " $800", " 10/30/2018 ", " Best Buy"],
      ["1/1/2015", " Refrigerator", " $1500", " 10/30/2018", " Best Buy"],
      ["5/30/2018", " Iphone X", " $1000", " 5/29/2019", " Apple Store"],
      ["7/13/2016", " New Desk", " $2000", " 7/13/2020", " Office Depot"],
      ["9/1/2018", " Pencil Sharpner", " $30", " 8/31/2020", " Office Depot"]
    ]
  }
}
