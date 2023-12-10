var target_particle_size = 200;

var particle_container = document.getElementById("smoke_screen");
var target_height = document.documentElement.scrollHeight + target_particle_size;
var last_viewport_update = document.documentElement.scrollWidth;
var frozen = false;
// stores this values [x, y, particle_size]
var smoke_data = [];

// creates single smoke particle, memory in {smoke_data}, set's it's properties
function createSmoke(){
    // set image properties
    let particle = document.createElement("img");
    particle.src = "./img/Polution/smoke.png";
    particle.className = "smoke";
    particle.style.left = String(Math.floor(Math.random() * 70) + 5) + "%";
    particle.width = 0;
    particle.height = 0;
    particle.style.opacity = "0.2";

    smoke_data.push(generateParticleData());
    particle_container.appendChild(particle);
}

// updates {smoke_data} for each {particle_container} child 
function update_smoke(){
    // cheks if {frozen} is false
    if (!frozen){
        // update {target_height} ; {target_height} = height of page + {target_particle_size}
        target_height = document.documentElement.scrollHeight + target_particle_size;
        
        let index = 0; // index of currently updated particle
        for (const child of particle_container.children) {  
            // move particle up by 2px
            smoke_data[index][1] -= 2;
            
            // cheks if particle is still visible on screen
            if (smoke_data[index][1] > -target_height){
                // update {smoke_data}[particle_size] by ; {target_particle_size} / number_of_steps
                smoke_data[index][2] += target_particle_size / (target_height / 2);

                // change particle size by {smoke_data}[particle_size]
                child.width = smoke_data[index][2];
                child.height = smoke_data[index][2];

                // randomply move particle on x axis
                let dir = Math.random();
                if (dir > 0.8){
                    smoke_data[index][0] -= 1;
                }else if (dir < 0.2){
                    smoke_data[index][0] += 1;
                }
                
                // actually update particle from {smoke_data}
                child.style.transform = `translate(${String(smoke_data[index][0])}px,${String(smoke_data[index][1])}px)`;
            // if parthicle is no longer visible ...
            }else{
                // randomise x position 
                child.style.left = String(Math.floor(Math.random() * 70) + 5) + "%";
                // sets {smoke_data} to default values
                smoke_data[index] = [0, +30, 0];
            }
            index++;
        }
    }
}

// on viewport resize
function viewportUpdate(force=false){
    let threshold = 50;

    // cheks if viewport changed more then {threshold}
    if (Math.abs(last_viewport_update - document.documentElement.scrollWidth) > threshold || force == true){
        // updates {last_viewport_update}
        last_viewport_update = document.documentElement.scrollWidth;

        // check if visible width is less then 800px
        if (last_viewport_update < 800){
            frozen = true;

            // sets particle invisible
            for (const child of particle_container.children) {
                child.style.opacity = "0";
            }
        // if visible width is more then 800px
        }else{
            frozen = false;

            // sets particle visible
            for (const child of particle_container.children) {
                child.style.opacity = "0.2";
            }
        }

        for (var index=0; index!=(smoke_data.length-1); index++) {
            smoke_data[index] = generateParticleData()
        }
    }
}

function generateParticleData(){
    // generate random vertical position from [0 - ceiling]
    let y = Math.floor(Math.random() * target_height);
    // calculates {particle_size} based on vertical position
    let particle_size = y / document.documentElement.scrollHeight * target_particle_size;

    return [0, -y, particle_size]
}

// spawn {count} number of smoke particles
for (var count=0; count<400; count++){
    createSmoke();
}

viewportUpdate(true)
// set interval for update_smoke()
window.setInterval(update_smoke, 30);
// set event listener
visualViewport.addEventListener("resize", viewportUpdate);