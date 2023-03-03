class ChunkHandler {
    constructor(world) {
        this.world = world
        this.options = {
            chunkSize:2000,

            loadSize:3,
            
        }

        this.chunks = {}
        this.loadedChunks = {}
        
        this.loadedPoints = []

        this.loadQueue = []
        this.unloadQueue = []
    }
    gamePos2Chunk(pos) {return v(Math.floor(pos.x/this.options.chunkSize),Math.floor(pos.y/this.options.chunkSize))}
    getChunksForPoint(pos) {
        var chunksPos = this.gamePos2Chunk(pos),
            halfLoadmi = (Math.floor(this.options.loadSize/2)),
            halfLoadma = (Math.ceil(this.options.loadSize/2)),
            chunks = {}
        for (let x = -halfLoadmi; x < halfLoadma; x++) {
            for (let y = -halfLoadmi; y < halfLoadma; y++) {
                chunks[`${x+chunksPos.x},${y+chunksPos.y}`] = true
            }
        }
        return chunks
    }
    runChunks() {
        this.clearQueues()
        var loadPoint = testMass.averagePoint,
            newLoadedChunks = this.getChunksForPoint(loadPoint)

        var chunks = Object.keys(newLoadedChunks)
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!this.loadedChunks[chunk]) this.queueLoad(chunk)
        }
        var chunks = Object.keys(this.loadedChunks)
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!newLoadedChunks[chunk]) this.queueUnload(chunk)
        }

        for (let i = 0; i < this.loadQueue.length; i++) {
            const chunk = this.loadQueue[i];
            this.loadChunk(chunk)
        }
        for (let i = 0; i < this.unloadQueue.length; i++) {
            const chunk = this.unloadQueue[i];
            this.unloadChunk(chunk)
        }
    }
    clearQueues() {this.loadQueue=[];this.unloadQueue=[]}
    queueLoad(pos) {
        this.loadQueue.push(pos)
    }
    queueUnload(pos) {
        this.unloadQueue.push(pos)
    }
    loadChunk(pos) {
        this.loadedChunks[`${pos}`] = []
        var chunkData = levelDat.chunks[pos]
        if (chunkData) {
            var rects = chunkData.rects
            for (let i = 0; i < rects.length; i++) {
                const rect = rects[i];
                var mass = loadRect(this.world, rect)
                this.loadedChunks[`${pos}`].push(mass)
            }
        } else {
            console.error("chunk not found", pos)
        }
    }
    unloadChunk(pos) {
        console.log(`unloaded chunk ${pos}`)
        var masses = this.loadedChunks[`${pos}`]
        for (let i = 0; i < masses.length; i++) {
            const mass = masses[i];
            mass.unload = true
        }
        delete this.loadedChunks[`${pos}`]

    }
}


function loadRect(world, rect) {
    var largeScale = 2.3
    rect = {...rect}
    rect.x*=largeScale;rect.y*=largeScale;rect.width*=largeScale;rect.height*=largeScale;
    var rectCenter = v(
        rect.x+(rect.width/2),
        rect.y+(rect.height/2),
    ),
    scale = 0.7
    
    var rd = v(
        rect.width*scale,
        rect.height*scale,
    ),
    

    vertices = [
        v(rect.x+rd.x,rect.y+rd.y),
        v(rect.x+-rd.x,rect.y+rd.y),
        v(rect.x+-rd.x,rect.y+-rd.y),
        v(rect.x+rd.x,rect.y+-rd.y),

    ]

    vertices = vertices.map((m)=>{return rotate(rectCenter.x,rectCenter.y,m.x,m.y,-rect.angle)})
    
    vertices = vertices.map((m=>{
        return v(
            ((m.x-rectCenter.x)*scale)+rectCenter.x,
            ((m.y-rectCenter.y)*scale)+rectCenter.y,
        )
    }))

    function generateLine(a,b,splitLength=100) {
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

    var newPoints = []
    for (let i = 0; i < vertices.length; i++) {
        var vert1 = vertices[i],
            vert2 = vertices[stopOverflow(i+1,vertices.length)]
        newPoints = [...newPoints, ...generateLine(vert1,vert2)]
        
    }

    var mass = world.addPointMass(newPoints)
    mass.static = true

    return mass
}