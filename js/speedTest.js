// Changes from version 1:
// Added quotes to the encoding of browser version number
// 		since they turn out to be strings rather than actual numbers
// Added comments

// Variables start with 'T' to help prevent declaring a variable that already exists
// (since this code is inserted directly into a game page)

var TstartTime, TendTime;
var TimageAddr;
var TbigImageSize;
var TsmallImageSize;
var Tdownload = new Image();
var Tpacket = new Image();
var Tcounter = 0;
var TRTT = {};
var Tresults = '{';
var TtestVersion = 2;		// Version of this script
var TlCounter = 0;
var Tlocations = 10;
var Tsurvey_value = {};

// The servers around the world that we test with
var Tlocation = {};

Tlocation[0] = {};
Tlocation[0]['prefix'] = 'WPI_';
Tlocation[0]['bigFileURL'] = '../sizeFiles/size100000B.bmp';
Tlocation[0]['bigFileSize'] = 100000;
Tlocation[0]['smallFileURL'] = '../sizeFiles/size43B.gif';
Tlocation[0]['smallFileSize'] = 43;

Tlocation[1] = {};
Tlocation[1]['prefix'] = 'Australia_';
Tlocation[1]['bigFileURL'] = 'http://caia.swin.edu.au/images/for-wpi.edu/size100000B.bmp';
Tlocation[1]['bigFileSize'] = 100000;
Tlocation[1]['smallFileURL'] = 'http://caia.swin.edu.au/images/for-wpi.edu/size43B.gif';
Tlocation[1]['smallFileSize'] = 43;

Tlocation[2] = {};
Tlocation[2]['prefix'] = 'Singapore_';
Tlocation[2]['bigFileURL'] = 'http://eiger.ddns.comp.nus.edu.sg/pubs/size100000B.bmp';
Tlocation[2]['bigFileSize'] = 100000;
Tlocation[2]['smallFileURL'] = 'http://eiger.ddns.comp.nus.edu.sg/pubs/size43B.gif';
Tlocation[2]['smallFileSize'] = 43;

Tlocation[3] = {};
Tlocation[3]['prefix'] = 'Japan_';
Tlocation[3]['bigFileURL'] = 'http://www.ime.cmc.osaka-u.ac.jp/~kiyo/pub/wpi/size100000B.bmp';
Tlocation[3]['bigFileSize'] = 100000;
Tlocation[3]['smallFileURL'] = 'http://www.ime.cmc.osaka-u.ac.jp/~kiyo/pub/wpi/size43B.gif';
Tlocation[3]['smallFileSize'] = 43;

Tlocation[4] = {};
Tlocation[4]['prefix'] = 'OR_';
Tlocation[4]['bigFileURL'] = 'http://web.cecs.pdx.edu/~wuchi/size100000B.bmp';
Tlocation[4]['bigFileSize'] = 100000;
Tlocation[4]['smallFileURL'] = 'http://web.cecs.pdx.edu/~wuchi/size43B.gif';
Tlocation[4]['smallFileSize'] = 43;

Tlocation[5] = {};
Tlocation[5]['prefix'] = 'MN_';
Tlocation[5]['bigFileURL'] = 'http://www.grouplens.org/system/files/ekstrand.jpg';
Tlocation[5]['bigFileSize'] = 97005;
Tlocation[5]['smallFileURL'] = 'http://www.grouplens.org/sites/www.grouplens.org/themes/barron/images/close-quote.gif';
Tlocation[5]['smallFileSize'] = 159;

Tlocation[6] = {};
Tlocation[6]['prefix'] = 'MA_';
Tlocation[6]['bigFileURL'] = 'http://www.cs.bu.edu/~best/public/size100000B.bmp';
Tlocation[6]['bigFileSize'] = 100000;
Tlocation[6]['smallFileURL'] = 'http://www.cs.bu.edu/~best/public/size43B.gif';
Tlocation[6]['smallFileSize'] = 43;

