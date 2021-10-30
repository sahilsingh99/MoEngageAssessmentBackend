const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

    anilist_id : Number,
    rating : Number,
    comment : {
        type : String,
        maxlength : 500,
    },
    author : {

        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

module.exports = mongoose.model('Review', reviewSchema);