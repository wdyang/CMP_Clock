/*
 * common Util function
 ********/
var THREE = require('three');
var CoordinateTZ = require('coordinate-tz');

/* eslint-disable */
Date.prototype.format = function(fmt) {
/* eslint-enable */
	var o = {
		'M + ': this.getMonth() + 1,
		'd + ': this.getDate(),
		'h + ': this.getHours(),
		'm + ': this.getMinutes(),
		's + ': this.getSeconds(),
		'q + ': Math.floor((this.getMonth() + 3) / 3),  //quarter (of a year);
		'S': this.getMilliseconds()
	};
	if (/(y + )/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
		}
	}
	return fmt;
};

function Common() {
	var self = this;

	this.getURLParameter = function(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	this.mapRange = function(num, oldMinValue, oldMaxValue, newMinValue, newMaxValue) {
		var a = oldMaxValue - oldMinValue;
		var b = newMaxValue - newMinValue;
		return (num - oldMinValue) / a * b + newMinValue;
	}

	this.convertVec3ToLatLon = function(pos) {
		var RADIUS_SPHERE = 1725; // should match the camera start z;
		return [90 - (Math.acos(pos.y / RADIUS_SPHERE)) * 180 / Math.PI,
			((270 + (Math.atan2(pos.x , pos.z)) * 180 / Math.PI) % 360) -180];
	}

	this.convertLatLonToVec3 = function(latitude,longitude, R)
	{
		var LAT = latitude * Math.PI/180
		var LON = longitude * Math.PI/180
		return new THREE.Vector3(
			-R * Math.cos(LAT) * Math.cos(LON),
			R * Math.sin(LAT),
			R * Math.cos(LAT) * Math.sin(LON)
		);
	}


	this.getTZ = function(lat, lon) {
		var l = 40; // for to be around new york / tokyo
		return CoordinateTZ.calculate(l, lon).timezone;
	}

	this.print_filter = function(filter) {
		/* eslint-disable */
		var f = eval(filter);
		/* eslint-enable */
		if (typeof (f.length) !== 'undefined') {
		} else {
		}
		if (typeof (f.top) !== 'undefined') {
			f = f.top(Infinity);
		} else {
		}
		if (typeof (f.dimension) !== 'undefined') {
			f = f.dimension(function(d) {
				return '';
			}).top(Infinity);
		} else {
		}
		console.log(filter + '(' + f.length + ') = ' 
			+ JSON.stringify(f)
			.replace('[', '[\n\t')
			.replace(/}\,/g, '},\n\t')
			.replace(']', '\n]'));
	}


	this.isNullOrEmpty = function(strVal) {
		if (strVal === '' || strVal == null || strVal == 'undefined') {
			return true;
		} else {
			return false;
		}
	}

	this.showLoading = function() {
		$('#loading-tip').show();
	}
	this.hideLoading = function() {
		$('#loading-tip').hide();
	}


	this.isEmptyObject = function(O) {
		if (typeof O !== 'object') {
			return true;
		}
		for (var x in O) {
			return false;
		}
		return true;
	}

	this.isString = function(str) {
		return (typeof str == 'string') && str.constructor == String;
	}

	this.getQueryString = function(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
		var r = window.location.search.substr(1).match(reg);
		if (r !== null) {
			return unescape(r[2]);
		}
		return null;
	}

	this.getQueryStringAll = function(name) {
		var r = window.location.search;
		r = r.substr(1);
		return r;
	}

	this.deepCopy = function(source) {
		var result;
		if ( Array.isArray(source)) {
			result = [];
		} else if (typeof source === 'object') {
			result = {};
		} else {
			return source;
		}
		for (var key in source) {
			result[key] = this.deepCopy(source[key]);
		}
		return result;
	}

	this.equal = function(objA, objB) {
		if (typeof arguments[0] !== typeof arguments[1]) {
			return false;
		}

		//Array
		if (arguments[0] instanceof Array && arguments[1] instanceof Array) {
			if (arguments[0].length !== arguments[1].length) {
				return false;
			}

			var allElementsEqual = true;
			for (var i = 0; i < arguments[0].length; ++i) {
				if (typeof arguments[0][i] !== typeof arguments[1][i]) {
					return false;
				}

				if (typeof arguments[0][i] == 'number' && typeof arguments[1][i] == 'number') {
					allElementsEqual = (arguments[0][i] == arguments[1][i]);
				} else {
					/* eslint-disable */
					allElementsEqual = arguments.callee(arguments[0][i], arguments[1][i]);
					/* eslint-enable */
				}

				if (!allElementsEqual) {
					break;
				}
			}
			return allElementsEqual;
		} else

		//object
		if (arguments[0] instanceof Object && arguments[1] instanceof Object) {
			// If number of properties is different,
			// objects are not equivalent
			if (Object.getOwnPropertyNames(arguments[0]).length !== Object.getOwnPropertyNames(arguments[1]).length) {
				return false;
			}

			var result = true;
			for (var o in arguments[0]) {
				//same props
				if (typeof arguments[0][o] == 'number' || typeof arguments[0][o] == 'string') {
					/* eslint-disable */
					result = eval('arguments[0]["' + o + '"] == arguments[1]["' + o + '"]');
					/* eslint-enable */
				} else {
					/* eslint-disable */
					result = arguments.callee(eval('arguments[0]["' + o + '"]'), eval('arguments[1]["' + o + '"]'));
					/* eslint-enable */
				}

				if (!result) {
					break;
				}
			}
			return result;
		} else {
			return arguments[0] == arguments[1];
		}

	}

	this.isNonEmptyArray = function(arrVal) {
		if (Array.isArray(arrVal) && arrVal.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	this.sendRequst = function(request_url, data, func) {
		var requestType = arguments[3] ? arguments[3] : 'POST';
		var needCache = arguments[4] ? arguments[4] : true;

		if (requestType == 'POST') {
			//must be json object
			if (self.isString(data)) {
				data = JSON.parse(data);
			}
			data = JSON.stringify(data);
		}

		$.ajax({
			type: requestType,
			url: request_url,
			data:data, //must be json string
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			cache: needCache,
			success: function(responseData) {
				//need login
				if (responseData && responseData.status && parseInt(responseData.status, 10) == 401) {
					window.location.href = '/login';
				} else {
					func(responseData);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if (errorThrown === 'Not Found') {
					func({}, new Error('Request path error, error path : ' + request_url));
				} else {
					func({}, new Error('Requset fail, please open firebug or develop tool,'
						+ 'then check console & feedback, thanks.'));
				}
			}

		});
	}

	this.getDayTime = function(date) {
		if (!date) {
			date = new Date();
		} else {
			date = new Date(date);
		}
		return date.getTime() - (date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()) * 1000;
	}	

	this.getTime = function(date) {
		if (!date) {
			return 0;
		}
		return new Date(date).getTime();
	}
	//getFormData
	this.getDataWithElement = function(obj) {
		var formData = {};

		$(obj).find('input:hidden').each(function(index, input) {
			formData[$(input).attr('name')] = $(input).val();
		});

		$(obj).find('input:text').each(function(index, input) {
			formData[$(input).attr('name')] = $(input).val();
		});

		$(obj).find('select').each(function(index, select) {
			if ($(select).find('option:selected').attr('value')) {
				formData[$(select).attr('name')] = $(select).find('option:selected').attr('value');
			}
		});

		$(obj).find('input:radio:checked').each(function(index, radio) {
			formData[$(radio).attr('name')] = $(radio).val();
		});

		$(obj).find('input:checkbox').each(function(index, checkbox) {
			formData[$(checkbox).attr('name')] = $(checkbox).is(':checked') ? 1 : 0;
		});

		$(obj).find('textarea').each(function(index, textarea) {
			formData[$(textarea).attr('name')] = $(textarea).val();
		});

		return formData;
	}

	//add hints to input view
	this.addHints = function(obj, msg) {
		$('#result').show();
		$('#result > span').html(msg);
		$('#result').alert();
		if (obj !== null) {
			$(obj).parents('.form-group').addClass('has-error');
		}
		$(obj).parents('form').find('input, textarea').bind('change', function() {
			$('#result').hide();
			$(this).parents('.form-group').removeClass('has-error');
		});
	}

	//check input element
	this.checkDataElement = function(obj) {
		var isSuccess = true;
		$(obj).find('input:text, textarea, input:hidden').each(function(index, input) {
			var textMuted = $(input).parents('.form-group').find('.text-muted').html();
			if ('*' == textMuted && $(input).val() == '') {
				self.addHints($(input), 'You must fill in the required');
				isSuccess = false;
			}
		});

		return isSuccess;
	}

	//handle sure model
	this.sureModel = function(title, content, sureCallback) {
		$('#confirm-title').html(title);
		$('#confirm-content').html(content);
		$('#confirm-modal').modal('show');
		$('#confirm-ok-button').unbind('click');
		$('#confirm-ok-button').click(function() {
			$('#confirm-modal').modal('hide');
			if (sureCallback) {
				sureCallback();
			}
		});
	}

	this.updateDatePicker = function(obj, range, cb) {
		if (!range || range.length !== 2) {
			return new Error('Range is Error');
		}
		$(obj).find('.startDatepicker').datepicker({
			format: 'mm/dd/yyyy',
			weekStart: 1,
			autoclose: true,
			todayHighlight: true,
			// startView:range[0],
			// startDate:range[0],
			// endDate:range[1],
			defaultViewDate:{year:range[0].getFullYear(), month:range[0].getMonth(), day:range[0].getDate()}
		}).on('changeDate', function(ev) {
			ev.preventDefault();
			var start = ev.date.valueOf();
			if (cb) {
				cb('startDatepicker', start, ev);
			}

		});
		$(obj).find('.endDatepicker').datepicker({
			format: 'mm/dd/yyyy',
			weekStart: 1,
			autoclose: true,
			todayHighlight: true,
			// startView:range[1],
			// startDate:range[0],
			// endDate:range[1],
			defaultViewDate:{year:range[1].getFullYear(), month:range[1].getMonth(), day:range[1].getDate()}
		}).on('changeDate', function(ev) {
			ev.preventDefault();
			var endTime = ev.date.valueOf();
			if (cb) {
				cb('endDatepicker', endTime, ev);
			}
		});
		return true;
	}

	this.updateDefaultDatePicker = function(obj) {

		function autoHandleTime(startTime, endTime, isStart) {
			// if (endTime && startTime && startTime > endTime) {

			// }
		}

		$(obj).find('.startDatepicker').datepicker({
			format: 'mm/dd/yyyy',
			weekStart: 1,
			autoclose: true,
			todayHighlight: true
		})
		.on('changeDate', function(ev) {
			var startTime = ev.date.valueOf();
			var time = $(obj).find('.endDatepicker').val();
			if (time && time.length > 0) {
				autoHandleTime(startTime, new Date(time).getTime(), true);
			}
		});

		$(obj).find('.endDatepicker').datepicker({
			format: 'mm/dd/yyyy',
			weekStart: 1,
			autoclose: true,
			todayHighlight: true
		})
		.on('changeDate', function(ev) {
			var endTime = ev.date.valueOf();
			var time = $(obj).find('.startDatepicker').val();
			if (time && time.length > 0) {
				autoHandleTime(new Date(time).getTime(), endTime, false);
			}
		});
	}

	this.CSVToArray = function(strData, strDelimiter) {
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ',');
		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp((
		// Delimiters.
		'(\\' + strDelimiter + '|\\r?\\n|\\r|^)' + 
		// Quoted fields.
		'(?:\'([^\']*(?:\'\'[^\']*)*)\'|' + 
		// Standard fields.
		'([^\'\\' + strDelimiter + '\\r\\n]*))'), 'gi');
		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];
		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;
		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec(strData)) {
			// Get the delimiter that was found.
			var strMatchedDelimiter = arrMatches[1];
			// Check to see if the given delimiter has a length
			// (is not the start of string) and if it matches
			// field delimiter. If id does not, then we know
			// that this delimiter is a row delimiter.
			if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
				// Since we have reached a new row of data,
				// add an empty row to our data array.
				arrData.push([]);
			}
			// Now that we have our delimiter out of the way,
			// let's check to see which kind of value we
			// captured (quoted or unquoted).
			var strMatchedValue = '';
			if (arrMatches[2]) {
				// We found a quoted value. When we capture
				// this value, unescape any double quotes.
				strMatchedValue = arrMatches[2].replace(
				new RegExp('\'\'', 'g'), '\'');
			} else {
				// We found a non-quoted value.
				strMatchedValue = arrMatches[3];
			}
			// Now that we have our value string, let's add
			// it to the data array.
			arrData[arrData.length - 1].push(strMatchedValue);
		}
		// Return the parsed data.
		return (arrData);
	}

	this.convertCSV2JSON = function(csvString) {
		var csvArray = this.CSVToArray(csvString);
		var jsonArray = [];
		for (var i = 1; i < csvArray.length; i++ ) {

			var jsonRow = {};
			var countEmptyCol = 0;

			if (csvArray[0].length !== csvArray[i].length) {
				continue;
			}

			for (var k = 0; k < csvArray[0].length; k++ ) {

				if (csvArray[i][k] == '') {
					countEmptyCol++;
				}

				jsonRow[csvArray[0][k]] = csvArray[i][k];

				//Support value is key=value|key=value|key=value . auto convert to json.
				if (jsonRow[csvArray[0][k]].indexOf('=') > 0) {
					var tempObject = {};
					var reg = /,/g;
					if (jsonRow[csvArray[0][k]].indexOf('|') > 0) {
						reg = /\|/g;
					}

					jsonRow[csvArray[0][k]].split(reg).filter(function(s) {return s.length > 0})
						.map(function(s) { //key=value|key=value|key=value
							var t = s.trim().split('=');
							//maybe have bug, will override old data
							if (t.length == 2 && t[0] && t[0].trim() !== '') {
								tempObject[t[0].trim()] = t[1].trim();
							}
						});
					//replace key=value|key=value|key=value to object
					jsonRow[csvArray[0][k]] = tempObject;
				}

			}

			if (countEmptyCol !== csvArray[0].length ) {
				jsonArray.push(jsonRow);
			}
		}

		// var json = JSON.stringify(jsonArray);
		// var str = json.replace(/},/g, '},\r\n');

		return jsonArray;
	}
}

var tempCommon = new Common();
module.exports = tempCommon;
