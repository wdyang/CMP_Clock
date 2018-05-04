"use strict";

const SpeedUp = 26 // set this to 1 for final play

// p_change => population_change

class Playback{
	constructor(){
		this.data = null
		this.getData()
			.then(d=>{this.data = d})
			.then(()=>{this.playback()})
	}
	getData(){
		return new Promise((resolve, reject)=>{
			$.get('data/all_data.csv', data=>{
				let res = _.filter(csvToObjectArray(data), d=>d.Seconds!==undefined)
				res.forEach(d=>{
					d.Year = parseInt(d.Year)
					d.Seconds = parseInt(d.Seconds)
					d.land_percent = d.RCP == 'RCP 2.6' ? parseFloat(d.land_percent_26) : parseFloat(d.land_percent_85)
					d.population_change = d.RCP == 'RCP 2.6' ? parseFloat(d.p_change_26) : parseFloat(d.p_change_85)
					d.co2 = d.RCP == 'RCP 2.6' ? parseFloat(d.co2_26) : parseFloat(d.co2_85)
					d.co2_change = d.RCP == 'RCP 2.6' ? parseFloat(d.co2_change_26) : parseFloat(d.co2_change_85)
				})
				let maxCO2 = _.max(res.map(d=>d.co2))
				res.forEach(d=>{
					let co2_scaled = d.co2 / maxCO2
					d.co2_scaled = Math.sign(co2_scaled) * Math.pow(Math.abs(co2_scaled), 0.8)
				})
				resolve(res)
			})	
		})
	}

	playback(){
		_scene.clock.start()
		_.forEach(this.data, (d, idx)=>{
			let t0 = d.Seconds/SpeedUp // in seconds
			let theta0 = (d.Year - 1880) / 200 * 2 * Math.PI
			let t1 = t0
			let theta1 = theta0

			if(idx<this.data.length-1){
				t1 = this.data[idx+1].Seconds/SpeedUp
				theta1 = (this.data[idx+1].Year - 1880) / 200 * 2 * Math.PI
			}

			setTimeout(()=>{
				// console.log(idx, d.Year)
				_scene.worldClock.setPosition(t0, theta0, t1, theta1)
				_scene.worldClock.setCO2(d.co2_scaled)
				// _scene.dots.setTargetHumanPercent(d.land_percent)
				_scene.dots.setTarget({land_percent: d.land_percent, population_change: d.population_change})

				$('#Year').text("Year " + d.Year)
				$('#RCP').text("RCP scenerio: "+d.RCP)
				$('#Population').text("Population vs year 1880: " + Math.round(d.population_change*100)/100 + "x")
				$('#LandUse').text("Human land use: "+Math.round(d.land_percent*1000)/10+"% of total land")
				$('#Co2Base').text("CO2 Emission at 1880: "+this.data[0].co2)
				$('#Co2').text("CO2 Emission: "+Math.round(d.co2) + ", vs 1880: "+ Math.round(d.co2_change*100)/100 + "x")
			}, t0*1000)
		})
	}
}