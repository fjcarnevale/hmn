// Toggle div
function toggle_div(el, div_id) {	
	is_visible = !el.checked;	
	document.getElementById(div_id).style.visibility = (is_visible) ? 'hidden' : 'visible';
	document.getElementById(div_id).style.display= (is_visible) ? 'none' : 'block';
}

/*
	Display estimate for each activity
	element - where to put the text
	time - time in seconds
	id - id of element where to put the text
*/

function show_estimate(element, time, id) {
	if (test_running)
		return;
	total_estimated_time += time * ((element.checked) ? 1 : -1);
	click_default_checkboxes = false;
	display_total_estimate(total_estimated_time);
	if (!id)
		id = element.value + "_results";
	results_element = document.getElementById(id); 

	// We don't display estimate if there is rating from previous run displayed
	if (results_element.innerHTML.match(/star.gif/))
		return;
		
	results_element.innerHTML = (element.checked) ? " - Estimated time to test: <em>" +  time + "</em> seconds" : "";
	
}

/*
	Display total estimate
	time - total time in seconds
*/
function display_total_estimate(time) {	
	var tm = new Date(time * 1000) 
	var minutes = tm.getUTCMinutes(); 
	var seconds = tm.getUTCSeconds();
	var output_time = ((minutes < 10) ? "0" : "") + minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;
	document.getElementById('total_estimated_time').innerHTML = "Total estimated time: " + output_time;
}

// Disabling or enabling other_activity in additional activities survey
function show_hide_other_activity_box(this_checkbox) {
	document.getElementById('other_activity').disabled = !this_checkbox.checked;
}

// Function that displays that the measurements for activity still didn't start but will soon
function display_not_started(activity, subtype) {

	var display_text = "<span class='results_not_started'> - Not started yet </span>";
	if (activity == 'game')
		document.getElementById('game_results_' + subtype).innerHTML = display_text;
	else if ((activity == 'camera') || (activity == 'voip'))
		document.getElementById(activity + '_results_' + subtype).innerHTML = display_text;
	else
		document.getElementById(subtype + '_results').innerHTML = display_text;
}

