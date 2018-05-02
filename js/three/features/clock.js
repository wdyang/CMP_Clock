


class Clock{
    constructor(scene){
        this.scene = scene

        this.add_back()
        this.add_ring()

        _.range(0, 8).forEach(x=>this.add_tick(290, Math.PI * x / 4))
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
        this.scene.add(this.handle)
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
        mesh.position.z = 1
        mesh.position.y += r*Math.cos(theta)
        mesh.position.x += r*Math.sin(theta)
        mesh.rotateZ(-theta)
        this.scene.add( mesh );
    }
    add_back(){
        var geometry = new THREE.CircleGeometry( 300, 32 );
        var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.z = -2
        this.scene.add( mesh );
    }
    add_ring(){
        var geometry = new THREE.RingGeometry( 280, 350, 128 );
        var material = new THREE.MeshBasicMaterial( { color: 0x9FD9D6, side: THREE.DoubleSide } );
        var mesh = new THREE.Mesh( geometry, material );
        this.scene.add( mesh );
    }

    update(){
        this.handle.rotateZ(-0.002)
    }
}