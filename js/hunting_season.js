var animal_counter = document.getElementById("animal_counter");
var counter_text = animal_counter.children[0];
var animal_spawner = document.getElementById("animal_spawner");
var first = true;

// Initial speed of animals
var speed = 2;

// on start game button pressed
function on_start_button(){
    // alert the player about the atrocities they are about to commit
    if (first){ 
        alert("You are about to kill innocent animals purely for your enjoyment are you okay with that ?")
    }
    if (animal_spawner.children.length == 0){
        animal_counter.style.display = "block";  // unhide score
        create_animal();
        speed = 2;
        counter_text.textContent = "0";  // set score to 0
        animal_counter.style.backgroundColor = "white";
    }
}

// on end game button pressed
function on_score_button(){
    animal_counter.style.display = "none";  //hide score
    animal_spawner.children[0].remove();  // delete remaining animals
}

// on animal button pressed
function on_kill_animal(element){
    element.remove();
    create_animal();
    speed += 0.5;
    counter_text.textContent = String(parseInt(counter_text.textContent) + 1);
}

// spawn new animal
function create_animal(){
    // asign values to img
    let animal = document.createElement("img");
    animal.src = `./img/Ecosystem/animal${Math.floor(Math.random() * 4)}.png`;
    animal.className = "animal";
    animal.setAttribute("onclick","on_kill_animal(this);");
    animal.style.top = String(Math.floor(Math.random() * (document.documentElement.scrollHeight - 500))) + "px";
    animal.style.left = `-${(10 * animal_spawner.offsetWidth) / 100 +100}px`;
    animal.id = 'normal';

    // 50% chance of going from right-to-left else left-to-right
    if (Math.random() > 0.5){
        animal.style.transform = "scale(-1, 1)";
        animal.id = 'reversed';
        animal.style.left = String(animal_spawner.offsetWidth + (10 * animal_spawner.offsetWidth) / 100) + "px";
    }

    animal_spawner.appendChild(animal);
}

// update animal
function update_animal(){
    let border_offset = document.body.clientWidth * 0.1;  //aproximate width of animals
    let spd = parseInt(speed);

    let index = 0; // index of currently updated animal
    for (const child of animal_spawner.children) {  
        // move animal in correct direction
        let x = parseInt(child.style.left);
        if (child.id == "reversed"){
            x -= spd;
            if (x < -border_offset){
                child.remove();
                animal_counter.style.backgroundColor = "red";
            }
        }else{
            x += spd;
            if (x > animal_spawner.offsetWidth){
                child.remove();
                animal_counter.style.backgroundColor = "red";
            }
        }

        child.style.left = String(x)  + "px";
        index++;
    }
}

// set interval for update function
window.setInterval(update_animal, 30);