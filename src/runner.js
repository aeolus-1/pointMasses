class Runner {
    constructor(world, options){
        this.options = {

            updateTime:120,
            timeScale:1,

            ...options,
        }
        this.world = world

        this.deltaTime = (new Date()).getTime()


        this.events = {
            beforeRun:()=>{},
            afterRun:()=>{},
        }

        this.output = {
            sps:1,
        }
    }
    run() {
        setInterval(()=>{

            this.events.beforeRun()

            var idealMs = 1000/this.options.updateTime,
                msInterval = clamp((new Date()).getTime()-this.deltaTime, idealMs*0.9, idealMs*1.1),
                seconds = (msInterval/(1000/this.options.updateTime))*0.1*this.options.timeScale
            this.output.sps = (1000/msInterval)*this.options.timeScale

            var subSteps = 5
            for (let i = 0; i < subSteps; i++) {
                this.stepWorld(seconds/subSteps)

                
            }


            this.deltaTime = (new Date()).getTime()

            this.events.afterRun()
        }, 1000/this.options.updateTime)
        
    }
    stepWorld(deltaTime) {

        this.deleteMasses()

        this.updatePointVelocitys(deltaTime)

        this.updatePointPositions(deltaTime)



    }

    deleteMasses() {
        var masses = this.world.pointMasses
        for (let i = 0; i < masses.length; i++) {
            const mass = masses[i];
            if (mass.unload) {
                console.log("unloading")
                this.world.pointMasses.splice(i, 1)
            }
        }
    }

    updatePointVelocitys(deltaTime) {
        var worldPoints = this.world.getWorldPoints()
    
        this.world.pointMasses.forEach(m => {
            m.calculateAveragePosition()
            m.calculateAverageRotation()
            m.calculateAverageVelocity()

        });

        this.runForPoints(worldPoints, (p, i)=>{
            p.updateVelocity(this.world.pointMasses, deltaTime)
        })
    }

    updatePointPositions(deltaTime) {
        var worldPoints = this.world.getWorldPoints()

        this.runForPoints(worldPoints, (p, i)=>{
            if (true) p.updatePosition(this.world.pointMasses, deltaTime)
        })
    }

    runForPoints(points, callback=()=>{}) {

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            callback(point, i)
        }
    }
}