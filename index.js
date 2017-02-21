var pg = require('pg');
var express = require('express');
var app = express();

var bodyParser = require( 'body-parser' );
app.use( bodyParser.urlencoded({ extended: true }) );

//for passport
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

//for passport
require('./config/passport')(passport);
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); 

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const connectionString = 'postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true';

// app.get('/dashboard', function(request, response) {
//     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
//       client.query('SELECT * FROM test_table', function(err, result) {
//         done();
//         if (err)
//          { console.error(err); response.send("Error " + err); }
//         else
//          { response.render('pages/dashboard', {results: result.rows} ); }
//       });
//     });
// });

/*app.get('/', function(request, response) {
  response.render('home');
});

app.get('/login', function(request, response) {
  response.render('pages/login');
});

app.get('/test', function(request, response) {
  response.render('pages/index');
});

app.get('/signup', function(request, response) {
  response.render('pages/signup');
});

app.get('/logout', function(request, response) {
  response.logout();
  response.redirect('/');
});*/
        
/*app.get('/inventory', function(request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/index', {results: result.rows} ); }
        //THIS IS WHERE YOU LEFT OFF, MAKING IT GO TO LOGIN FIRST       
       //{ response.render('home'); }
    });
  });
});*/

app.get('/updateItems', function(request, response) {
  const items = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM products;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/updateItems', { 
        items: items
      });
    });
  });
});

app.get('/addCategories', function(request, response) {
  response.render('pages/addCategories');
});

app.get('/addItems', function(request, response) {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM categories;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/addItems', { 
        results: results
      });
    });
  });
});

app.get('/removeCategories', function(request, response) {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM categories;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/removeCategories', { 
        results: results
      });
    });
  });
});

app.get('/dashboard', function(request, response) {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT c.category_name, p.name, p.units, d.quantity FROM categories c INNER JOIN ' +
      'products p on c.category_id=p.category_id INNER JOIN daily_inventory d on p.product_id=d.product_id;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/dashboard', { 
        results: results
      });
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//for passport
require('./app/routes.js')(app, passport);

/*app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});*/

require('./queries.js')(app);