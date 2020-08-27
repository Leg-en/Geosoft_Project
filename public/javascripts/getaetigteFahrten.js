getData()
function display(processedData){
    var TableElem = ["Zeit", "Typ", "Name", "Headsign", "Haltestelle",  "Fahrtnummer", "Gefährdet"]
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


}

function getData(){
    display()
}

