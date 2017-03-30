// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var pg = require('pg');
var conString = "postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b";
var client = new pg.Client(conString);

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        //console.log(user.u_id +" was seralized");
        done(null, user.u_id);
        //done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        //console.log(id + "is deserialized");
        User.findById(user, function(err, user) {
            done(err, user);
        });
        //done(null, user);
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function(callback) {


                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne(email, password, function(err, isNotAvailable, user) {
                    //console.log('userfound: ' + isNotAvailable);
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    //if (){
                    //
                    //}

                    // check to see if theres already a user with that email
                    if (isNotAvailable == true) {
                        //console.log(user.email +' is not available');
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        console.log('new local user');

                        // if there is no user with that email
                        // create the user
                        user            = new User();


                        // set the user's local credentials

                        user.email    = req.body.email;
                        user.password = req.body.password;
                        //newUser.photo = 'http://www.flippersmack.com/wp-content/uploads/2011/08/Scuba-diving.jpg';

                        user.save(function(newUser) {
                            console.log("the object user is: ", newUser);
                            passport.authenticate();
                            return done(null, newUser);
                            //newUser.password = newUser.generateHash(password);
                        });
                    }

                });

            });

        }));



    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne(email, password, function(err, isNotAvailable, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!isNotAvailable)
                    return done(null, false, req.flash('loginMessage', 'The username or password you have entered is invalid.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                /*if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
*/
                // all is well, return successful user
                return done(null, user);
            });

        }));

};