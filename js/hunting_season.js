var animal_counter = document.getElementById("animal_counter")
var counter_text = animal_counter.children[0]
var animal_spawner = document.getElementById("animal_spawner")

var speed = 2;

function on_start_button(){
    if (animal_spawner.children.length == 0){
        animal_counter.style.display = "block";
        create_animal();
        speed = 2
        counter_text.textContent = "0";
        animal_counter.style.backgroundColor = "white";
    }
}

function on_score_button(){
    animal_counter.style.display = "none";
    animal_spawner.children[0].remove()
}

function on_kill_animal(element){
    element.remove()
    create_animal()
    speed += 0.5
    counter_text.textContent = String(parseInt(counter_text.textContent) + 1);
}

function create_animal(){
    let animal = document.createElement("img");
    animal.src = `./img/Ecosystem/animal${Math.floor(Math.random() * 4)}.png`;
    animal.className = "animal";
    animal.setAttribute("onclick","on_kill_animal(this);");
    animal.style.top = String(Math.floor(Math.random() * (document.documentElement.scrollHeight - 500))) + "px";
    animal.style.left = `-${(10 * animal_spawner.offsetWidth) / 100 +100}px`;
    animal.id = 'normal';

    if (Math.random() > 0.5){
        animal.style.transform = "scale(-1, 1)";
        animal.id = 'reversed';
        animal.style.left = String(animal_spawner.offsetWidth + (10 * animal_spawner.offsetWidth) / 100) + "px";
    }

    animal_spawner.appendChild(animal);
}

function update_animal(){
    let border_offset = 400;
    let spd = parseInt(speed)

    let index = 0; // index of currently updated animal
    for (const child of animal_spawner.children) {  
        let x = parseInt(child.style.left);
        console.log(x)
        if (child.id == "reversed"){
            x -= spd;
            if (x < -border_offset){
                // x = animal_spawner.offsetWidth + 100;
                child.remove()
                animal_counter.style.backgroundColor = "red";
            }
        }else{
            x += spd;
            if (x > animal_spawner.offsetWidth + border_offset){
                // x = -100;
                child.remove()
                animal_counter.style.backgroundColor = "red";
            }
        }

        
        child.style.left = String(x)  + "px";
        index++;
    }
}

window.setInterval(update_animal, 30);