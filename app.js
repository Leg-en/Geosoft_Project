//Vorbereitende Imports und Festlegungen
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
const bcrypt = require('bcrypt')





//Login System
var passport = require('passport') //Passport für Login benötigt
const initializePassport = require('./passport-config') //Passport Konfiguration


connectMongoDB() //Mongodb Verbindung herstellen



app.set('view engine', "ejs") //Wir verwenden ejs als View Engine. Templates nutzen wir der einfachheit halber nicht.
//Sonst noch nötigte Festlegungen, teils benötigt für Passport
app.use(express.urlencoded({extended: false}))
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




//Für  Login
app.use(flash())
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat', //Todo: Anderes Secret Wählen
    resave: false,
    saveUninitialized: true,
    cookie: {} //Cookies sind bei uns nicht weiter Konfiguriert.
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method')) //Benötigt für Passport
app.use(express.static("public"));

//Passport auch benutzen und auch Session benutzen
app.use(passport.initialize())
app.use(passport.session());







//Bibs Verfügbar machen
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/markercluster', express.static(__dirname + '/node_modules/leaflet.markercluster/dist'));
app.use('/qunit', express.static(__dirname + '/node_modules/qunit/qunit'));

//Passport Initialisieren.
initializePassport(
    passport,
    //Nutzer über Email bekommen
    async email =>  {
        var user  = await app.locals.db.collection("nutzer").find({Email: email}).toArray();
        return user[0]
    },
    //Nutzer über Datenbank Bekommen
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
        //Wenn nicht mit Docker verwendet wir zu mongodb://localhost:27017 ändern
        app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true }); //Alte URL "mongodb://root:rootpassword@mongodbservice:27017"
        app.locals.db = await app.locals.dbConnection.db("geosoftproject");
        console.log("Using db: " + app.locals.db.databaseName);
        app.set("db", app.locals.db);
        createAdmin();
    }
    catch (error) {
        console.dir(error)
        setTimeout(connectMongoDB(), 3000)
    }
}
async function createAdmin(){
    var Admin = await app.locals.db.collection("nutzer").find({admin: true}).toArray();
    if(Admin.length == 0){
        app.locals.db.collection("nutzer").insertOne({
            Name: "admin",
            Email: "admin@admin",
            password: await bcrypt.hash("admin", 10),
            Arzt: true,
            Fahrten: [], //Fahrten Array ist noch Leer. Nutzer kann offensichtlicherweise noch keine Fahrten gemacht haben.
            RecentFlags: false,
            recentFlagged: [],
            flags: [],
            admin: true,
        })
    }
}


module.exports = app;
