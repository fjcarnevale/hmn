page_loaded = false;
var currently_doing = ""; // Activity done currently
var current_subtype = ""; // Activity subtype
var current_file_type; // File currently downloaded (used for download throughput where we download larger files little by little)
var container = "";
var avg_object= "";
var counter = 0; // Used for knowing which stage of the measurements we are in (example: download to origin, upload to origin, download from akamai)
var counter_max = 20;
var par_var = 0;  // (parallel) we got this number by : (num-of-objects * biggest-chunk-% / max-persistent-conn)
var container_time = 0; // Time to download container
var predicted_time = 0; // Predicted time to download a page
var test; // current_test
var test_type;
var measurements_array = new Array();
var voip_pings = 20; // Maximum number of pings
var voip_timeout = null; // Maximum number of seconds to wait (for one location)
var MOS_array; // Array of all MOS from selected region
var browser;
var voip_cities = [['Miami','DC','Philadelphia','New York','Boston'],
					['Seattle','Portland', 'LA','San Francisco', 'San Diego'],
					['Budapest','Moscow','Milan','Madrid','Oxford']];
var voip_files = [['miami_voip_ping','dc_voip_ping','ph_voip_ping','ny_voip_ping','boston_voip_ping'],
				  ['seattle_voip_ping','portland_voip_ping','la_voip_ping','sf_voip_ping','sd_voip_ping'],
				  ['budapest_voip_ping','moscow_voip_ping','milan_voip_ping','madrid_voip_ping','oxford_voip_ping']];

results_to_send = {}; // Object with all results (we send this to DB)
start_time = 0; // Start of measurement (when we want time limit)
var ready_to_perform_measurements = 0;
var download_speed;
var upload_speed;
var download_size; // Size of the last object downloaded
var tasks_array;
var activities_list = ['news','social','shopping','file_hosting','game','camera','voip'];
var voip_medians; // Medians for all locations in selected area
var list_obtained; // Boolean for list of game server obtained
total_estimated_time = 0;
var session_results = {};
start_measurement_time = null;
automatic_testing = false; // Did test execute automatically or because user clicked
test_running = false;
periodic_test_timer = null;
session_testing_number = 0;
interval_between_tests = 5; // In minutes
test_mode = false; // Parameter set for testing purposes
graph_created = 0;
var dots_in_tests_title = 0; // Used for test tab running indicator;
var test_tab_running_indicator_timer = null;
last_output_text = {};

function build_results_page(){

	// Hide everything to start
	var results_divs = document.getElementById("results_page").children;
	for(var i=0;i<results_divs.length;i++){
		results_divs[i].style.visibility='hidden';
		results_divs[i].style.display='none';
	}
	

	// Reveal results only for what we testsed for
	for (i in activities_list) {
		string = activities_list[i] + "_item";
		//this_group_tasks = document.getElementsByName(string);
		this_group_tasks = getElementsByName_iefix("input", string);
		for (j in this_group_tasks) {
			this_checkbox = this_group_tasks[j];				
			if (this_checkbox.checked) {
				document.getElementById(this_checkbox.value+'_results_div').style.visibility='visible';
				document.getElementById(this_checkbox.value+'_results_div').style.display='block';
				//alert(activities_list[i]);
				//alert(this_checkbox.value);			
			}
		}
	}
}

// Getting all activities selected
function get_all_information(auto_testing) {
	if ((!auto_testing) && (!total_estimated_time))
		return;

	if (test_running) {
		if (periodic_test_timer)
			clearTimeout(periodic_test_timer);
		periodic_test_timer = setTimeout(function() {get_all_information(true);}, 1000 * 60 * interval_between_tests);
		return;
	}

	test_running = true;
	indicate_test_tab_running(); // Show tab title when running
	automatic_testing = auto_testing;
	session_testing_number++;

	if (periodic_test_timer)
		clearTimeout(periodic_test_timer);
		
	periodic_test_timer = setTimeout(function() {get_all_information(true);}, 1000 * 60 * interval_between_tests);
	//alert(last_tasks_array);
	measurement_time = new Date().getTime();
	if (!start_measurement_time)
		start_measurement_time = measurement_time;		
	
	document.getElementById('measurements_button').disabled = true;
	results_to_send = {};
	
	// We take all spans and clear them
	var spans = document.getElementsByTagName("span");
	for (var i = 0; i < spans.length; i++) {
		spans[i].innerHTML = "";
	}	
	// Create list of all tasks
	tasks_array = new Array();
	// Add tasks
	tasks_array.push(['start', '']);
	tasks_array.push(['cache', '']);
	for (i in activities_list) {
		string = activities_list[i] + "_item";
		//this_group_tasks = document.getElementsByName(string);
		this_group_tasks = getElementsByName_iefix("input", string);
		for (j in this_group_tasks) {
			this_checkbox = this_group_tasks[j];				
			if (this_checkbox.checked) {
				display_not_started(activities_list[i], this_checkbox.value); 
				tasks_array.push([activities_list[i],this_checkbox.value]);				
			}
		}
	}
	process_remaining_tasks(); // Start dequeueing tasks
}

