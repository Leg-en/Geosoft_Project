//Wichtige Sachen Importieren und Festlegen
var express = require('express');
var router = express.Router();
var passport = require('passport');
const methodOverride = require('method-override')
const path = require('path');
const bcrypt = require('bcrypt')
var publicdir = path.normalize(path.normalize(__dirname + "/..") + "/public/HTMLs"); //Erlaubt probemlosen zugriff auf den Public Ordner
var viewdir = path.normalize(path.normalize(__dirname + "/..") + "/Views");  //Zugriff auf Views
const mongodb = require('mongodb');


//Get Anweisungen für Websiten
//Check Authenticated überprüft ob user Authenthifiziert ist
router.get('/', checkAuthenticated, async (req, res, next) => {
    res.redirect("/Startseite") //Redirect auf Startseite für einfachen aufruf auf Server. User wird im Folgenden wahrscheinlich auf Login redirected

});
router.get('/Startseite', checkAuthenticated, async (req, res, next) => {
    var Nutzer = await req.user; //Nutzer Daten Holen
    //Wenn Nutzer Arzt ist, zeige die Arzt seite an. Sonst nicht. Und Stellt den namen des Nutzers da
    if (Nutzer.Arzt) {
        res.render(viewdir + "/Startseite.ejs", {name: Nutzer.Name, Role: "Arzt Menü"});
    } else {
        res.render(viewdir + "/Startseite.ejs", {name: Nutzer.Name, Role: null});
    }

});
//Letzte Sendfile anweisung die auf alten HTMLs beruht. Evtl entfernen da sie nicht mit dem backend verknüpft ist
router.get('/fahrt', checkAuthenticated, function (req, res, next) {
    res.sendFile(publicdir + '/FahrtTaetigen.html');

});
//Fahrt Tätitgen
router.get('/fahrtdef', checkAuthenticated, async (req, res, next) => {
    var Nutzer = await req.user;
    if (Nutzer.Arzt) {
        res.render(viewdir + "/FahrtTaetigen.ejs", {name: Nutzer.Name, Role: "Arzt Menü"});
    } else {
        res.render(viewdir + "/FahrtTaetigen.ejs", {name: Nutzer.Name, Role: null});
    }
});
//Getätigte Fahrten
router.get('/GetaetigteFahrten', checkAuthenticated, async (req, res, next) => {
    var Nutzer = await req.user;
    if (Nutzer.Arzt) {
        res.render(viewdir + "/GetaetigteFahrten.ejs", {name: Nutzer.Name, Role: "Arzt Menü"});
    } else {
        res.render(viewdir + "/GetaetigteFahrten.ejs", {name: Nutzer.Name, Role: null});
    }
});
//Überprüft zusätzlich ob Arzt auch Arzt ist.
router.get('/Arzt', checkAuthenticated, isInRole, async (req, res, next) => {
    var db = req.app.get("db");
    var Nutzer = await req.user;
    var User = await db.collection("nutzer").find({}).toArray();

    if (Nutzer.Arzt) {
        res.render(viewdir + "/ArztMenue.ejs", {name: Nutzer.Name, Role: "Arzt Menü", User: User});
    } else {
        res.render(viewdir + "/Startseite.ejs", {name: Nutzer.Name, Role: null});
    }
});
router.get('/Registrierung', checkNotAuthenticated, function (req, res, next) {
    res.render(viewdir + '/Registrierung.ejs');
});
router.get('/Login', checkNotAuthenticated, function (req, res, next) {
    res.render(viewdir + '/Login.ejs');
});


//User Managment System
//Post anweisung fürs Registrieren.
router.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        //Datenbank Verbindung aufbauen
        var db = req.app.get("db");
        //Passwort hashen
        hashedpassword = await bcrypt.hash(req.body.Password, 10);
        //Überprüfen ob Nutzer bereits Existiert und dann Redirecten auf Startseite
        var exNutzer = await db.collection("nutzer").find({Email: req.body.Email}).toArray();
        try {
            if (req.body.Email == exNutzer[0].Email) {
                res.redirect("/Registrierung") //Todo: Ersetzen durch Fehlermeldung
                return;
            }
        } catch (e) {
            //Keine bessere Idee für ne Lösung
        }
        //Default mäßig ist man kein Arzt. Außer man wählt es bei der Registirierung an
        var Arzt = false;
        if (req.body.Rolle == "Arzt") {
            Arzt = true;
        }
        //Daten in der Datenbank Speichern
        db.collection("nutzer").insertOne({
            Name: req.body.Username,
            Email: req.body.Email,
            password: hashedpassword,
            Arzt: Arzt,
            Fahrten: [] //Fahrten Array ist noch Leer. Nutzer kann offensichtlicherweise noch keine Fahrten gemacht haben.
        })
        //Nach Erfolgreicher Registierung auf Login redirecten
        res.redirect("/Login")
    } catch (e) {
        console.log(e)
    }

})
//Logout Statement
router.delete("/logout", ((req, res) => {
    req.logOut(); //Passport methode für Logout
    res.redirect("/Login") //Nach Erfolgreichem Logout, zurück zum login
}))
//Login Route. Eigentliche Login funktionalität wir Passport überlassen
//Wir Verwenden Exklusiv eine Lokale Strategie zum Login
router.post("/Login", passport.authenticate('local', {
    successRedirect: '/Startseite', //Bei erfolgreichem Login zur Startseite
    failureRedirect: '/Login', //Ansonsten zum Login
    failureFlash: true //Fehlermeldung bei Falschem Login
}))


