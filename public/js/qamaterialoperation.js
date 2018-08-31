app.controller("qaMaterialOperationCtrl", function($scope) {
})

$(document).ready(function(){
    setOnClicks();
});

function setOnClicks(){
    saveOnClick();
    deleteOnClick();
}

function saveOnClick(){
    $("#save").click(function(){
        var data = {};
        data.name = $("#name").val();
        data.unittype = $("#unittype").val();
        data.short = $("#short").val();
        data.isMultiple = document.getElementById('isMultiple').checked;
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                var html = $.parseHTML(data);
                var mainContent = $(data).find("#mainContent");
                $("#mainContent").html(mainContent);
                setOnClicks();
            }
          });
    });
}

function deleteOnClick(){
    $("#delete").click(function(){
        var data = {};
        data.name = $("#name").val();
        data.unittype = $("#unittype").val();
        data.short = $("#short").val();
        data.isMultiple = document.getElementById('isMultiple').checked;
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                var html = $.parseHTML(data);
                var mainContent = $(data).find("#mainContent");
                $("#mainContent").html(mainContent);
                setOnClicks();
            }
          });
    });
}