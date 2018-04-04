var isOpen = 0;

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    isOpen = 1;
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    isOpen = 0;
}

function nav(){
    if(isOpen){
        closeNav();
    }else{
        openNav();
    }
}