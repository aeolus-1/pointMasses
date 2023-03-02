class Renderer {
    constructor(world, canvas=undefined, options={}) {
        this.world = world
        this.options = {
            fps:60,
            ...options,
        }

        this.element = canvas
        this.ctx = this.element.getContext("2d")
        this.ctx.element = this.element

        this.packetQueue = []

        this.ctx.options = {
            scale:1,
        }

        this.camera = {
            pos:v(),
            targetPos:v(),
            lerp:0.1,
        }

    }
    run() {
        setInterval(() => {
            this.renderWorld(this.ctx)
        }, 1000/this.options.fps);
    }
    updateCamera() {
        this.camera.pos = v(
            this.camera.pos.x+((this.camera.targetPos.x-this.camera.pos.x)*this.camera.lerp),
            this.camera.pos.y+((this.camera.targetPos.y-this.camera.pos.y)*this.camera.lerp),
        )
    }
    renderWorld(ctx) {
        var world = this.world,
            worldPoints = world.getWorldPoints()

        

        this.ctx.options = {
            scale:1,
        }

        ctx.save()
        this.wipeScreen(ctx)

        this.renderGrid(ctx)


        this.centreScreen(ctx)

        this.camera.targetPos = testMass.averagePoint

        this.updateCamera()

        var camera = this.camera.pos

        this.ctx.translate(-camera.x,-camera.y)


        ctx.scale(1,1)

        var masses = this.world.pointMasses
        for (let j = 0; j < masses.length; j++) {
            const mass = masses[j];
            this.renderMass(this.ctx, mass)
            for (let i = 0; i < mass.points.length; i++) {
                const p = mass.points[i];
                this.renderPoint(this.ctx, p)
                this.renderConnection(this.ctx, p, mass.points[stopOverflow(i+1, mass.points.length)])
            }
            
        }
        this.renderPacketQueue(ctx)

        

        ctx.restore()
    }
    centreScreen(ctx) {
        ctx.translate(ctx.element.width*0.5,ctx.element.height*0.5)
    }
    wipeScreen(ctx) {
        ctx.fillStyle = colorTheme.back
        ctx.fillRect(0,0,ctx.element.width,ctx.element.height)
    }
    renderMass(ctx, mass) {
        var interval = 120,
            time = Math.floor((((new Date()).getTime())/interval)%interval),
            id = mass.id,
            offsetMag = 1.3
       

            

        ctx.beginPath()
        ctx.moveTo(mass.points[0].pos.x,mass.points[0].pos.y)
        for (let i = 1; i < mass.points.length; i++) {
            const point = mass.points[i];

            var posIdRound = 100,
                posId = v(
                    Math.floor(point.pos.x/posIdRound),
                    Math.floor(point.pos.y/posIdRound),
                )
                posId = `${posId.x}${posId.y}`

            var randX = offsetMag*((cyrb53(`${id}${time}${posId}.x`)/10e14)-5),
                randY = offsetMag*((cyrb53(`${id}${time}${posId}.y`)/10e14)-5)

            ctx.lineTo(mass.points[i].pos.x+randX,mass.points[i].pos.y+randY)

            
        }
        ctx.fillStyle = mass.render.fill
        ctx.fill()

        ctx.closePath()
    }
    renderGrid(ctx) {
        var gridSize = 100,
            columns = Math.floor(ctx.element.width/gridSize),
            rows = Math.floor(ctx.element.height/gridSize)

        ctx.save()

        var mod = v(
            this.camera.pos.x%gridSize,
            this.camera.pos.y%gridSize
        )

        ctx.translate(-mod.x, -mod.y)

        var buffer = 5,
            offsets = v(
                buffer*gridSize,
                buffer*gridSize,
            )

        for (let x = -buffer; x < columns+buffer; x++) {
            ctx.beginPath()

            var xPos = x*gridSize

            ctx.moveTo(xPos, -offsets.y)
            ctx.lineTo(xPos, ctx.element.height+offsets.y)

            ctx.strokeStyle = "#000"
            ctx.stroke()

            ctx.closePath() 
        }
        for (let y = -buffer; y < rows+buffer; y++) {
            ctx.beginPath()

            var xPos = y*gridSize

            ctx.moveTo(-offsets.x, xPos)
            ctx.lineTo(ctx.element.width+offsets.x, xPos)

            ctx.strokeStyle = "#000"
            ctx.stroke()

            ctx.closePath() 
        }


        ctx.restore()
    }
    renderPoint(ctx, point){
        ctx.beginPath()

        ctx.arc(point.pos.x, point.pos.y, 1/ctx.options.scale, 0, Math.PI*2)
        ctx.fillStyle = "#000"
        ctx.fill()

        ctx.closePath()
    }
    renderConnection(ctx, point1, point2) {
        ctx.beginPath()

        ctx.moveTo(point1.pos.x,point1.pos.y)
        ctx.lineTo(point2.pos.x,point2.pos.y)
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.closePath()
    }
    renderPacketQueue(ctx) {
        for (let i = 0; i < this.packetQueue.length; i++) {
            const packet = this.packetQueue[i];
            this.renderQueuePacket(ctx, packet)
        }
    }
    renderQueuePacket(ctx, packet) {
        switch (packet.type) {
            case "line":
                this.renderConnection(ctx, packet.point1,packet.point2)
                break;
        
            default:
                break;
        }
    }
}