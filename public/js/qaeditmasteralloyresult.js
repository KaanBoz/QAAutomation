function numericOnChange(item){
    $(item).val(checkGetValue($(item).val()));   
}

function checkGetValue(value){
    if(value.includes('.')){
        if(value.split('.')[1].length > 3){
            value = value.split('.')[0] + "." + value.split('.')[1].substring(0,3);
        }
    }
    return value;
}

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
        var results = [];
        for(var i = 0; i < fields.length; i++){
            var fieldNumber = i + 1;
            results.push($("#field" + fieldNumber).val());
        }
        data.results = results;
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
        var results = [];
        for(var i = 0; i < fields.length; i++){
            var fieldNumber = i + 1;
            results.push($("#field" + fieldNumber).val());
        }
        data.results = results;
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