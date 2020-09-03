var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongodb = require('mongodb');



//Login System
var passport = require('passport')
//var LocalStrategy = require("passport-local").Strategy;
const initializePassport = require('./passport-config')
initializePassport(passport, email => {
    //Todo: Datenbank verbindung herstellen und nach Email Filtern.
    // https://www.youtube.com/watch?v=-RCnNyD0L-s
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(express.urlencoded({extended: false}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//Für  Login
//app.use(passport.initialize());
//app.use(passport.session());

//Bibs Verfügbar machen
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/markercluster', express.static(__dirname + '/node_modules/leaflet.markercluster/dist'));
//Wir nutzen ejs
app.set('view-engine', 'ejs')


//Datenbank
async function connectMongoDB() {
    try {
        //connect to database server
        app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true }); //Alte URL "mongodb://root:rootpassword@mongodbservice:27017"
        app.locals.db = await app.locals.dbConnection.db("geosoftproject");
        console.log("Using db: " + app.locals.db.databaseName);
        app.set("db", app.locals.db);
    }
    catch (error) {
        console.dir(error)
        setTimeout(connectMongoDB(), 3000)
    }
}
connectMongoDB()

//passport.use(new LocalStrategy(
//    function (username, password, done){
        //Todo: Fertigstellen
//    }
//))



module.exports = app;
