'use strict'

import _ from 'lodash'
window._ = _;

import moment from 'moment-timezone'

import Common from './../util/Common'
import config from './../config/defaults'

class DataOps {
	constructor() {
		this.data = [];
		this.regionCalls = {};
		this.regionCallsDate = {};
		this.dateRange = [0,0];
		this.regionDays = {};
		this.regionPeaksTotal = {};
		this.regionIncoming = {};
		this.regionOutgoing = {};
		this.maxCount = 0
	}

	addData(d) {
		this.data = _.concat(this.data, _.filter(d, (d0) => {
			return d0.continent !== null;
		} ));

		this.maxCount = _.max([this.maxCount, ...this.data.map(d=>d.count)])
		window._d = this.data;
		return this.data;
	}

	getGlobalDurationsObj() {
		var idx = -1;
		var order = ["10secs_2min", "2min_10min", "10min_1hr", "1hr_2hr", "2hr_+",];
		return _.sortBy(_.map(this.getGlobalDurations(), function(dur) {
			return {title: dur.key, x: order.indexOf(dur.key), y: dur.val};
		}), "x");
	}

	getGlobalDurations() { // get list of all call type arrays
		if (this.globalDurations) {
			return this.globalDurations;
		} else {
			var durations = _.map(_.groupBy(this.data, x=>{return x.duration}), (list, key)=>{
				return {
					key: key,
					val: _.sumBy(list, l=>{return parseInt(l.count)})
				};
			});
			return this.globalDurations = durations;
		}
	}

	getTypeLists() { // get list of all call type arrays
		if (this.globalTypeLists) {
			return this.globalTypeLists;
		} else {
			var types = _.map(_.groupBy(this.data, x=>{return x.ua_type}), (list, key)=>{
				return {
					key: key,
					val: _.sumBy(list, l=>{return parseInt(l.count)})
				};
			});
			return this.globalTypeLists = types;
		}
	}

	getTypeCountByName(name) {
		var type = _.filter(this.getTypeLists(), function(d) {
			return d.key == name;
		})[0];

		if (type) {
			return type.val;
		} else {
			return false;
		}
	}

	getGlobalPhoneTypeObj() {
		if (!this.globalPhoneTypeObj) {
			this.updateGlobalPhoneTypeObj();
		}
		return this.globalPhoneTypeObj;
	}

