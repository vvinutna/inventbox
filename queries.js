const connectionString = 'postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true';
var pg = require('pg');

module.exports = function(app) {

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
      client.query('DELETE FROM categories WHERE category_name=($1);',
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
        client.query('INSERT INTO daily_inventory(day_date, product_id, quantity) values(NOW(), $2, $1);',
        [quantity, row.product_id]);
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
      client.query('DELETE * FROM products WHERE name=($1)',
      [item_name]);
    });
    return res.json();
  });

  app.post('/api/products', (req, res, next) => {
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
          client.query('INSERT INTO daily_inventory(day_date, product_id, quantity) values(NOW(), $1, $2)', [row.product_id, data.quantity]);
        });
      });     
    });
  });

  app.post('/api/daily_inventory', (req, res, next) => {
    var sum = [];
    // Grab data from http request
    const data = {startDate: req.body.startDate, endDate: req.body.endDate, item: req.body.item, category: req.body.category};
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
      const category = client.query('SELECT category_id FROM categories WHERE category_name=($1);', [data.category]);
      category.on('row', (row) => {
        done();
        var categoryID = row.category_id;
        
        const product = client.query('SELECT product_id FROM products WHERE name=($1) and category_id=($2);', [data.item, categoryID]);
        product.on('row', (row) => {
          done();
          var productID = row.product_id;

          const inventories = client.query("SELECT SUM(quantity) from daily_inventory where product_id=($1) and quantity < 0 and day_date >= ($2)::date and day_date <= ($3)::date;", [productID, data.startDate, data.endDate]);
          // Stream results back one row at a time
          inventories.on('row', (row) => { 
            done();
            sum.push(row);
            console.log(sum);
            return res.json(sum);
          }); 
        }); 
      });    
    });
  });
}