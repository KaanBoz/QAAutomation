$(document).ready(function() {
    $('.selectpicker').selectpicker();
    $('#lang').on('change', function(){
        $('#isLangChange').val('1');  
        this.form.submit();
    });
 });