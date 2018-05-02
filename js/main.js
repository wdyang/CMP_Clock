// let projection = d3.geoNaturalEarth1()
let projection = d3.geoProjection

var A = 4 * pi + 3 * sqrt(3)
var B = 2 * sqrt(2 * pi * sqrt(3) / A)

var wagner4Raw = mollweideBromleyRaw(B * sqrt(3) / pi, B, A / 6);


var wagner6Raw = function(lambda, phi) {
	return [lambda * sqrt(1 - 3 * phi * phi / (pi * pi)), phi];
  }
  
  wagner6Raw.invert = function(x, y) {
	return [x / sqrt(1 - 3 * y * y / (pi * pi)), y];
  };

var wagner4Projection = projection(wagner4Raw)//.scale(176.84);
  
var wagner6Projection = projection(wagner6Raw)//.scale(152.63)

var azimuthalEqualAreaProjection = projection(azimuthalEqualAreaRaw)
.scale(124.75)
.clipAngle(180 - 1e-3);


$(document).ready(()=>{
    SHADER_LOADER.load(shaders=>{
        console.log("shader loaded")
        window.SHADERS = shaders

        this.scene = new Scene()
        window._scene = this.scene
        this.scene.initScene(true)

		let _globeData = _.filter(globeData, 
			x=> x[1]%3==0 && x[2]%(3+Math.round(Math.abs(x[1]*x[1])/1000))==0)
		window._globeDataOrg = _globeData
					
		_globeData=_globeData.map(x=>azimuthalEqualAreaProjection([x[2], [x[1]]]))
			.map(x=>[-x[1]+250, x[0]-400])

		window._globeData = _globeData

		if (this.scene.dots) {
			this.scene.dots.updateFromElevationData(_globeData);
		}

		if (this.scene.spikes) {
			this.scene.spikes.updateFromElevationData(_globeData);
		}

		if (this.scene.globe) {
			this.scene.globe.updateFromElevationData(_globeData);
		}



        setTimeout(()=>{
            setInterval(()=>{_scene.dots.addRandomHuman()}, 30)
        }, 2000)
    })
})