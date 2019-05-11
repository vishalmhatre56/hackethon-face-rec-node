const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {isEmail}  = require('validator');

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [ isEmail, 'invalid email' ]        
    },
    password: {
        type: String,
        required: true
    },


});

userSchema.pre('save', function(next) {

    const hash = bcrypt.hashSync(this.password, 10);
    this.password = hash;
    next();
});

userSchema.methods.comparePassword = function(password) {

    return bcrypt.compareSync(password, this.password);

};
const user = mongoose.model('User', userSchema);

module.exports = user;