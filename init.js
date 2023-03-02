loadScripts([
    "src/pointMasses.js",
    "src/world.js",
    "src/renderer.js",
    "src/runner.js",
    
], ()=>{
    mainWorld = new World({
        gravity:{
            ...v(0,1),
            constant:9.81,
            scale:15,
        },
        frictionAir:0.999,
        neighbourStrength:10,
        shapeStrength:10,
    })
    runner = new Runner(mainWorld, {
        timeScale:0.8,
        updateTime:60,
    })
    renderer = new Renderer(mainWorld, canvas)

    runner.events.beforeRun = ()=>{
        renderer.packetQueue = []

        runControls()

        if (mouse.down) {
        var gamePos = v(
            (mouse.pos.x-(renderer.element.width/2)),
            (mouse.pos.y-(renderer.element.height/2)),
        )
        if (mouse.down && !preMouse.down) {
            var points = window.testMass.points,
                smol = {dst:Infinity,point:undefined}
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                var dst = getDst(p.pos, gamePos)
                if (smol.dst>dst) {
                    smol = {
                        dst:dst,
                        point:p
                    }
                }
            }
            mouse.grabbedPoint = smol.point
        } else if (!mouse.down && preMouse.down) {
            mouse.grabbedPoint = undefined
        }
        if (0) {
        if (mouse.grabbedPoint!=undefined) {
            const point = mouse.grabbedPoint
            var velChange = point.updatePointToPointConstraints(gamePos, 0, 40)
            var max = 100000
            point.vel.x += clamp(velChange.x*0.01,-max,max)
            point.vel.y += clamp(velChange.y*0.01,-max,max)
        }
    } else {
        for (let i = 0; i < window.testMass.points.length; i++) {
            const point = window.testMass.points[i];
            var velChange = point.updatePointToPointConstraints(gamePos, 0, 10)
            var max = 100000
            point.vel.x += clamp(velChange.x*0.01,-max,max)
            point.vel.y += clamp(velChange.y*0.01,-max,max)
            
        }
    }
        
       /* */
        
        }
    }
    runner.events.afterRun = ()=>{
        preMouse = {...mouse}
    }

    runner.run()
    renderer.run()
    var width = 1800
    var floor = mainWorld.addPointMass([...generateLine(v(-width,200),v(width,200)),...generateLine(v(width,200), v(width,500)),...generateLine(v(width,500), v(-width,500)), ...generateLine(v(-width,500), v(-width,200))], {mass:1000,render:{fill:colorTheme.platforms}})
    floor.static = true

    
    var pPoints = JSON.parse(`[{"x":0,"y":0},{"x":75,"y":0},{"x":100,"y":25},{"x":100,"y":75},{"x":300,"y":50},{"x":350,"y":75},{"x":350,"y":125},{"x":300,"y":200},{"x":100,"y":175},{"x":100,"y":225},{"x":75,"y":250},{"x":25,"y":250},{"x":0,"y":225},{"x":0,"y":175},{"x":50,"y":150},{"x":50,"y":100},{"x":0,"y":75},{"x":0,"y":25}]`)
    //mainWorld.addPointMass(pPoints)

    //window.testMass = mainWorld.addPointMass([v(200,0),v(250,0),v(250,50),v(200,50)],{render:{fill:colorTheme.platforms}})
    //cube.static = true

    function generateLine(a,b,splitLength=33) {
        var dst = getDst(a,b),
            angle = (-getAngle(a,b)+90)*(Math.PI/180)
            subdivsions = Math.floor(dst/splitLength),

            points = [a]

        for (let i = 1; i < subdivsions; i++) {
            var length = (i*splitLength),
                point = v(
                    a.x-(Math.cos(angle)*length),
                    a.y-(Math.sin(angle)*length),
                )

            points.push(point)
        }

        return points
    }


    mainWorld.addPointMass((()=>{
        var points = [],
            radius = 100,
            segments = 30,
            startPos = v(1000, -5400)

        for (let i = 0; i < segments; i++) {
            points.push(v(
                startPos.x+(Math.cos((i/segments)*2*Math.PI)*radius),
                startPos.y+(Math.sin((i/segments)*2*Math.PI)*radius),
            )
            )
        }
        return points
    })(), {render:{fill:colorTheme.platforms},mass:0.001})
    let a = 1
    let f1 = mainWorld.addPointMass([
        ...generateLine(
            v(300,200+a),
            v(400,150+a)
        ),
        ...generateLine(
            v(400,150+a),
            v(600,150+a)
        ),
        ...generateLine(
            v(600,150+a),
            v(700,200+a)
        ),
        ...generateLine(
            v(700,200+a),
            v(300,200+a)
        ),
    ], {render:{fill:colorTheme.platforms}})
    f1.static = true


    window.testMass = mainWorld.addPointMass([
        ...generateLine(
            v(0,0),
            v(100,0)
        ),
        ...generateLine(
            v(100,0),
            v(100,100)
        ),
        ...generateLine(
            v(100,100),
            v(0,100)
        ),
        ...generateLine(
            v(0,100),
            v(0,0)
        ),
    ], {render:{fill:colorTheme.player}})
    

    //window.testMass = mainWorld.addPointMass(pPoints)

    

    

    
})

var mainWorld;
var runner;
var renderer;
