const User = require('../models/user');
const Review = require('../models/review');
const axios = require('axios');


exports.getUserById = (req, res, next, id) => {
    User.findById({_id : id}).exec( 
        (err, user) => {
            if(err || !user) {
                console.log(err, user);
                return res.status(500).json({
                    status : 500,
                    message : "error in finding user by id"
                })
            }
            req.profile = user;
            req.profile.password = undefined; 
            next();
        })
}

exports.searchAnime = (req, res, next) => {

    let title = req.body.title;
    title = encodeURIComponent(title.trim());
    let genre = req.body.genre;

    let url = "https://api.aniapi.com/v1/anime";

    if(title != "" && genre != "") url = url + "?title=" + title + "&genres=" + genre;
    else if(title != "") url = url + "?title=" + title;
    else if(genre != "") url = url + "?genres=" + genre;
    console.log(url);

    axios.get(url, {
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {

        response = response.data;
        if(response.status_code != 200) {

            return res.status(500).json({

                status : 500,
                message : "data fetching unsuccessfull"
            });
        }
        // a. Anime name/title
        // b. Trailer url
        // c. genres
        // d. description
        // e. Current rating (rating based on point no.4)
        // f. Season year
        // g. No.of episodes

        let documents = response.data.documents;

        let anime_data = [];
        documents.forEach(document => {

            var anime = {

                anilist_id : document.anilist_id,
                title : document.titles.en,
                trailer_url : document.trailer_url,
                genres : document.genres,
                description : document.descriptions.en,
                rating : Math.floor(document.score / 25 + 1),
                season_year : document.season_year,
                no_of_episodes : document.episodes_count,
                banner_image : document.banner_image
            }
            anime_data.push(anime);
        });

        return res.status(200).json({

            status : 200,
            message : "Data fetched successfully",
            anime_data : anime_data
        });
    })
    .catch(error => {

        console.log(error);
        return res.status(500).json({

            status : 500,
            message : "Error in fetching data from API",
            error : error
        })
    })
}


exports.addReview = (req, res, next) => {

    const rating = req.body.rating;
    const comment = req.body.comment;
    const author_id = req.auth._id;
    const anilist_id = req.anime_data.anilist_id;
    // console.log(anilist_id);

    let review = new Review( {

        anilist_id : anilist_id,
        rating : rating,
        comment : comment,
        author : author_id
    });

    review.save()
    .then(data => {

        User.findOneAndUpdate(
            {_id : req.auth._id},
            {$push : {reviews : data._id}}
        ).exec()
        .then(user_data => {

            return res.status(201).json({

                status : 201,
                message : "review added successfully",
                review : data
            });
        })
        .catch(user_error => {

            status : 500,
            console.log(user_error);
            return res.status(500).json({

                message : "error in saving review id in user",
            });
        });
        
    })
    .catch(error => {

        console.log(error);
        return res.status(500).json({

            status : 500,
            message : "error in saving review"
        });
    });
}

exports.getAnimeById = (req, res, next, id) => {

    let url = "https://api.aniapi.com/v1/anime";
    url = url + "?anilist_id=" + id;

    axios.get(url, {
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {

        response = response.data;

        if(response.status_code != 200) {

            return res.status(response.status_code).json({

                status : 500,
                message : "data fetching unsuccessfull"
            });
        }
        // all information
        /*
                "anilist_id"
                "status"
                "titles"
                "descriptions"
                "start_date"
                "end_date"
                "season_period"
                "season_year"
                "episodes_count"
                "episode_duration"
                "trailer_url"
                "cover_image"
                "cover_color"
                "banner_image"
                "genres"
        */

        let document = response.data.documents[0];
        let anime_data;
        //console.log(document.titles);

            anime_data = {

                anilist_id : document.anilist_id,
                status : document.status,
                title : document.titles.en,
                trailer_url : document.trailer_url,
                genres : document.genres,
                description : document.descriptions.en,
                rating : Math.floor(document.score / 25 + 1),
                season_year : document.season_year,
                no_of_episodes : document.episodes_count,
                episode_duration : document.episode_duration,
                start_date : document.start_date,
                end_date : document.end_date,
                session_period : document.session_period,
                cover_image : document.cover_image,
                cover_color : document.cover_color,
                banner_image : document.banner_image

            }
        req.anime_data = anime_data;
        next();
    })
    .catch(error => {

        console.log(error);
        return res.status(500).json({

            status : 500,
            message : "Error in fetching data from API",
        })
    })
}

exports.getReview = (req, res, next) => {

    let review_message;
    Review.find({anilist_id : req.anime_data.anilist_id}).populate("author", "username _id").exec()
    .then(review_data => {

        if(review_data.length == 0) {

            review_message = "no reviews";
            review_data = [];
        }
        else review_message = "some reviews found"; 
        req.anime_data.reviews = review_data;
        req.anime_data.review_message = review_message;

        return res.status(200).json({

            status : 200,
            message : "fetched reviews and anime data successfully",
            anime_data : req.anime_data
        })
    })
    .catch(review_error => {

        review_message = "error in review query";
        console.log(review_error);
        return res.status(500).json({

            status : 500,
            message : "error in fetching reviews",
            error : review_error
        })

    })
}