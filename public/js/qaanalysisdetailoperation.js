app.controller("qaAnalysisDetailOperationCtrl", function($scope) {
});

$(document).ready(function(){
    setOnClicks();
});

function setOnClicks(){
    saveOnClick();
    deleteOnClick();
    minOnChange();
    maxOnChange();
}

function saveOnClick(){
    $("#save").click(function(){
        var data = {};
        data.material = $("#material").val();
        data.min = $("#min").val();
        data.max = $("#max").val();
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
        data.material = $("#material").val();
        data.min = $("#min").val();
        data.max = $("#max").val();
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

function minOnChange(){
    $('#min').change(function(){
        $('#min').val(checkGetValue($('#min').val()));       
    });
}

function maxOnChange(){
    $('#max').change(function(){
        $('#max').val(checkGetValue($('#max').val()));   
    });
}

function checkGetValue(value){
    if(value.includes('.')){
        if(value.split('.')[1].length > 3){
            value = value.split('.')[0] + "." + value.split('.')[1].substring(0,3);
        }
    }
    return value;
}
