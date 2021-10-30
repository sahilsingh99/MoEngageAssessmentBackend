var express = require('express');

var router = express.Router();

var {signup , login , logout} = require('../controllers/auth');

router.get('/signup', (req, res, next) => {
    res.status(200).json({
        message : "this is signup page"
    });
})

router.get('/login', (req, res, next) => {
    res.status(200).json({
        message : "this is login page"
    });
})

// signup route
router.post('/signup', signup);

// login route
router.post('/login', login);

// logout route
router.get('/logout', logout);

module.exports = router;