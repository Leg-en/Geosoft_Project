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
const nodemailer = require("nodemailer"); //Wird verwendet für Email versenden
const mailTransporter = nodemailer.createTransport({
    host: 'smtp.web.de',
    port: 587,
    secure: false,
    auth: {
        user: 'CoronaWarnseiteWWU@web.de',
        pass: 'WWUCorona'
    }
});



//Quelle  für dates: https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
var dates = {
    convert: function (d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp)
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                    d.constructor === Number ? new Date(d) :
                        d.constructor === String ? new Date(d) :
                            typeof d === "object" ? new Date(d.year, d.month, d.date) :
                                NaN
        );
    },
    compare: function (a, b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a = this.convert(a).valueOf()) &&
            isFinite(b = this.convert(b).valueOf()) ?
                (a > b) - (a < b) :
                NaN
        );
    },
    inRange: function (d, start, end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(d = this.convert(d).valueOf()) &&
            isFinite(start = this.convert(start).valueOf()) &&
            isFinite(end = this.convert(end).valueOf()) ?
                start <= d && d <= end :
                NaN
        );
    }
}


//Get Anweisungen für Websiten
//Check Authenticated überprüft ob user Authenthifiziert ist
router.get('/', checkAuthenticated, async (req, res, next) => {
    res.redirect("/Startseite") //Redirect auf Startseite für einfachen aufruf auf Server. User wird im Folgenden wahrscheinlich auf Login redirected
});
router.get('/Startseite', checkAuthenticated, async (req, res, next) => {
    var Nutzer = await req.user; //Nutzer Daten Holen
    var FlagFahrten = [];
    var db = req.app.get("db");
    if(Nutzer.recentFlagged.length > 0){
        for (var i = 0; i<Nutzer.recentFlagged.length;i++){
            var fahrt = await db.collection("fahrten").find({_id: new mongodb.ObjectID(Nutzer.recentFlagged[i])}).toArray();
            FlagFahrten.push(fahrt[0])
        }
    }else {
        FlagFahrten = null;
    }
    console.log(Nutzer);
    var Fahrten = [];
    //Es waren mal 5 geplant. Aber irgendwie ist das Frontend damit überfordert
    //Todo: Daten über Ajax request Anfordern. Das ist wenigstens Stabil
    for (var i = 0; i <Nutzer.Fahrten.length && i < 4; i++){
        var fahrt = await db.collection("fahrten").find({_id: new mongodb.ObjectID(Nutzer.Fahrten[i])}).toArray();
        Fahrten.push(fahrt[0])
    }
    if (Fahrten.length == 0){
        Fahrten = null;
    }
    db.collection("nutzer").updateOne({_id: Nutzer._id},{$set: {recentFlagged: []}})



    //Wenn Nutzer Arzt ist, zeige die Arzt seite an. Sonst nicht. Und Stellt den namen des Nutzers da
    if (Nutzer.Arzt) {
        res.render(viewdir + "/Startseite.ejs", {name: Nutzer.Name, Role: "Arzt Menü", FlagFahrten: FlagFahrten, Fahrten: Fahrten});
    } else {
        res.render(viewdir + "/Startseite.ejs", {name: Nutzer.Name, Role: null, FlagFahrten: FlagFahrten, Fahrten: Fahrten});
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
            Fahrten: [], //Fahrten Array ist noch Leer. Nutzer kann offensichtlicherweise noch keine Fahrten gemacht haben.
            RecentFlags: false,
            recentFlagged: [],
            flags: [],
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

//Todo: Nach Zeit Filtern
router.post("/Markieren", async (req, res) => {
    var db = req.app.get("db");
    var user = req.body;
    //var date = new Date(user.ISOdateVon);
    var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user.id)}).toArray();
    //Alle Fahrten des Nutzers Durchgehen
    for (var i = 0; i < Nutzer[0].Fahrten.length; i++) {
        var Fahrt = await db.collection("fahrten").find({_id: new mongodb.ObjectID(Nutzer[0].Fahrten[i])}).toArray()
        //Zeitüberprüfung
        var dateVon = new Date(req.body.ISOdateVon)
        var dateBis = new Date(req.body.ISOdateBis)
        if(dates.compare(dateVon, dateBis) != -1){
            console.log("Datum falsch rum")
            return;
        }
        if(dates.inRange(new Date(Fahrt[0].ISODate), dateVon, dateBis)){
            if (!Fahrt.Geflaggt) {
                db.collection("fahrten").updateOne({_id: new mongodb.ObjectID(Fahrt[0]._id)}, {$set: {Geflaggt: true}})
                //Todo: Nutzer Email über Flaggung Senden

                //Alle Mitfahrer des Fahrtes des Nutzers durchgehen
                for (var j = 0; j < Fahrt[0].Nutzer.length; j++) {
                    var nutzerFlag = await db.collection("nutzer").find({_id: new mongodb.ObjectID(Fahrt[0].Nutzer[j])}).toArray()
                    nutzerFlag[0].recentFlagged.push((Fahrt[0]._id))
                    nutzerFlag[0].flags.push((Fahrt[0]._id))
                    await db.collection("nutzer").updateOne({_id: new mongodb.ObjectID(Fahrt[0].Nutzer[j])}, {
                        $set: {
                            RecentFlags: true,
                            recentFlagged: nutzerFlag[0].recentFlagged,
                            flags: nutzerFlag[0].flags,
                        }
                    })

                    //Um hier fehler zu Vermeiden währe evtl. eine Verifizierung der Email Sinnvoll.
                    try{
                        let info = mailTransporter.sendMail({
                            from: 'CoronaWarnseiteWWU@web.de', // sender address
                            to: nutzerFlag[0].Email, // list of receivers
                            subject: "CoronaWarnTrackingWWU", // Subject line
                            html: "<b>Guten Tag</b> <br> Sie wurden auf der Corona Warnseite als Risiko Klassifiziert! Es handelt sich um die Fahrt mit der " + Fahrt[0].Name +" am " + Fahrt[0].Datum + "." // html body
                        })
                    }catch (e){
                        console.log(e)
                    }

                }
            }
        }



    }


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
