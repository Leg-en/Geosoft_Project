
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