// Retrieve stats with all users ratings (or similar users)
function get_user_stats(user_type) {
	// Show tab for results	
	change_tab((user_type == 'all') ? 'All Users History' : 'Similar Users History'); 
	scroll(0, 0);
	
	$('#' + user_type + '_stat_loading_indicator').show(); // Show load indicator
	
	$.get(((test_mode) ? 'history-test.txt?' : 'history.txt?') + new Date().getTime(), function(data) {
		var history_hash = JSON.parse(data);
		
		var history_last_modified = history_hash['date'];
		var stat_hash = history_hash['results'];//.parseJSON();
		
		// Get characteristics user selected
		var helper = (user_type == 'all') ? "" : "connection_";
		var survey = get_survey_results((user_type == 'all') ? 'stat_survey' : 'survey_1');
		
		var selected_type;
		var selected_location;
		var selected_access; 
		if (survey) {
			selected_type = survey[helper + 'type'];
			selected_location = survey[helper + 'location'];
			selected_access = survey[helper + 'access'];
		}
		else {
			selected_type = "unknown";
			selected_location = "unknown";
			selected_access = "unknown";
		}
		
		if ((selected_type == 'dont_know') || (selected_type == 'not_selected') || (selected_type == 'other'))
			selected_type = "unknown";
		if ((selected_location == 'dont_know') || (selected_location == 'not_selected') || (selected_location == 'other'))
			selected_location = "unknown";
		if ((selected_access == 'dont_know') || (selected_access == 'not_selected') || (selected_access == 'other'))
			selected_access = "unknown";	
		
		// Go throught hash from file retrieved and populate related results_hash
		var related_results_hash = {};
		for (var type in stat_hash) {
			for (var access in stat_hash[type]) {
				for (var location in stat_hash[type][access]) {
					if (((type != selected_type) && (selected_type != 'unknown')) ||
						((access != selected_access) && (selected_access != 'unknown')) ||
						((location != selected_location) && (selected_location != 'unknown')))		
						continue; // Not the type of user we want

					for (var activity in stat_hash[type][access][location]) {
						var results_object = stat_hash[type][access][location][activity];
						if (results_object.constructor.toString().indexOf("Array") != -1) { // Results for activities with no subtypes
							if (!related_results_hash[activity])
								related_results_hash[activity] = [0, 0, 0, 0, 0];
							related_results_hash[activity] = add_two_rating_arrays(related_results_hash[activity], results_object);
						}
						else { // Results for activities that have subtypes
							if (!related_results_hash[activity])
									related_results_hash[activity] = {};
							for (var subtype in results_object) {
								if (!related_results_hash[activity][subtype])
									related_results_hash[activity][subtype] = [0, 0, 0, 0, 0];
							
								related_results_hash[activity][subtype] = add_two_rating_arrays(related_results_hash[activity][subtype], results_object[subtype]);
							}
						}
					}
				}
			}	
		}
		
		// Find all checkboxes selected
		var selected_tasks = new Array();
		for (i in activities_list) {
			string = activities_list[i] + "_item";
			this_group_tasks = getElementsByName_iefix("input", string);
			for (j in this_group_tasks) {
				this_checkbox = this_group_tasks[j];				
				if  ((this_checkbox.checked) || (user_type == 'all')) {
					selected_tasks.push([activities_list[i], this_checkbox.value]);				
				}
			}
		}
				
		var graph_activities = [];
		var graph_data = [];
		for (var i = 0; i < 5; i++)
			graph_data[i] = [];
		
		for (var activity in related_results_hash) {if (related_results_hash[activity].constructor.toString().indexOf("Array") != -1) {
				if (!in_activities_array(activity, null, selected_tasks))
					continue;
				graph_activities.push([activity, activity]);
				for (var i = 0; i < 5; i++)
					graph_data[i].push(related_results_hash[activity][i]);
			}
			else {
				for (var subtype in related_results_hash[activity]) {
					if (!in_activities_array(activity, subtype, selected_tasks))
						continue;
					graph_activities.push([activity, subtype]);
					for (var i = 0; i < 5; i++)
						graph_data[i].push(related_results_hash[activity][subtype][i]);
				}
			}
		}
			
		// Sort graph_application names in the same order as activities are presented
		// on the page and accordingly change graph_data
		var next_position_to_fill = 0;
		for (var i = 0; i < selected_tasks.length; i++) {
			// Find position in activities_array
			var position = -1;
			for (var j = 0; j < graph_activities.length; j++) {
				if ((selected_tasks[i][0] == graph_activities[j][0]) &&
					(selected_tasks[i][1] == graph_activities[j][1])) {
						position = j;
						break;
				}
						
			}		
			// Replace next_position_to_fill and position-th element
			
			if (position >= 0) {
				var helper = graph_activities[next_position_to_fill];
				graph_activities[next_position_to_fill] = graph_activities[position];
				graph_activities[position] = helper;
				
				for (var j = 0; j < 5; j++) {
					var helper = graph_data[j][next_position_to_fill];
					graph_data[j][next_position_to_fill] = graph_data[j][position];
					graph_data[j][position] = helper;
				}
				next_position_to_fill++;
			}
			
		}
		$('#' + user_type + '_user_stats').empty(); // Clean previous graph
		if (graph_activities.length == 0) {// no activity to display
			$('#' + user_type + '_stat_loading_indicator').hide();
			$('#' + user_type + '_user_stats').html("<div class='no_data'> We do not have any data for this selection");
			return;
		}
		else {
			var graph_application_names = [];
			for (var i = 0; i < graph_activities.length; i++)
				graph_application_names.push(get_activity_description(graph_activities[i][0], graph_activities[i][1]));
			
			// Add total stats
			graph_application_names.push(get_activity_description('total'));
			for (var i = 0; i < 5; i++) {
				var sum = 0;
				for (var j = 0; j < graph_activities.length; j++) {
					sum += graph_data[i][j];
				}
				graph_data[i][j] = sum;
			}
			
			// Change data to percentages
			for (var i = 0; i < graph_application_names.length; i++) {
				var sum = 0;
				for (var j = 0; j < 5; j++)
					sum += graph_data[j][i];
				for (var j = 0; j < 5; j++)
					graph_data[j][i] = parseInt(graph_data[j][i] / sum * 100 + 0.5);
			}
			
			draw_stat_graph(graph_application_names, graph_data, user_type, history_last_modified);
		}
		$('#' + user_type + '_stat_loading_indicator').hide();
	});
}


/*
	Draw bar chart of rating for activities
	app_names - array with names for each activity
	data - array of arrays that represents percent of ratings for each activity and rating
	user_type - "all" or "similar"
	last_modified - time when the file was last modified
*/

