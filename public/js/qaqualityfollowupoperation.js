app.controller("qaQualityFollowupOperationCtrl", function ($scope) {
})

$(document).ready(function () {
    setOnClicks();
    if(alloy != "-1"){
        $('#analysis option').each(function () {
            $(this).remove();
        });
        customerOnChange(true);
    }
    $("#customer").on('change', function () {
        customerOnChange(false);
    })
});


function customerOnChange(select) {
    var data = {};
    data.customer = $("#customer").val();
    $.ajax({
        type: "POST",
        url: window.location.href.split('?')[0] + '/getCustAnalysis',
        data: data,
        success: function (data) {
            $('#analysis option').each(function () {
                $(this).remove();
            });
            $('#analysis').append(new Option(localization.choose, ""))
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $('#analysis').append(new Option(data[i].name, data[i].id))
                }
            }
            if (select) {
                $('#analysis').val(alloy)
            }
        }
    });
}

function setOnClicks() {
    saveOnClick();
    deleteOnClick();
    amountOnChange();
}

function saveOnClick() {
    $("#save").click(function () {
        var data = {};
        data.analysis = $("#analysis").val();
        data.partyno = $("#partyno").val();
        data.date = $("#date").val();
        data.assignedto = $("#assignedto").val();
        data.sender = $("#sender").val();
        data.explanation = $("#explanation").val();
        data.productionAmount = $("#productionAmount").val();
        data.customer = $("#customer").val();
        data.doublecheck = $('#doublecheck').prop('checked')
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: data,
            success: function (data) {
                var mainContent = $(data).find("#mainContent");
                if ($(mainContent).find('#errorMessage').val() != undefined) {
                    $("#mainContent").html(mainContent);
                    setOnClicks();
                    customerOnChange(true);
                    return;
                }
                window.location = window.location.origin + "/qaallqualityfollowup";
            }
        });
    });
}

function deleteOnClick() {
    $("#delete").click(function () {
        var data = {};
        data.analysis = $("#analysis").val();
        data.partyno = $("#partyno").val();
        data.date = $("#date").val();
        data.assignedto = $("#assignedto").val();
        data.sender = $("#sender").val();
        data.explanation = $("#explanation").val();
        data.prodcutionAmount = $("#prodcutionAmount").val();
        data.customer = $("#customer").val();
        data.doublecheck = $('#doublecheck').prop('checked')
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: data,
            success: function (data) {
                var mainContent = $(data).find("#mainContent");
                if ($(mainContent).find('#errorMessage').val() != undefined) {
                    $("#mainContent").html(mainContent);
                    setOnClicks();
                    customerOnChange(true);
                    return;
                }
                window.location = window.location.origin + "/qaallqualityfollowup";
            }
        });
    });
}


function amountOnChange() {
    $('#prodcutionAmount').change(function () {
        $('#prodcutionAmount').val(checkGetValue($('#prodcutionAmount').val()));
    });
}

function checkGetValue(value) {
    if (value.includes('.')) {
        if (value.split('.')[1].length > 3) {
            value = value.split('.')[0] + "." + value.split('.')[1].substring(0, 3);
        }
    }
    return value;
}