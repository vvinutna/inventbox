var pg = require('pg');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var bodyParser = require( 'body-parser' );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//for passport
var passport = require('passport');
var flash    = require('connect-flash');
var session = require('express-session');

app.set('port', (process.env.PORT || 5000));

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

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

app.get('/dashboard', isLoggedIn, function(request, response, next) {
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
    const query = client.query('SELECT reorder_point, name, category_name, units, SUM(quantity) as quantity FROM (SELECT d.day_date, c.category_name, p.name, p.units, p.reorder_point, d.quantity FROM (categories c INNER JOIN ' +
      'products p on c.category_id=p.category_id INNER JOIN daily_inventory d on p.product_id=d.product_id) WHERE c.u_id=($1) AND p.u_id=($1) AND d.u_id=($1)) as dash GROUP BY name, category_name, units, reorder_point ORDER BY category_name;', [request.user.u_id]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      console.log(row);
      results.push(row);
    });



    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/dashboard', { 
        results: results, 
        email: request.user.email
      });
    });
  });
});

app.get('/updateStock', isLoggedIn, function(request, response) {
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
    const query = client.query('SELECT * FROM products where u_id=($1);', [request.user.u_id]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/updateItems', { 
        items: items,
        email: request.user.email, 
        id: request.user.u_id
      });
    });
  });
});


app.get('/usage', isLoggedIn, function(request, response) {
  const results = [];
  const categories = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    console.log(request.body.u_id);
    // SQL Query > Select Data
    const query1 = client.query('SELECT * FROM products where u_id=($1);', [request.user.u_id]);
    // Stream results back one row at a time
    query1.on('row', (row) => {
      results.push(row);
    });

    const query2 = client.query('SELECT * FROM categories where u_id=($1);', [request.user.u_id]);
    // Stream results back one row at a time
    query2.on('row', (row) => {
      categories.push(row);
    });
    // After all data is returned, close connection and return results
    query2.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/usage', { 
        results: results,
        categories: categories,
        email: request.user.email, 
        id: request.user.u_id
      });
    });
  });
});

app.get('/updateCategoriesStock', isLoggedIn, function(request, response) {
  const results = [];
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM categories where u_id=($1);', [request.user.u_id]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/updateCategoriesStock', { 
        results: results,
        email: request.user.email,
        id: request.user.u_id
      });
    });
  });
});

// app.get('/addCategories', function(request, response) {
//   response.render('pages/addCategories');
// });

// app.get('/addCategories', isLoggedIn, function(request, response) {
//   const results = [];
//   // Get a Postgres client from the connection pool
//   pg.connect(connectionString, (err, client, done) => {
//     // Handle connection errors
//     if(err) {
//       done();
//       console.log(err);
//       return res.status(500).json({success: false, data: err});
//     }
//     // SQL Query > Select Data
//     const query = client.query('SELECT * FROM categories;');
//     // Stream results back one row at a time
//     query.on('row', (row) => {
//       results.push(row);
//     });
//     // After all data is returned, close connection and return results
//     query.on('end', () => {
//       done();
//       //return res.json(results);
//       response.render('pages/addCategories', { 
//         results: results,
//         email: request.user.email
//       });
//     });
//   });
// });

app.get('/updateItemsStock', isLoggedIn, function(request, response) {
  const results = [];
  const items = [];
  var uid = request.user.u_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM categories where u_id=$1;', [uid]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });

    const query1 = client.query('SELECT * FROM products where u_id=$1;', [uid]);
    // Stream results back one row at a time
    query1.on('row', (row) => {
      console.log(row);
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query1.on('end', () => {
      done();
      //return res.json(results);
      response.render('pages/updateItemsStock', { 
        results: results,
        items: items,
        email: request.user.email, 
        id: request.user.u_id
      });
    });
  });
});

// app.get('/addItems', isLoggedIn, function(request, response) {
//   const results = [];
//   // Get a Postgres client from the connection pool
//   pg.connect(connectionString, (err, client, done) => {
//     // Handle connection errors
//     if(err) {
//       done();
//       console.log(err);
//       return res.status(500).json({success: false, data: err});
//     }
//     // SQL Query > Select Data
//     const query = client.query('SELECT * FROM categories;');
//     // Stream results back one row at a time
//     query.on('row', (row) => {
//       results.push(row);
//     });
//     // After all data is returned, close connection and return results
//     query.on('end', () => {
//       done();
//       //return res.json(results);
//       response.render('pages/addItems', { 
//         results: results,
//         email: request.user.email
//       });
//     });
//   });
// });

// app.get('/removeCategories', isLoggedIn, function(request, response) {
//   const results = [];
//   // Get a Postgres client from the connection pool
//   pg.connect(connectionString, (err, client, done) => {
//     // Handle connection errors
//     if(err) {
//       done();
//       console.log(err);
//       return res.status(500).json({success: false, data: err});
//     }
//     // SQL Query > Select Data
//     const query = client.query('SELECT * FROM categories;');
//     // Stream results back one row at a time
//     query.on('row', (row) => {
//       results.push(row);
//     });
//     // After all data is returned, close connection and return results
//     query.on('end', () => {
//       done();
//       //return res.json(results);
//       response.render('pages/removeCategories', { 
//         results: results,
//         email: request.user.email
//       });
//     });
//   });
// });

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