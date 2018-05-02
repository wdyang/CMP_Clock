// var THREE = require('three');
// import TWEEN from 'tween'

var AnimateAlongSpline = function(scene, controls, camera, sPos, tPos, lookAt, params) {
	this.scene = scene;
	this.controls = controls;
	this.camera = camera;
	this.sPos = sPos;
	this.tPos = tPos;

	this.lookAt = lookAt;

	this.arcHeight = params.arcHeight || 0.75;
	this.visible = params.visible || false;

	this.animateLine = params.animateLine || false;
	this.animationType = params.animationType || 'linear';
	this.lineColor = params.lineColor || 0xFFFFFF;

	this.circle = null;

	this.easing = params.easing || TWEEN.Easing.Cubic.Out
	this.duration = params.duration || 3000;
	this.numPoints = (this.duration * 60 / 1000 + 60) * 2;
	this.focus = params.focus || null;
	this.delay = params.delay || 0;

	this.look = params.look || 'forward';

	this.creatures = params.creatures || null;

	this.tweens = [];
};

AnimateAlongSpline.prototype.hide = function() {
	this.line.visible = false;
	this.camera.visible = false;
	this.visible = false;
	if (this.animationType == 'multi') {
		this.line2.visible = false;
		if (this.circle) {
			this.circle.visible = false;
		}
	}
}

AnimateAlongSpline.prototype.show = function() {
	this.line.visible = true;
	this.camera.visible = true;
	this.visible = true;
	if (this.animationType == 'multi') {
		this.line2.visible = true;
	}
}

AnimateAlongSpline.prototype.greatCircleFunction = function(P, Q) {
	var angle = P.angleTo(Q);
	return function(t) {
		var X = new THREE.Vector3().addVectors(
			P.clone().multiplyScalar(Math.sin( (1 - t) * angle )), 
			Q.clone().multiplyScalar(Math.sin(      t  * angle ))
		)
		.divideScalar( Math.sin(angle) );
		return X;
	};
}

AnimateAlongSpline.prototype.createSphereArc = function(P, Q) {
	var sphereArc = new THREE.Curve();
	sphereArc.getPoint = this.greatCircleFunction(P, Q);
	return sphereArc;
}

AnimateAlongSpline.prototype.drawCurve = function(curve, color, numPoints, visible) {
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices = curve.getPoints(numPoints);
	
	var lineMaterial = new THREE.LineBasicMaterial();
	lineMaterial.color = (typeof (color) === 'undefined') ? new THREE.Color(0xFF0000) : new THREE.Color(color);
	var line = new THREE.Spline( lineGeometry.vertices );

	if (visible) {
		this.scene.add(new THREE.Line(lineGeometry, lineMaterial));
	}

	return line;
}

AnimateAlongSpline.prototype.start = function() {
	var scope = this;

	this.srcLook = this.controls.target.clone()

	this.spline = this.createSphereArc(this.sPos, this.tPos);
	this.spline = this.drawCurve( this.spline, this.lineColor, this.numPoints, this.visible);
		
	var objTween = new TWEEN.Tween({
		percent: 0,
		lookX:this.srcLook.x,
		lookY:this.srcLook.y,
		lookZ:this.srcLook.z
	})
	.to({
		percent: 1,
		lookX:this.lookAt.x,
		lookY:this.lookAt.y,
		lookZ:this.lookAt.z
	}, this.duration)
	.onUpdate(function() {
		if (!scope.camera) {
			return;
		}
		
		var currentPoint = scope.spline.getPoint(this.percent);
		
		scope.camera.position.copy(currentPoint);
		scope.camera.lookAt(new THREE.Vector3(this.lookX, this.lookY, this.lookZ));
	})
	.easing(this.easing)
	.delay(this.delay)
	.onComplete(function() {
		scope.controls.target.copy(scope.lookAt);
		scope._handleCallback(objTween);
	})
	.start();
	this.tweens.push[objTween];

	return this;
};

AnimateAlongSpline.prototype._handleCallback = function(tween) {
	if (this.tweens && this.tweens.length > 0) {
		for (var tempIndex in this.tweens) {
			this.tweens[tempIndex].stop();
		}
		this.tweens = [];
	}

	if (this.callback && (!this.tweens || this.tweens.length == 0)) {
		this.callback();
	}
};

AnimateAlongSpline.prototype.stop = function() {
	if (this.tweens && this.tweens.length > 0) {
		for (var tempIndex in this.tweens) {
			this.tweens[tempIndex].stop();
		}
		this.tweens = [];
	}
	this.destory();
};

AnimateAlongSpline.prototype.destory = function() {
	if (this.line) {
		this.scene.remove(this.line);
		this.line = null;
	}

	if (this.line2) {
		this.scene.remove(this.line2);
		this.line2 = null;
	}

	this.scene = null;
	this.controls = null;
	this.camera = null;
	this.sPos = null;
	this.tPos = null;
};

AnimateAlongSpline.prototype.onComplete = function(callback) {
	this.callback = callback;
	return this;
};

// export default AnimateAlongSpline