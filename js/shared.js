var header_target = document.getElementById("header_container");
var state = true;

// Hamburger interaction
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

// Accordeon interaction
var accordeon = document.getElementsByClassName("accordion");
var count;

// bind "when_clicked" function to each section
for (count = 0; count < accordeon.length; count++) {
  accordeon[count].addEventListener("click", when_clicked);
}

function when_clicked(){
    this.classList.toggle("active");
    var panel = this.nextElementSibling;

    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
}

// slideshow interactions
var slideIndex = 0;
if (document.getElementsByClassName("slideshow").length > 0) {showSlides();}

function showSlides() {
    let slides = document.getElementsByClassName("slides");
    let count;

    // update which slide is visible
    for (count = 0; count < slides.length; count++) {
      slides[count].style.display = "none";
    }

    // change index
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1
    }
    
    slides[slideIndex-1].style.display = "block";
    setTimeout(showSlides, 5000);
}