function draw_stat_graph(app_names, data, user_type, last_modified) {
	var div_id = user_type + "_user_graph"; // Div where to put the graph
	var helper_string = "";
	
	$('#' + user_type + '_user_stats').append("<div id='" + div_id + "' style='width: 1000px;'></div>");
	var chart = new Highcharts.Chart({
		  chart: {
			 renderTo: div_id, // Div where to create graph
			 defaultSeriesType: 'bar',
			 height: 100 + 100 * app_names.length,
			 width: 400,
			 backgroundColor: 'white'
			 
		  },
		  credits: {
			disabled: true
		  },
		  exporting: {
			enabled: false
		  },
		  title: {
			 text: 'Percentage of Users Ratings for Each Activity',
			 style: {
				 color: '#000'//,
				 //font: 'bold'
			}
		  },
		  subtitle: {
			 text: 'Results as of: ' + last_modified,
			 style: {
				 color: '#000'//,
				 //font: 'bold'
			}
		  },
		  xAxis: {
			 categories: app_names,
			 title: {
				text: null				
			 },
			 labels: {				
				style: {
					color: '#000'//,
					//font: 'bold'
				}
			 }
			 
		  },
		  yAxis: { 
			 min: 0,
			 max: 100,
			 title: {
				text: null,
				style: {
					color: '#000'//,
					//font: 'bold'
				}
				
			 },			 
			 //gridLineWidth: 0
			 allowDecimals: false
			 
		  },
		  plotOptions: {
			 bar: {
				dataLabels: {
				   enabled: true
				}
			 }
		  },
		  legend: {
			 layout: 'vertical',
			 align: 'right',
			 verticalAlign: 'top',
			 x: 10,
			 y: 50,
			 //floating: true,
			 borderWidth: 1,
			 backgroundColor: '#FFFFFF',
			 shadow: true,
			 reversed: true,
			 itemStyle: {
					color: '#000'//,
					//font: 'bold'
				}
		  },
		  
		  series: [{
			 name: '1 star',
			 data: data[0],
			 color: '#E41A1C'
		  }, {
			 name: '2 stars',
			 data: data[1],
			 color: '#FF7F00'
		  }, {
			 name: '3 stars',
			 data: data[2],
			 color: '#984EA3'
		  }, {
			 name: '4 stars',
			 data: data[3],
			 color: '#377EB8'
		  }, {
			 name: '5 stars',
			 data: data[4],
			 color: '#4DAF4A'
		  }
		  ]
   });
   
		   
		
	   
		
}

function add_two_rating_arrays(a1, a2) {
	for (var i = 0; i < 5; i++)
		a1[i] += a2[i];
	return a1;//[0,0,0,0,0];
}

// Check if activity and its subtype is in the array
function in_activities_array(activity, subtype, the_array) {
	for (var i in the_array) {
		if ((the_array[i][0] == activity) && ((the_array[i][1] == subtype) || (subtype == null))) {
			return true;
		}
	}
	return false;
}

// Activity name and subtype converted to nicer name for display in graph
function get_activity_description(activity, subtype) {
	switch(activity) {
		case "file_hosting":
			return "File Hosting";
		case "total":
			return "Total";
		case "news":
			switch(subtype) {
				case 'cnn':
				  return "CNN";
				case "la":
				  return "Los Angeles Times";
				case "msn":
				  return "MSNBC";
				case "ny":
				  return "New York Times";
				case "wp":
				  return "Washington Post";
				case "abc":
				  return "ABC News";
				case "ru":
				  return "Reuters";
				case "bbc":
				  return "BBC";
				case "hp":
				  return "Huffington Post";
				case "ut":
				  return "USA Today";
			}
		case "social":
			switch(subtype) {
				case "fb":
				  return "Facebook";
				case "tw":
				  return "Twitter";
				case "ms":
				  return "MySpace";
				case "fr":
				  return "Friendster";
				case "ld":
				  return "LinkedIn";
			}
		case "shopping":
			switch(subtype) {
				case "eb":
				  return "Ebay";
				case "az":
				  return "Amazon";
				case "br":
				  return "Bizrate";
				case "gt":
				  return "Giftag";
				case "sb":
				  return "Smartbargains";
			}
		case "game":
			switch(subtype) {
				case "wow_us":
					return "WoW US";
				case "wow_australia":
					return "Wow Australia";
				case "wow_europe":
					return "WoW Europe";
				case "wow_china":
					return "WoW China";
				case "wow_taiwan":
					return "Wow Taiwan";
				case "wow_korea":
					return "WoW Korea";
				case "lol_us":
					return "LoL US";
				case "lol_europe":
					return "LoL Europe";
				case "lol_asia":
					return "LoL Asia";
				case "cod2":
					return "Call of Duty 2";
				case "cod4":
					return "Call of Duty 4";
				case "tf2":
					return "Team Fortress 2";	
			}
		case "camera":
			switch(subtype) {
				case "0":
				  return "Video Conference US East Coast";
				case "1":
				  return "Video Conference US West Coast";
				case "2":
				  return "Video Conference Europe";
			}
		case "voip":
			switch(subtype) {
				case "0":
				  return "Voice Conference US East Coast";
				case "1":
				  return "Voice Conference US West Coast";
				case "2":
				  return "Voice Conference Europe";		
			}			
		default:
			return "unknown activity: ";
	}
}