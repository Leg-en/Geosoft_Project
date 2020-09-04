
function markieren(){
    var Name = document.getElementById("Name").value;
    var dateVon = document.getElementById("DatumVon").value.split("");
    var dateBis = document.getElementById("DatumBis").value;
    var timeVon = document.getElementById("ZeitVon").value;
    var timeBis = document.getElementById("ZeitBis").value;
    var dateVonFancy = dateVon[8] + dateVon[9] + "." + dateVon[5] + dateVon[6] + "." + dateVon[0] + dateVon[1]+ dateVon[2]+ dateVon[3]
    var dateBisFancy = dateBis[8] + dateBis[9] + "." + dateBis[5] + dateBis[6] + "." + dateBis[0] + dateBis[1]+ dateBis[2]+ dateBis[3]
    var data = {
        id: Name,
        dateVon: dateVonFancy,
        ZeitVon: timeVon,
        dateBis: dateBisFancy,
        ZeitBis: timeBis,
    }
    console.log(data)
    $.ajax({
        type: "POST",
        url: "/markieren",
        data: data,
        dataType: "JSON"
    })
}

