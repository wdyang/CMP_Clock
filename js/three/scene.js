// var THREE = require('three');

// var OrbitControls = require('three-orbit-controls')(THREE);

// import Dots from './features/dots'
// import Earth from './features/earth'

// import CameraControl from './camera/cameraControl'

// import Common from './../util/Common'
// import config from './../../config/defaults'

class Scene {
	constructor() {
		this.renderer = null;
		this.scene = null;
		this.camera = null;
		this.controls = null;

		this.container;
		this.w;
		this.h;

		this.pts = [];
		this.layers = [];

		this.stats = null;

		// this.prevLocation = '';
		// this.prevTimezone = '';
	}
	initScene( statsEnabled) {
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		this.w = window.innerWidth || 2;
		this.h = window.innerHeight || 2;

		// this.w = this.container.width();
		// this.h = this.container.height();

		/// Global : this.renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		
		this.renderer.setClearColor( 0x101030, 1 );
		this.renderer.setSize( this.w, this.h );

		this.renderer.shadowMap.enabled = true;
		// to antialias the shadow
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

		/// Global : this.scene
		this.scene = new THREE.Scene();

		/// Global : this.camera
		this.camera = new THREE.PerspectiveCamera( 20, this.w / this.h, 0.1, 200000 );

		var src = new THREE.Vector3(0, 0, 1000)

		this.camera.position.copy(src);
		this.camera.position.z = 1200
		this.camera.up.set(0,1,0);

		this.camera.lookAt(new THREE.Vector3(0,0,0));

		// this.camera.location = [startPos.lat, startPos.lon];
		// this.camera.timezone = Common.getTZ(startPos.lat, startPos.lon);
		// this.camera.prevPosition = this.camera.position.clone();

		this.scene.add( this.camera );

		this.initLights(this.scene, this.camera);

		//orbit control
		this.controls = new THREE.OrbitControls(this.camera)

		this.controls.enableDamping = false;
		// this.controls.enableZoom = (inputs.indexOf("mouse")>=0);
		// this.controls.enableRotate = (inputs.indexOf("mouse")>=0);
		// this.controls.enablePan = (inputs.indexOf("mouse")>=0);
		
		this.controls.autoRotate = false;
		
		this.controls.enableKeys = false;

		this.stats = new Stats();
		if (statsEnabled) {
			this.stats.dom.id = "stats";
			this.container.append( this.stats.dom );
		}

		//attach this.renderer to DOM
		this.container.append( this.renderer.domElement );

		this.clock = new THREE.Clock();

		this.earth = new Earth(this.scene, 10000);
		this.dots = new Dots(this.scene, 4000);
		
		if (this.earth && this.earth.mesh) {
			this.earth.mesh.position.set(0, 0, 0);
		}
		
		// hide them for now
		// this.earth.mesh.visible = false

		this.cameraControl = new CameraControl(this.scene, this.camera, this.controls);

		//initiating renderer
		this.render();

		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

	}

	initLights(scene, camera) {
		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6250011825856442, 60.75949367088608, 30.980392156862745 );
		hemiLight.groundColor.setHSL( 4.190951334017909e-8, 33.68421052631579, 37.254901960784316 );
		hemiLight.position.set( 0, 500, 0 );
		scene.add( hemiLight );

		var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		dirLight.position.set( -1, 0.75, 1 );
		dirLight.position.multiplyScalar( 50);
		dirLight.name = 'dirlight';

		this.scene.add( dirLight );

		dirLight.castShadow = true;

		dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 1024 * 2;

		var d = 300;

		dirLight.shadow.camera.left = -d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = -d;

		dirLight.shadow.camera.far = 3500;
		dirLight.shadow.bias = -0.0001;
		dirLight.shadow.darkness = 0.35;

		dirLight.shadow.camera.visible = true;
		
	}

	flyTo(lat, lon, radius, look, cb) {
		this.controls.autoRotate = false;
		$('.globeDonutBox').fadeOut();
		$('.globalCallDisplay > div.numberDisplayBox > div.smallCube').fadeOut();

		var trg = Common.convertLatLonToVec3(lat,lon,radius);
		
		this.cameraControl.fly_to(
			trg,
			new THREE.Vector3(0,0,0),
			look,
			TWEEN.Easing.Quadratic.InOut,
			'path',
			3000,
			radius,
			cb
		);
	}

	toggleDots() {
		this.dots.toggleVisible();
	}

	toggleRotation() {
		this.controls.autoRotate = !this.controls.autoRotate;
	}

	shouldUpdateTimezone() {
		if (this.camera.position.distanceTo(this.camera.prevPosition)>500) {
			// update lat long based on camera location
			var location = Common.convertVec3ToLatLon(this.camera.position.clone());
			this.camera.location = location;
			this.camera.prevPosition = this.camera.position.clone();
			
			// update timezone based on camera location
			var timezone = Common.getTZ(location[0],location[1]);
			if (timezone !== this.camera.timezone) {
				if (this.camera.updateTimezone) {
					this.camera.updateTimezone(timezone);
				}
			}
			this.camera.timezone = timezone;
		}
	}

	render() {
		this.controls.update();
		
		TWEEN.update();

		if(this.dots){
			this.dots.update(this.clock.getElapsedTime());
		}

		if(this.earth){
			this.earth.update(this.clock.getElapsedTime());
		}

		this.renderer.render( this.scene, this.camera );

		this.stats.update();

		requestAnimationFrame(this.render.bind(this));
	}

	onWindowResize() {
		this.w = 1920;//this.container.width();
		this.h = 1080;//this.container.height();
		
		this.camera.aspect = this.w / this.h;
		this.camera.updateProjectionMatrix();
		
		this.renderer.setSize( this.w, this.h );
	}
}

// export default Scene;