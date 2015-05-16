var mongoose = require('mongoose');
var Schema    = mongoose.Schema;

var validatePresenceOf = function(value) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    return (this.provider && this.provider !== 'local') || (value && value.length);
};

var validateUniqueEmail = function(value, callback) {
    var User = mongoose.model('User');
    User.find({
        $and: [{
            email: value
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, user) {
        callback(err || user.length === 0);
    });
};

module.exports = function() {
    var UserSchema = new Schema({
        nome: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Por favor informe um email valido'],
            index: {
                unique: true
            }
        },
        hashed_password: {
            type: String,
            validate: [validatePresenceOf, 'Password nao pode ser nulo']
        },
        provider: {
            type: String,
            default: 'local'
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        facebook: {},
        twitter: {},
        github: {},
        google: {},
        linkedin: {}
    });



    // rotinas que podem ser útil algum dia
    UserSchema.methods = {
        hasRole: function(role) {
            var roles = this.roles;
            return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
        },

        isAdmin: function() {
            return this.roles.indexOf('admin') !== -1;
        },

        authenticate: function(plainText) {
            return this.hashPassword(plainText) === this.hashed_password;
        },

        makeSalt: function() {
            return crypto.randomBytes(16).toString('base64');
        },

        hashPassword: function(password) {
            if (!password || !this.salt) return '';
            var salt = new Buffer(this.salt, 'base64');
            return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
        },

        toJSON: function() {
            var obj = this.toObject();
            delete obj.hashed_password;
            return obj;
        }
    };

    return mongoose.model('Contato', UserSchema);
};