	updateGlobalPhoneTypeObj() {
		var colors = ["#4fd4e9", "#fbae44", "#0073ae"];
		var typeObj = [ // build data objects
			[
				{
					title: 'POLYCOM', angle:
					(this.getTypeCountByName("polycom"))?this.getTypeCountByName("polycom"):0
				},
				{
					title: 'MOBILE', angle:
					(this.getTypeCountByName("ios"))?this.getTypeCountByName("ios"):0
					+(this.getTypeCountByName("android"))?this.getTypeCountByName("android"):0,
				},
				{
					title: 'OTHER', angle:
					(this.getTypeCountByName("other"))?this.getTypeCountByName("other"):0
					+(this.getTypeCountByName("cisco"))?this.getTypeCountByName("cisco"):0
					+(this.getTypeCountByName("webrtc"))?this.getTypeCountByName("webrtc"):0
					+(this.getTypeCountByName("softphone"))?this.getTypeCountByName("softphone"):0,
				}
			],
			[
				{
					title: 'IPHONE', angle:
					(this.getTypeCountByName("ios"))?this.getTypeCountByName("ios"):0
				},
				{
					title: 'ANDROID', angle:
					(this.getTypeCountByName("android"))?this.getTypeCountByName("android"):0
				},
				{
					title: 'NON-MOBILE', angle:
					(this.getTypeCountByName("polycom"))?this.getTypeCountByName("polycom"):0
					+(this.getTypeCountByName("cisco"))?this.getTypeCountByName("cisco"):0
					+(this.getTypeCountByName("other"))?this.getTypeCountByName("other"):0
					+(this.getTypeCountByName("webrtc"))?this.getTypeCountByName("webrtc"):0
					+(this.getTypeCountByName("softphone"))?this.getTypeCountByName("softphone"):0
				}
			],
			[
				{
					title: 'SOFTPHONE', angle:
					(this.getTypeCountByName("softphone"))?this.getTypeCountByName("softphone"):0
				},
				{
					title: 'MOBILE', angle:
					(this.getTypeCountByName("ios"))?this.getTypeCountByName("ios"):0
					+(this.getTypeCountByName("android"))?this.getTypeCountByName("android"):0
				},
				{
					title: 'NON-NATIVE', angle:
					(this.getTypeCountByName("polycom"))?this.getTypeCountByName("polycom"):0
					+(this.getTypeCountByName("cisco"))?this.getTypeCountByName("cisco"):0
					+(this.getTypeCountByName("other"))?this.getTypeCountByName("other"):0
					+(this.getTypeCountByName("webrtc"))?this.getTypeCountByName("webrtc"):0
				}
			],
			[
				{
					title: 'POLYCOM', angle:
					(this.getTypeCountByName("polycom"))?this.getTypeCountByName("polycom"):0
				},
				{
					title: 'CISCO', angle:
					(this.getTypeCountByName("cisco"))?this.getTypeCountByName("cisco"):0
				},
				{
					title: 'OTHER', angle:
					(this.getTypeCountByName("ios"))?this.getTypeCountByName("ios"):0
					+(this.getTypeCountByName("android"))?this.getTypeCountByName("android"):0
					+(this.getTypeCountByName("other"))?this.getTypeCountByName("other"):0
					+(this.getTypeCountByName("webrtc"))?this.getTypeCountByName("webrtc"):0
					+(this.getTypeCountByName("softphone"))?this.getTypeCountByName("softphone"):0
				}
			],
			[
				{
					title: 'IPHONE', angle:
					(this.getTypeCountByName("ios"))?this.getTypeCountByName("ios"):0
				},
				{
					title: 'ANDROID', angle:
					(this.getTypeCountByName("android"))?this.getTypeCountByName("android"):0
				}
			]
		];

		this.globalPhoneTypeObj = _.map(typeObj, function(obj) { //sort and add color
			var idx = colors.length-1;
			return _.each(_.orderBy(obj, function (t) {
				return t.angle;
			}, 'desc'), function(t){
				t.color = colors[idx];
				idx--;
			});
		});
	}

	getGlobalOutgoing() { //count outing calls
		return _.sumBy(this.data, function(d){
			if (d.direction == "outgoing") {
				return parseInt(d.count);
			}
		});
	}

	getGlobalIncoming() { //count incoming calls
		return _.sumBy(this.data, function(d){
			if (d.direction == "incoming") {
				return parseInt(d.count);
			}
		});
	}

