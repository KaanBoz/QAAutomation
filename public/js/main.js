var app = angular.module("qaApp", []);

function logout(){
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/logout",
        success: function(data, textStatus, jqXHR){
            window.location = "http://localhost:3000";
        }
      });
 }

 function users(){
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/users",
        success: function(data, textStatus, jqXHR){
            window.location = "http://localhost:3000/users";
        }
      });
 }