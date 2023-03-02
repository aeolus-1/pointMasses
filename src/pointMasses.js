class Point {
    constructor(pos, mass=undefined) {
        this.id = self.crypto.randomUUID()

        this.mass = mass
        
        this.startPos = {...pos}
        this.startRot = 0


        this.pos = {...pos}
        this.vel = v()
    }

    updateVelocity(masses, deltaTime) {
        var world = this.mass.world,
            gravity = world.options.gravity


        var additionalVelocity = v(
            gravity.x*gravity.scale*gravity.constant,
            gravity.y*gravity.scale*gravity.constant,
        )
        
        var neighbours = this.updatePointNeighbourConstraints()
        additionalVelocity.x += neighbours.x
        additionalVelocity.y += neighbours.y

        var rigdAd = this.updatePointRigdBodyClone()
        additionalVelocity.x += rigdAd.x
        additionalVelocity.y += rigdAd.y




        this.vel = v(
            this.vel.x+(additionalVelocity.x*deltaTime),
            this.vel.y+(additionalVelocity.y*deltaTime),
        )
    }

    updatePointToMassCollision(mass) {
        let points = mass.points,
        point = this.pos
        var collides = polygonPoint(mass.points.map((p)=>{return p.pos}), point)
        if (collides && !(this.mass.static&&mass.static)) {
            var lines = new Array()
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                var p2 = points[stopOverflow(i+1, points.length)]
                lines.push([p,p2])
	        }
            var closest = v(Infinity,Infinity),
                closestLine = undefined
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                var closestPoint = linePoint(this.pos, [line[0].pos,line[1].pos]),
                    dst = getDst(this.pos, closestPoint),
                    dst2 = getDst(this.pos, closest)

                if (dst<dst2) {
                    closest = closestPoint
                    closestLine = line
                }
                
                
                
            }

            if (closestLine!=undefined) {
                
                //console.log(getDst(this.pos,closest), closestLine)
                //closestLine = closestLine.sort((a,b)=>{return (a.index-b.index)})
                var lineNormal = (-getAngle(closestLine[0].pos,closestLine[1].pos)-90)*(Math.PI/180)

                //console.log(lineNormal/(Math.PI/180))

                function r(v,s=1) {
                    return rotate(0,0,v.x,v.y,lineNormal*s)
                }

                var rotatedSelfPos = r({...this.pos}),
                    rotatedLine = [
                        r({...closestLine[0].pos}),
                        r({...closestLine[1].pos}),
                    ]

                var interpolation = 1-((rotatedSelfPos.x-(rotatedLine[0].x))/(rotatedLine[1].x-(rotatedLine[0].x)))


                var staticV = 0.5//(closestLine[0].mass.static^this.mass.static)?1:(!closestLine[0].mass.static&!this.mass.static)?0:0


                var diff = clamp(Math.abs(((rotatedLine[0].y+rotatedLine[1].y)/2)-rotatedSelfPos.y), 0, Infinity)


                rotatedSelfPos.y -= diff*staticV//(rotatedLine[0].y+rotatedLine[1].y)/2



                var newSelfPos = r(rotatedSelfPos, -1)

                rotatedLine[0].y+=diff*staticV*interpolation
                rotatedLine[1].y+=diff*staticV*(1-interpolation)


                var newRotatedLine1 = r({...rotatedLine[0]},-1),
                    newRotatedLine2 = r({...rotatedLine[1]},-1)

                if (true) {
                    closestLine[0].pos = newRotatedLine1
                    closestLine[1].pos = newRotatedLine2
                }

                if (true) {
                    this.pos = newSelfPos
                }






                //============velocturts===============

                var selfVel = r(this.vel),
                    lineAverageVel = r(v(
                        (closestLine[0].vel.x+closestLine[1].vel.x)/2,
                        (closestLine[0].vel.y+closestLine[1].vel.y)/2,
                    )),
                    rotatedLineAverageVel = r({...lineAverageVel})

                var resistution = 0.05//0.25

                var mass1 = closestLine[0].mass.mass,
                        mass2 = this.mass.mass,

                    massDistribution1 = 1,
                    massDistribution2 = 1

                if (mass1 > mass2) {
                    var split = mass2/mass1
                    massDistribution1 = split
                    massDistribution2 = 1-split
                } else {
                    var split = mass1/mass2
                    massDistribution2 = split
                    massDistribution1 = 1-split
                }

                rotatedLineAverageVel.x*=-resistution*massDistribution1
                selfVel.x*=-resistution*massDistribution2



                var rotatlineAverageVel = r({...rotatedLineAverageVel},-1)

                closestLine[0].vel = {...rotatlineAverageVel}
                closestLine[1].vel = {...rotatlineAverageVel}


                this.vel = selfVel




                //console.log(diff)

                //console.log(diff)

                


            }

            
        }
    
    }
    updatePointNeighbourConstraints() {
        var addition = v(0,0),
        fp = (nei) => {
            var newA = this.updatePointToPointConstraints(nei.point2.pos, nei.length, this.mass.world.options.neighbourStrength*5)
            addition.x += newA.x
            addition.y += newA.y
        }
        fp(this.neighbours[0])
        fp(this.neighbours[1])

        return addition
    }
    updatePointToPointConstraints(point2, length=0, strength=1) {
        var dst = getDst(this.pos, point2),
            strength = -clamp(Math.pow(length-dst, 2)/9, -(length-dst)*3,(length-dst)*2)*strength

        var angle = ((-getAngle(this.pos, point2)+90)*(Math.PI/180))

        return v(
            -Math.cos(angle)*strength,
            -Math.sin(angle)*strength
        )
                
    }
    getTranslatedStartPos() {
        var translatedPos = v(
            (this.startPos.x+this.mass.averagePoint.x),
            (this.startPos.y+this.mass.averagePoint.y),
        ),
            rotatedPos = rotate(
                this.mass.averagePoint.x,this.mass.averagePoint.y,
                translatedPos.x, translatedPos.y,
                this.mass.averageRot
                )
        return rotatedPos
    }
    updatePointRigdBodyClone() {
        
        return this.updatePointToPointConstraints(
            this.getTranslatedStartPos(),
            0,
            this.mass.world.options.shapeStrength*10)
    }

    updatePosition(masses, deltaTime) {


        this.pos.x += this.vel.x*deltaTime
        this.pos.y += this.vel.y*deltaTime
        
        this.updateFriction(deltaTime)
        this.updateNeighbourDampening(deltaTime)

        for (let i = 0; i < masses.length; i++) {
            const mass = masses[i];
            if (mass.id != this.mass.id) {
                this.updatePointToMassCollision(mass)
            }

            
        }

    }
    updateFriction(deltaTime) {
        var trueDeltaTime = (deltaTime*100),
            frictionAir = this.mass.world.options.frictionAir

        var maxVel = 600

        this.vel = v(
            clamp(this.vel.x*(Math.pow(frictionAir, trueDeltaTime)), -maxVel, maxVel),
            clamp(this.vel.y*(Math.pow(frictionAir, trueDeltaTime)), -maxVel, maxVel)
        )
    }
    updateNeighbourDampening(deltaTime) {
        var fp = (nei) => {
            //=======position============
            var point1 = this,
                point2 = nei.point2
            var angle = (-getAngle(point1.pos, point2.pos)+90)*(Math.PI/180)

            var rotPoint1 = rotate(0,0,point1.pos.x,point1.pos.y,angle),
                rotPoint2 = rotate(0,0,point2.pos.x,point2.pos.y,angle)

            var currentLength = Math.abs(rotPoint2.x-rotPoint1.x),
                targetLength = nei.length

            var difference = targetLength-currentLength

            //=======veloctiy============

            var vel1 = this,
                vel2 = {...this.mass.averageVelocity}

            var rotVel = rotate(0,0,vel1.vel.x,vel1.vel.y,angle),
                rotVel2 = rotate(0,0,vel2.x,vel2.y,angle),


            //averageVel = rotVel2

            rotVel = v(rotVel.x-rotVel2.x,rotVel.y-rotVel2.y)


            rotVel.x *= 0.97
            rotVel.y *= 0.97

            rotVel = v(rotVel.x+rotVel2.x,rotVel.y+rotVel2.y,)

            var newVel = rotate(0,0,rotVel.x,rotVel.y,-angle)

            this.vel = newVel
            

            if (window.testMass) if (this.mass.id == window.testMass.id) {
            }
        }
        fp(this.neighbours[0])
        fp(this.neighbours[1])
    }
}

