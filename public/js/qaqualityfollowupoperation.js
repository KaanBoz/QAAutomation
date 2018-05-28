app.controller("qaQualityFollowupOperationCtrl", function($scope) {
})

$(document).ready(function(){
    setOnClicks();
});

function setOnClicks(){
    saveOnClick();
    deleteOnClick();
    amountOnChange();
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
        data.productionAmount = $("#productionAmount").val();
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
        data.prodcutionAmount = $("#prodcutionAmount").val();
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


function amountOnChange(){
    $('#prodcutionAmount').change(function(){
        $('#prodcutionAmount').val(checkGetValue($('#prodcutionAmount').val()));   
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