// Function that is called when we start testing and every time a task is completed
function process_remaining_tasks() {
	session_results[measurement_time] = results_to_send; // Update with new results
	if (tasks_array.length == 0) {
		//$('#survey_2').show();
		document.getElementById('measurements_button').value = "New measurements";
		test_running = false;
		// Send results and clear them
		var request = createXMLHttpRequest();
		var survey_results = get_survey_results('survey_1');
		var survey_string = survey_results ? JSON.stringify(survey_results) : "";
		var results_string = JSON.stringify(results_to_send);
		
		if (!get_cookie("user_id"))
			set_cookie("user_id", randomstring(5), 10);
		
		// Sending results
		if (results_string != "{}") {
			params = "results=" + results_string + "&survey=" + survey_string + "&cookie=" + get_cookie("user_id") + "&auto=" 
			+ automatic_testing + "&order=" + session_testing_number 
			+ "&from_game=0&user_agent=" + browser_data;
			var script_url = test_mode ? "http://cew-research.cs.wpi.edu/~mihajlo/Project/add_hmn_test_to_test_db.cgi" : "add_hmn_test_to_official_db.cgi";
			request.open("POST", script_url, true);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			request.setRequestHeader("Content-length", params.length);
			request.send(params);
			reset_survey(); // Reset connection survey
		}

		document.getElementById('measurements_button').disabled = false;
		/*var checkboxes = document.getElementsByTagName("input");
		for (var i = 0; i < checkboxes.length; i++)
			if (checkboxes[i].type == 'checkbox')
				checkboxes[i].checked = false;
		*/
		return;
	}
	
	// Remove last task and start testing it
	had_timeout = false;
	current_task = tasks_array.shift();
	start_testing(current_task[0], current_task[1]);
}


function start_testing(test_par, test_type_par) {

	// Initial Setup
	test = test_par;
	test_type = test_type_par;
	all_stored_measurements = {}; // Needed for storing all measurements, not just the reported ones
	if (test == 'voip') {
		current_subtype = test_type;		
		counter = 5 * (voip_pings + 1); // First doing 10 pings
		start_time = new Date().getTime();
		MOS_array = new Array();
		voip_medians = new Array();
		loss_array = new Array();
	}
	else if (test == 'camera') {
		current_subtype = test_type;
		current_file_type = 5; 
		counter = 4;
	}
	else if (test == 'game') {
		game_private_server = in_array(['cod2','cod4','tf2'], test_type_par) ? 1 : 0;
		ready_to_perform_measurements = 0;
		current_subtype = test_type;
	}
	else if (test == 'file_hosting') {		
		counter = 4;
	}
	else if ((test == 'news') || (test == 'social') || (test == 'shopping')) {
		counter = 0;
		current_subtype = test_type;
		current_phase = 'start';
	}
	else if (test == 'start') {
		file_counter = 0;
		total_times = 0;
	}
	else if (test == 'cache') {
		file_counter = 0;
		total_times = 0;
	}
	had_timeout = false;
	
	add_test();
	
	//	document.getElementById("start_measurement").disabled = false;
}

