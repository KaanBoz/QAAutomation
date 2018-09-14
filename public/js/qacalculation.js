app.controller("qaCalculation", function($scope) {
    $scope.formData = {};
    $scope.formData = formData;

    // gets the template to ng-include for a table row / item
    $scope.getTemplate = function (detail) {
        if($scope.formData.selected){
            if (detail.id === $scope.formData.selected.id) return 'edit';
        }
        return 'display';
    };

    $scope.editContact = function (detail) {
        $scope.formData.selected = angular.copy(detail);
    };

    $scope.saveContact = function (idx) {
        $scope.formData.details[idx] = angular.copy($scope.formData.selected);
        $scope.reset();
    };

    $scope.reset = function () {
        $scope.formData.selected = {};
    };

    $scope.save = function(){
        $scope.formData.type = 1;
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: $scope.formData,
            success: function (data) {
                $("#messageBox").empty();
                var message = $(data).find("#message");
                var html = message.html()
                if(html){
                    $("#messageBox").append("<p>" + html + "</p>");
                }else{
                    window.location = window.location.origin + "/qacorrections";
                }
            }
          });
    }

    $scope.noCorrection = function(){
        $scope.formData.type = 2;
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: $scope.formData,
            success: function (data) {
                $("#messageBox").empty();
                var message = $(data).find("#message");
                var html = message.html()
                if(html){
                    $("#messageBox").append("<p>" + html + "</p>");
                }else{
                    window.location = window.location.origin + "/qacorrections";
                }
            }
          });
    }


});