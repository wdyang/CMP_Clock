
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
        this.add_handle()
    }

    add_handle(){
        let shape = new THREE.Shape()

        shape.moveTo(-20, 0)
        shape.lineTo(-5, 300)
        shape.lineTo(5, 300)
        shape.lineTo(20, 0)
        shape.lineTo(-20, 0)

        var geometry = new THREE.ShapeGeometry( shape );
        var material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );

        this.handle = new THREE.Mesh(geometry, material)
        this.handle.position.z = 10
        this.group.add(this.handle)
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
    update(time){
        let axis = new THREE.Vector3(0, 0, -1)
        let angle = scaleMap(time, this.t0, this.t1, this.theta0, this.theta1)
        this.handle.setRotationFromAxisAngle(axis, angle)
    }
}