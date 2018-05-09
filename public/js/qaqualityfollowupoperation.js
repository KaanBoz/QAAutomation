app.controller("qaQualityFollowupOperationCtrl", function($scope) {
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
        data.analysis = $("#analysis").val();
        data.partyno = $("#partyno").val();
        data.date = $("#date").val();
        data.assignedto = $("#assignedto").val();
        data.sender = $("#sender").val();
        data.explanation = $("#explanation").val();
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
        data.analysis = $("#analysis").val();
        data.partyno = $("#partyno").val();
        data.date = $("#date").val();
        data.assignedto = $("#assignedto").val();
        data.sender = $("#sender").val();
        data.explanation = $("#explanation").val();
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