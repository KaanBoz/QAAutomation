var app = angular.module("qaApp", []);

function logout(){
    $.ajax({
        type: "GET",
        url: "../logout",
        success: function(data, textStatus, jqXHR){
            window.location = "..";
        }
      });
 }

 function users(){
    $.ajax({
        type: "GET",
        url: "../users",
        success: function(data, textStatus, jqXHR){
            window.location = "../users";
        }
      });
 }