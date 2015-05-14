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
            validate: [validateUniqueEmail, 'E-mail address is already in-use'],
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

    UserSchema.methods = {
        /**
         * HasRole - check if the user has required role
         *
         * @param {String} plainText
         * @return {Boolean}
         * @api public
         */
        hasRole: function(role) {
            var roles = this.roles;
            return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
        },

        /**
         * IsAdmin - check if the user is an administrator
         *
         * @return {Boolean}
         * @api public
         */
        isAdmin: function() {
            return this.roles.indexOf('admin') !== -1;
        },

        /**
         * Authenticate - check if the passwords are the same
         *
         * @param {String} plainText
         * @return {Boolean}
         * @api public
         */
        authenticate: function(plainText) {
            return this.hashPassword(plainText) === this.hashed_password;
        },

        /**
         * Make salt
         *
         * @return {String}
         * @api public
         */
        makeSalt: function() {
            return crypto.randomBytes(16).toString('base64');
        },

        /**
         * Hash password
         *
         * @param {String} password
         * @return {String}
         * @api public
         */
        hashPassword: function(password) {
            if (!password || !this.salt) return '';
            var salt = new Buffer(this.salt, 'base64');
            return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
        },

        /**
         * Hide security sensitive fields
         *
         * @returns {*|Array|Binary|Object}
         */
        toJSON: function() {
            var obj = this.toObject();
            delete obj.hashed_password;
            return obj;
        }
    };
};