// add_test is a function that is called from jsFunctions.js after measurement is done
// It contains size and measurement of the file downloaded
function add_test(size, measurement) { // example: add_test(55000, 213)

	if (!test_running)
		return; // Bug in IE and Chrome, add_test() executed after everything is done sometimes
	if (test != null) {
		currently_doing = test;
	}
	if (currently_doing == 'start') {		
		//alert('start');
		if (measurement == 'timeout') {
			if (!results_to_send.packet_pair) 
				results_to_send.packet_pair = [];
			results_to_send.packet_pair.push("timeout");			
			process_remaining_tasks();
		}
		else if (file_counter == 0) {					
				
			DownloadJSDOM('packet_pair', 5, 1);
			DownloadJSDOM('packet_pair', 5, 2);
			file_counter++;
		}
		else if (file_counter == 1) {
			file_counter++;
			first_time = measurement;
			
		}
		else {
			total_times++;
			var time_between = measurement - first_time;			
			
			if (!results_to_send.packet_pair) 
				results_to_send.packet_pair = [];
			results_to_send.packet_pair.push(Math.floor(time_between));
			if (total_times == 5)
				process_remaining_tasks();
			else {
				DownloadJSDOM('packet_pair', 5, 1);
				DownloadJSDOM('packet_pair', 5, 2);
				file_counter = 1;
			}
		}
		
		
	}
	else if (currently_doing == 'cache') {		
		//alert('start');
		if (!results_to_send.cache_times) 
				results_to_send.cache_times = [];
		if (measurement) {
			if (measurement == 'timeout')
				results_to_send.cache_times.push("timeout");
			else 
				results_to_send.cache_times.push(measurement);
		}
		total_times++;
		if (total_times <= 5)
			setTimeout(function() {DownloadJSDOM('cached_item')}, 500);
		else {
			cache_median = results_to_send.cache_median = get_median(results_to_send.cache_times);
			process_remaining_tasks();
		}
		
	}
	else if  ((currently_doing == 'news') || (currently_doing == 'social') || (currently_doing == 'shopping')){
		if (measurement == 'timeout') {
			had_timeout = true;
		}
		
		if (current_phase == 'start') {
			// Display Indicator
			newNode = document.getElementById('indicator_image').cloneNode(true);			
			document.getElementById(current_subtype + "_results").innerHTML = "&nbsp;-&nbsp ";
			document.getElementById(current_subtype + "_results").appendChild(newNode);
			
			current_phase = 'container';
			DownloadJSDOM(current_subtype + "_container", 5);
			
		}
		else if (current_phase == 'container') { // Receiving container data
			current_phase = 'avg_object';
			container_time = measurement;
			par_var = size;
			avg_object_times = [];
			counter = 0;
			for (i = 0; i < 6; i++){
				DownloadJSDOM(current_subtype + "_avg_object", 5, i);
			}
		}
		else if (current_phase == 'avg_object') {
			avg_object_times.push(measurement);
			
			counter++;			
			if (counter == 6) {
				// Output results
				var avg_multi_dl_time = get_average(avg_object_times);
				var rating = 0;
				if (had_timeout) {
					rating = 0;
					predicted_time = null;
				}
				else {
					predicted_time = (container_time + avg_multi_dl_time * par_var) / 1000;
					rating = get_site_results(null, -1, predicted_time, container_time, avg_multi_dl_time);
				}
				var this_result = {};
				this_result.all_stored = avg_object_times;
				this_result.avg_multi_dl_time = avg_multi_dl_time;
				this_result.container_time = container_time;
				if (predicted_time)
					this_result.predicted_time = predicted_time.toFixed(1);
				
				this_result.rating = rating;
				
				
				if (currently_doing == 'news') {
					if (!results_to_send.news)
						results_to_send.news = {};					
					results_to_send.news[test_type] = (had_timeout) ? 'error' : this_result;
				}	
				if (currently_doing == 'social') {
					if (!results_to_send.social)
						results_to_send.social = {};
					results_to_send.social[test_type] = (had_timeout) ? 'error' : this_result;
				}	
				if (currently_doing == 'shopping') {
					if (!results_to_send.shopping)
						results_to_send.shopping = {};
					results_to_send.shopping[test_type] = (had_timeout) ? 'error' : this_result;
				}
				
				var site_name = current_subtype;
				var site_group = currently_doing;
				
				//output_results(site_name + "_results", rating, "", function() { showBox(get_site_results(site_group, 0, this_result.predicted_time, this_result.container_time, this_result.avg_multi_dl_time), this);});
				output_results(site_name + "_results", rating, "", get_site_results(site_group, 0, this_result.predicted_time, this_result.container_time, this_result.avg_multi_dl_time));
				
				document.getElementById(site_name + "_more_info_detailed").innerHTML = get_detailed_info_text();
				document.getElementById(site_name + "_history").innerHTML = "history";
				
				
				create_popup(0, site_name + "_more_info_detailed", get_site_results(site_group, 1, this_result.predicted_time, this_result.container_time, this_result.avg_multi_dl_time));
				create_popup(1, site_name + "_history", [currently_doing, test_type]);
				
				process_remaining_tasks();
			}
				
		}
		
	}
	else if (currently_doing == 'voip') {		
		if (counter == -1)
			return;
		
		if (measurement == 'timeout') {
			had_timeout = true;
			counter = Math.floor(counter / (voip_pings + 1)) * (voip_pings + 1);
		}
		world_part = current_subtype;
		
		if (counter != 5 * (voip_pings + 1)) {
			add_to_all_stored_hash(Math.floor(counter / (voip_pings + 1)), measurement);
			if (counter % (voip_pings + 1) != voip_pings) {
				measurements_array.push(measurement); // Add measurement	
				//add_to_all_stored_hash(Math.floor(counter / (voip_pings + 1)), measurement * 1000);
			}
			
			if (counter % (voip_pings + 1) == 0) { // Output results
				city = voip_cities[world_part][counter / (voip_pings + 1)];
				
				// Calculate MOS
				if (had_timeout) {
					MOS_array.push(null);
					voip_medians.push(null);
					loss_array.push(null);
					had_timeout = false;
					//alert('had tout');
						
				}
				else {
					delay = get_average(measurements_array); // Delay that will be stored (we do NOT deduct cache time)
					var one_way_delay = (delay - cache_median) / 2;
					//alert("d:" + delay);
					id = 0.024 * one_way_delay + (one_way_delay > 177.3) ? 0.11 * (one_way_delay - 177.3) : 0;
					loss = get_loss(measurements_array) / 100;
					il = 30 * Math.log(1 + 15 * loss);
					r = 94 - id - il;
					er = (1.0 + 0.035 * r + 0.000007 * r * (r - 60) * (100 - r)).toFixed(1);
					MOS_array.push(er);			

					voip_medians.push(delay);
					loss_array.push(loss);
	
				}
				start_time = new Date().getTime();
				measurements_array = [];
			}		
		}
		else {			
			//document.getElementById('voip_results_' + world_part).innerHTML += "<br />" + line();
		}		
		counter--;
		//document.getElementById('voip_results_' + world_part).innerHTML = "<br /><br />" +(100 - counter * 100 / 5 / (voip_pings + 1)).toFixed(1) + "% voice testing done <br />";
		output_progress_percent('voip_results_' + world_part, (100 - counter * 100 / 5 / (voip_pings + 1)).toFixed(1), "voice testing");
		end_time = new Date().getTime();
		if ((voip_timeout != null) && (end_time - start_time > voip_timeout)) { // Time exceeded
			while (counter % (voip_pings + 1) != 0)
				counter--;
		}
		if (counter >= 0)
			setTimeout(function() {DownloadJSDOM(voip_files[world_part][Math.floor(counter / (voip_pings + 1))])}, 500);
			//PingJSDOM(null, voip_cities[world_part][counter / (voip_pings + 1)], voip_files[world_part][Math.floor(counter / (voip_pings + 1))], 1)
		else {			
			MOS_array = MOS_array.filter(Number);
			mos_print = print_array(MOS_array);
			mos_median = get_median(MOS_array);
			// Getting loss for median MOS
			var corresponding_loss;
			for (i = 0; i < MOS_array.length; i++) {
				if (MOS_array[i] == mos_median)
					corresponding_loss = loss_array[i];
			}
			rating = 1;
			// MOS interpretation
			if (mos_median >= 4.34)
				rating = 5;
			else if (mos_median >= 4.03)
				rating = 4;
			else if (mos_median >= 3.60)
				rating = 3;
			else if (mos_median >= 3.10)
				rating = 2;			
			
			median_delay = get_median(voip_medians) - cache_median;
			
			
			
		
			var this_result = {};				
			if (median_delay) {
				this_result.rating = rating;
				this_result.all_medians = voip_medians;
				this_result.all_losses = loss_array;
				this_result.delay = median_delay.toFixed(0);
				this_result.mos = mos_median;
				this_result.all_stored = all_stored_measurements;
				this_result.corresponding_loss = corresponding_loss;
			}
			else
				rating = 0;
			
			if (!results_to_send.voip)
				results_to_send.voip = {};
			results_to_send.voip[world_part] = (had_timeout) ? 'error' : this_result;	
			
			// Clean arrays
			voip_medians = new Array();
			loss_array = new Array();
			
			// Fill rating, detailed info and history
			output_results('voip_results_' + world_part, rating, "Voice", get_voip_results(0, world_part));
			details = document.getElementById("voip_" + world_part + "_more_info_detailed");
			details.innerHTML = get_detailed_info_text();			
			
			document.getElementById("voip_" + world_part + "_history").innerHTML = "history";
			
			create_popup(0, "voip_" + world_part + "_more_info_detailed", get_voip_results(1, world_part));
			create_popup(1, "voip_" + world_part + "_history", [currently_doing, world_part]);
				
			process_remaining_tasks();
			
		}
	}
	else if (currently_doing == 'camera') { // Testing upload and download speed for camera
	
		if (counter == 4) { // Start download tests	

			world_part = current_subtype;
			
			output_progress_time('camera_results_' + world_part, 15, 'video testing');
			document.getElementById('camera_ind_' + world_part).style.display = 'inline';
			document.getElementById('camera_ind_' + world_part).style.visibility = 'visible';
				
			
			XMLHTTPRequestDownLoad(null, current_file_type);
			counter--;
		}
		else if (counter == 3) { // Receive Dl results
			var dl_object = {};
			dl_object.size = size;
			dl_object.time = measurement;
			add_to_all_stored_hash('camera_download', dl_object);
			helper = measurement;			
			if (helper > 2000 || current_file_type == 13) { // We downloaded file for at least 2 sec or the max size file
				counter--;
				download_speed = calculate_dl_speed(size, measurement);
				download_size = size;
				runXHRUploadTest(null, 32000); // Start upload tests
			}
			else { // We try to download larger file
				while (current_file_type < 13 && helper < 3000) {
					current_file_type++;
					helper *= 2;
				}
				XMLHTTPRequestDownLoad(null, current_file_type);
			}
			
		}
		else if (counter == 2) { // Receive Upload results
			helper = measurement;
			helper2 = size;
			// Store this upload result
			var upl_object = {};
			upl_object.size = size;
			upl_object.time = measurement;
			add_to_all_stored_hash('camera_upload', upl_object);
			if (helper > 2000) { // We downloaded file for at least 2 sec or the max size file
				// Done with both download and uplaod
				upload_speed = calculate_dl_speed(size, measurement);				
				
				counter--;
				
				// Start downloading Akamai file(s)
				file_to_download = 0;
				while ((file_to_download < 7) && (give_file("akamai_download_" + file_to_download)[1] < download_size))
					file_to_download++;
				DownloadJSDOM("akamai_download_" + file_to_download, 12);
				
			}
			else { // We try to download larger file
				runXHRUploadTest(null, Math.floor(3000 * helper2 / helper));
			}
			
		}
		else { // Receiving Akamai Results
			
			var helper = world_part;
			rating = 1;
			
			var dl_object = {};
			dl_object.size = size;
			dl_object.time = measurement;
			add_to_all_stored_hash('camera_akamai', dl_object);
			
			var this_result = {};
			var akamai_speed =  calculate_dl_speed(size, measurement);
			if (!akamai_speed || !upload_speed || !download_speed) {
				rating = 0;
				this_result.rating = 0;
			}
			else {
				var actual_upload_speed = upload_speed * akamai_speed / download_speed;				
				if (akamai_speed > 187 && actual_upload_speed > 187)
					rating = 5;
				else if (akamai_speed > 150 && actual_upload_speed > 150)
					rating = 4;	
				else if (akamai_speed > 50 && actual_upload_speed > 50)
					rating = 3;	
				else if (akamai_speed > 16 && actual_upload_speed > 16)
					rating = 2;	
							
				this_result.all_stored = all_stored_measurements;
				this_result.dl_tput = download_speed;
				this_result.upl_tput = upload_speed;
				this_result.akamai_tput = akamai_speed;
				this_result.calculated_upl_tput = parseInt(actual_upload_speed);
				this_result.rating = rating;
				
					
			}	
			
			if (!results_to_send.camera)
				results_to_send.camera = {};
			results_to_send.camera[world_part] = this_result;
			
			var helper2 = world_part;
			output_results('camera_results_' + world_part, rating, "Video", get_camera_results(0, helper));
			document.getElementById('camera_ind_' + world_part).style.display = 'none';
			document.getElementById('camera_ind_' + world_part).style.visibility = 'hidden';
			
			document.getElementById("camera_" + world_part + "_history").innerHTML = "&nbsp;history";
			//document.getElementById("camera_" + world_part + "_history").onmouseover = function() { showBox(get_graph_container_page(), this); drawGraph('camera', helper2);}
			//document.getElementById("camera_" + world_part + "_history").onmouseout = function() { hideBox();}
				
			// Changing onmouseover and onmouseout for detailed info label
			details = document.getElementById("camera_" + world_part + "_more_info_detailed");
			//details.onmouseover = function() { showBox(get_camera_results(1, helper), this);}
			//details.onmouseout = function() { hideBox();}
			details.innerHTML = get_detailed_info_text();
			
			create_popup(0, "camera_" + world_part + "_more_info_detailed", get_camera_results(1, world_part));
			create_popup(1, "camera_" + world_part + "_history", [currently_doing, world_part]);
						
			process_remaining_tasks();
		}
	}
	else if (currently_doing == 'game') {		
		if (ready_to_perform_measurements == 1) { // Here we do measurements for both public and private servers
			if (measurement != 'timeout') {
				if (measurement)
					counter++;
			}
			else {
				// Go to next server
				counter = (Math.floor(counter / 20) + 1) * 20;
			}
			//	had_timeout = true; // First Timeout
			//alert('ct: ' + counter);
			output_progress_percent('game_results_' + current_subtype, Math.floor(counter * 100 / counter_max), "game testing");
			if (counter <= counter_max) {// Still not done testing
				
				
				//alert('dd2');
				if ((measurement) && (measurement != 'timeout')) {
					current_rtt_array.push(measurement);
				}
				//alert('getting server');
				if (game_private_server == 1){
					setTimeout(function() {DownloadJSDOM(null, null, 5, 0, current_server + '/ttt.txt')}, 500);
					//setTimeout(function() {DownloadJSDOM("akamai_download_" + 4, 8);}, 500);						
				}else
					setTimeout(function() {DownloadJSDOM('game_' + current_subtype)}, 500);
								
				if (counter % 20 == 0) { // Done with this location for measurements
					//alert('mod 20 = 0');
					
					index = counter / 20 - 1;
					all_rtt_array[index] = current_rtt_array.slice(0);
					current_rtt_array.shift();
					
					//alert("current cache: " + current_cache_array);
					
					current_rtt_array = new Array();
					current_server = 'http://' + server_list[index + 1];
					
				}
			}
			else { // Done with measurements
				//alert('done');
				all_stored_measurements.all_rtt_array = all_rtt_array;
				var average_rtt = new Array();
				for (var i = 0; i < all_rtt_array.length; i++) {
					average_rtt[i] = get_average(all_rtt_array[i]);
				}
				var subtype = current_subtype;
				var servers = server_list;
				var is_private = game_private_server;
				var cache_var = cache_median;
				rating = get_game_results(-1, average_rtt, cache_var, current_subtype, servers, is_private);
				//
				var this_result = {};				
			
				this_result.all_stored = all_stored_measurements;
				this_result.average_rtt = average_rtt;
				this_result.servers = servers;
				this_result.is_private = is_private;
				this_result.rating = rating;
			
			
				if (!results_to_send.game)
					results_to_send.game = {};
				results_to_send.game[current_subtype] = this_result;
				
				
				output_results('game_results_' + current_subtype, rating, '', get_game_results(0, average_rtt, cache_var, subtype, servers, is_private));
				
				document.getElementById('game_results_' + current_subtype + "_more_info_detailed").innerHTML = get_detailed_info_text();
				
				document.getElementById(current_subtype + "_history").innerHTML = "history";
				
				create_popup(0, 'game_results_' + current_subtype + "_more_info_detailed", get_game_results(1, average_rtt, cache_var, subtype, servers, is_private));
				create_popup(1, current_subtype + "_history", [currently_doing, current_subtype]);
							
				
				ready_to_perform_measurements = 0;
				process_remaining_tasks();
				
			}
		}
		else if (game_private_server) { // Obtain servers for games that have private servers
			if (list_obtained == 1) { // List was just obtained using get_closest_servers() function
									  // Here we initialize variables	
				list_obtained = 0;
				ready_to_perform_measurements = 1;
				counter_max = server_list.length * 20;
				counter = 0;
				current_server = 'http://' + server_list[0];
				add_test();
			}			
			else {  // We still didn't obtain list of servers
				get_closest_servers();
				current_rtt_array = new Array();
				current_cache_array = new Array();
				all_rtt_array = new Array();
				all_cache_array = new Array();
			}
		}
		else { // Games with public servers
			current_rtt_array = new Array();
			current_cache_array = new Array();
			all_rtt_array = new Array();
			all_cache_array = new Array();
			server_list = new Array();
			server_list.push(give_file[current_subtype]);
			ready_to_perform_measurements = 1;
			counter_max = server_list.length * 20;
			counter = 0;
			add_test();	
		}
	}
	else if (currently_doing == 'file_hosting') { // Testing upload and download speed for camera
		if (counter == 4) { // Start download tests		
			//document.getElementById('file_hosting_results_' + current_subtype).innerHTML = " - Doing tests. This should take about 10 seconds.";
			output_progress_time('file_hosting_results', 15, "testing of file hosting");
			document.getElementById('file_hosting_indicator' ).style.display = 'inline';
			document.getElementById('file_hosting_indicator').style.visibility = 'visible';
			current_file_type = 5;
			XMLHTTPRequestDownLoad(null, current_file_type);
			counter--;
		}
		else if (counter == 3) { // Receive Dl results
			var dl_object = {};
			dl_object.size = size;
			dl_object.time =  measurement;
			add_to_all_stored_hash('download', dl_object);
			helper = measurement;			
			if (helper > 2000 || current_file_type == 13) { // We downloaded file for at least 2 sec or the max size file
				// Start upload tests
				counter--;
				download_speed = calculate_dl_speed(size, measurement);
				download_size = size;
				runXHRUploadTest(null, 32000);
			}
			else { // We try to download larger file
				while (current_file_type < 13 && helper < 3000) {
					current_file_type++;
					helper *= 2;
				}
				XMLHTTPRequestDownLoad(null, current_file_type);
			}
			
		}
		else if (counter == 2) { // Receive Upload results
			var upl_object = {};
			upl_object.size = size;
			upl_object.time = measurement;
			add_to_all_stored_hash('upload', upl_object);
			
			helper = measurement;
			helper2 = size;
			if (helper > 2000) { // We downloaded file for at least 2 sec or the max size file
				// Done with both download and uplaod
				upload_speed = calculate_dl_speed(size, measurement);
				counter--;
				file_to_download = 0;
				while ((file_to_download < 7) && (give_file("akamai_download_" + file_to_download)[1] < download_size))
					file_to_download++;
				DownloadJSDOM("akamai_download_" + file_to_download, 12);
				
			}
			else { // We try to download larger file
				runXHRUploadTest(null, Math.floor(3000 * helper2 / helper));
			}
			
		}
		else if (counter == 1) {
			
			var akamai_download_speed = calculate_dl_speed(size, measurement);
			var dl_speed = download_speed;
			var upl_speed = upload_speed;
			
			rating = get_file_hosting_results(-1, akamai_download_speed, dl_speed, upl_speed);
			var this_result = {};				
			
			this_result.all_stored = all_stored_measurements;
			this_result.akamai = {};
			this_result.akamai.size = size;
			this_result.akamai.time = measurement;
			
			this_result.rating = rating;
			this_result.dl_tput = dl_speed;
			this_result.upl_tput = upl_speed;
			this_result.akamai_speed = akamai_download_speed;
			this_result.calculated_upl_tput = parseInt(akamai_download_speed * upl_speed / dl_speed);
			
			if (!results_to_send.file_hosting)
				results_to_send.file_hosting = this_result;
			
				//
			//var ratio = download_speed / upload_speed;
			
			output_results('file_hosting_results' , rating, "", get_file_hosting_results(0, akamai_download_speed, dl_speed, upl_speed));
			
			// Changing onmouseover and onmouseout for detailed info label
			details = document.getElementById("file_hosting_results_more_info_detailed");
			//details.onmouseover = function() { showBox(get_file_hosting_results(1, akamai_download_speed, dl_speed, upl_speed), this);}
			//details.onmouseout = function() { hideBox();}
			details.innerHTML = get_detailed_info_text();
			
			// history onmouseover and mouseout
			
			document.getElementById("file_hosting_history").innerHTML = "history";
			//document.getElementById("file_hosting_history").onmouseover = function() { showBox(get_graph_container_page(), this); drawGraph('file_hosting');}
			//document.getElementById("file_hosting_history").onmouseout = function() { hideBox();}
				
			create_popup(0, "file_hosting_results_more_info_detailed", get_file_hosting_results(1, akamai_download_speed, dl_speed, upl_speed));
			create_popup(1, "file_hosting_history", [currently_doing]);
				
			
			document.getElementById('file_hosting_indicator').style.display = 'none';
			document.getElementById('file_hosting_indicator').style.visibility = 'hidden';
			process_remaining_tasks();
		}		
	}

}

