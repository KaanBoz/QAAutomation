var customer = 0;
var product = 0;
$(document).ready(()=>{
    $('#customer').val(customer);
    $('#product').val(product);
});
app.controller("customerproduct", function($scope) {
    $scope.formData = model;
    // for(let i = 0; i < $scope.formData.customers.length; i++){
    //     let customer = $scope.formData.customers[i];
    //     $('#customer').append(new Option(customer.customername, customer.id));
    // }
    // for(let i = 0; i < $scope.formData.products.length; i++){
    //     let product = $scope.formData.products[i];
    //     $('#product').append(new Option(product.alloyNoCode + "-" 
    //     + product.productionTypeCode + "-" 
    //     + product.productDetail1Code + "-" 
    //     + product.productDetail2Code, product.id));
    // }
    customer = $scope.formData.customer;
    product = $scope.formData.product;
    $scope.save = () => {
        if ($scope.formData.customer.id == 0 || $scope.formData.product.id == 0) {
            $('#errMessage').text(localization.fillFormRequired);
                return;
        }
        $('#message').text('');
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: $scope.formData,
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
    $('#customer').prop('disabled', value);
    $('#product').prop('disabled', value);
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
