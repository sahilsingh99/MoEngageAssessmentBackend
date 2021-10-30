const jwt = require('express-jwt');

exports.isLoggedIn = jwt({
    secret : process.env.SECRET,
    userProperty : "auth",
    algorithms: ['sha1', 'RS256','HS256'] 
});

exports.isAuthenticated = (req, res, next) => {
    const validator = req.profile && req.auth && req.auth._id == req.profile._id;
    if(!validator) {
        return res.status(403).json({
            msg : "ACCESS DENIED :("
        });
    }
    next();
}