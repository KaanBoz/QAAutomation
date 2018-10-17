app.controller("productController", function ($scope) {
    $scope.model = model;
    if(getParameterByName('operation') != 'add'){
        $scope.model = JSON.parse(model);
    }
    $scope.save = () => {
        if( !$scope.model.alloyNoCode || !$scope.model.productionTypeCode || !$scope.model.productDetail1Code || !$scope.model.productDetail2Code ){
            if(getParameterByName('operation') != 'delete'){
                $('#errMessage').text(localization.fillFormRequired);
                return;
            }
        }
        $('#message').text('');
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: $scope.model,
            success: function (data) {
                data = JSON.parse(data);
                if(data.err){
                    $('#errMessage').text(data.errMessage);
                }else{
                    enableDisableForm(true);
                    $('#save').css('display', 'none');
                    $('#errMessage').text('');
                    if(getParameterByName('operation') == 'delete'){
                        $('#errMessage').text(localization.deleted);
                    }else{
                        $('#message').text(localization.saved);
                    }
                    
                }
            }
          });
    }

});

function enableDisableForm(value){
    $('#alloyNoCode').prop('disabled', value);
    $('#alloyNoEx').prop('disabled', value);
    $('#productionTypeCode').prop('disabled', value);
    $('#productionTypeEx').prop('disabled', value);
    $('#productDetail1Code').prop('disabled', value);
    $('#productDetail1Ex').prop('disabled', value);
    $('#productDetail2Code').prop('disabled', value);
    $('#productDetail2Ex').prop('disabled', value);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}