function line() {
	ret_value = ""
	for (i = 0; i < 100; i++)
		ret_value += "-";
	return ret_value + "<br />";
}
function get_average(the_array) {
	//the_array = the_array.filter(Number);
	sum = 0;
	for (i = 0; i < the_array.length; i++) {
		sum += the_array[i];
	}
	return (sum / the_array.length).toFixed(2);
}

function get_minimum(the_array) {
	min = the_array[0];
	for (i = 0; i < the_array.length; i++)
		if (min > the_array[i])
			min = the_array[i];

	return min;
}

function sort_function(a, b){
	return a - b;
}

function get_median(the_array) {
	//alert('array: ' + the_array)
	the_array = the_array.filter(Number);
	//alert('filtered: ' + the_array);
	var total = the_array.length;
	//alert('total: ' + total);
	if (total == 0)
		return null;
	the_array.sort(sort_function);
	//alert('sorted: ' + the_array);
	if (total % 2 == 1) {
		//alert('here: ' + the_array[(total - 1) / 2]);
		return the_array[(total - 1) / 2]; // Middle element
	}
	return (parseFloat(the_array[total / 2]) + parseFloat(the_array[total / 2 - 1])) / 2; // Average of two middle elements
	
}

function get_loss(the_array) {
	the_array.sort();
	total = the_array.length;
	median = 0;
	if (total % 2 == 1) {
		median = the_array[(total + 1) / 2];
	}
	else
		median = (the_array[total / 2] + the_array[total / 2 + 1]) / 2;
	
	
	lost_packets = 0;
	for (var i in the_array) {
		if (the_array[i] >= 3 * median)
			lost_packets++;
	}
	return (lost_packets * 100 / total);	
}

