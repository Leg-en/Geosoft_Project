getData()
//Todo: Karte Hinzufügem
function display(processedData) {
    var TableElem = ["Datum", "Zeit", "Typ", "Name", "Headsign", "Haltestelle"]
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
            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });

}
