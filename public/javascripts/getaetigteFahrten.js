getData()
//Todo: Karte Hinzufügem
function display(processedData) {
    var TableElem = ["Datum", "Zeit", "Typ", "Name", "Headsign", "Haltestelle", "Geflaggt"]
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
        var row = document.createElement("tr")

        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].Datum))
        row.appendChild(cell);

        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].Zeit))
        row.appendChild(cell);

        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].Typ))
        row.appendChild(cell);

        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].Name))
        row.appendChild(cell);

        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].headsign))
        row.appendChild(cell);
        //Todo: Evtl wieder Haltestelle ergänzen?
        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].Haltestellenname))
        row.appendChild(cell);

        var cell = document.createElement('td')
        cell.appendChild(document.createTextNode(processedData[i].Geflaggt))
        row.appendChild(cell);


        tbody.appendChild(row);


    }


    thead.classList.add("thead-dark");
    table.appendChild(thead);
    table.appendChild(tbody);
    table.classList.add("table");
    table.classList.add("table-sm");
    table.classList.add("table-hover")
    table.id = "tableid";

    document.getElementById("tab").appendChild(table);
}

function getData() {
    $.ajax(   // request url
        {
            url: "/getFahrten",
            success: function (data, status, xhr) {// success callback function
                console.log(data.Fahrten);
                display(data.Fahrten)
                mapsetup(data.Fahrten);
            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });

}

function mapsetup(Fahrten) {
    var icon = L.icon({ //Hebt es farblich hervor. Größenskalierung stimmt noch nicht so ganz
        iconUrl: '../images/marker-icon-red.png',
        shadowUrl: '../images/marker-shadow.png',
        iconSize: [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
    });

    try {
        map.removeLayer(markers)
    } catch (e) {
        console.log(e)
    }
    markers = L.markerClusterGroup();

    if (Fahrten != null) {
        for (var i = 0; i < Fahrten.length; i++) {
            console.log(typeof Fahrten[i].Geflaggt)
            //Irgendwie ist in der Datenbank die Geflaggt Variable ne String wenn sie  False ist, sonst  ist sie ein boolean
            if(typeof Fahrten[i].Geflaggt == "boolean"){
                var marker = L.marker([Fahrten[i].lat, Fahrten[i].lng], {icon: icon});

            }else {
                var marker = L.marker([Fahrten[i].lat, Fahrten[i].lng]);
            }
            marker.bindPopup(Fahrten[i].Name + ", " + Fahrten[i].Datum + ", "+ Fahrten[i].Zeit + " Uhr")
            markers.addLayer(marker)
        }
        markers.addTo(map);
    }
}
