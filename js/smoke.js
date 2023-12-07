var smoke_spawn = document.getElementById("smoke_screen");
var smoke_pos = [[0, 0]];
var to_delete = [];

function update_smoke(){
    let index = 0;
    for (const child of smoke_spawn.children) {  
        smoke_pos[index][1] -= 2;
        
        if (smoke_pos[index][1] > -100){

            let temp = Math.random();

            if (temp < 0.2){
                smoke_pos[index][0] += 1;
            }else if (temp > 0.8){
                smoke_pos[index][0] -= 1;
            }

            child.style.transform = "translate(" + String(smoke_pos[index][0]) + "px," + String(smoke_pos[index][1]) + "px)";

        }else{
            to_delete.push(index);
            child.remove();
        }

        index++;
    }
    if (to_delete.length > 0){
        for (index in to_delete){
            smoke_pos.pop(index);
        }
    }
}

function create_smoke(){
    let img = document.createElement("img");
    img.src = "./img/smoke.png";
    img.className = "smoke";
    img.style.left = String(Math.floor(Math.random() * smoke_spawn.offsetWidth)) + "px";

    smoke_pos.push([0, 0]);
    smoke_spawn.appendChild(img);
}

for (var i=0; i<10; i++){
    create_smoke();
}

window.setInterval(update_smoke, 40);