var Fahrten;
var FlagFahrten;



function parseVariables(){
    try {
        Fahrten = JSON.parse(Fahrten);
    }catch (e){
     Fahrten =null;
     console.log(e)
    }
    try {
        FlagFahrten = JSON.parse(FlagFahrten);
    }catch (e){
        FlagFahrten = null;
        console.log(e)
    }
    console.log(Fahrten)
    mapsetup()
}

function mapsetup(){
    try{
        map.removeLayer(markers)
    }catch (e){
        console.log(e)
    }
    markers = L.markerClusterGroup();

    if(Fahrten!=null){
        for(var i = 0; i < Fahrten.length; i++){
            var marker = L.marker([Fahrten[i].lat, Fahrten[i].lng]);
            marker.bindPopup(Fahrten[i].Name)
            markers.addLayer(marker)
        }
        markers.addTo(map);
    }
    if(FlagFahrten!=null){
        for(var i = 0; i < FlagFahrten.length; i++){
            var marker = L.marker([FlagFahrten[i].lat, FlagFahrten[i].lng]);
            marker.bindPopup(FlagFahrten[i].Name)
            markers.addLayer(marker)
        }
        markers.addTo(map);
    }





}
