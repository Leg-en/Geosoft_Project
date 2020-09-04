var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongodb = require('mongodb');
const flash = require("express-flash")
const session = require("express-session")
let ejs = require('ejs');
var app = express();
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const methodOverride = require('method-override')




//Login System
var passport = require('passport')

const initializePassport = require('./passport-config')


connectMongoDB()



app.set('view-engine', ejs)
app.use(express.urlencoded({extended: false}))

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




//Für  Login
app.use(flash())
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'))
//Todo: Evtl Löschen
app.use(express.static("public"));


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
        var user  = await app.locals.db.collection("nutzer").find({_id: new  mongodb.ObjectID(id)}).toArray();
        return user[0]
    }
)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
app.use('/', indexRouter);
app.use('/users', usersRouter);


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
    successRedirect: '/Arzt',
    failureRedirect: '/GetaetigteFahrten',
    failureFlash: true
}))



module.exports = app;
