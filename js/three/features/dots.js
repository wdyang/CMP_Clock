// var THREE = require('three');

var hideOutPosition = new THREE.Vector3(-10000, 0, 0)
var hideOutColor = new THREE.Color(0xFF8800)
var hideOutSize = 0
const defaultSize = 15

class Dots {
	constructor(scene, maxNumNode) {
		this.maxNumNode = maxNumNode
		this.scene = scene
		this.pcPositions = new Float32Array( this.maxNumNode  *  3 )
		this.pcColors = new Float32Array( this.maxNumNode  *  3 )
		
		this.pcKind = new Float32Array(this.maxNumNode)
		this.treeIds = []
		this.humanIds = []
		this.alpha = new Float32Array(this.maxNumNode)
		this.pcSizes = new Float32Array( this.maxNumNode )
		this.skipSizeCheck = []		
		this.points = null
		this.numNode = 0

		this.humanPercent = 0
		this.targetHumanPercent = 0
		this.population = 1
		this.targetPopulation = 1

		this.time = 0

		for (var i = 0; i < this.maxNumNode; i++ ) {
			//[lon, lat, size]
			var vertex = hideOutPosition.clone();
			vertex.toArray(this.pcPositions, i * 3);
			var pcColor = new THREE.Color(0xFFFFFF); //0xff660e for external
			pcColor.toArray(this.pcColors, i * 3);

			this.alpha[i] = 1
			this.pcSizes[i] = defaultSize
			this.skipSizeCheck[i] = false
			this.pcKind[i] = 0
			// this.treeIds.push(i)
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

	setTarget(target){
		this.targetHumanPercent = target.land_percent
		this.targetPopulation = target.population_change
		// console.log(target.population_change)
		// this.humanIds.forEach(id=>{
		// 	this.pcSizes[id] = defaultSize * this.targetPopulation / this.targetHumanPercent / 5.0
		// })
		// this.pcGeometry.attributes.size.needsUpdate = true
	}

	makeAllTree(){
		this.treeIds.length = 0
		this.humanIds.length = 0
		for(let i = 0; i< this.numNode; i++){
			this.pcKind[i] = 0;
			this.treeIds.push(i)
		}
		
		this.pcGeometry.attributes.kind.needsUpdate = true
		this.humanPercent = 0
	}

	addRandomHuman(){
		// console.log('add human')
		if(this.treeIds.length > 0) { // if there is no tree left, we stop
			let idx = Math.floor(Math.random()*this.treeIds.length)
			let drop = this.treeIds.splice(idx, 1) // this should shrink treeIds array
			this.humanIds.push(drop)
			this.skipSizeCheck[drop] = true
			let x={t:0}
			new TWEEN.Tween(x).to({t:1}, 3000)
			.onUpdate(()=>{
				this.pcKind[drop] = x.t
				let s = x.t > 0.5 ? 1.0-x.t : x.t
				this.pcSizes[drop] = defaultSize  * (1+3*s + 0.5*x.t)
				this.pcGeometry.attributes.kind.needsUpdate = true
				this.pcGeometry.attributes.size.needsUpdate = true
			}).start()
			.onComplete(()=>{
				this.skipSizeCheck[drop] = false
			})
		}
	}

	addRandomTree(){
		if(this.humanIds.length > 0) { // if there is no human left, we stop
			let idx = Math.floor(Math.random()*this.humanIds.length)
			let drop = this.humanIds.splice(idx, 1) // this should shrink treeIds array
			this.treeIds.push(drop)
			let x={t:0}
			new TWEEN.Tween(x).to({t:1}, 3000)
			.onUpdate(()=>{
				this.pcKind[drop] = 1.0-x.t
				let s = x.t > 0.5 ? 1.0-x.t : x.t
				this.pcSizes[drop] = defaultSize  * (1+3*s + 0.5*x.t)
				this.pcGeometry.attributes.kind.needsUpdate = true
				this.pcGeometry.attributes.size.needsUpdate = true
			}).start()
		}
	}

	makeAllHuman(){
		this.treeIds.length = 0
		this.humanIds.length = 0
		for(let i = 0; i< this.numNode; i++){
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

		this.humanPercent = this.humanIds.length * 1.0 / this.numNode
		if(this.humanPercent < this.targetHumanPercent){
			let chance = Math.random()
			if(chance > 0.2){
				this.addRandomHuman()
			}
		}else if(this.humanPercent > this.targetHumanPercent + 0.0022){
			let chance = Math.random()
			if(chance > 0.2){
				this.addRandomTree()
			}
		}

		if(Math.abs(this.population - this.targetPopulation) > 0.001){
			this.population += 0.1*(this.targetPopulation - this.population)
			this.humanIds.forEach(id=>{
				if(!this.skipSizeCheck[id])
					// not exact sqrt, to add a bit drama
					this.pcSizes[id] = defaultSize * Math.pow(this.population / this.targetHumanPercent, 0.7) / 2.5
			})
			this.pcGeometry.attributes.size.needsUpdate = true
	}

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
			attributes.size.array[i] = defaultSize;
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

		this.makeAllTree()
	}	
}

var colorFn = function(x) {
	var c = new THREE.Color(0xFF8800);
	// c.setHSL( ( 0.6 - ( x  *  0.5 ) ), 1.0, 0.5 );
	return c;
};

// export default Dots;