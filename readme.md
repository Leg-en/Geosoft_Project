# Geosoft Project

## Allgemeine Infos
Dies ist der Master Branch von dem aus immer neue Docker images generiert werden. Entsprechend sollte man wenn man ohne Docker starten möchte vom
LocalStart branch aus starten. Der HTTPs Branch ist quasi identisch zum LocalStart, bis auf die Tatsache das dieser einen HTTPs Server mit selbst signierten
Zertifikaten benutzt. 

## Server starten
- Im Hauptverzeichnis des  Projekts  Datenbank  starten
`mongod --dbpath data`
- Im Hauptverzeichnis  Node Server  starten `npm  start`
  - Im  Bedarfsfall  mit npm vorher  dependencys  installieren `npm install` 
  
- Als Admin Einloggen und /setup aufrufen und API Keys Eintragen
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
- Automatisches versenden von Mails bei Krankheit
- HTTPs Unterstützung. (Bei Einsatz in Produktiv Umgebung sollten richtige Zertifikate geholt werden)
- Login System mit Verschlüsseltem Passwort