function get_stdev(the_array) {
	average = get_average(the_array);
	sum = 0;
	for (i = 0; i < the_array.length; i++) {
		sum += (the_array[i] - average) * (the_array[i] - average);
	}
	return (Math.sqrt(sum / the_array.length)).toFixed(2);
}

function print_array(the_array) {
	output = "";
	for (i = 0; i < the_array.length; i++) {
		output += the_array[i] + " ";
	}
	return output;
}

function deduct_cache(the_array) {
	min = the_array[0];
	for (i = 2; i < the_array.length; i+=2)
		if (min > the_array[i])
			min = the_array[i];
	return_array = new Array();
	for (i = 3; i < the_array.length; i+=2)
		return_array.push(the_array[i] - min);
	return return_array;
}

function start_measurements() {
	document.getElementById("start_measurement").disabled = true;

	news_radio_buttons = document.getElementsByName_iefix("news_item");
	for(var k=0;k<news_radio_buttons.length;k++)
          if(news_radio_buttons[k].checked){
            add_test("news",news_radio_buttons[k].value);
       }

}

function select_value(radio_group) {	
	var all_items = document.getElementsByName_iefix(radio_group);	
	for (i = 0; i < all_items.length; i++) {
		if (all_items[i].checked){
			return all_items[i].value;
		}
	}
}

