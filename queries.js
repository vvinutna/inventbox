const connectionString = 'postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true';
var pg = require('pg');

module.exports = function(app) {

  app.post('/api/categories', (req, res, next) => {

    // Grab data from http request
    const data = {category: req.body.category, uid: req.body.uid};
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Insert Data
      const query = client.query('INSERT INTO categories(category_name, u_id) values($1, $2)',
      [data.category, data.uid]);

      query.on('error', function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
        done();
      });

      query.on('end', () => {
        done();
      });
    });
    return res.json();
  });

  app.delete('/api/categories/:category_name', (req, res, next) => {

    // Grab data from http request
    const category_name = req.body.category_name;
    const uid = req.body.uid;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Insert Data
      const query = client.query('DELETE FROM categories WHERE category_name=($1) and u_id=($2);',
      [category_name, uid]);

      query.on('error', function(err) {
        done();
      });

      query.on('end', () => {
        done();
      });

    });
    return res.json();
  });

  app.put('/api/daily_inventory/:product_id', (req, res, next) => {

    // Grab data from http request
    const name = req.body.itemName;
    console.log(name);
    const quantity = req.body.quantity;
    console.log(quantity);
    const uid = req.body.uid;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      const query1 = client.query('SELECT * FROM products WHERE name=($1) and u_id=($2);', [name, uid]);

      // Stream results back one row at a time
      query1.on('row', (row) => {
        client.query('INSERT INTO daily_inventory(day_date, product_id, quantity, u_id) values(NOW(), $2, $1, $3);',
        [quantity, row.product_id, uid]);
      });

      query1.on('error', function(err) {
        done();
      });

      query1.on('end', () => {
        done();
      });

    });
    return res.json();
  });

  app.delete('/api/products/:name', (req, res, next) => {

    // Grab data from http request
    const item_name = req.body.itemName;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Insert Data
      const query = client.query('DELETE FROM products WHERE name=($1)', [item_name]);

      query.on('error', function(err) {
        done();
      });

      query.on('end', () => {
        done();
      });
    });
    return res.json();
  });

  app.post('/api/products', (req, res, next) => {
    // Grab data from http request
    const data = {itemName: req.body.itemName, categoryName: req.body.categoryName, units: req.body.units, reorderQuantity: req.body.reorderQuantity, uid: req.body.uid};
    console.log("1");
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }

      const query1 = client.query('SELECT category_id FROM categories WHERE category_name=($1) and u_id=($2);', [data.categoryName, data.uid]);
      console.log("2");
      // Stream results back one row at a time
      query1.on('row', (row) => {
        console.log("3");
        var queryString = 'INSERT INTO products(category_id, name, units, reorder_point, u_id) values($1, $2, $3, $4, $5) RETURNING *;';
        var query = client.query(queryString, [row.category_id, data.itemName, data.units, data.reorderQuantity, data.uid], function (error, result) {
            //console.log("4");
            //done();
        });
      });

      query1.on('error', function(err) {
        done();
      });

      query1.on('end', () => {
        done();
      });
    });
    return res.json();
  });

  app.post('/api/daily_inventory', (req, res, next) => {
    var sum = [];
    // Grab data from http request
    const data = {startDate: req.body.startDate, endDate: req.body.endDate, item: req.body.item, category: req.body.category, uid: req.body.uid};
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }

      //get product id of item
      //get all inventories for that product, between the date range, with negative quantities
      //add all results
      const category = client.query('SELECT category_id FROM categories WHERE category_name=($1) and u_id=($2);', [data.category, data.uid]);
      category.on('row', (row) => {
        //done();
        var categoryID = row.category_id;

        const product = client.query('SELECT product_id FROM products WHERE name=($1) and category_id=($2) and u_id=($3);', [data.item, categoryID, data.uid]);
        product.on('row', (row) => {
          //done();
          var productID = row.product_id;

          const inventories = client.query("SELECT SUM(quantity) from daily_inventory where product_id=($1) and quantity < 0 and day_date >= ($2)::date and day_date <= ($3)::date and u_id=($4);", [productID, data.startDate, data.endDate, data.uid]);
          // Stream results back one row at a time
          inventories.on('row', (row) => { 
            //done();
            sum.push(row);
            console.log(sum);
            return res.json(sum);
          }); 
        }); 
      });  

      category.on('error', function(err) {
        done();
      });

      category.on('end', () => {
        done();
      }); 
    });
  });
}