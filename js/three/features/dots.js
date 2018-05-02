// var THREE = require('three');

var hideOutPosition = new THREE.Vector3(0, 0, 0)
var hideOutColor = new THREE.Color(0xFF8800)
var hideOutSize = 0

class Dots {
	constructor(scene, maxNumNode) {
		this.maxNumNode = maxNumNode
		this.scene = scene
		this.pcPositions = new Float32Array( this.maxNumNode  *  3 )
		this.pcColors = new Float32Array( this.maxNumNode  *  3 )
		
		this.pcKind = new Float32Array(this.maxNumNode)
		this.treeIds = []
		this.alpha = new Float32Array(this.maxNumNode)
		this.pcSizes = new Float32Array( this.maxNumNode )		
		this.points = null
		this.numNode = 0

		this.time = 0

		for (var i = 0; i < this.maxNumNode; i++ ) {
			//[lon, lat, size]
			var vertex = new THREE.Vector3(0, 0, 0);
			vertex.toArray(this.pcPositions, i * 3);
			var pcColor = new THREE.Color(0xFFFFFF); //0xff660e for external
			pcColor.toArray(this.pcColors, i * 3);

			this.alpha[i] = 1
			this.pcSizes[i] = 8
			this.pcKind[i] = 0
			this.treeIds.push(i)
		}

		this.pcGeometry = new THREE.BufferGeometry();
		this.pcGeometry.addAttribute('position', new THREE.BufferAttribute(this.pcPositions, 3 ));
		this.pcGeometry.addAttribute('customColor', new THREE.BufferAttribute(this.pcColors, 3 ));

		this.pcGeometry.addAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1 ));
		this.pcGeometry.addAttribute('size', new THREE.BufferAttribute(this.pcSizes, 1 ));
		this.pcGeometry.addAttribute('kind', new THREE.BufferAttribute(this.pcKind, 1 ));
	  
		this.uniforms = {
			time: { type: 'f', value: 0 },
			color:   { type: 'c', value: new THREE.Color( 0xffffff ) },
			// icons is mix of 4 icons
			texture: { type: 't', value: new THREE.TextureLoader().load( 'images/icons.png' ) }
		}

		var pcMaterial = new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: SHADERS.dot.vertex,
			fragmentShader: SHADERS.dot.fragment,
			transparent: true,
			alphaTest: 0.1
		} );

		this.points = new THREE.Points(this.pcGeometry, pcMaterial);
		this.points.position.set(0, 0, 0)
		
		window.points = this.points;
		this.points.frustumCulled = false;
		this.points.visible = true;
		this.scene.add(this.points);

		// this.points.rotation.set(0,Math.PI,0);

	}

	makeAllTree(){
		this.treeIds.length = 0
		for(let i = 0; i< this.maxNumNode; i++){
			this.pcKind[i] = 0;
			this.treeIds.push(i)
		}
		
		this.pcGeometry.attributes.kind.needsUpdate = true
	}

	addRandomHuman(){
		// console.log('add human')
		if(this.treeIds.length > 0) { // if there is no tree left, we stop
			let idx = Math.floor(Math.random()*this.treeIds.length)
			let drop = this.treeIds.splice(idx, 1) // this should shrink treeIds array
			this.pcKind[drop] = 1
			this.pcGeometry.attributes.kind.needsUpdate = true
		}
	}

	makeAllHuman(){
		this.treeIds.length = 0
		for(let i = 0; i< this.maxNumNode; i++){
			this.pcKind[i] = 1;
		}
		this.pcGeometry.attributes.kind.needsUpdate = true
	}

	toggleVisible() {
		this.points.visible = !this.points.visible;
	}

	update(time) {
		this.time = time
		this.uniforms.time.value  = time
	}

	// move nodes up so edges is always under, this should be removed for 3D render
	setZ(cameraZ) {
		var z = 1e-5 * (1.0 + cameraZ * cameraZ)
		z = Math.min(z, cameraZ / 10.0)
		if (RootObj.graphLayout.force2d) {
			// console.log('node cloud moves to ', z)
			this.points.position.set(0, 0, z)
		}
	}

	clear() {
		this.clearNodes(0, this.numNode)
	}

	clearNodes(from, to) {
		var attributes = this.pcGeometry.attributes;
		// debugger
		for (var i = from; i < to; i++ ) {
			attributes.position.array[3 * i] = hideOutPosition.x;
			attributes.position.array[3 * i + 1] = hideOutPosition.y;//(n.position.y/18) + 0.95;
			attributes.position.array[3 * i + 2] = hideOutPosition.z;

			attributes.size.array[i] = hideOutSize
			// We use node color to simplify it
			attributes.customColor.array[3 * i] = hideOutColor.r
			attributes.customColor.array[3 * i + 1] = hideOutColor.g
			attributes.customColor.array[3 * i + 2] = hideOutColor.b
		}
		attributes.position.needsUpdate = true;
		attributes.size.needsUpdate = true;
		attributes.customColor.needsUpdate = true;

		this.pcGeometry.verticesNeedUpdate = true;
	}
	
	updateFromElevationData(data) {
		var previousNumNode = this.numNode

		this.numNode = data.length
		if (this.numNode > this.maxNumNode) {
			console.log('!!!!! Max num node exceeded')
			this.numNode = this.maxNumNode
		}
		var attributes = this.pcGeometry.attributes;

		for (var i = 0; i < this.numNode; i++ ) {
			attributes.position.array[3 * i] = data[i][0]; //lat
			attributes.position.array[3 * i + 1] = data[i][1]; // lon
			attributes.position.array[3 * i + 2] = 0; //z is zero, ground

			// sizeScale for animation
			// mouseoverScale for mouseover
			// attributes.size.array[i] = Math.sqrt(data[3 * i + 2] * 100) + 5;
			attributes.size.array[i] = 15;
			// We use node color to simplify it
			var c = colorFn(data[i][0])
			attributes.customColor.array[3 * i] = c.r
			attributes.customColor.array[3 * i + 1] = c.g
			attributes.customColor.array[3 * i + 2] = c.b

			// attributes.ringColor.array[3 * i] = c.r
			// attributes.ringColor.array[3 * i + 1] = c.g
			// attributes.ringColor.array[3 * i + 2] = c.b

			attributes.alpha.array[i] = 1.0
		}

		// remove extra nodes
		if (previousNumNode > this.numNode) { 
			this.clearNodes(this.numNode, previousNumNode)
		}

		attributes.position.needsUpdate = true;
		attributes.size.needsUpdate = true;
		attributes.customColor.needsUpdate = true;
		// attributes.ringColor.needsUpdate = true;
		attributes.alpha.needsUpdate = true;

		this.pcGeometry.verticesNeedUpdate = true;
	}	
}

var colorFn = function(x) {
	var c = new THREE.Color(0xFF8800);
	// c.setHSL( ( 0.6 - ( x  *  0.5 ) ), 1.0, 0.5 );
	return c;
};

// export default Dots;