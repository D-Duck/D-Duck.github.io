var header_target = document.getElementById("header_container");
var state = true;

function on_hamburger_click(){
    state = !state
    if (state){
        header_target.style.display = "none";
    }else{
        header_target.style.display = "inline";
        header_target.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        header_target.style.height = "165px";
        header_target.style.borderRadius = "30px";
        header_target.style.paddingRight= "2px";
    }
}

var acc = document.getElementsByClassName("accordion");
for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
    this.classList.toggle("active");

    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }   
  });
}