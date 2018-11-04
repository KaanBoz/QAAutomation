app.controller("customerController", function ($scope) {
    $scope.model = model;
    if (getParameterByName('operation') != 'add') {
        $scope.model = JSON.parse(model);
    }
    $scope.save = () => {
        if (!$scope.model.customerName) {
            if (getParameterByName('operation') != 'delete') {
                $('#errMessage').text(localization.fillFormRequired);
                return;
            }
        }
        if ($scope.model.email) {
            if (!validateEmail($scope.model.email)) {
                $('#errMessage').text(localization.enterValidEmail);
                return;
            }
        }
        if ($scope.model.telephone) {
            if (!validatePhone($scope.model.telephone)) {
                $('#errMessage').text(localization.enterValidPhone);
                return;
            }
        }
        $('#message').text('');
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: $scope.model,
            success: function (data) {
                data = JSON.parse(data);
                if (data.err) {
                    $('#errMessage').text(data.errMessage);
                } else {
                    enableDisableForm(true);
                    $('#save').css('display', 'none');
                    $('#errMessage').text('');
                    if (getParameterByName('operation') == 'delete') {
                        $('#errMessage').text(localization.deleted);
                    } else {
                        $('#message').text(localization.saved);
                    }

                }
            }
        });
    }

});

function enableDisableForm(value) {
    $('#customerName').prop('disabled', value);
    $('#responsiblePerson').prop('disabled', value);
    $('#telephone').prop('disabled', value);
    $('#email').prop('disabled', value);
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

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    var formats = "(999)999-9999|999-999-9999|9999999999";
    var re = RegExp("^(" +
        formats
            .replace(/([\(\)])/g, "\\$1")
            .replace(/9/g, "\\d") +
        ")$")
    return re.test(String(phone).toLowerCase());
}