var express = require('express');
var app = express();

//for passport
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());

app.set('port', (process.env.PORT || 5000));

var passport = require('passport');

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

// app.get('/', function(request, response) {
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
        
app.get('/inventory', function(request, response) {
  response.render('pages/dashboard');
  // pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  //   client.query('SELECT * FROM test_table', function(err, result) {
  //     done();
  //     if (err)
  //      { console.error(err); response.send("Error " + err); }
  //     else
  //      { response.render('pages/index', {results: result.rows} ); }
  //       //THIS IS WHERE YOU LEFT OFF, MAKING IT GO TO LOGIN FIRST       
  //      //{ response.render('home'); }
  //   });
  // });
});

app.get('/addItems', function(request, response) {
  response.render('pages/addItems');
});

app.get('/addCategories', function(request, response) {
  response.render('pages/addCategories');
});

app.get('/removeItems', function(request, response) {
  response.render('pages/removeItems');
});

app.get('/removeCategories', function(request, response) {
  response.render('pages/removeCategories');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var pg = require('pg');

//for passport
require('./app/routes.js')(app, passport);

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});
