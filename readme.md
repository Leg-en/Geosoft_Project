# Geosoft Project

## Allgemeine Infos
Dies ist der Master Branch von dem aus immer neue Docker images generiert werden. Entsprechend sollte man wenn man ohne Docker starten möchte vom
LocalStart branch aus starten. Der HTTPs Branch ist quasi identisch zum LocalStart, bis auf die Tatsache das dieser einen HTTPs Server mit selbst signierten
Zertifikaten benutzt. 

## Server starten`
- Im Hauptverzeichnis  Node Server  starten `npm  start`
  - Im  Bedarfsfall  mit npm vorher  dependencys  installieren `npm install` 
- Als Admin Einloggen und /setup aufrufen und API Keys Eintragen
    - Benötigte Keys von 'Here' und 'Mapbox'
- Dies ist der Branch der mit HTTPs Arbeitet. Entsprechend erfolgt hier der Zugriff statt einfach über `localhost` über
    `https://127.0.0.1:80/`


## Zugang zum Assoziierten Web de Konto
Email: CoronaWarnseiteWWU@web.de <br>
Passwort: WWUCorona

## Default Admin Konto Login
Nutzername: `admin` <br>
Passwort: `admin` <br>
Email: `admin@admin` <br>

## Docker
- Evtl alte Docker Images löschen (?)
    - Mit `docker system prune -a` werden alle Images gelöscht
- Compose starten mit `docker-compose up`

# Highlights 
- Automatisches versenden von Mails bei gefahren Markierung
- HTTPs Unterstützung. (Bei Einsatz in Produktiv Umgebung sollten richtige Zertifikate geholt werden)
- Login System mit Verschlüsseltem Passwort

# Anleitung
Server Starten, entweder über Docker oder manuell. Zugriff auf Seite über `https://127.0.0.1:80/`. 
Erst `/setup` aufrufen, Keys einfügen und speichern. Dann als Benutzer registrieren und dann einloggen. Entsprechend der Anweisungen der App die App benutzen.


# Abgabe Parameter
Autoren: Sven Busemann und Marius Sterthaus
Github Link: https://github.com/Leg-en/Geosoft_Project
## Web Bibliotheken: 
- bootstrap
- jquery
- leaflet
- markercluster
- qunit
## Node Modules
- bcrypt
- body-parser
- cookie-parser
- ejs
- express
- express-flash
- express-session
- method-override
- morgan
- nodemailer
- passport
- passport-local
- mongodb
