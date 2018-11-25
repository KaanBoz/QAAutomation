app.controller("qaAnalysisHeaderOperationCtrl", function($scope) {
    $scope.formData = {};
    $scope.formData.name = formDataJsonName != null ? formDataJsonName : "";
    $scope.formData.customer = formDataJsonCustomer != null ? formDataJsonCustomer+"" : "";
    $scope.formData.alloy = formDataJsonAlloy != null ? formDataJsonAlloy+"" : "";
    $scope.formData.type = formDataJsonType + "";
    $scope.formData.standart = formDataJsonStandart + "";
    $scope.formData.details = detailsJson;
    $scope.materials = materials;
    $scope.localization = localizationJson;

    $scope.addDetail = function(){
        var detail = {};
        detail.id = 0;
        detail.isDeleted = false;
        detail.materialId = $('#material').val();
        detail.material = $scope.getMaterialName(detail.materialId);
        detail.min = parseFloat($('#min').val());
        detail.max = parseFloat($('#max').val());
        detail.master = parseFloat($('#master').val());
        if(!detail.materialId || !detail.material || (!detail.min && !detail.min == 0) || (!detail.max && !detail.max == 0) || (!detail.master && !detail.master == 0)){
            alert($scope.localization.fillForm);
            return;
        }
        if($scope.doesMaterialExists(detail.materialId)){
            alert($scope.localization.materialExistsinAnalysis);
            return;
        }
        if(detail.min > detail.max){
            alert($scope.localization.minCannotBeMoreThanMax);
            return;
        }
        if(detail.master > detail.max || detail.master < detail.min){
            alert($scope.localization.masterValueError);
            return;
        }
        if(detail.master > $scope.getRest()){
            alert($scope.localization.overHundred);
            return;
        }
        $scope.formData.details.push(detail);
            $("#material").val("");
            $("#min").val("");
            $("#max").val("");
            $("#master").val("");
        
    }

    $scope.deleteDetail = function(index){
        $scope.formData.details.splice(index, 1);
    }

    $scope.getMaterialName = function(materialId){
        for(var i = 0; i < $scope.materials.length; i++){
            if (materialId == $scope.materials[i].id){
                return $scope.materials[i].name;
            }
        }
        return "";
    }

    $scope.doesMaterialExists = function(materialId){
        for(var i = 0; i < $scope.formData.details.length; i++){
            if (materialId == $scope.formData.details[i].materialId){
                if(!$scope.formData.details[i].isDeleted){
                    return true;
                }
            }
        }
        return false;
    }

    $scope.save = function(){
        var data = {};
        data.alloy = $("#alloy").val();
        data.customer = $("#customer").val();
        data.name = $("#alloy option:selected").html();
        data.type = $("#type").val();
        data.standart = $("#standart").val();
        data.detail = $scope.formData.details;
        if(!data.alloy || !data.customer){
            alert($scope.localization.fillForm);
            return;
        }
        if($scope.getRest() < 0){
            alert($scope.localization.mustBeHundred);
            return;
        }
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                $("#messageBox").empty();
                var message = $(data).find("#message");
                var html = message.html()
                if(html){
                    $("#messageBox").append("<p>" + html + "</p>");
                }else{
                    window.location = window.location.origin + "/customeranalyses";
                }
            }
          });
    }

    $scope.alloyChange = () =>{
        $.ajax({
            type: "POST",
            url: window.location.href.split("?")[0] + "/details" ,
            data: { id : $scope.formData.alloy },
            success: function (data) {
                //alert(data);
                $scope.formData.details = data;
                $scope.$apply();
            }
          });
    }


    $scope.delete = function(){
        var data = {};
        data.name = $("#name").val();
        data.type = $("#type").val();
        data.standart = $("#standart").val();
        data.detail = $scope.formData.details;
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                $("#messageBox").empty();
                var message = $(data).find("#message");
                var html = message.html()
                if(html){
                    $("#messageBox").append("<p>" + html + "</p>");
                }else{
                    window.location = window.location.origin + "/customeranalyses";
                }
            }
          });
    }

    $scope.rest = function(){
        var rest = 0;
        for(var i = 0; i < $scope.formData.details.length; i++){
            rest += parseFloat($scope.formData.details[i].master);
        }
        $("#master").val(checkGetValue((100 - rest) + ""));
    }

    $scope.getRest = function(){
        var rest = 0;
        for(var i = 0; i < $scope.formData.details.length; i++){
            rest += parseFloat($scope.formData.details[i].master);
        }
        return 100 - rest;
    }

});

$(document).ready(function(){
    setOnClicks();
});

function setOnClicks(){
    minOnChange();
    maxOnChange();
    masterOnChange();
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

function masterOnChange(){
    $('#master').change(function(){
        $('#master').val(checkGetValue($('#master').val()));   
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
