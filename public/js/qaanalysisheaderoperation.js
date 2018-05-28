app.controller("qaAnalysisHeaderOperationCtrl", function($scope) {
});

var details = [];

$(document).ready(function(){
    setOnClicks();
});

function setOnClicks(){
    saveOnClick();
    deleteOnClick();
    detailsOnClick();
    $("#details").val(details);
    setTable();
    selectDetails();
}

function saveOnClick(){
    $("#save").click(function(){
        var details = [];
        var masterAlloys = [];
        for (var i = 0 ; i < $("#table").DataTable().rows( { selected: true } ).data().length; i++ ){
            details.push($("#table").DataTable().rows( { selected: true } ).data()[i].id);
            masterAlloys.push($("#table").DataTable().rows( { selected: true } ).data()[i].master_alloy);
        }
        var data = {};
        data.name = $("#name").val();
        data.type = $("#type").val();
        data.details = details;
        data.masterAlloys = masterAlloys;
        data.standart = $("#standart").val();
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                var html = $.parseHTML(data);
                var mainContent = $(data).find("#mainContent");
                $("#mainContent").html(mainContent);
                setOnClicks();
            }
          });
    });
}

function deleteOnClick(){
    $("#delete").click(function(){
        var details = [];
        var masterAlloys = [];
        for (var i = 0 ; i < $("#table").DataTable().rows( { selected: true } ).data().length; i++ ){
            details.push($("#table").DataTable().rows( { selected: true } ).data()[i].id);
            masterAlloys.push($("#table").DataTable().rows( { selected: true } ).data()[i].master_alloy);
        }
        var data = {};
        data.name = $("#name").val();
        data.type = $("#type").val();
        data.details = details;
        data.masterAlloys = masterAlloys;
        data.standart = $("#standart").val();
        $.ajax({
            type: "POST",
            url: window.location.href ,
            data: data,
            success: function (data) {
                var html = $.parseHTML(data);
                var mainContent = $(data).find("#mainContent");
                $("#mainContent").html(mainContent);
                setOnClicks();
            }
          });
    });
}

function detailsOnClick(){
    $("#details").click(function(){
        var value = $("#details").val();
        if((getIndex(value) > -1)){
            details.splice(getIndex(value), 1);
        }else{
            details.push(value);
        }
        $("#details").val(details);
    });
}

function getIndex(value){
    for(var i = 0; details.length > i; i++){
        if(parseInt(value) == parseInt(details[i])){
            return i;
        }
    }
    return -1;
}

function selectDetails(){
    for (var i = 0 ; i < $("#table").DataTable().rows().data().length; i++ ){
        var id = $("#table").DataTable().rows().data().row(i).data().id;
        if(details.indexOf("" + id) > -1){
            $("#table").DataTable().rows().data().row(i).select();
            $("#table").DataTable().rows().data().row(i).data().master_alloy = masterAlloys[details.indexOf("" + id)];
            $("#" + id + "editable").html(masterAlloys[details.indexOf("" + id)]);
        }
    }
}

function masterAlloyOnChange(item){
    $(item).val(checkGetValue($(item).val()));   
}

function checkGetValue(value){
    if(value.includes('.')){
        if(value.split('.')[1].length > 3){
            value = value.split('.')[0] + "." + value.split('.')[1].substring(0,3);
        }
    }
    return value;
}

function setTable(){

    if(isDisabled){
        if(localization == 'tr'){
            $('#table').DataTable( {
                "language": {
                    "sDecimal":        ",",
                    "sEmptyTable":     "Tabloda herhangi bir veri mevcut değil",
                    "sInfo":           "_TOTAL_ kayıttan _START_ - _END_ arasındaki kayıtlar gösteriliyor",
                    "sInfoEmpty":      "Kayıt yok",
                    "sInfoFiltered":   "(_MAX_ kayıt içerisinden bulunan)",
                    "sInfoPostFix":    "",
                    "sInfoThousands":  ".",
                    "sLengthMenu":     "Sayfada _MENU_ kayıt göster",
                    "sLoadingRecords": "Yükleniyor...",
                    "sProcessing":     "İşleniyor...",
                    "sSearch":         "Ara:",
                    "sZeroRecords":    "Eşleşen kayıt bulunamadı",
                    "oPaginate": {
                        "sFirst":    "İlk",
                        "sLast":     "Son",
                        "sNext":     "Sonraki",
                        "sPrevious": "Önceki"
                    },
                    "oAria": {
                        "sSortAscending":  ": artan sütun sıralamasını aktifleştir",
                        "sSortDescending": ": azalan sütun sıralamasını aktifleştir"
                    }
                },
                columns: [
                    { data: 'id'},
                    { data: 'name'},
                    { data: 'master_alloy', className: 'editable' }
                ],
                select: {
                    style:    'api'
                }   
            });
        }else{
            
            $('#table').DataTable( {
                
                columns: [
                    { data: 'id'},
                    { data: 'name'},
                    { data: 'master_alloy', className: 'editable' }
                ],


                select: {
                    style:    'api'
                }
            } );
        }   
    }else{
        if(localization == 'tr'){
            $('#table').DataTable( {
                "language": {
                    "sDecimal":        ",",
                    "sEmptyTable":     "Tabloda herhangi bir veri mevcut değil",
                    "sInfo":           "_TOTAL_ kayıttan _START_ - _END_ arasındaki kayıtlar gösteriliyor",
                    "sInfoEmpty":      "Kayıt yok",
                    "sInfoFiltered":   "(_MAX_ kayıt içerisinden bulunan)",
                    "sInfoPostFix":    "",
                    "sInfoThousands":  ".",
                    "sLengthMenu":     "Sayfada _MENU_ kayıt göster",
                    "sLoadingRecords": "Yükleniyor...",
                    "sProcessing":     "İşleniyor...",
                    "sSearch":         "Ara:",
                    "sZeroRecords":    "Eşleşen kayıt bulunamadı",
                    "oPaginate": {
                        "sFirst":    "İlk",
                        "sLast":     "Son",
                        "sNext":     "Sonraki",
                        "sPrevious": "Önceki"
                    },
                    "oAria": {
                        "sSortAscending":  ": artan sütun sıralamasını aktifleştir",
                        "sSortDescending": ": azalan sütun sıralamasını aktifleştir"
                    }
                },

                columns: [
                    { data: 'id'},
                    { data: 'name'},
                    { data: 'master_alloy', className: 'editable' }
                ],

                select: {
                    style:    'multi'
                }   
            });
        }else{
            $('#table').DataTable( {
                columns: [
                    { data: 'id'},
                    { data: 'name'},
                    { data: 'master_alloy', className: 'editable' }
                ],

                select: {
                    style:    'multi'
                }
            } );
        }   
    }

    editor = new $.fn.dataTable.Editor( {
        table: "#table",
        idSrc:  'id',
        fields: [ {
                label: "ID",
                name: "id"
            }, {
                label: "Name",
                name: "name"
            }, {
                label: "",
                name: "master_alloy",
                attr: {
                    type: "number"
                  }
            }
        ]
    } );

    $('#table').on( 'click', 'tbody td.editable', function (e) {
        editor.inline( this );
    } );

}
