var Points = {
    pointA: null,
    pointB: null
}
var hereData = null;
var processedData = null;
var standortMarker = L.marker([0, 0]).addTo(map)
standortMarker.setOpacity(0)
var markers = L.markerClusterGroup();

/**
 * Ruft die Daten von 'Here' ab.
 */
function requestData(Start) {
    var resource = "https://transit.hereapi.com/v8/departures"

    $.ajax(   // request url
        {
            url: resource,
            data: {
                in: Start[1] + "," + Start[0],
                lang: 'de-DE',
                apiKey: 'p8KanGv1s7_cvHsmF9U58sEe0KUXDPDQNeNvKuQtsQA', //Todo: Löschen

            },
            dataType: 'json',
            success: function (data, status, xhr) {// success callback function
                if (status == "success") {
                    //Blöde Lösung. Jedoch muss überprüft werden ob überhaupt eine Route gefunden wurde. Und wenn eine gefunden wurde gibts keine Notiz..
                    hereData = data;
                    preProcessData()
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log(errorMessage)
                console.log(textStatus)
                console.log(jqXhr)
            }
        });
}

/**
 * Nimmt die Daten entgegen  und bereitet sie Auf. Speichert sie in der Variable processedData.
 */
function preProcessData() {
    var resData = []; //3D Array, 0 Element gibt Routea an, 1 Element gibt schritt, 2 Element  gibt spezifiken für die Fahrt, 0 - ID, 1 - Typ, 2- Start, 3 - Abfahrt, 4 - Ziel, 5 - Ankunft

    var Haltestellen = [];



    for (var i = 0; i < hereData.boards.length; i++) {
        Haltestellen[i] = {
            Name: hereData.boards[i].place.name,
            Koordinaten: hereData.boards[i].place.location,
            Abfahrten: getAbfahrten(i),
            id: i

        }
    }


    processedData = Haltestellen;
    console.log(processedData)
    printData()
}

/**
 * Hilfsfunktion  für preprocessData.
 * @param i -  Iterator variable von preprocesstata
 * @returns {[]}  -  Returnt das Array mit den Abfahrten
 */

function getAbfahrten(i) {
    var res = [];
    for (var j = 0; j < hereData.boards[i].departures.length; j++) {
        var oldDate = hereData.boards[i].departures[j].time.split("");
        console.log(oldDate)
        var date = oldDate[8] + oldDate[9] + "." + oldDate[5] + oldDate[6] + "." +oldDate[0] + oldDate[1] + oldDate[2] + oldDate[3]
        var Zeit = oldDate[11] + oldDate[12] + ":" + oldDate[14] + oldDate[15]
        res[j] = {
            Datum: date,
            Zeit: Zeit,
            Typ: hereData.boards[i].departures[j].transport.mode,
            Name: hereData.boards[i].departures[j].transport.name,
            headsign: hereData.boards[i].departures[j].transport.headsign,
            subid: j,
            Nutzer: [],
            Geflaggt: false,
            UniqueID: date+Zeit+hereData.boards[i].place.location.lat+hereData.boards[i].place.location.lng+hereData.boards[i].departures[j].transport.name,
            Haltestellenname: hereData.boards[i].place.name, //Benötigt für Interne Zwecke
            lat: hereData.boards[i].place.location.lat,
            lng: hereData.boards[i].place.location.lng,
            ISODate: hereData.boards[i].departures[j].time,
        }
    }
    return res;
}

/**
 * Visualisiert  die  aufbereiteten daten in der Seite
 */
function printData() {
    var TableElem = ["Datum","Zeit", "Typ", "Name", "Headsign", "Haltestelle",  "Fahrtnummer"]
    document.getElementById("tab").innerHTML = "";
    var table = document.createElement("table");
    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");
    var row = document.createElement("tr");
    for (var i in TableElem) {
        var cell = document.createElement('td') //Erschaffen einer neuen zelle
        cell.appendChild(document.createTextNode(TableElem[i])) //Zelle befüllen
        row.appendChild(cell) //Zelle "Anhängen"
    }
    thead.appendChild(row);

    for (var i = 0; i < processedData.length; i++) {

        for (var j = 0; j < processedData[i].Abfahrten.length; j++) {
            var row = document.createElement("tr")

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode(processedData[i].Abfahrten[j].Datum))
            row.appendChild(cell);

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode(processedData[i].Abfahrten[j].Zeit))
            row.appendChild(cell);

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode(processedData[i].Abfahrten[j].Typ))
            row.appendChild(cell);

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode(processedData[i].Abfahrten[j].Name))
            row.appendChild(cell);

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode(processedData[i].Abfahrten[j].headsign))
            row.appendChild(cell);

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode(processedData[i].Name))
            row.appendChild(cell);

            var cell = document.createElement('td')
            cell.appendChild(document.createTextNode("" + processedData[i].id + processedData[i].Abfahrten[j].subid))
            row.appendChild(cell);

            tbody.appendChild(row);
        }


    }


    thead.classList.add("thead-dark");
    table.appendChild(thead);
    table.appendChild(tbody);
    table.classList.add("table");
    table.classList.add("table-sm");
    table.classList.add("table-hover")
    table.id = "tableid";
