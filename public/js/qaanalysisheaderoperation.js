app.controller("qaAnalysisHeaderOperationCtrl", function($scope) {
});

var details = [];

$(document).ready(function(){
    setOnClicks();
});

function setOnClicks(){
    saveOnClick();
    deleteOnClick();
    detailsOnClick();
    $("#details").val(details);
}

function saveOnClick(){
    $("#save").click(function(){
        var data = {};
        data.name = $("#name").val();
        data.type = $("#type").val();
        data.details = $("#details").val();
        data.standart = $("#standart").val();
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
        data.type = $("#type").val();
        data.details = $("#details").val();
        data.standart = $("#standart").val();
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

function detailsOnClick(){
    $("#details").click(function(){
        var value = $("#details").val();
        if((getIndex(value) > -1)){
            details.splice(getIndex(value), 1);
        }else{
            details.push(value);
        }
        $("#details").val(details);
    });
}

function getIndex(value){
    for(var i = 0; details.length > i; i++){
        if(parseInt(value) == parseInt(details[i])){
            return i;
        }
    }
    return -1;
}
