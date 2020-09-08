# Geosoft Project

## Allgemeine Infos
Dies ist der Master Branch von dem aus immer neue Docker images generiert werden. Entsprechend sollte man wenn man ohne Docker Starten möchte vom
LocalStart branch aus Starten. Der HTTPs Branch ist quasi identisch zum LocalStart, bis auf die Tatsache das dieser einen HTTPs Server mit selbst Signierten
Zertifikaten benutzt. 

## Server Starten
- Im hauptverzeichnis des  Projekts  datenbank  Starten
`mongod --dbpath data`
- Im Hauptverzeichnis  Node Server  Starten `npm  start`
  - Im  Bedarfsfall  mit npm vorher  dependencys  installieren `npm install` 
- Als Admin Einloggen und /setup aufrufen und API Keys Eintragen

## Zugang zum Assoziierten Web de Konto
Email: CoronaWarnseiteWWU@web.de <br>
Passwort: WWUCorona

## Default Admin Konto Login
Nutzername: `admin` <br>
Passwort: `admin` <br>
Email: `admin@admin` <br>

## Docker
- Evtl alte Docker Images Löschen (?)
    - Mit `docker system prune -a` werden alle Images gelöscht
- Compose starten mit `docker-compose up`

# Highlights 
- Automatisches Versenden von Mails bei Krankheit
- HTTPs Unterstützung. (Bei Einsatz in Produktiv Umgebung sollten richtige Zertifikate geholt werden)
- Login System mit Verschlüsseltem Passwort

