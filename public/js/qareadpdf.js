app.controller("qaReadPdf", function($scope) {
    for(var i=0; i < results.length; i++){
        results[i].operation = "1";
    }
    $scope.formData = {};    
    $scope.formData.results = results;
    
    $scope.save = function(){
        var data = {};
        data.results = [];
        data.save = 1;
        for(var i = 0; i < $scope.formData.results.length; i++){
            data.results.push(new Result($scope.formData.results[i].operation, $scope.formData.results[i]));
        }
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                window.location = window.location.origin + "/qaeditassigned?id=" + getParameterByName('id');
            }
          });
    }
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

class Result {
    constructor(operation, values) {
        this.operation = operation;
        this.values = values;
    }
}


$( document ).ready(function() {
    $("#uploadFile").click(function () {
        $("#file").trigger('click');
    });
    $("#file").change(function () {
        $("#form").submit();
    });
});