//Datenbakrouten
//Müsste eine Fahrt entgegennehmen und speichern
router.post("/setFahrten", checkAuthenticated, async (req, res) => {
    try {
        //Todo: Evtl daten erst verifizieren bevor ich sie in die Datenbank packe
        //Vorbereitende Variablen Festlegen.
        var user = await req.user;
        var db = req.app.get("db");
        var data = req.body;
        data.Nutzer = [];
        var checkIfAlreadyExists = await db.collection("fahrten").find({UniqueID: data.UniqueID}).toArray()
        var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user._id)}).toArray();
        //Überprüfen ob Fahrt schon Existiert
        if (checkIfAlreadyExists.length > 0) {
            //Wenn element schon Existiert
            //Fahrt bekommt  Nutzer ID
            checkIfAlreadyExists[0].Nutzer.push(user._id);
            await db.collection("fahrten").updateOne({_id: new mongodb.ObjectID(checkIfAlreadyExists[0]._id)}, {$set: {Nutzer: checkIfAlreadyExists[0].Nutzer}})
            //In der Nutzer Datenbank  dem Nutzer die Fahrt  Hinzufügen
            Nutzer[0].Fahrten.push(checkIfAlreadyExists[0]._id);
        } else {
            //Wenn Element noch nicht Existiert
            data.Nutzer.push(user._id)
            db.collection("fahrten").insertOne(data);

            //In der Nutzer Datenbank  dem Nutzer die Fahrt  Hinzufügen

            Nutzer[0].Fahrten.push(data._id)
        }
        //Dem Nutzer die Fahrt hinzufügen
        db.collection("nutzer").updateOne({_id: user._id}, {$set: {Fahrten: Nutzer[0].Fahrten}})
        //Erfolg senden
        res.send({status: 'SUCCESS'});
    } catch (e) {
        //Fehlermeldung ?
        console.log(e)
        res.send({status: "Internal Server Error"})
    }
})


router.post("/Markieren", async (req, res) => {

    var db = req.app.get("db");
    var user = await req.user;
    var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user._id)}).toArray();

})


//Sendet Fahrten des Eingeloggten Nutzers
router.get("/getFahrten", async (req, res) => {
    var db = req.app.get("db");
    var db = req.app.get("db");
    var user = await req.user;
    var Fahrten = [];
    var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user._id)}).toArray();
    for (var i = 0; i < Nutzer[0].Fahrten.length; i++) {
        var data = await db.collection("fahrten").find({_id: Nutzer[0].Fahrten[i]}).toArray();
        Fahrten.push(data[0]);
    }
    var result = {Fahrten: Fahrten};
    res.json(result);
})

/**
 * Überprüft ob Nutzer Authentifiziert ist. Wenn ja darf er weiter, wenn nicht geht er zum Login
 * @param req - Request
 * @param res - Result
 * @param next - Weiter
 * @returns {*}
 */
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/Login')
}

/**
 * Überprüft ob der Nutzer Eingeloggt ist. Wenn er eingeloggt ist darf er nicht Zugreifen. Ansonsten darf er zugreifen.
 * @param req - Request
 * @param res - Result
 * @param next - Weiter
 * @returns {void|*|Response}
 */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/Startseite')
    }
    next()
}

/**
 * Überprüft ob der Nutzer die Arzt Rolle hat.
 * @param req - Request
 * @param res - Result
 * @param next - Weiter
 * @returns {Promise<void|*|Response>}
 */
async function isInRole(req, res, next) {
    var Nutzer = await req.user
    if (!Nutzer.Arzt) {
        return res.redirect("/Startseite") //Todo: Durch Fehlermeldung Ergänzen
    }
    next();
}

module.exports = router;
