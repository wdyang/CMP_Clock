"use strict";

// return number of available days, descending order
function getDays(){
	var p = new Promise((resolve, reject)=>{
		$.ajax({
				type: 'GET',
				url: '/calls/days'
		})
		.done(res=>{
			console.log('Days loaded')
			let days = res.content.map(d=>d.day)
			resolve(days)
		})
		.fail(err=>{
			console.log('err')
			reject(err)
		})
	})
	return p
}

// return all data from one day
function getOneDayData(day){
	console.log("Geting one day data for "+day)
	var p = new Promise((resolve, reject)=>{
		$.ajax({
				type: 'GET',
				url: '/calls/byday/'+day
		})
		.done(res=>{
			console.log('Day loaded')
			resolve(res)
		})
		.fail(err=>{
			console.log('err')
			reject(err)
		})
	})
	return p	
}

// return last n days of data
function getNDayData(n){
	return getDays()
		.then(d=>{
			console.log('Available days:', d)
			return Promise.all(d.slice(0, n).map(x=>getOneDayData(x)))
		})
		.then(d=>{
			window._d = _.flatten(d.map(x=>x.content))
			return(_d)
		})
}

// getNDayData(7)
// .then(d=>console.log(_d.length, ' data returned'))

export { getDays, getOneDayData, getNDayData }