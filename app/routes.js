module.exports = function(app, passport) {
	app.get('/', function(req, res) {
		res.render('home.ejs');
	})

	app.get('/login', function(req, res) {
    	// render the page and pass in any flash data if it exists
        res.render('credentials.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/index', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get('/dashboard', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/dashboarddemo.ejs'); 
    });

    app.get('/index', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/dashboard.ejs'); 
    });

    app.get('/trends', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/trends.ejs'); 
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/index', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}