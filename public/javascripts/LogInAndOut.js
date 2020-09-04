$(function() {
    $("#logout").on("click",function(e) {
        e.preventDefault(); // cancel the link itself
        $.ajax({
            type: "POST",
            url: "/logout?_method=DELETE",
            success: () => {
                location.reload();
            }
        })
    });
});
