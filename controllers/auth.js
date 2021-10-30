// modules for hashing
const bcrypt = require('bcrypt'),
      jwt   = require('jsonwebtoken');

// User model
const User = require('../models/user');


// signup 
exports.signup = (req, res, next) =>{
    const {username, email, password} = req.body;
    console.log(req.body);

    if(password.length < 6) {
        let custom_error = {
            status : 409,
            custom_message : "enter a valid password of min length 6",
            message : "no system error! (signup user)"
        }
        next(custom_error);
    }

    User.findOne({email})
        .then( user => {
            if(user) {
                let custom_error = {
                    status : 409,
                    custom_message : "mail already exist!",
                    message : "no system error! (signup user)"
                }
                next(custom_error);
            } else {
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    if(err) {
                        let custom_error = {
                            status : 500,
                            custom_message : "error in first hashing!",
                            message : err2
                        }
                        next(custom_error);
                    }
                    bcrypt.hash(password, salt, function (err2, hash) {
                        if(err2){
                            let custom_error = {
                                status : 500,
                                custom_message : "error in hashing!",
                                message : err2
                            }
                            next(custom_error);
                        } 
                        const user = new User( {
                            username : username,
                            email : email,
                            password : hash
                        });
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message : "User created Successfully :)",
                                    data : {
                                        user : {
                                            username : result.name,
                                            userId : result._id,
                                            email : result.email,
                                            password : result.password
                                        }
                                    }
                                })
                            })
                            .catch( error => {
                                let custom_error = {
                                    status : 500,
                                    custom_message : "user not created!",
                                    message : error
                                }
                                next(custom_error);
                            });
                    })
                })
            }
        })
        .catch(error => {
            let custom_error = {
                status : 500,
                custom_message : "error in finding user!",
                message : error
            }
            next(custom_error);
        })
}

// login 
exports.login = (req, res, next) => {

    const {email , password} = req.body;
    User.findOne({email})
        .exec()
        .then(user => {
            if(!user || user.length < 1) {
                let custom_error = {
                    status : 401,
                    custom_message : "Auth failed! enter valid email",
                    message : "no system error! (login email)"
                }
                next(custom_error);
            } else {
                bcrypt.compare(password, user.password, (error, result) => {
                    if(error){
                        let custom_error = {
                            status : 500,
                            custom_message : "error in compairing pass!",
                            message : error
                        }
                        next(custom_error);
                    } else {
                        if(!result) {
                            let custom_error = {
                                status : 401,
                                custom_message : "Auth failed!",
                                message : "no results in compare pass!"
                            }
                            next(custom_error);
                        } else{
                            // generate token
                            const token = jwt.sign({
                                exp: Math.floor(Date.now() / 1000) + (6000 * 6000),
                                iat: Math.floor(Date.now() / 1000),
                                _id : user._id
                            }, process.env.SECRET);

                            // put token in cookie
                            res.cookie("token", token, { maxAge : 360000 });

                            res.status(202).json({
                                message : "Logined successfully :)",
                                data : {
                                    userId : user._id,
                                    username : user.username,
                                    token : token
                                }
                            });
                        }
                    }
                })
            }
        })
        .catch(error => {
            console.log(error);
            let custom_error = {
                status : 500,
                custom_message : "error in finding user!",
                message : error
            }
            next(custom_error);
        })
}

// logout
exports.logout = (req, res, next) => {

    // remove token 
    res.clearCookie("token");

    res.status(200).json({
        message : "Logged out successfully :)"
    })
}