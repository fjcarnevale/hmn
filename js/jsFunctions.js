var object_load_result_obtained = false;
var object_load_start = false;
var object_load_end_time =false;
var object_size = 0;
var reporting_el = 0;
var object_url = "";
var testType = "";
timeout_timer = new Array();
var dl_request;
var upl_request; 
//////////

/*
	file_type - parameter for give_file() function that returns url (only used if url is null)
	timeout - time after timeout will be generated and download stopped
	dl_number - iframe to which object is downloaded (1 to 6 for site activities that require multiple downloads at once)
	second_try - are we downloading same object for the second time, after failure
	url - url of a file we want to download
*/

function DownloadJSDOM (file_type, timeout, dl_number, second_try, url){
	var timeout_time = (timeout) ? timeout * 1000 : 5000; // If timeout parameter is null we set it to default
	var iframe_container_el;
	
	// We set iframe container to be either iframe (single download) or iframe_<number> for parallel downloads
	if (dl_number != null) {
		iframe_container_el = document.getElementById('iframe_' + dl_number);
	}
	else {
		iframe_container_el = document.getElementById('iframe');
	}	
	
	object_load_start = new Date().getTime(); // Set start time
	
	if (!file_type)
		file_type = 0; // Default file (1B)
	
	if (url)
		link = url;
	else
		link = give_file(file_type)[0];
	
	object_size = give_file(file_type)[1];	
	object_load_start2 = object_load_start;
	
	// If file_type is "cached_item" we download object from cache
	iframe_container_el.src = link + ((file_type == 'cached_item') ? "" : ("?" + object_load_start)) + ((dl_number) ? dl_number : "");
	
	// Update second_try_par
	var second_try_par = (second_try == 1) ? 2 : 1; // 1 - this will be 1st timeout, 2 - 2nd timeout function
	
	// Set timeout for the download
	timeout_timer[(dl_number != null) ? dl_number : 'main'] = setTimeout(function() { requestTimeout(file_type, timeout, dl_number, second_try_par, url); }, timeout_time);
	
}

/* 
	Function if we had timeout
	parameters the same as in downloadJSDOM
*/
function requestTimeout(file_type, timeout, dl_number, second_try, url) {
	var iframe_container_el = document.getElementById('iframe' + ((dl_number) ? "_" + dl_number : ""));
	$('iframe' + ((dl_number) ? "_" + dl_number : "")).empty();
	
	if (second_try == 1)
		DownloadJSDOM(file_type, timeout, dl_number, second_try, url); // Download one more time
	else
		add_test(null, 'timeout'); // This was final timeout
	
}

function XMLHTTPRequestDownLoad(el, file_type){
	if (network_wait) {		
		setTimeout(function() { XMLHTTPRequestDownLoad(el, file_type); }, 500);
		return;
	}
	network_wait = true;
	
	dl_request = createXMLHttpRequest();
		
	if (!file_type)
		file_type = 0;
	
	var link = give_file(file_type)[0];
	var object_size = give_file(file_type)[1];	
	
	dl_request.open("GET", link + '?' + (new Date ()).getTime(), true)
	dl_request.onreadystatechange = function(evt) {
		// IE will throw an exception when accessing an incomplete request (while it's downloading).
		// We handle that and not gather information about each received "packet".
		try {
			// stateArray.push(new Array(new Date(), request.readyState, request.responseText.length));
		} catch (e) {
			// stateArray.push(new Array(new Date(), request.readyState));
		}
		if (dl_request.readyState == 4 && dl_request.status == 200){	
			var object_load_end = new Date().getTime(); // Set time when download finished
			time_elapsed = parseInt(object_load_end - object_load_start); // Download time
			speed = calculate_dl_speed(object_size, time_elapsed);
			network_wait = false;
			add_test(object_size, time_elapsed);
		}
	
	}
	var object_load_start = new Date().getTime();
	dl_request.send(null);
	
}

// Function that creates xmlhttprequest depending on the browser (IE requires special way)
function createXMLHttpRequest() {
    if (typeof XMLHttpRequest != "undefined") {
        return new XMLHttpRequest();
    } else if (typeof ActiveXObject != "undefined") {
        return new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("XMLHttpRequest not supported");
    }
}


function runXHRUploadTest(el, upload_size) {
	url = web_file_root + "object-1KB.txt"; // Small file
	uploadData(upload_size, url); // We upload certain size of upload data
}

function uploadData(size, url) {
	return postToURL(url, size);
}

function postToURL(url, size) {
	var params = randomString(size);
	upl_request = createXMLHttpRequest();	

	post_url = web_file_root + 'object-1KB.txt';// + '1B';
	upl_request.open("POST", post_url + '?' + getTime(), true);
	
	upl_request.onreadystatechange = function() {
		
		if (upl_request.readyState == 4 && upl_request.status == 200) {
			end_time = getTime();
			network_wait = false;

			time_elapsed = parseInt(end_time - start_time);
			speed = calculate_dl_speed(size, time_elapsed);
		
			add_test(size, time_elapsed); // Send information back to the add_test
		}
	}

	start_time = getTime();
	upl_request.send(params);
}

function getTime() {
	var d = new Date();
	return d.getTime();
}

function randomString(length, charlist)
{
	var alphanum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = length;

	var chars = ( (charlist) ? charlist : alphanum);

	function generateBuffer1000() {

		var randomstring = "";

		for (var i=0; i<1000; i++)
		{
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}

		return randomstring;
	}

	var str = generateBuffer1000();
	while (str.length < length) {
		str += str;
	}

	return str.substring(0, length);

}


function uploadSpeedJS (site){
		return "ULJS";
	}
function pingSpeedJS (site){
		return "PingJS";
	}

// Functions ro calculate avg, std, ,,,
var isArray = function (obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
},
getNumWithSetDec = function( num, numOfDec ){
	var pow10s = Math.pow( 10, numOfDec || 0 );
	return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
},
getAverageFromNumArr = function( numArr, numOfDec ){
	if( !isArray( numArr ) ){ return false;	}
	var i = numArr.length, 
		sum = 0;
	while( i-- ){
		sum += numArr[ i ];
	}
	return getNumWithSetDec( (sum / numArr.length ), numOfDec );
},
getVariance = function( numArr, numOfDec ){
	if( !isArray(numArr) ){ return false; }
	var avg = getAverageFromNumArr( numArr, numOfDec ), 
		i = numArr.length,
		v = 0;
 
	while( i-- ){
		v += Math.pow( (numArr[ i ] - avg), 2 );
	}
	v /= numArr.length;
	return getNumWithSetDec( v, numOfDec );
},
getStandardDeviation = function( numArr, numOfDec ){
	if( !isArray(numArr) ){ return false; }
	var stdDev = Math.sqrt( getVariance( numArr, numOfDec ) );
	return getNumWithSetDec( stdDev, numOfDec );
}

// Function not complete and is currently NOT used anywhere
function cancel_requests() {
	
	dl_request = null;
	upl_request = null;
	document.getElementById('iframe').empty();
	document.getElementById('iframe').src = "";
	for (i = 1; i <= 6; i++)
		$('iframe_' + i).empty();
		
	// Stop timeout timers
	
}

