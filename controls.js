var mouse = {
    pos:v(800, 800),
    down:false
},
    preMouse = {...mouse},
    keys = {},
    preKeys = {}

document.addEventListener("mousemove", (e)=>{
    mouse.pos.x = e.offsetX+renderer.camera.pos.x
    mouse.pos.y = e.offsetY+renderer.camera.pos.y
})
document.addEventListener("mousedown", (e)=>{mouse.down=true})
document.addEventListener("mouseup", (e)=>{mouse.down=false})

document.addEventListener("keydown", (e)=>{keys[e.key]=true})
document.addEventListener("keyup", (e)=>{keys[e.key]=false})

var camera = v()

function runControls() {
    function rotateMass(mass, strength) {
        var points = mass.points
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            var averagePos = mass.calculateAveragePosition(),
                angle = (-getAngle(averagePos, p.pos)+90)*(Math.PI/180)
            angle += Math.PI*0.5

            var newVel = v(
                Math.cos(angle)*strength,
                Math.sin(angle)*strength,
            )

            p.vel.x += newVel.x
            p.vel.y += newVel.y
        
        }
    }
    var speed = 45
    if (keys.d) {
        rotateMass(testMass, -speed)
    }
    if (keys.a) {
        rotateMass(testMass, speed)
    }
    if (keys.w && !preKeys.w) {
        console.log("jump")
        var points = testMass.points,
            ju = v(0, -300)
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            p.vel.x+=ju.x
            p.vel.y+=ju.y
        }
    }

    preKeys = {...keys}
}