class PointConnection {
    constructor(point1, point2) {
        this.point1 = point1
        this.point2 = point2

        this.length = getDst(this.point1.pos, this.point2.pos)
    }
    
}

class PointMass {
    constructor(world, points, options={}) {
        this.world = world
        this.points = points
        this.id = self.crypto.randomUUID()
        this.static = false

        this.options = {
            mass:1,
            render:{
                fill:"#222",
            },
            ...options,
        }

        this.render = this.options.render

        this.mass = this.options.mass
        this.averagePoint = v()
        this.calculateAveragePosition()
        this.startAveragePoint = {...this.averagePoint}

        this.averageVelocity = v()
        this.calculateAverageVelocity()

        this.averageRot = 0
        this.calculateAverageRotation()
        this.startAverageRot = this.averageRot

        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            p.mass = this
            p.index = i
            p.startPos = v(
                p.pos.x-this.startAveragePoint.x,
                p.pos.y-this.startAveragePoint.y,
            )
            p.startRot = (-getAngle(p.startPos, this.startAveragePoint)+90)*(Math.PI/180)
            p.neighbours = [
                new PointConnection(p, this.points[stopOverflow(i-1, this.points.length)]),
                new PointConnection(p, this.points[stopOverflow(i+1, this.points.length)])
            ]
        }
        

    }

    calculateAveragePosition() {
        var av = v()
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            av.x+=p.pos.x
            av.y+=p.pos.y
        }
        var av = v(
            av.x/this.points.length,
            av.y/this.points.length,
        )
        this.averagePoint = (this.static&&this.averagePoint!=undefined)?this.averagePoint:{...av}
        return this.averagePoint
    }
    calculateAverageVelocity() {
        var av = v()
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            av.x+=p.vel.x
            av.y+=p.vel.y
        }
        var av = v(
            av.x/this.points.length,
            av.y/this.points.length,
        )
        this.averageVelocity = {...av}
        return this.averageVelocity
    }

    calculateAverageRotation() {
        var rotations = new Array()
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            rotations.push(
                -(((-getAngle(p.pos, this.averagePoint)+90)*(Math.PI/180))+(-((-getAngle(p.startPos, v())+90)*(Math.PI/180))))
                )
        }
        this.averageRot = (this.static)?0:(averageAngles(rotations))
        if (window.testMass) if (this.id == window.testMass.id) {
            //console.log((averageAngles(rotations)/(Math.PI/180)))

            //console.log(rotations.map((r)=>{return r/(Math.PI/180)}))
            //console.log(this.averageRot/(Math.PI/180))
        }
        return this.averageRot
    }

    getLines() {
        var lines = new Array(),
            points = this.points
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                var p2 = points[stopOverflow(i+1, points.length)]
                lines.push([p,p2])
            }
            return lines
    }

    testCollision(point) {

        var points = [...this.points],
            connections = (()=>{
                let con = new Array()
                for (let i = 0; i < this.points.length; i++) {
                    const point = this.points[i];
                    var nextPoint = this.points[stopOverflow(i+1,this.points.length)]
                    con.push([point, nextPoint])
                }
                return con
            })();

            //console.log(points, connections)
        return false
    }
}