Tlocation[7] = {};
Tlocation[7]['prefix'] = 'UK_';
Tlocation[7]['bigFileURL'] = 'http://www.cs.st-andrews.ac.uk/~tristan/include/images/banners/wall.jpg';
Tlocation[7]['bigFileSize'] = 56046;
Tlocation[7]['smallFileURL'] = 'http://www.cs.st-andrews.ac.uk/~tristan/include/images/bg.gif';
Tlocation[7]['smallFileSize'] = 82;

Tlocation[8] = {};
Tlocation[8]['prefix'] = 'France_';
Tlocation[8]['bigFileURL'] = 'http://openvirtualenvironment.lip6.fr/sizeFiles/size100000B.bmp';
Tlocation[8]['bigFileSize'] = 100000;
Tlocation[8]['smallFileURL'] = 'http://openvirtualenvironment.lip6.fr/sizeFiles/size43B.gif';
Tlocation[8]['smallFileSize'] = 43;

Tlocation[9] = {};
Tlocation[9]['prefix'] = 'Norway_';
Tlocation[9]['bigFileURL'] = 'http://home.ifi.uio.no/griff/size100000B.bmp';
Tlocation[9]['bigFileSize'] = 100000;
Tlocation[9]['smallFileURL'] = 'http://home.ifi.uio.no/griff/size43B.gif';
Tlocation[9]['smallFileSize'] = 43;

// Grabbing the browser user agent
var Tuser_agent = navigator.userAgent;

var TversionIndex = -1;
var Tbrowser = Tuser_agent;
if (Tbrowser.indexOf('Firefox') != -1)
{
	TversionIndex = Tbrowser.indexOf('Firefox') + 8;
	Tbrowser = "Firefox";
}
else if (Tbrowser.indexOf('MSIE') != -1)
{
	TversionIndex = Tbrowser.indexOf('MSIE') + 5;
	Tbrowser = "Internet Explorer";
}
else if (Tbrowser.indexOf('Chrome') != -1)
{
	TversionIndex = Tbrowser.indexOf('Chrome') + 7;
	Tbrowser = "Chrome";
}
else if (Tbrowser.indexOf('Opera') != -1)
{
	TversionIndex = Tbrowser.indexOf('Opera') + 6;
	Tbrowser = "Opera";
}
else if (Tbrowser.indexOf('Safari') != -1)
{
	TversionIndex = Tbrowser.indexOf('Safari') + 7;
	Tbrowser = "Safari";
}
else
{
	Tbrowser = "Other/Unknown";
}

var Tversion;

var TversionEnd = Tuser_agent.indexOf(' ', TversionIndex);
if (TversionEnd == -1)
{
	TversionEnd = Tuser_agent.indexOf(';', TversionIndex);
	
	if (TversionEnd == -1)
	{
		TversionEnd = Tuser_agent.indexOf('\n', TversionIndex);
	}
	else if (Tuser_agent.indexOf('\n', TversionIndex) != -1)
	{
		TversionEnd = Math.min(TversionEnd, Tuser_agent.indexOf('\n', TversionIndex));
	}
}
else if (Tuser_agent.indexOf(';', TversionIndex) == -1)
{
	if (Tuser_agent.indexOf('\n', TversionIndex) != -1)
	{
		TversionEnd = Math.min(TversionEnd, Tuser_agent.indexOf('\n', TversionIndex));
	}
}
else
{
	TversionEnd = Math.min(TversionEnd, Tuser_agent.indexOf(';', TversionIndex));
	
	if (Tuser_agent.indexOf('\n', TversionIndex) != -1)
	{
		TversionEnd = Math.min(TversionEnd, Tuser_agent.indexOf('\n', TversionIndex));
	}
}

if (TversionIndex == -1)
{	
	Tversion = navigator.appVersion;
	Tversion = Tversion.substring(0, Tversion.indexOf(' '));
}
else
{
	if (TversionEnd == -1)
	{
		Tversion = Tuser_agent.substring(TversionIndex);
	}
	else
	{
		Tversion = Tuser_agent.substring(TversionIndex, TversionEnd);
	}
}

var TOS = Tuser_agent;
if (TOS.indexOf('Windows') != -1)
{
	TOS = 'Windows';
}
else if (TOS.indexOf('Mac') != -1)
{
	TOS = 'Mac';
}
else if (TOS.indexOf('Linux') != -1)
{
	TOS = 'Linux';
}
else
{
	TOS = 'Unknown';
}

