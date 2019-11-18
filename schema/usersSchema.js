let mongoose = require('mongoose');
let Schema = mongoose.Schema;

var User = new Schema({
    username: {
        type: String,
        required : [ true, 'name is required'],
        lowercase : true
    },
    email: {
        type: String,
        required : [ true, 'email is required'],
        unique : true,
        lowercase : true
    },
    password: {
        type: String,
        required : [ true, 'password is required']
    },
    file_directory:{
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', User);