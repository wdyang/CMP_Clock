"use strict";

const SpeedUp = 26 // set this to 1 for final play

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
				console.log(idx, d.Year)
				_scene.worldClock.setPosition(t0, theta0, t1, theta1)

			}, t0*1000)
		})
	}
}