var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongodb = require('mongodb');
const flash = require("express-flash")
const session = require("express-session")
let ejs = require('ejs');
var app = express();
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')



//Login System
var passport = require('passport')

const initializePassport = require('./passport-config')


connectMongoDB()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


app.set('view-engine', ejs)
app.use(express.urlencoded({extended: false}))

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//Für  Login
app.use(flash())
app.use(session({
    secret: "Test", //Todo: Ändern
    resave: false,
    saveUninitialized: false,
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);


app.use(passport.initialize())
app.use(passport.session());



//Bibs Verfügbar machen
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/markercluster', express.static(__dirname + '/node_modules/leaflet.markercluster/dist'));
//Wir nutzen ejs

//Todo: Evtl löschen



initializePassport(
    passport,
    async email =>  {
        var user  = await app.locals.db.collection("nutzer").find({Email: email}).toArray();
        return user[0]
    },
    async id=> {
        console.log("Huhu")
        var user  = await app.locals.db.collection("nutzer").find({_id: new  mongodb.ObjectID(id)}).toArray();
        console.log(user)
        return user[0]
    }
)


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




//Keine Ahnung wie man das sonst machen soll
app.post("/Login", passport.authenticate('local', {
    successRedirect: '/Startseite',
    failureRedirect: '/Login',
    failureFlash: true
}))



module.exports = app;