function multi_download(link){
}

function output_results(results_id, grade, message, show_text) {
	results_object = document.getElementById(results_id);
	grade_interpretation = "";
	grade_interpretation = characterize_rating(grade);
	results_object.innerHTML = "&nbsp;- " + message + " Rating: <span id='characterization_" + results_id + "'>" + grade_interpretation + "</span>";
	
	// Changing mouseover and mouseout for characterization label
	/*characterization_info = document.getElementById('characterization_' + results_id); 
	characterization_info.onmouseover = show_function;
	characterization_info.onmouseout = function() {hideBox();};*/
	create_popup(0, results_id, show_text);
	
}

function output_progress_percent(progress_id, percent, message) {
	progress_object = document.getElementById(progress_id);
	progress_object.style.backgroundColor = document.body.style.background;
	progress_object.style.color = document.body.style.color;
	percent = (percent > 100) ? 100 : percent;
	progress_object.innerHTML = "&nbsp;- <span class='progress'>" + percent + " % of " + message + " done </span>";
}

function output_progress_time(progress_id, time, message) {
	progress_object = document.getElementById(progress_id);
	progress_object.style.backgroundColor = document.body.style.background;
	progress_object.style.color = document.body.style.color;
	progress_object.innerHTML = "&nbsp;- <span class='progress'>Doing " + message + ", about " + time + " seconds remaining </span>";
}
function explain(obj){
	value = document.getElementById(obj.id + "_time").innerHTML;
	txt = 'For reviewing a news site <br /> Excellent time is: <b> 5 seconds or less </b><br /> Very good time is: <b> 5 to 10 seconds</b><br /> Good time is: <b>10 to 15 seconds</b><br /> Fair time is: <b>15 to 25 seconds</b><br /> Poor time is: <b> more than 25 seconds</b><br /> Your time is: <b>' + value + '</b> seconds for this news site';
	return txt;
}
function news_result(news_site, pre_time, container_time, avg1, multi_avg, f_avg, s_avg, t_avg){
	this.site = news_site;
	this.pre_time = pre_time;
	this.container_time = container_time;
	this.avg1 = avg1;
	this.multi_avg = multi_avg;
	this.f_avg = f_avg;
	this.s_avg = s_avg;
	this.t_avg = t_avg;
}

