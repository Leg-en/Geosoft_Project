


/**
 * Ruft die Daten von 'Here' ab.
 */
function requestData(Start, Ende) {
    var resource = "https://transit.router.hereapi.com/v8/routes"
    //var req = new XMLHttpRequest();
    $.ajax(   // request url
        {
            url: resource,
            data: {
                origin: Start[1]+','+Start[0],
                destination: Ende[1]+','+Ende[0],
                lang: 'de-DE',
                units: 'metric',
                apiKey: '' //Todo: Löschen
            },
            dataType: 'json',
            timeout: 3000,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    console.log("Erfolg")
                    console.dir(data)
                    return data;
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });
}

function printData(data) {

}

function geocoding(Input) {

    $.ajax(   // request url
        {
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+Input+".json",
            data: {
                autocomplete: 'true',
                language: 'de',
                access_token: '' //Todo: Löschen
            },
            dataType: 'json',
            timeout: 3000,
            async: false,
            success: function (data, status, xhr) {// success callback function
                if(status == "success"){
                    console.log("Erfolg")
                    console.dir(data)
                    return data.features[0].center;
                }

            },
            error: function (jqXhr, textStatus, errorMessage) { // error callback
                console.log("Fehlschlag")
            }
        });
}

function main() {
    console.log($("#Start").val())
    console.log($("#Ziel").val())
    var reqa = geocoding($("#Start").val())
    console.dir(reqa)
    var reqb = geocoding($("#Ziel").val())
    //Todo: Fixen, Ajax erlaubt keine Return Statements
    printData(requestData(reqa, reqb));
}
