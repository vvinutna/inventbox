/*var bcrypt   = require('bcrypt-nodejs');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b');

var userSchema = sequelize.define('local', {
  		email: Sequelize.STRING,
 		password: Sequelize.STRING
 	},
 	{instanceMethods: {
 		generateHash: function(password) {
			return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
		},
		validPassword: function(password) {
    		return bcrypt.compareSync(password, this.local.password);
		},	
 	}
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = userSchema;*/

var pg = require('pg');
var conString = "postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b";
var client = new pg.Client(conString);

function User() {
	this.u_id = 0;
    this.email = "";
    this.password= "";

    this.save = function(callback) {
    	var conString = "postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true";

        var client = new pg.Client(conString);
        client.connect();

        console.log(this.email +' will be saved');

        var query = client.query('INSERT INTO users(email, password) VALUES($1, $2)', [this.email, this.password], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
            //console.log(this.email);
        });
        var query1 = client.query('SELECT * FROM users ORDER BY u_id desc limit 1', null, function(err, result){

            if(err){
                return callback(null);
            }
            //if no rows were returned from query, then new user
            if (result.rows.length > 0){
                console.log(result.rows[0] + ' is found!');
                var user = new User();
                user.email= result.rows[0]['email'];
                user.password = result.rows[0]['password'];
                user.u_id = result.rows[0]['u_id'];
                console.log(user.email);
                client.end();
                return callback(user);
            }
        });

        query1.on('end', () => { client.end(); });
    };
}

User.findOne = function(email, password, callback){
    var conString = "postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true";
    var client = new pg.Client(conString);

    var isNotAvailable = false; //we are assuming the email is taking
    //var email = this.email;
    //var rowresult = false;

    //check if there is a user available for this email;
    client.connect();
    //client.connect(function(err) {
    ////    //console.log(this.photo);
    //    console.log(email);
    //    if (err) {
    //        return console.error('could not connect to postgres', err);
    //    }

    var query = client.query("SELECT * from users where email=$1", [email], function(err, result){
        if(err){
            console.log('error');
            return callback(err, isNotAvailable, this);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            if (password === result.rows[0].password) {
                isNotAvailable = true;
            }
        }
        else {
            isNotAvailable = false;
        }
        //the callback has 3 parameters:
        // parameter err: false if there is no error
        //parameter isNotAvailable: whether the email is available or not
        // parameter this: the User object;
        client.end();
        return callback(false, isNotAvailable, result.rows[0]);
    });

//});
};

User.findById = function(id, callback){
    var conString = "postgres://wsjlyhcniawoyr:cf2K6zizjThAweZ19mCPA6NWlp@ec2-54-235-246-220.compute-1.amazonaws.com:5432/d5cgikmoltlg1b?ssl=true";
    var client = new pg.Client(conString);

    client.connect();
    var query = client.query("SELECT * from users where u_id=$1", [id], function(err, result){
        if(err){
            return callback(err, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            var user = new User();
            user.email= result.rows[0]['email'];
            user.password = result.rows[0]['password'];
            user.u_id = result.rows[0]['u_id'];
            return callback(null, user);
        }
    });

    query.on('end', () => { client.end(); });
};

//User.connect = function(callback){
//    return callback (false);
//};

//User.save = function(callback){
//    return callback (false);
//};

module.exports = User;