function getElementsByName_iefix(tag, name) { // IE had some issues with getElementsByName
     
     var elem = document.getElementsByTagName(tag);
     var arr = new Array();
     for(i = 0,iarr = 0; i < elem.length; i++) {
          att = elem[i].getAttribute("name");
          if(att == name) {
               arr[iarr] = elem[i];
               iarr++;
          }
     }
     return arr;
}

function get_closest_servers() {
	request = createXMLHttpRequest();
	
	var script_url = test_mode ? "http://cew-research.cs.wpi.edu/~mihajlo/Project/get_closest_servers.cgi?game=" : "get_closest_servers.cgi?game=";
	var link = script_url + current_subtype;
	request.open("GET", link , true)
	request.onreadystatechange = function(evt) {
		// IE will throw an exception when accessing an incomplete request (while it's downloading).
		// We handle that and not gather information about each received "packet".
		try {
			// stateArray.push(new Array(new Date(), request.readyState, request.responseText.length));
		} catch (e) {
			// stateArray.push(new Array(new Date(), request.readyState));
		}
		if (request.readyState == 4 && request.status == 200) {
			clearTimeout(request_timeout);
			//alert(request.responseText);
			var match = request.responseText.match(/\d+.\d+.\d+.\d+/g);
			server_list = match;
			list_obtained = 1;
			add_test();
			
			// Call add_test
		}
	
	}
	
	
	var request_timeout = setTimeout("ajaxTimeout();", 5000);
	
	
	request.send(null);
}

function ajaxTimeout(){
	   request.abort();
	   server_list = [];
	   list_obtained = 1;
	   add_test();
}

function in_array(the_array, value){ 
  var i; 
  for(i=0; i < the_array.length; i++){ 
    if(the_array[i] === value) 
      return true; 
  }; 
  return false; 
}

function get_output() {
	alert(str);
}

