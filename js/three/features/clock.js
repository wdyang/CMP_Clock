
function scaleMap(x, in_min, in_max, out_min, out_max){
    if(x< in_min){
        return out_min
    }else if(x>in_max){
        return out_max
    }else{
        return out_min + (out_max-out_min) * (x - in_min) / (in_max-in_min)
    }
}

class Clock{
    constructor(scene){
        this.scene = scene
        this.group = new THREE.Group()
        let s = 0.9
        this.group.scale.set(s,s,s)
        this.scene.add(this.group)
        this.speed = 0
        this.t0 = 0
        this.t1 = 0
        this.theta0 = 0
        this.theta1 = 0

        this.add_back()
        this.add_ring()

        _.range(0, 8).forEach(x=>this.add_tick(285, Math.PI * x / 4))

        this.co2 = 0.3
        this.add_handle()
    }

    add_handle(){
        let midWidth = this.co2 * 5 + (1.0-this.co2)*20
        let midHeight = 300 * this.co2
        
        let shapeBase = new THREE.Shape()

        shapeBase.moveTo(-20, 0)
        shapeBase.lineTo(-midWidth, midHeight)
        shapeBase.lineTo(midWidth, midHeight)
        shapeBase.lineTo(20, 0)
        shapeBase.lineTo(-20, 0)

        var geometry = new THREE.ShapeGeometry( shapeBase );
        var material = new THREE.MeshBasicMaterial( { color: 0x00FF00 } );

        this.handleBase = new THREE.Mesh(geometry, material)
        this.handleBase.position.z = 10
        this.group.add(this.handleBase)

        let shapeTip = new THREE.Shape()
        shapeTip.moveTo(-midWidth, midHeight)
        shapeTip.lineTo(-5, 300)
        shapeTip.lineTo(5, 300)
        shapeTip.lineTo(midWidth, midHeight)
        shapeTip.lineTo(-midWidth, midHeight)

        geometry = new THREE.ShapeGeometry( shapeTip );
        material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );

        this.handleTip = new THREE.Mesh(geometry, material)
        this.handleTip.position.z = 10
        this.group.add(this.handleTip)

    }

    add_tick(r, theta){
        let tick = new THREE.Shape();

        tick.moveTo( -10, 0 );
        tick.lineTo(0, 50);
        tick.lineTo(10, 0);
        tick.lineTo(-10, 0);

        var geometry = new THREE.ShapeGeometry( tick );
        var material = new THREE.MeshBasicMaterial( { color: 0x2C4954 } );
        var mesh = new THREE.Mesh( geometry, material ) ;
        mesh.position.z = 3
        mesh.position.y += r*Math.cos(theta)
        mesh.position.x += r*Math.sin(theta)
        mesh.rotateZ(-theta)
        this.group.add( mesh );
    }
    add_back(){
        var geometry = new THREE.CircleGeometry( 300, 32 );
        var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.z = -2
        this.group.add( mesh );
    }
    add_ring(){
        var geometry = new THREE.RingGeometry( 280, 340, 128 );
        var material = new THREE.MeshBasicMaterial( { color: 0x9FD9D6, side: THREE.DoubleSide } );
        var mesh = new THREE.Mesh( geometry, material );
        this.group.add( mesh );
    }

    setPosition(t0, theta0, t1, theta1){
        this.t0 = t0
        this.t1 = t1
        this.theta0 = theta0
        this.theta1 = theta1
    }

    setCO2(co2){
        this.co2 = co2
        let x = Math.abs(co2)*0.9+0.1 //set min at 0.15
        let midWidth = x * 5 + (1.0-x)*20
        let midHeight = 300 * x
        
        let vertices = this.handleBase.geometry.vertices
        vertices[1].x = -midWidth
        vertices[1].y = midHeight
        vertices[2].x = midWidth
        vertices[2].y = midHeight
        this.handleBase.geometry.verticesNeedUpdate = true

        if(this.co2 > 0){
            this.handleBase.material.color.r = 0.9
            this.handleBase.material.color.g = 0.6
            this.handleBase.material.color.b = 0.2
        }else{
            this.handleBase.material.color.r = 0
            this.handleBase.material.color.g = 1
            this.handleBase.material.color.b = 0
        }
        // this.handleBase.material.colorNeedsUpdate = true

        vertices = this.handleTip.geometry.vertices
        vertices[0].x = -midWidth
        vertices[0].y = midHeight
        vertices[3].x = midWidth
        vertices[3].y = midHeight
        this.handleTip.geometry.verticesNeedUpdate = true
    }
    update(time){
        let axis = new THREE.Vector3(0, 0, -1)
        let angle = scaleMap(time, this.t0, this.t1, this.theta0, this.theta1)
        this.handleBase.setRotationFromAxisAngle(axis, angle)
        this.handleTip.setRotationFromAxisAngle(axis, angle)
    }
}