const express = require('express');

const { isLoggedIn, isAuthenticated } = require("../middlewares/auth");

const { getAnimeById, searchAnime, addReview, getReview, getUserById } = require("../controllers/anime");

var router = express.Router();

router.param('anilist_id', getAnimeById);
router.param('user_id', getUserById);

router.get('/:user_id', isLoggedIn, isAuthenticated, (req, res, next) => {

    return res.status(200).json({
        status : 200,
        message : "everything is fine here, & you logged in ( Date bayyo)"
    })
});

router.post('/:user_id', isLoggedIn, isAuthenticated, searchAnime);

router.post('/add/review/:anilist_id/:user_id', isLoggedIn, isAuthenticated, addReview);

router.get('/byId/:anilist_id/:user_id', isLoggedIn, isAuthenticated, getReview);

module.exports = router;