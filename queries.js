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
}