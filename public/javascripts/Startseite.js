var Fahrten;
var FlagFahrten;


requestData()

function requestData() {
    $.ajax(
        {
            url: "/getStartseite",
            dataType: "json",
            success: function (data, status, xhr) {// success callback function
                if (status == "success") {
                    Fahrten = data.Fahrten;
                    FlagFahrten = data.FlagFahrten;
                    if (Fahrten != null) {
                        display(Fahrten, "tab1","5 Letzte getätigte Fahrten");
                    }else{
                        var h = document.createElement("H4");
                        var t = document.createTextNode("Noch keine Fahrten Hinterlegt")
                        h.appendChild(t)
                        h.classList.add("display-4")
                        document.getElementById("tab1").appendChild(h);
                    }
                    if (FlagFahrten != null) {
                        display(FlagFahrten, "tab2", "Neue Geflaggte Fahrten")
                    }else{
                        var h = document.createElement("H4");
                        var t = document.createTextNode("Keine Geflaggten Fahrten")
                        h.appendChild(t)
                        h.classList.add("display-4")
                        document.getElementById("tab2").appendChild(h);
                    }
                    mapsetup();


                }

            }
        }
    )
}

function display(processedData, div, msg) {
    var TableElem = ["Datum", "Zeit", "Typ", "Name", "Headsign", "Haltestelle", "Geflaggt"]
    document.getElementById(div).innerHTML = "";

    var h = document.createElement("H4");
    var t = document.createTextNode(msg)
    h.appendChild(t)
    h.classList.add("display-4")
    document.getElementById(div).appendChild(h);

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

    document.getElementById(div).appendChild(table);
}


function mapsetup() {
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
            console.log(Fahrten[i].Zeit)
            var marker = L.marker([Fahrten[i].lat, Fahrten[i].lng]);
            marker.bindPopup(Fahrten[i].Name + ", " + Fahrten[i].Datum + ", "+ Fahrten[i].Zeit + " Uhr")
            markers.addLayer(marker)
        }
        markers.addTo(map);
    }
    if (FlagFahrten != null) {
        for (var i = 0; i < FlagFahrten.length; i++) {
            var marker = L.marker([FlagFahrten[i].lat, FlagFahrten[i].lng], {icon: icon});
            marker.bindPopup(FlagFahrten[i].Name + ", " + FlagFahrten[i].Datum + ", "+ FlagFahrten[i].Zeit + " Uhr")
            markers.addLayer(marker)
        }
        markers.addTo(map);
    }


}
