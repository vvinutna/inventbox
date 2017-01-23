var bcrypt   = require('bcrypt-nodejs');
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

/*userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};*/

module.exports = userSchema;