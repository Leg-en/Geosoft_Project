
function markieren(){
    var Name = document.getElementById("Name").value;
    var dateVon = document.getElementById("DatumVon").value.split("");
    var dateBis = document.getElementById("DatumBis").value;
    var timeVon = document.getElementById("ZeitVon").value;
    var timeBis = document.getElementById("ZeitBis").value;
    console.log(dateVon)
    console.log(timeVon)
    var dateVonFancy = dateVon[8] + dateVon[9] + "." + dateVon[5] + dateVon[6] + "." + dateVon[0] + dateVon[1]+ dateVon[2]+ dateVon[3]
    var dateBisFancy = dateBis[8] + dateBis[9] + "." + dateBis[5] + dateBis[6] + "." + dateBis[0] + dateBis[1]+ dateBis[2]+ dateBis[3]
    var ISODateVon  =  dateVon[5] + dateVon[6] + "." + dateVon[8] + dateVon[9] + "." + dateVon[0] + dateVon[1]+ dateVon[2]+ dateVon[3]
    var ISODateBis = dateBis[5] + dateBis[6] + "." + dateBis[8] + dateBis[9] + "." + dateBis[0] + dateBis[1]+ dateBis[2]+ dateBis[3]
    var data = {
        id: Name,
        dateVon: dateVonFancy,
        ZeitVon: timeVon,
        dateBis: dateBisFancy,
        ZeitBis: timeBis,
        ISOdateVon: new Date(ISODateVon + " "+ timeVon),
        ISOdateBis: new  Date(ISODateBis + " " + timeBis),
    }
    console.log(data)
    $.ajax({
        type: "POST",
        url: "/markieren",
        data: data,
        dataType: "JSON"
    })
}

