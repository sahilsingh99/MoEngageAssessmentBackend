var express         = require('express'),
    morgan          = require('morgan'),
    cors            = require('cors'),
    mongoose        = require('mongoose'),
    cookieParser    = require('cookie-parser'),
    env             = require('dotenv');

// setting app configurations and several packages.
var app = express();
env.config();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());

const URI = process.env.DBURI;
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {
        console.log("connected to database");
    })
    .catch(err => {
        console.log(err);
    });

//handling cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",'*');
    res.header(
        "Access-Control-Allow-Headers",
        "origin, X-Requested-With, Accept, Authorization, Content-type"
    );
    
    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH , GET , DELETE");
        return res.status(200).json({});
    }

    next();
})

// import routes
const authRoute = require('./routes/auth');
const animeRoute = require('./routes/anime');

// Signal EndPoint    
app.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Working fine'
    })
});

app.use('/api/auth', authRoute);
app.use('/api/anime',animeRoute);


// error for invalid route
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

// error handler
app.use((error, req, res, next) => {
    console.log("error is here in handler", error);
    return res.status(error.status || 500).json({
            custom_message : error.custom_message,
            message: error.message
    })
})

const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
    console.log("Server is Live!");
})