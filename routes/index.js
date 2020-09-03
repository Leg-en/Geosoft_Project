var express = require('express');
var router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt')
var publicdir = path.normalize(path.normalize(__dirname + "/..") + "/public/HTMLs"); //Erlaubt probemlosen zugriff auf den Public Ordner
var viewdir = path.normalize(path.normalize(__dirname + "/..") + "/Views");  //Zugriff auf Views





/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.get('/Startseite', checkAuthenticated, function (req, res, next) {
    res.render(viewdir + '/Startseite.ejs',  {name: req.user.name});
});
router.get('/fahrt', function (req, res, next) {
    res.sendFile(publicdir + '/FahrtTaetigen.html');
});
router.get('/fahrtdef', function (req, res, next) {
    res.render(viewdir + '/FahrtTaetigen.ejs');
});
router.get('/GetaetigteFahrten', function (req, res, next) {
    res.render(viewdir + '/GetaetigteFahrten.ejs');
});
//Todo: Rollen Abhängigkeit Hinzufügen
router.get('/Arzt', function (req, res, next) {
    res.render(viewdir + '/ArztMenue.ejs');
});
router.get('/Registrierung', function (req, res, next) {
    res.render(viewdir + '/Registrierung.ejs');
});
router.get('/Login', function (req, res, next) {
    res.render(viewdir + '/Login.ejs');
});
//User System
router.get("/register", (req, res) => {

})


router.post("/register", async (req, res) => {
    try {
        hashedpassword = await bcrypt.hash(req.body.Password, 10);
        var db = req.app.get("db");
        db.collection("nutzer").insertOne({
            Name: req.body.Username,
            Email: req.body.Email,
            password: hashedpassword
        })
        res.redirect("/Login")
    } catch (e) {
        console.log(e)
    }

})





//Datenbakrouten
//Müsste eine Fahrt entgegennehmen und speichern
router.post("/setFahrten", (req, res) => {
    //Todo: Evtl daten erst verifizieren bevor ich sie in die Datenbank packe
    var db = req.app.get("db");
    db.collection("fahrten").insertOne(req.body);
    res.send({status: 'SUCCESS'});

});
router.post("/markieren", (req, res) => {

})



//Sendet Fahrt zurück
//Todo: Fahrt Filtern
router.get("/getFahrten", (req, res) => {
    app.locals.db.collection("fahrten").find({}).toArray((mongoError, result) => {
        if (mongoError) throw mongoError;
        res.json(result);
    });
})

module.exports = router;

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/Login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
