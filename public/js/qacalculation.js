app.controller("qaCalculation", function ($scope) {
    $scope.formData = {};
    $scope.formData = formData;

    // gets the template to ng-include for a table row / item
    $scope.getTemplate = function (detail) {
        if ($scope.formData.selected) {
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


    $scope.print = function () {
        $scope.formData.type = 1;
        $.ajax({
            type: "POST",
            url: window.location.href.split('?')[0] + "/print?" + window.location.href.split('?')[1],
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

    $scope.save = function () {
        $scope.formData.type = 1;
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: $scope.formData,
            success: function (data) {
                $("#messageBox").empty();
                var message = $(data).find("#message");
                var html = message.html()
                if (html) {
                    $("#messageBox").append("<p>" + html + "</p>");
                } else {
                    window.location = window.location.origin + "/qacorrections";
                }
            }
        });
    }

    $scope.noCorrection = function () {
        $scope.formData.type = 2;
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: $scope.formData,
            success: function (data) {
                $("#messageBox").empty();
                var message = $(data).find("#message");
                var html = message.html()
                if (html) {
                    $("#messageBox").append("<p>" + html + "</p>");
                } else {
                    window.location = window.location.origin + "/qacorrections";
                }
            }
        });
    }

    $scope.explanations = () => {
        $("#modalButton").click();
        $.ajax({
            type: "POST",
            url: window.location.href.split('?')[0] + "/explanations?id=" + getParameterByName("id"),
            data: $scope.formData,
            success: function (data) {
                data = JSON.parse(data);

                $('#modalBody').html(getTable(data));
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

function getTable(data) {
    let a = "<table class=\"table\">" +
        "<thead>" +
        "<tr>" +
        "<th>" + localization.partyno + "</th>" +
        "<th>" + localization.date + "</th>" +
        "<th>" + localization.amount + "</th>" +
        "<th>" + localization.alloyValue + "</th>" +
        "<th>" + localization.measurementValue + "</th>" +
        "<th>" + localization.addition + "</th>" +
        "<th>" + localization.explanation + "</th>" +
        "</tr>" +
        "</thead>";

    a += "<tbody>";
    if (data.otherQf != undefined && data.otherQf != null) {
        for (let i = 0; i < data.otherQf.length; i++) {
            let b = data.otherQf[i];
            let alloyResults = [];
            let masterResults = [];
            let orjiResults = [];
            let alloyDetail = "";
            if (b.alloyDetails != undefined && b.alloyDetails != null) {
                for (let j = 0; j < b.alloyDetails.length; j++) {
                    let ad = b.alloyDetails[j];
                    alloyDetail += ad.name + " : " + ad.master + "<br/>";
                    orjiResults.push(ad);
                }
            }
            if (b.alloyResultsIds != undefined && b.alloyDetails != null && b.masterResultsIds != undefined && b.masterResultsIds != null) {
                for (let j = 0; j < b.alloyResultsIds.length; j++) {
                    if (b.alloyResultsIds[j].results != undefined && b.alloyResultsIds[j].results != null) {
                        let found = false;
                        let newFound = null;
                        for (let k = 0; k < b.alloyResultsIds[j].results.length; k++) {
                            for (let z = 0; z < alloyResults.length; z++) {
                                if (alloyResults[z].name == b.alloyResultsIds[j].results[k].name) {
                                    alloyResults[z].result = (parseFloat((parseFloat(alloyResults[z].result) + parseFloat(b.alloyResultsIds[j].results[k].result)) / 2)).toFixed(2);
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) alloyResults.push(b.alloyResultsIds[j].results[k]);
                        }
                    }
                }
                for (let j = 0; j < b.masterResultsIds.length; j++) {
                    if (b.masterResultsIds[j].results != undefined && b.masterResultsIds[j].results != null) {
                        let found = false;
                        let newFound = null;
                        for (let k = 0; k < b.masterResultsIds[j].results.length; k++) {
                            for (let z = 0; z < masterResults.length; z++) {
                                if (masterResults[z].name == b.masterResultsIds[j].results[k].name) {
                                    masterResults[z].result = parseFloat(((parseFloat(masterResults[z].result) + parseFloat(b.masterResultsIds[j].results[k].result))) / 2).toFixed(2);
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) masterResults.push(b.masterResultsIds[j].results[k]);
                        }
                    }
                }
            }
            for (let i = 0; i < masterResults.length; i++) {
                for (let j = 0; j < orjiResults.length; j++) {
                    if (masterResults[i].name == orjiResults[j].name) {
                        masterResults[i].dif = (parseFloat(masterResults[i].result) - parseFloat(orjiResults[j].master)).toFixed(2)
                    }
                }
            }

            for (let i = 0; i < masterResults.length; i++) {
                for (let j = 0; j < alloyResults.length; j++) {
                    if (masterResults[i].name == alloyResults[j].name) {
                        alloyResults[j].result = (parseFloat(alloyResults[j].result) + parseFloat(masterResults[i].dif)).toFixed(2);
                    }
                }
            }

            

            let measurementDetail = "";

            for (let i = 0; i < masterResults.length; i++) {
                for (let j = 0; j < alloyResults.length; j++) {
                    if (masterResults[i].name == alloyResults[j].name) {
                        measurementDetail += alloyResults[j].name + " : " + alloyResults[j].result + "<br/>";
                    }
                }
            }


            let addition = "";
            let explanation = "";
            if (b.correction != undefined && b.correction != null) {
                if (b.correction.details != undefined && b.correction.details != null) {
                    for (let j = 0; j < b.correction.details.length; j++) {
                        addition += b.correction.details[j].name + " : " + b.correction.details[j].addedamount + "<br/>";
                    }
                }
                if (b.correction.explanation != undefined && b.correction, explanation != null) {
                    explanation += b.correction.explanation;
                }
            }


            a += "<tr>" +
                "<td>" + b.partyno + "</th>" +
                "<td>" + new Date(b.partydate).toLocaleDateString() + "</td>" +
                "<td>" + b.amount + " kg" + "</td>" +
                "<td>" + alloyDetail + "</td>" +
                "<td>" + measurementDetail + "</td>" +
                "<td>" + addition + "</td>" +
                "<td>" + explanation + "</td>" +
                "</tr>";
        }
    }

    a += "</tbody>" +
        "</table>";
    return a;
}