//Kartendarstellung
    try{
        map.removeLayer(markers)
    }catch (e){
        console.log(e)
    }
    markers = L.markerClusterGroup();

    document.getElementById("tab").appendChild(table);

    for(var i = 0; i < processedData.length; i++){
        var marker = L.marker(processedData[i].Koordinaten);
        marker.bindPopup(processedData[i].Name)
        markers.addLayer(marker)
    }
    markers.addTo(map);


}

/**
 * Geocodiert die nutzereingaben
 * @param Input  -  Nutzereingabe
 * @param point  -  Ort wo die Nutzereingabe gespeichert werden soll
 */
function geocoding(Input, point) {
    $.ajax(   // request url
        {
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + Input + ".json",
            data: {
                autocomplete: 'true',
                language: 'de',
                access_token: 'pk.eyJ1IjoibGVnZW4yNiIsImEiOiJja2FremZxdTIwNTZpMnpucWw2d2Q3anJ3In0.exarKxsiFDy1QZKMYHvlNQ' //Todo: Löschen
            },
            dataType: 'json',
            timeout: 3000,
            async: false,
            success: function (data, status, xhr) {// success callback function
                if (status == "success") {
                    if (point == "pointA") {
                        Points.pointA = data;
                    } else {
                        Points.pointB = data;
                    }
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });
}

/**
 * Main Methode die die Suche startet
 */
function main() {

    geocoding($("#Start").val(), "pointA");

    standortMarker.setLatLng([Points.pointA.features[0].geometry.coordinates[1], Points.pointA.features[0].geometry.coordinates[0]]);
    map.setView([Points.pointA.features[0].geometry.coordinates[1], Points.pointA.features[0].geometry.coordinates[0]]);
    standortMarker.setOpacity(1)

    requestData(Points.pointA.features[0].geometry.coordinates);
}

/**
 * Funktion zur  Nutzerortung
 */
function locate() {
    if (navigator.geolocation) { //Überprüft ob geolocation supportet wird
        navigator.geolocation.getCurrentPosition(function (x) { //Wenn erfolgreich koordinaten ermittelt
            //Erfolgreich  Lokalisiert x.coords.longitude, x.coords.latitude
            console.log(x.coords.longitude)
            console.log(x.coords.latitude)
            map.setView([x.coords.latitude, x.coords.longitude])
            reverseGeocoding(x.coords.latitude, x.coords.longitude)
            standortMarker.setLatLng([x.coords.latitude, x.coords.longitude]);
            standortMarker.setOpacity(1)


        }, function () {
            //Fehler
            console.log("Error bei standort suche")
        });
    } else {
        //Geolocation nicht verwendet
        console.log("Geolocation nicht unterstützt")
    }
}

function reverseGeocoding(lat, lng) {
    $.ajax(   // request url
        {
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + lng + "," + lat + ".json?",
            data: {
                access_token: 'pk.eyJ1IjoibGVnZW4yNiIsImEiOiJja2FremZxdTIwNTZpMnpucWw2d2Q3anJ3In0.exarKxsiFDy1QZKMYHvlNQ' //Todo: Löschen
            },
            dataType: 'json',
            timeout: 3000,
            async: false,
            success: function (data, status, xhr) {// success callback function
                if (status == "success") {
                    document.getElementById("Start").value = data.features[0].place_name;
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });
}
function setData(){
    var selector = document.getElementById("Anzahl").value;
    var selectorArray = selector.split(""); //Todo: Typsicherung
    for(var i = 0; i < processedData.length; i++){
        if(processedData[i].id == selectorArray[0]){
           for(var j = 0; j < processedData[i].Abfahrten.length; j++){
               if(processedData[i].Abfahrten[j].subid == selectorArray[1]){
                   console.log(processedData[i].Abfahrten[j])
                   $.ajax({
                       type: "POST",
                       url: "/setFahrten",
                       data: processedData[i].Abfahrten[j],
                       dataType: "JSON"
                   })
               }
           }
        }
    }


}
