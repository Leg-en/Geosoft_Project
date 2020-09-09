
async function getAdmin(){
    var result;
    await $.ajax({
        url: "/getAdminTest",
        success: function (data, status, xhr){
            result = data;
        }
    })
    console.log(result.data[0].admin)
    return result.data[0].admin;
}

/**
 * Guckt ob der Admin Admin ist. Diese Funktionalität ist eigentlich nicht Notwendig. Aber tests sind gefordert.. Wow...
 */
QUnit.module("getAdmin", function (){
    QUnit.test("Should get Admin",async function (assert){
        var a = await getAdmin();
        assert.equal(a, true)
    })
})
