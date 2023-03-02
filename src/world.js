class World {
    constructor(options) {
        this.pointMasses = new Array()

        this.options = {
            gravity:{
                x:0,
                y:1,
                constant:0.981,
                scale:1,
            },

            frictionAir:0.99,

            neighbourStrength:1,
            shapeStrength:1,

            ...options,
        }
    }
    getWorldPoints() {
        var points = new Array()

        for (let i = 0; i < this.pointMasses.length; i++) {
            const mass = this.pointMasses[i];
            points = [...points, ...mass.points]
        }

        return points
    } 

    addPointMass(points, options) {
        points = points.map((p)=>{return new Point(p)})
        var newMass = new PointMass(this, points, options)
        this.pointMasses.push(newMass)
        return newMass
    }
}