var express = require('express');
var router = express.Router();
var passport = require('passport');
const methodOverride = require('method-override')
const path = require('path');
const bcrypt = require('bcrypt')
var publicdir = path.normalize(path.normalize(__dirname + "/..") + "/public/HTMLs"); //Erlaubt probemlosen zugriff auf den Public Ordner
var viewdir = path.normalize(path.normalize(__dirname + "/..") + "/Views");  //Zugriff auf Views







/* GET home page. */

router.get('/Startseite', checkAuthenticated, async (req, res, next) => {
    var Nutzer = await req.user;
    res.render(viewdir + "/Startseite.ejs",  {name: Nutzer.Name});
});
router.get('/fahrt', checkAuthenticated,function (req, res, next) {
    res.sendFile(publicdir + '/FahrtTaetigen.html');
});
router.get('/fahrtdef', checkAuthenticated,function (req, res, next) {
    res.render(viewdir + '/FahrtTaetigen.ejs');
});
router.get('/GetaetigteFahrten', checkAuthenticated,function (req, res, next) {
    res.render(viewdir + '/GetaetigteFahrten.ejs');
});
//Todo: Rollen Abhängigkeit Hinzufügen
router.get('/Arzt', checkAuthenticated, isInRole, function (req, res, next) {
    res.render(viewdir + '/ArztMenue.ejs');
});
router.get('/Registrierung',checkNotAuthenticated, function (req, res, next) {
    res.render(viewdir + '/Registrierung.ejs');
});
router.get('/Login', checkNotAuthenticated,function (req, res, next) {
    res.render(viewdir + '/Login.ejs');
});
//User System
router.get("/register", (req, res) => {

})


router.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        var db = req.app.get("db");
        hashedpassword = await bcrypt.hash(req.body.Password, 10);

        var exNutzer = await db.collection("nutzer").find({Email: req.body.Email}).toArray();


        try{
            if (req.body.Email == exNutzer[0].Email) {
                res.redirect("/Registrierung") //Todo: Ersetzen durch Fehlermeldung
                return;
            }
        }catch (e){
            //Keine bessere Idee für ne Lösung
        }

        var Arzt = false;


        if(req.body.Rolle == "Arzt"){
            Arzt = true;
        }
        db.collection("nutzer").insertOne({
            Name: req.body.Username,
            Email: req.body.Email,
            password: hashedpassword,
            Arzt: Arzt
        })
        res.redirect("/Login")
    } catch (e) {
        console.log(e)
    }

})

router.delete("/logout", ((req, res) => {
    req.logOut();
    res.redirect("/Login")
}))

router.post("/Login", passport.authenticate('local', {
    successRedirect: '/Startseite',
    failureRedirect: '/Login',
    failureFlash: true
}))




//Datenbakrouten
//Müsste eine Fahrt entgegennehmen und speichern
router.post("/setFahrten",checkAuthenticated, async (req, res) => {
    try {
        //Todo: Evtl daten erst verifizieren bevor ich sie in die Datenbank packe
        var Nutzer = await req.user;
        var db = req.app.get("db");
        var data = req.body;
        data.NutzerID = Nutzer._id;
        db.collection("fahrten").insertOne(data);
        res.send({status: 'SUCCESS'});
    } catch (e) {
        console.log(e)
    }
})
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



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/Login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/Startseite')
    }
    next()
}
async function isInRole(req, res, next){
    var Nutzer = await req.user
    if(!Nutzer.Arzt){
        return res.redirect("/Startseite") //Todo: Durch Fehlermeldung Ergänzen
    }
    next();
}

module.exports = router;
