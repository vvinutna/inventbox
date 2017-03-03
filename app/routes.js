module.exports = function(app, passport) {
	app.get('/', function(req, res) {
		res.render('home.ejs');
	})

	app.get('/login', function(req, res) {
    	// render the page and pass in any flash data if it exists
        res.render('credentials.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // app.post('/login', function(req, res, next) {
    //     console.log(req.url);
    //     passport.authenticate('local-login', function(err, user, info) {
    //         console.log("authenticate");
    //         console.log(err);
    //         console.log(user);
    //         console.log(info);
    //     })(req, res, next);
    // });

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    /*app.get('/dashboard', isLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists
        if (req.user) {
            res.render('pages/dashboard.ejs', {
                user: req.user
            }); 
        }
    });*/

    app.get('/trends', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/trends.ejs'); 
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    
};