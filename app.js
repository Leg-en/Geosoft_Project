var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongodb = require('mongodb');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Bibs Verfügbar machen
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/markercluster', express.static(__dirname + '/node_modules/leaflet.markercluster/dist'));

//Datenbank
async function connectMongoDB() {
    try {
        //connect to database server
        app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true }); //Alte URL "mongodb://root:rootpassword@mongodbservice:27017"
        app.locals.db = await app.locals.dbConnection.db("geosoftproject");
        console.log("Using db: " + app.locals.db.databaseName);
    }
    catch (error) {
        console.dir(error)
        setTimeout(connectMongoDB(), 3000)
    }
}
connectMongoDB()


module.exports = app;
