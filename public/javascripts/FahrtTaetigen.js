var Points = {
    pointA: null,
    pointB: null
}
var hereData = null;
var processedData = null;
var standortMarker = L.marker([0,0]).addTo(map)
standortMarker.setOpacity(0)
var haltestellen = [];

/**
 * Ruft die Daten von 'Here' ab.
 */
function requestData(Start, Ziel, Anzahl) {
    var resource = "https://transit.router.hereapi.com/v8/routes"
    var origin = Start[1]+','+ Start[0];
    var dest = Ziel[1]+','+ Ziel[0];
    $.ajax(   // request url
        {
            url: resource,
            data: {
                origin: origin,
                destination: dest,
                lang: 'de-DE',
                units: 'metric',
                apiKey: 'p8KanGv1s7_cvHsmF9U58sEe0KUXDPDQNeNvKuQtsQA', //Todo: Löschen
                alternatives: Anzahl
            },
            dataType: 'json',
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    console.log("Erfolg")
                    console.dir(data)
                    //Blöde Lösung. Jedoch muss überprüft werden ob überhaupt eine Route gefunden wurde. Und wenn eine gefunden wurde gibts keine Notiz..
                    try{
                        if(data.notices[0].code != "noCoverage"){
                            hereData = data;
                            preProcessData()
                        }else{
                            console.log("Fehler bei Routenberechnung")
                            //Todo: Fancy Fehlermeldung einfügen
                        }
                    }catch (e){
                        hereData = data;
                        preProcessData()
                    }

                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log(errorMessage)
                console.log(textStatus)
                console.log(jqXhr)
            }
        });
}
function preProcessData(){
    var resData = []; //3D Array, 0 Element gibt Routea an, 1 Element gibt schritt, 2 Element  gibt spezifiken für die Fahrt, 0 - ID, 1 - Typ, 2- Start, 3 - Abfahrt, 4 - Ziel, 5 - Ankunft
    for(var j=0; j<hereData.routes.length; j++){//J Max Höher  Setzen bei mehr Alternativen
        resData[j] = [];
        for(var i =  0; i<hereData.routes[j].sections.length;i++){
            var temp = hereData.routes[j].sections[i];
            resData[j][i] = [];
            resData[j][i][0] = temp.id;
            resData[j][i][1] = temp.type;
            //Prüfe ob name für Ort Existiert. Wenn nicht verwende Koordinaten
            if(temp.departure.place.name != null){
                resData[j][i][2] = temp.departure.place.name
            }else{
                resData[j][i][2] = temp.departure.place.location.lat + ","+ temp.departure.place.location.lng
            }
            resData[j][i][3] = temp.departure.time;
            //Prüfe ob name für Ort Existiert. Wenn nicht verwende Koordinaten
            if(temp.arrival.place.name != null){
                resData[j][i][4] = temp.arrival.place.name
            }else{
                resData[j][i][4] = temp.arrival.place.location.lat + ","+ temp.arrival.place.location.lng
            }
            resData[j][i][5] = temp.arrival.time;
            //Interne Daten
            resData[j][i][6] = temp.departure.place.location

        }
    }
    processedData = resData;
    console.log(processedData)
    var tab = document.getElementById("tab")
    tab.innerHTML = ""
    for(var i = 0; i < hereData.routes.length; i++){
        var div = document.createElement("div")
        div.id = "divid" + i;
        tab.appendChild(div);
        printData(div,i)
    }

    //Alte Marker Entfernen
    for (var i in haltestellen){
        map.removeLayer(haltestellen[i])
    }
    //Haltestellen einblenden
    for(var i = 0; i<hereData.routes.length; i++){
        for(var j = 0; j<resData[i].length; j++){
            if(resData[i][j][1] == "transit"){
                marker = L.marker(resData[i][j][6]).addTo(map)
                haltestellen[i] = marker;
                break;
            }
        }
    }


}
function printData(div, iterator) {
    var TableElem = ["ID","Typ","Start","Abfahrt","Ziel","Ankunft"]
    div.innerHTML = "";
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


        for(var j = 0; j<6;j++){
            var row = document.createElement("tr")
            for(var u in processedData[iterator][j]){
                var cell = document.createElement('td')
                cell.appendChild(document.createTextNode(processedData[iterator][j][u]))
                row.appendChild(cell);
            }
        tbody.appendChild(row);
        }



    thead.classList.add("thead-dark");
    table.appendChild(thead);
    table.appendChild(tbody);
    table.classList.add("table");
    table.classList.add("table-sm");
    table.classList.add("table-hover")
    table.id = "tableid";
    div.appendChild(table);

    //Button erstellen
    var  btn = document.createElement("button");
    btn.innerText  = "Route Wählen"
    btn.classList.add("btn")
    btn.classList.add("btn-primary")
    div.appendChild(btn)

}

function geocoding(Input, point) {
    $.ajax(   // request url
        {
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+Input+".json",
            data: {
                autocomplete: 'true',
                language: 'de',
                access_token: 'pk.eyJ1IjoibGVnZW4yNiIsImEiOiJja2FremZxdTIwNTZpMnpucWw2d2Q3anJ3In0.exarKxsiFDy1QZKMYHvlNQ' //Todo: Löschen
            },
            dataType: 'json',
            timeout: 3000,
            async: false,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    if(point == "pointA"){
                        Points.pointA = data;
                    }else{
                        Points.pointB = data;
                    }
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });
}

function main() {

    geocoding($("#Start").val(), "pointA");

    standortMarker.setLatLng([Points.pointA.features[0].geometry.coordinates[1],Points.pointA.features[0].geometry.coordinates[0]]);
    map.setView([Points.pointA.features[0].geometry.coordinates[1],Points.pointA.features[0].geometry.coordinates[0]]);
    standortMarker.setOpacity(1)

    geocoding($("#Ziel").val(), "pointB");
    requestData(Points.pointA.features[0].geometry.coordinates, Points.pointB.features[0].geometry.coordinates, $("#Anzahl").val());
}

function locate(){
    if (navigator.geolocation) { //Überprüft ob geolocation supportet wird
        navigator.geolocation.getCurrentPosition(function (x) { //Wenn erfolgreich koordinaten ermittelt
            //Erfolgreich  Lokalisiert x.coords.longitude, x.coords.latitude
            console.log(x.coords.longitude)
            console.log(x.coords.latitude)
            map.setView([x.coords.latitude,x.coords.longitude])
            reverseGeocoding(x.coords.latitude,x.coords.longitude)
            standortMarker.setLatLng([x.coords.latitude,x.coords.longitude]);
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

function reverseGeocoding(lat, lng){
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
                if(status == "success"){
                    document.getElementById("Start").value = data.features[0].place_name;
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });
}