Tuser_agent = '{"browser":"' + Tbrowser + '","version":"' + Tversion + '","OS":"' + TOS + '"}';
	


// gets the selected radio button's value (returns last button's value if none selected)
function TgetRadioValue(radios)
{
	var len = radios.length;
	
	for (var i = 0; i < len; i++)
	{
		if (radios[i].checked)
		{
			return radios[i].value;
		}
	}
	
	return radios[len - 1].value;
}

// Submit test results
function TsendResults()
{
	Tsurvey_value['connection_type'] = TgetRadioValue(document.Tsurvey.connection_type);
	Tsurvey_value['connection_access'] = TgetRadioValue(document.Tsurvey.connection_access);
	Tsurvey_value['connection_location'] = TgetRadioValue(document.Tsurvey.connection_location);
	
	var surveyString = '{"connection_type":"' + Tsurvey_value['connection_type']
	+ '","connection_access":"' + Tsurvey_value['connection_access']
	+ '","connection_location":"' + Tsurvey_value['connection_location'] + '"}';
	
	Tsurvey_value = {};

	Tresults += '"script_version":' + TtestVersion + '}';

	Torder++;	

	var params = '';
	
	params = "results=" + Tresults			// Whatever, so long as in JSON format
	+ "&cookie=" + Tcookie					// Random string of 5 characters, case sensitive (expects value from game page)
	+ "&auto=1"								// Always 1 for data from this script
	+ "&order=" + Torder					// Session testing number (expects value from game page)
	+ "&survey=" + surveyString				// Results from the survey on the game page
	+ "&user_agent=" + Tuser_agent			// Example: {"browser":"Firefox","version":"8.14.29.3","OS":"Windows"}
	+ "&from_game=1";						// Always 1 for data from this script, obviously
	
	Tresults = '{';
	
	// console.log(params);
	
	
	// Upload the results
	var request = false;
	try
	{
		request = new XMLHttpRequest();
	}
	catch (trymicrosoft)
	{
		try
		{
			request = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (othermicrosoft)
		{
			try
			{
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (failed)
			{
				request = false;
			}  
		}
	}

	if (!request)
	{
		alert("Error: Your browser does not support XMLHttpRequests");
	}
	else
	{
		// request.open("POST", "http://hmn-games.cs.wpi.edu/~mihajlo/Project/add_hmn_test_to_test_db.cgi", true);	// Test data
		request.open("POST", "http://hmn-games.cs.wpi.edu/~mihajlo/Project/add_hmn_test_to_official_db.cgi", true);	// Real data
		// request.open("POST", "http://hmn.cs.wpi.edu/add_hmn_test.cgi", true);		// Real data (Doesn't work in IE, access not allowed)
		
		// Send the proper header information along with the request
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.setRequestHeader("Content-length", params.length);
		request.setRequestHeader("Connection", "close");
		
		request.send(params);
		
		// Call a function when the state changes.
		request.onreadystatechange = function() {
			if (request.readyState == 4) { // && request.status == 200) {
				setTimeout("TrunTest()", 60000);		// Wait a minute and then run tests again
			}
		}
	}
}

// Gathers RTT data
function TtestRTT()
{
	if (Tcounter < 10)
	{
		TstartTime = (new Date()).getTime();
		Tpacket.src = Tlocation[TlCounter]['smallFileURL'] + "?n=" + TstartTime + Tcounter;
	}
	else
	{
		Tcounter = 0;
		
		Tresults += '],';
		
		Tnum = 0;
		var total = 0;
		for (var i = 0; i < 10; i++)
		{
			if (TRTT[i] != "ERROR")
			{
				total += TRTT[i];
				Tnum++;
			}
		}
		
		var avg;
		if (total == 0 || Tnum < 2)
		{
			avg = "ERROR";
		}
		else
		{
			avg = total / Tnum;
			// AVERAGE RTT
			var time_date = new Date(parseInt((new Date()).getTime()));
			var UTC = Date.UTC(time_date.getFullYear(),  time_date.getMonth(), time_date.getDate(), time_date.getHours(), time_date.getMinutes(), time_date.getSeconds());
			chart_RTT.series[TlCounter].addPoint([UTC, avg]);
		
			total = 0;
			for (var j = 0; j < 10; j++)
			{
				if (TRTT[j] != "ERROR")
				{
					total += Math.pow(TRTT[j] - avg, 2);
				}
			}
			
			var CoV = Math.round(( (Math.sqrt(total / (Tnum - 1)) / avg) ) * 100) / 100;
			// JITTER (ms^2)	// Coefficient of Variation: std/avg (unitless)
			chart_Jitter.series[TlCounter].addPoint([UTC, CoV]);
		}
		
		TlCounter++;
		
		if (TlCounter < Tlocations)
		{
			setTimeout("TrunTest()", 100);
		}
		else
		{
			TlCounter = 0;
			TsendResults();
		}
	}
}

// Gathers Throughput data
function TshowResults()
{
	var duration = (TendTime - TstartTime)
	var bitsLoaded = TbigImageSize * 8;
	var speedbps = bitsLoaded / (duration / 1000);
	var speedKbps = (speedbps / 1024);
	var speedMbps = Math.round((speedKbps / 1024) * 100) / 100;
	// THROUGHPUT
	var time_date = new Date(parseInt((new Date()).getTime()));
	var UTC = Date.UTC(time_date.getFullYear(),  time_date.getMonth(), time_date.getDate(), time_date.getHours(), time_date.getMinutes(), time_date.getSeconds());
	chart_Throughput.series[TlCounter].addPoint([UTC, speedMbps]);
	
	TsmallImageSize = Tlocation[TlCounter]['smallFileSize'];
	
	var prefix = Tlocation[TlCounter]['prefix'];
	Tresults += '"' + prefix + 'bigObjectSize_Bytes":' + TbigImageSize + ',"' + prefix + 'timeToDownload_ms":' + duration + ',"' + prefix + 'smallObjectSize_Bytes":' + TsmallImageSize + ',"' + prefix + 'RTT_ms":[';
}

function TdownloadNew(adress, filesize)
{
	// Run speedtest
	TstartTime = (new Date()).getTime();
	TimageAddr = '' + adress + '?n=' + TstartTime;
	TbigImageSize = parseInt(filesize);
	
	Tdownload.src = TimageAddr;
}

Tpacket.onload = function()
{
	TendTime = (new Date()).getTime();
	
	var duration = (TendTime - TstartTime);
	
	TRTT[Tcounter] = duration;
	
	Tresults += duration;
	
	Tcounter++;
	if (Tcounter < 10)
	{
		Tresults += ',';
	}
	
	TtestRTT();
}

Tpacket.onerror = function(evt)
{
	console.log(this.src + " failed to load");
	
	TendTime = (new Date()).getTime();
	
	var duration = (TendTime - TstartTime);
	
	TRTT[Tcounter] = "ERROR";
	
	Tresults += duration;
	
	Tcounter++;
	if (Tcounter < 10)
	{
		Tresults += ',';
	}
	
	TtestRTT();
}

// When image loaded, note time
Tdownload.onload = function()
{
	TendTime = (new Date()).getTime();

	TshowResults();
	TtestRTT();
}

// If can't load image, alert
Tdownload.onerror = function(evt)
{
	console.log(this.src + " failed to load");
	
	TendTime = (new Date()).getTime();

	TsmallImageSize = Tlocation[TlCounter]['smallFileSize'];
	
	var prefix = Tlocation[TlCounter]['prefix'];
	Tresults += '"' + prefix + 'bigObjectSize_Bytes":' + TbigImageSize + ',"' + prefix + 'timeToDownload_ms":"ERROR","' + prefix + 'smallObjectSize_Bytes":' + TsmallImageSize + ',"' + prefix + 'RTT_ms":[';
	
	TtestRTT();
}

// Run the network tests
function TrunTest()
{
	var bigFile = Tlocation[TlCounter]['bigFileURL'];
	var size = Tlocation[TlCounter]['bigFileSize'];
	TdownloadNew(bigFile, size);
}

// Start the tests and create the graphs as soon as the page is loaded
document.onready = function()
{
	drawGraph();
	TrunTest();
}

var chart_Throughput;
var chart_RTT;
var chart_Jitter;
var start_date_string;

function leadingZero(num)
{
	if (num < 10)
	{
		return "0" + num;
	}
	else
	{
		return num;
	}
}

function drawGraph()
{
	Highcharts.setOptions({
		colors: ['#C79B00', '#EE5F00', '#D30000', '#C50099', '#892ACB', '#4530C1', '#0078FF', '#00BE8F', '#00A513', '#6FB600']
	});

	var start_date = new Date(parseInt((new Date()).getTime()));
	var week_days = new Array('Sunday', 'Monday', 'Tuesday','Wednesday', 'Thursday', 'Friday', 'Saturday');
	var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
	start_date_string = (week_days[start_date.getDay()] + ", " + months[start_date.getMonth()]) + " " + start_date.getDate() + ", " + start_date.getFullYear() + ", " + start_date.getHours() + ":" + leadingZero(start_date.getMinutes()) + ":" + leadingZero(start_date.getSeconds());
	
	/*
	var d1 = [];

	// d1.push([Date.UTC(time_date.getFullYear(),  time_date.getMonth() + 1, time_date.getDate(), time_date.getHours(), time_date.getMinutes(), time_date.getSeconds()), value]);
	
	d1.push([Date.UTC(2012, 0, 22, 14, 4, 32), 4]);
	d1.push([Date.UTC(2012, 0, 22, 14, 6, 2), 2]);
	d1.push([Date.UTC(2012, 0, 22, 14, 9, 32), 5]);
	
	var d2 = [];
	
	d2.push([Date.UTC(2012, 0, 22, 14, 4, 32), 1]);
	d2.push([Date.UTC(2012, 0, 22, 14, 7, 2), 3]);
	d2.push([Date.UTC(2012, 0, 22, 14, 9, 32), 2]);
	*/
	
	// var counterzzz = 0;
	chart_Throughput = new Highcharts.Chart({
		chart: {
			renderTo: 'graph_Throughput',
			zoomType: 'y',
			type: 'spline',
			marginRight: 147,
			marginLeft: 65,
			backgroundColor: {
				linearGradient: [0, 0, 250, 500],
				stops: [
					[0, 'rgb(48, 48, 96)'],
					[1, 'rgb(0, 0, 0)']
				]
			},
			borderColor: '#000000',
			borderWidth: 2,
			plotBackgroundColor: 'rgba(255, 255, 255, .1)',
			plotBorderColor: '#CCCCCC',
			plotBorderWidth: 1
			/*events: {
				load: function() {
	
					// set up the updating of the chart each second
					var series1 = this.series[0];
					var series2 = this.series[1];
					setInterval(function() {
						var x = (new Date()).getTime(), // current time
							y = Math.random();
							y2 = Math.random();
						//series1.addPoint([x, y]);
						//series2.addPoint([x, y2]);
						chart_Throughput.series[0].addPoint([x, y]);
					}, 1000);
				},
			}*/
		},
		credits: {
			disabled: true
		},
		exporting: {
			enabled: true
		},
		title: {
			style: {
				color: '#c0c0c0'
			},
			text: 'Throughput'
		},
		subtitle: {
			text: 'Starting from: ' + start_date_string 
		},
		xAxis: {
			title: {
				text: 'Time'
			},
			type: 'datetime',
			// tickInterval: 1,
			dateTimeLabelFormats: { // don't display the dummy year
				month: '%e. %b',
				year: '%b'
			}
		},
		yAxis: {
			title: {
				text: 'Megabits Per Second'
			},
			min: 0
			// max: 6,
			// tickInterval: 1
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			x: -4,
			y: 45,
			borderWidth: 1,
			itemStyle: {
				color: '#6D869F'
			},
			itemHoverStyle: {
				color: '#c0c0c0'
			}
		},
		series: [{
			// showInLegend: false,
			name: 'MA, USA (WPI)'
			// data: d1
			}, {
			name: 'Australia'
			}, {
			name: 'Singapore'
			}, {
			name: 'Japan'
			}, {
			name: 'OR, USA'
			}, {
			name: 'MN, USA'
			}, {
			name: 'MA, USA'
			}, {
			name: 'UK'
			}, {
			name: 'France'
			}, {
			name: 'Norway'
		}]
	});
   
   
	chart_RTT = new Highcharts.Chart({
		chart: {
			renderTo: 'graph_RTT',
			zoomType: 'y',
			type: 'spline',
			marginRight: 147,
			marginLeft: 65,
			backgroundColor: {
				linearGradient: [0, 0, 250, 500],
				stops: [
					[0, 'rgb(48, 48, 96)'],
					[1, 'rgb(0, 0, 0)']
				]
			},
			borderColor: '#000000',
			borderWidth: 2,
			plotBackgroundColor: 'rgba(255, 255, 255, .1)',
			plotBorderColor: '#CCCCCC',
			plotBorderWidth: 1
		},
		credits: {
			disabled: true
		},
		exporting: {
			enabled: true
		},
		title: {
			style: {
				color: '#c0c0c0'
			},
			text: 'Round Trip Time (Average of Ten)'
		},
		subtitle: {
			text: 'Starting from: ' + start_date_string 
		},
		xAxis: {
			title: {
				text: 'Time'
			},
			type: 'datetime',
			// tickInterval: 1,
			dateTimeLabelFormats: { // don't display the dummy year
				month: '%e. %b',
				year: '%b'
			}
		},
		yAxis: {
			title: {
				text: 'Milliseconds'
			},
			min: 0
			// max: 6,
			// tickInterval: 1
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			x: -4,
			y: 45,
			borderWidth: 1,
			itemStyle: {
				color: '#6D869F'
			},
			itemHoverStyle: {
				color: '#c0c0c0'
			}
		},
		series: [{
			// showInLegend: false,
			name: 'MA, USA (WPI)'
			// data: d1
			}, {
			name: 'Australia'
			}, {
			name: 'Singapore'
			}, {
			name: 'Japan'
			}, {
			name: 'OR, USA'
			}, {
			name: 'MN, USA'
			}, {
			name: 'MA, USA'
			}, {
			name: 'UK'
			}, {
			name: 'France'
			}, {
			name: 'Norway'
		}]
	});
	
	
	chart_Jitter = new Highcharts.Chart({
		chart: {
			renderTo: 'graph_Jitter',
			zoomType: 'y',
			type: 'spline',
			marginRight: 147,
			marginLeft: 65,
			backgroundColor: {
				linearGradient: [0, 0, 250, 500],
				stops: [
					[0, 'rgb(48, 48, 96)'],
					[1, 'rgb(0, 0, 0)']
				]
			},
			borderColor: '#000000',
			borderWidth: 2,
			plotBackgroundColor: 'rgba(255, 255, 255, .1)',
			plotBorderColor: '#CCCCCC',
			plotBorderWidth: 1
		},
		credits: {
			disabled: true
		},
		exporting: {
			enabled: true
		},
		title: {
			style: {
				color: '#c0c0c0'
			},
			text: 'Jitter'
		},
		subtitle: {
			text: 'Starting from: ' + start_date_string 
		},
		xAxis: {
			title: {
				text: 'Time'
			},
			type: 'datetime',
			// tickInterval: 1,
			dateTimeLabelFormats: { // don't display the dummy year
				month: '%e. %b',
				year: '%b'
			}
		},
		yAxis: {
			title: {
				text: ''
			},
			min: 0
			// max: 6,
			// tickInterval: 1
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			x: -4,
			y: 45,
			borderWidth: 1,
			itemStyle: {
				color: '#6D869F'
			},
			itemHoverStyle: {
				color: '#c0c0c0'
			}
		},
		series: [{
			// showInLegend: false,
			name: 'MA, USA (WPI)'
			// data: d1
			}, {
			name: 'Australia'
			}, {
			name: 'Singapore'
			}, {
			name: 'Japan'
			}, {
			name: 'OR, USA'
			}, {
			name: 'MN, USA'
			}, {
			name: 'MA, USA'
			}, {
			name: 'UK'
			}, {
			name: 'France'
			}, {
			name: 'Norway'
		}]
	});
}