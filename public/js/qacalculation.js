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


    $scope.print = function(){
        $scope.formData.type = 1;
        $.ajax({
            type: "POST",
            url: window.location.href.split('?')[0] + "/print?" + window.location.href.split('?')[1] ,
            data: $scope.formData,
            success: function (data) {
                window.open(window.location.origin + data, "newwin");
            }
          });
    }

    function openInNewTab(url) {
        var win = window.open(url, '_blank');
        win.focus();
    }

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