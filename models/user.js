const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        trim : true,
        minlength : 4
    },
    email : {
        type : String,
        required : true,
        unique : true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 6 
    },
    reviews : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Review"
    }]
}, {timestamps : true});

module.exports = mongoose.model('User', userSchema);