	getDay(date) {
		return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(date).getDay()];
	}

	getMaxCount(){
		return this.maxCount
	}

	getRegionDays(continent) {
		if (!this.regionDays[continent]) {
			this.updateRegionDays(continent);
		}
		return this.regionDays[continent];
	}

	updateRegionDays(continent) {
		return this.regionDays[continent] = _.groupBy(this.getRegionCalls(continent), function(c){
			return this.getDay(c.adjusted_discconect_time);
		}.bind(this));
	}

	getRegionPeaksTotal(continent) { //count all calls per day
		if (!this.regionPeaksTotal[continent]) {
			this.updateRegionPeaksTotal(continent);
		}
		return this.regionPeaksTotal[continent];
	}

	updateRegionPeaksTotal(continent) {
		var days = {
			'Sunday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			'Monday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			'Tuesday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			'Wednesday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			'Thursday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			'Friday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			'Saturday':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		};

		_.map(this.getRegionDays(continent), function(day, key) {
			var h = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
			_.map(_.groupBy(_.sortBy(day, 'adjusted_discconect_time'), function(d){
				return new Date(d.adjusted_discconect_time).getHours();
			}), function(hour, idx){
				h[idx] = Math.log(_.sumBy(hour,function(call){
					return parseFloat(call.count);
				}));
			});

			days[key] = h;
		});

		return this.regionPeaksTotal[continent] = days;
	}

	getRegionOutgoing(continent) { //count outing calls
		if (!this.regionOutgoing[continent]) {
			this.updateRegionOutgoing(continent);
		}
		return this.regionOutgoing[continent];
	}

	updateRegionOutgoing(continent) {
		return this.regionOutgoing[continent] = _.sumBy(this.getRegionCalls(continent), function(d){
			if (d.direction == "outgoing") {
				return parseInt(d.count);
			}
		});
	}

	getRegionIncoming(continent) { //count incoming calls
		if (!this.regionIncoming[continent]) {
			this.updateRegionIncoming(continent);
		}
		return this.regionIncoming[continent];
	}

	updateRegionIncoming(continent) { //count incoming calls
		return this.regionIncoming[continent] = _.sumBy(this.getRegionCalls(continent), function(d){
			if (d.direction == "incoming") {
				return parseInt(d.count);
			}
		});
	}

	getRegionTotal(continent) { //count all calls per region
		return this.getRegionIncoming(continent)+this.getRegionOutgoing(continent);
	}

	getRegionCalls(continent) {
		if (!this.regionCalls[continent]) { //if no cached version, create one
			this.regionCalls[continent] = _.filter(this.data, x=>x["continent"] == continent);
		}
		return this.regionCalls[continent];
	}

	getDates() {
		if (!this.dates) { //if no cached version, create one
			this.updateDates()
		}
		return this.dates;
	}

	updateDates() { //returns array of all date values
		return this.dates = _.map(_.sortBy(_.uniqBy(this.data, "date"), "date"), "date");
	}

	getAdjustedDates() {
		if (!this.adjustedDates) { //if no cached version, create one
			this.updateAdjustedDates()
		}
		return this.adjustedDates;
	}

	updateAdjustedDates() { //returns array of all date values
		return this.adjustedDates = _.map(_.sortBy(_.uniqBy(this.data, "adjusted_discconect_time"), "adjusted_discconect_time"), "adjusted_discconect_time");
	}

	groupedDatesAdjusted() {
		return _.groupBy(this.getAdjustedDates(), function(c){
			return moment(c).format("MM DD YYYY");
		}.bind(this));
	}

	groupedDates() {
		return _.map(_.groupBy(this.getDates(), function(c){
			return moment(c).format("MM DD YYYY");
		}.bind(this)));
	}

	getDateRange() {
		if (!this.dateRange) { //if no cached version, create one
			this.updateDateRange()
		}
		return this.dateRange;
	}

	updateDateRange() { //returns start and end date of dataset
		return this.dateRange = [_.minBy(this.getDates(), function(d){return new Date(d)}), _.maxBy(this.getDates(), function(d){return new Date(d)})];
	}

	getRegions() {
		if (!this.regions) {  //if no cached version, create one
			this.updateRegions()
		}
		// console.log(this.regions);
		return this.regions.sort();
	}

	updateRegions() { //returns list of all regions / continents
		return this.regions = _.map(_.uniqBy(this.data, "continent"), "continent").sort();
	}

	getRegionCallsByDate(region) {
		if (!this.regionCallsDate[region]) {
			this.updateRegionCallsByDate(region);
		}
		return this.regionCallsDate[region];
	}

	updateRegionCallsByDate(region) {
		this.regionCallsDate[region] = _.groupBy(this.getRegionCalls(this.getRegions()[region]), function(d) {
			return d.date;
		});
	}

	getImpactData(region, date) {
		var preset = Common.getURLParameter('type')?Common.getURLParameter('type'):config.animationDefault
		return _.map(_.groupBy(
				this.getRegionCallsByDate(region)[date],
				x=>Math.floor(x.lat/config.animationPresets[preset].dataResolution)*config.animationPresets[preset].dataResolution + "-" + Math.floor(x.lng/config.animationPresets[preset].dataResolution)*config.animationPresets[preset].dataResolution
			), list=>{
			return {
				lat: parseInt(list[0].lat),
				lon: parseInt(list[0].lng),
				count: _.sumBy(list, l=>{return parseInt(l.count)})
			};
		});
	}
}

export default DataOps