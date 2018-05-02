// var THREE = require('three');

const Shaders = {
	'earth' : {
		uniforms: {
			'texture': { type: 't', value: null }
		},
		vertexShader: [
			'varying vec3 vNormal;',
			'varying vec2 vUv;',
			'void main() {',
			'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position , 1.0 );',
			'	vNormal = normalize( normalMatrix * normal );',
			'	vUv = uv;',
			'}'
		].join('\n'),
		fragmentShader: [
			'uniform sampler2D texture;',
			'varying vec3 vNormal;',
			'varying vec2 vUv;',
			'void main() {',
			'	vec3 diffuse = texture2D( texture, vUv ).xyz;',
			'	float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
			'	vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
			'	gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
			'}'
		].join('\n')
	},
	'atmosphere' : {
		uniforms: {},
		vertexShader: [
			'varying vec3 vNormal;',
			'void main() {',
			'	vNormal = normalize( normalMatrix * normal );',
			'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join('\n'),
		fragmentShader: [
			'varying vec3 vNormal;',
			'void main() {',
			'	float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
			'	gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
			'}'
		].join('\n')
	}
};

var colorFn = function(x) {
	var c = new THREE.Color();
	c.setHSL( ( 0.6 - ( x * 0.5 ) ), 1.0, 0.5 );
	return c;
};

var imgDir = 'images/world/';
let center = new THREE.Vector3(0, 0, 0)

class Earth {
	constructor(scene) {
		this.scene = scene
		var loader = new THREE.TextureLoader();

		// load a resource
		loader.load(
			// resource URL
			imgDir + 'world.png',
			// Function when resource is loaded
			function( texture ) {
				let geometry = new THREE.SphereGeometry(200, 40, 30);

				let shader = Shaders['earth'];
				let uniforms = THREE.UniformsUtils.clone(shader.uniforms);

				uniforms['texture'].value = texture;//THREE.ImageUtils.loadTexture(imgDir+'world.png');

				let material = new THREE.ShaderMaterial({
					uniforms: uniforms,
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				});

				this.mesh = new THREE.Mesh(geometry, material);
				let s = 0.12
				this.mesh.scale.set(s,s,s) //hide it away for now
				this.mesh.rotation.y = Math.PI;
				this.scene.add(this.mesh);

				window.earth = this.mesh;
			}.bind(this));
	}

	update() {
		if(this.mesh !== undefined)
			this.mesh.rotateY(0.01)
	}
}

// export default Earth;