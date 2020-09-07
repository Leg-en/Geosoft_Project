var  HereKey;
var MapboxKey;
getKeys()
getDataForMarker()
function getKeys(){
    $.ajax({
        url: "/keys",
        success: function (data, stauts, xhr){
            HereKey =  data.HereAPIKey;
            MapboxKey  = data.MapboxAPIKey;
            mapInit()
        }
    })
}

function getDataForMarker(){
    $.ajax({
        url: "/ArztMarkData",
        success: function (data, status, xhr){
            setMarker(data);
        }
    })
}
//Todo: Marker daten requesten.. :(
function setMarker(data){
    var markers = markers = L.markerClusterGroup();
console.log(data.data)

    for (var i = 0; i < data.data.length; i++) {
        console.log(data.data[i].Zeit)
        var marker = L.marker([data.data[i].lat, data.data[i].lng]);
        marker.bindPopup(data.data[i].Name + ", " + data.data[i].Datum + ", "+ data.data[i].Zeit + " Uhr")
        markers.addLayer(marker)
    }
    markers.addTo(map);
}
function markieren(){
    var Fahrt = document.getElementById("Fahrt").value;
    var data = {
        id: Fahrt,
    }
    console.log(data)
    $.ajax({
        type: "POST",
        url: "/markierenFahrt",
        data: data,
        dataType: "JSON"
    })
}

