app.controller("qaCorrectionOperation", function($scope) {
    $scope.formData = {};

    $scope.save = function(){
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: $scope.formData,
            success: function (data) {
                window.location = window.location.origin + "/qaallcorrections";
            }
          });
    }


});