const connectionString = 'postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true';
var pg = require('pg');

module.exports = function(app, passport) {
  app.post('/api/categories', (req, res, next) => {

    // Grab data from http request
    const data = {category: req.body.category};
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Insert Data
      client.query('INSERT INTO categories(category_name) values($1)',
      [data.category]);
    });
    return res.json();
  });

  app.delete('/api/categories/:category_name', (req, res, next) => {

    // Grab data from http request
    const category_name = req.body.category_name;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Insert Data
      client.query('DELETE FROM categories WHERE category_name=($1)',
      [category_name]);
    });
    return res.json();
  });

  app.put('/api/daily_inventory/:product_id', (req, res, next) => {

    // Grab data from http request
    const name = req.body.itemName;
    console.log(name);
    const quantity = req.body.quantity;
    console.log(quantity);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      console.log(name);
      const query1 = client.query('SELECT * FROM products WHERE name=($1);', [name]);
      // Stream results back one row at a time
      query1.on('row', (row) => {
        client.query('UPDATE daily_inventory SET day_date=NOW(), quantity=quantity + ($1) WHERE product_id=($2)',
        [quantity, row.product_id]);
      });
    });
    return res.json();
  });

  app.delete('/api/products/:itemName', (req, res, next) => {

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
      client.query('DELETE FROM products WHERE name=($1)',
      [name]);
    });
    return res.json();
  });

  app.post('/api/products', (req, res, next) => {
    console.log("this is happening?");
    // Grab data from http request
    const data = {itemName: req.body.itemName, categoryName: req.body.categoryName, quantity: req.body.quantity, units: req.body.units};
    console.log(data.itemName);
    console.log(req.body.itemName);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }

      const query1 = client.query('SELECT category_id FROM categories WHERE category_name=($1);', [data.categoryName]);
      // Stream results back one row at a time
      query1.on('row', (row) => {
        var queryString = 'INSERT INTO products(category_id, name, units) values($1, $2, $3) RETURNING *;';
        var query = client.query(queryString, [row.category_id, data.itemName, data.units], function (error, result) {
            done();
        });

        query.on("row", function (row, result) {
          console.log(row);
          client.query('INSERT INTO daily_inventory(day_date, product_id, quantity) values(NOW(), $1, $2)', [row.product_id, data.quantity]);
        });
      });     
    });
  });
}