function set_cookie(c_name,value,exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

function get_cookie(c_name) {
	var i,x,y,ARRcookies = document.cookie.split(";");
	for (i=0; i<ARRcookies.length; i++)
	{
	  x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x = x.replace(/^\s+|\s+$/g,"");
	  if (x == c_name)
		{
		return unescape(y);
		}
	  }
}

function randomstring(L){
    var s= '';
    var randomchar=function(){
        var n= Math.floor(Math.random()*62);
        if(n<10) return n; //1-10
        if(n<36) return String.fromCharCode(n+55); //A-Z
        return String.fromCharCode(n+61); //a-z
    }
    while(s.length< L) s+= randomchar();
    return s;
}

function get_survey_results(div_id) {
	var return_value = {};		
	var empty = true;
	
	var survey_div = document.getElementById(div_id);
	var answers = survey_div.getElementsByTagName('input');
	
	for (i = 0; i < answers.length; i++) {
		// Survey questions about locations and connection
		if ((answers[i].type == 'radio') && (answers[i].checked)) {
			return_value[answers[i].name] = answers[i].value;
			if (answers[i].value != 'not_selected')
				empty = false;
		}
		
		// Additional activities
		if ((answers[i].name == 'additional_activity') && (answers[i].checked)) {
			if (!return_value['additional_activity'])
				return_value['additional_activity'] = new Array(); // Additional_activities from survey
			if (answers[i].value == 'other')
				return_value[answers[i].name].push(document.getElementById('other_activity').value);
			else
				return_value[answers[i].name].push(answers[i].value);
			empty = false;
		}
	}
	
	if (document.getElementById(div_id + '_comment')) {
		var comment = document.getElementById(div_id + '_comment').value || "";
		if (comment != "") {
			return_value['feedback'] = comment;
			empty = false;
		}
	}
	
	if (empty)
		return null;
	
	return return_value;
}

function get_graph_container_page() {
	return "<br /><div id='graph_div' style='width:600px;height:300px;'></div>";
}

function change_interval(el) {
	interval_between_tests = el.options[el.selectedIndex].value;
}

function send_feedback(survey_id) {
	$('#send_feedback').disabled = true;
	var survey = get_survey_results(survey_id);
	if (!survey)
		return;
	var survey_string = JSON.stringify(survey);
	//alert(results_string);
	if (!get_cookie("user_id"))
		set_cookie("user_id", randomstring(5), 10);
		
	
	// Sending results
	params = "survey=" + survey_string + "&cookie=" + get_cookie("user_id") + "&auto=" + automatic_testing 
			+ "&order=" + session_testing_number + "&from_game=0&user_agent=" + browser_data;
	var request = createXMLHttpRequest();
	var script_url = test_mode ? "http://cew-research.cs.wpi.edu/~mihajlo/Project/add_hmn_test_to_test_db.cgi" : "add_hmn_test_to_official_db.cgi"
	request.open("POST", script_url, true);
	request.onreadystatechange = function() {
		//alert('now');
		if (request.readyState == 4) {
			//alert("status: " + request.status);
			$('#send_feedback').disabled = false;
			$('#'+ survey_id +'_feedback_sent').show();
			setTimeout(function() {$('#'+ survey_id +'_feedback_sent').fadeOut("slow");}, 1000 * 3);
			
		}
	}
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Content-length", params.length);
	request.send(params);
	reset_additional_activities_and_comment(); // Reset data sent already

	//document.getElementById('send_feedback').disabled = false;
}

function reset_survey() {
	var survey_div = document.getElementById('survey_1');
	var answers = survey_div.getElementsByTagName('input');
		
	for (i = 0; i < answers.length; i++) 
		if ((answers[i].type == 'radio') && (answers[i].value == 'not_selected'))
			answers[i].checked = true;	
}

function reset_additional_activities_and_comment() {
	var survey_div = document.getElementById('survey_2');
	var answers = survey_div.getElementsByTagName('input');
		
	for (i = 0; i < answers.length; i++) 
		if (answers[i].type == 'checkbox')
			answers[i].checked = false;	
	
	$("#survey_2_comment").val("");
	$("#other_activity").val("");
}

function add_to_all_stored_hash(array_key, value) {
	if (!all_stored_measurements[array_key])
		all_stored_measurements[array_key] = [];
	(all_stored_measurements[array_key]).push(value);
}

function calculate_dl_speed(file_size, time) {
	return parseInt(file_size * 1000 / (time - cache_median) / 1024);
}

function stop_measurements() {	
	// Clear all iframes
	document.getElementById('iframe').empty();
	
	for (i = 1; i <= 6; i++)
		$('iframe_' + i).empty();
	// Clear all HTTP requests
	//client.abort();
	cancel_requests();

}

function create_popup(type, element_id, par) {
	last_output_text[element_id] = par;
	$("#" + element_id).live('mouseover', function(event) {		
		if (graph_created)
			return;
		graph_created = 1;
		var div_text;
		if (type == 0)
			div_text = '<div class="messagepop pop">' + last_output_text[element_id] + '</div>';
		else
			div_text = '<div class="messagepop pop" id="graph_div"></div>';
				
		$(this).parent().append(div_text);		
			
		if (type == 1) {
			var ar_length = par.length;
			if (ar_length > 2)
				drawGraph(par[0],par[1],par[2]);
			else if (ar_length > 1)
				drawGraph(par[0],par[1]);
			else
				drawGraph(par[0]);
			//alert(par[0] + " " + par[1] + ar_length);
		}
		return false;
	});
				
	$("#"+ element_id).live('mouseout', function(event) {		
		graph_created = 0;
		$(".pop").remove();
		return false;
	});
}

function indicate_test_tab_running() {
	dots_in_tests_title = dots_in_tests_title % 3 + 1;
	var title = "Tests";
	for (var i = 0; i < dots_in_tests_title; i++)
		title += ".";
	for (var i = dots_in_tests_title; i < 3; i++)
		title += "&nbsp;";
	
	var test_tab_title;
	var all_links = document.getElementsByTagName('a');
	for (var i = 0; i < all_links.length; i++) {
		if (all_links[i].title == 'Tests') {
			test_tab_title = all_links[i];
			test_tab_title.innerHTML = title;
		}
	}	
	//alert('eeee');
	if (test_running)
		test_tab_running_indicator_timer = setTimeout(function() {indicate_test_tab_running();}, 1000);
	else {
		test_tab_title.innerHTML = "Tests";
		dots_in_tests_title = 0;
	}
	
	
	
}
