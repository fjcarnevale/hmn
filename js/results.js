/*
	This file contains functions that produce ratings and explanations for different activities.
	It also contains function that produces text for session history graph
*/

var mouse_x;
var mouse_y;
var error_message = "We cannot estimate your performance";

function get_site_results(site_type, detailed, predicted_time, container_time, avg_multi_dl_time) {
	rating = 0;
	if (predicted_time == null)
		rating = 0;
	else if (predicted_time > 20.0)
		rating = 1;
	else if (predicted_time > 15.0)
		rating = 2;
	else if (predicted_time > 10.0)
		rating = 3;
	else if (predicted_time > 5.0)
		rating = 4;
	else 
		rating = 5;
	
	if (detailed == -1)
		return rating;
	if (rating == 0)
		return error_message;
	else if (detailed == 0)
		return 'Your predicted time to download main page from this site is ' + predicted_time + ' seconds, which corresponds to '
				+ characterize_rating(rating) + "<br /><br />"
				+ characterize_rating(5) + ((rating == 5) ? "<b>" : "") + ' 5 seconds or less ' + ((rating == 5) ? "</b>" : "") + '<br /> '
				+ characterize_rating(4) + ((rating == 4) ? "<b>" : "") + ' 5 to 10 seconds ' + ((rating == 4) ? "</b>" : "") + '<br /> '
				+ characterize_rating(3) + ((rating == 3) ? "<b>" : "") + ' 10 to 15 seconds ' + ((rating == 3) ? "</b>" : "") + '<br /> '
				+ characterize_rating(2) + ((rating == 2) ? "<b>" : "") + ' 15 to 20 seconds ' + ((rating == 2) ? "</b>" : "") + '<br /> '
				+ characterize_rating(1) + ((rating == 1) ? "<b>" : "") + ' 20 seconds or more ' + ((rating == 1) ? "</b>" : "") + '<br /> ';
	else if (detailed == 1)
		return 'Your browser took ' + container_time  
				+ ' milliseconds to download the container page for this site and ' 
				+ parseInt(avg_multi_dl_time) + ' milliseconds to download an average size object from this page.';
	 
}

function get_voip_results(detailed, the_world_part) {
	var area_description;
	switch (the_world_part) {
		case 0:
			area_description = 'US east coast';
			break;
		case 1:
			area_description = 'US west coast';
			break;
		case 2:
			area_description = 'Europe';
			break;
		default:
			
	}
	var mos = results_to_send.voip[the_world_part].mos;
	var loss = results_to_send.voip[the_world_part].corresponding_loss;
	if (!mos)
		return error_message;
	var rating = results_to_send.voip[the_world_part].rating;//all_results['voip'][the_world_part]['rating'];
	//all_results['voip'][the_world_part]['mos'];
	var im_rating = results_to_send.voip[the_world_part].im_rating;//all_results['voip'][the_world_part]['im_rating'];
	var delay = results_to_send.voip[the_world_part].delay;//all_results['voip'][the_world_part]['delay'];
	
	if (detailed)
		return "Out of 5 servers " + get_preposition(area_description) + " the " + area_description + ", the server with the median MOS had a round-trip time of " + delay 
				+ " milliseconds and " + (loss) * 100 + " % loss.";
	return 'Your calculated mean opinion score (MOS) to servers ' + get_preposition(area_description) + ' the '  + area_description + ' is ' + mos + ', which corresponds to '
				+ characterize_rating(rating) + "<br /><br />"
				+ characterize_rating(5) + ((rating == 5) ? "<b>" : "") + ' 4.34 or more ' + ((rating == 5) ? "</b>" : "") + '<br /> '
				+ characterize_rating(4) + ((rating == 4) ? "<b>" : "") + ' 4.03 to 4.33 ' + ((rating == 4) ? "</b>" : "") + '<br /> '
				+ characterize_rating(3) + ((rating == 3) ? "<b>" : "") + ' 3.60 to 4.02 ' + ((rating == 3) ? "</b>" : "") + '<br /> '
				+ characterize_rating(2) + ((rating == 2) ? "<b>" : "") + ' 3.10 to 3.60 ' + ((rating == 2) ? "</b>" : "") + '<br /> '
				+ characterize_rating(1) + ((rating == 1) ? "<b>" : "") + ' 3.1 or less ' + ((rating == 1) ? "</b>" : "") + '<br /> ';
	
}


function get_camera_results(detailed, the_world_part) {
	var rating = results_to_send.camera[the_world_part].rating;
	if (rating == 0)
		return error_message;
	var dl_tput = results_to_send.camera[the_world_part].dl_tput;
	var upl_tput = results_to_send.camera[the_world_part].upl_tput;
	var akamai_tput = results_to_send.camera[the_world_part].akamai_tput;
	var calculated_upl_tput = results_to_send.camera[the_world_part].calculated_upl_tput;
	
	if (detailed)
		return "Your download throughput to a nearby server is " + parseInt(akamai_tput) + " KB/s"
			+ "<br />Your download throughput to the origin server is " + parseInt(dl_tput) + " KB/s"
			+ "<br />Your upload throughput to the origin server is " + parseInt(upl_tput) + " KB/s"
			+ "<br />Your calculated upload throughput to a nearby server is " + parseInt(calculated_upl_tput) + " KB/s";
			
	return "Your download throughput to a nearby server is " + akamai_tput + " KB/s, and your calculated upload throughput is " 
			+ calculated_upl_tput + " KB/s which corresponds to "
			+ characterize_rating(rating) + "<br /><br />"
			+ characterize_rating(5) + ((rating == 5) ? "<b>" : "") + ' 187 KB/s or more ' + ((rating == 5) ? "</b>" : "") + '<br /> '
			+ characterize_rating(4) + ((rating == 4) ? "<b>" : "") + ' 150 to 186 KB/s ' + ((rating == 4) ? "</b>" : "") + '<br /> '
			+ characterize_rating(3) + ((rating == 3) ? "<b>" : "") + ' 50 to 149 KB/s ' + ((rating == 3) ? "</b>" : "") + '<br /> '
			+ characterize_rating(2) + ((rating == 2) ? "<b>" : "") + ' 16 to 49 KB/s ' + ((rating == 2) ? "</b>" : "") + '<br /> '
			+ characterize_rating(1) + ((rating == 1) ? "<b>" : "") + ' 15 KB/s or less ' + ((rating == 1) ? "</b>" : "") + '<br /> ';
	
				
	
	
}

function get_game_results(detailed, average_rtt, cache_time, current_subtype, servers, is_private) {
	rtt_limit = 104; //Time that has 60 % performance for 1st person shooter games
	if (current_subtype.match('wow'))
		rtt_limit = 740; // 60 % performance for third person games
	else if (current_subtype.match('lol'))
		rtt_limit = 2000; // 60 % performance for omnipresent games
	
	var min_average; // RTT for smallest RTT minus cache time
	var corresponding_cache; // Cache time for smallest RTT minus cache time
	for (var i = 0; i < average_rtt.length; i++)
		if ((average_rtt[i]) && ((!min_average) || (min_average > average_rtt[i] - cache_time)))
			min_average = average_rtt[i] - cache_time;
	
	if (min_average < 0)
		min_average = 0;
	
	if (!min_average) { // All servers found were down
		if (detailed < 0)
			return 0; // We just need rating
		else
			return error_message;
	}
	
	// Getting performance
	var performance;
	if (min_average > rtt_limit)
		performance = 0;
	else
		performance = Math.floor(60 + (rtt_limit - min_average) * 40 / rtt_limit);
	
	// Getting rating from performance
	var rating = 1;
	if (performance >= 90)
		rating = 5;
	else if (performance >= 80)
		rating = 4;
	else if (performance >= 70)
		rating = 3;
	else if (performance >= 60)
		rating = 2;
	
	var tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	var servers_results = "";
	if (is_private == 1) { // We provide servers table only for games with private servers
		servers_results = "<br /><br />Your estimated round-trip time results for the closest servers for this game are:<br /><br />"
								+"<table><tr><td>IP</td><td>Time [ms]" + tab + "</td></tr>";
		for (var i = 0; i < average_rtt.length; i++) {
			if ((average_rtt[i]) && (min_average > average_rtt[i] - cache_time)) {
				min_average = average_rtt[i] - cache_time;
				corresponding_cache = cache_time;
			}
			var this_server_time = Math.round(average_rtt[i] - cache_time);
			if (this_server_time <= 0)
				this_server_time = 0;
			servers_results += "<tr><td>"+servers[i] + tab + "</td><td>" 
							+ ((isNaN(average_rtt[i])) ? "-" : Math.round(average_rtt[i] - cache_time))
							+ "</td></tr>";
		}	
		servers_results += "</table>";
	}
	
	if (detailed < 0) // We only need to return rating
		return rating;
	else if (detailed == 0)
		return "Your performance is estimated to be " + ((performance < 60) ? " below 60" : performance) 
		+ "% relative to a game server at your location. This corresponds to "
		+ characterize_rating(rating) + "<br /> <br />"
		+ characterize_rating(5) + ((rating == 5) ? "<b>" : "") + ' 90% or more ' + ((rating == 5) ? "</b>" : "") + '<br /> '
		+ characterize_rating(4) + ((rating == 4) ? "<b>" : "") + ' 80% to 89% ' + ((rating == 4) ? "</b>" : "") + '<br /> '
		+ characterize_rating(3) + ((rating == 3) ? "<b>" : "") + ' 70% to 79% ' + ((rating == 3) ? "</b>" : "") + '<br /> '
		+ characterize_rating(2) + ((rating == 2) ? "<b>" : "") + ' 60% to 69% ' + ((rating == 2) ? "</b>" : "") + '<br /> '
		+ characterize_rating(1) + ((rating == 1) ? "<b>" : "") + ' 59% or less ' + ((rating == 1) ? "</b>" : "") + '<br /> ';
	else 
		return "Your estimated average round-trip time to the game server is " 
		+ Math.round(min_average) + " milliseconds. " + ((is_private == 1) ? servers_results : "");
}

function get_file_hosting_results(detailed, akamai_speed, dl_speed, upl_speed) {
	var rating = 0;
	
	var actual_upload_speed = akamai_speed * upl_speed / dl_speed;
	if (akamai_speed && dl_speed && upl_speed) {
		if  ((akamai_speed > 2000) && (actual_upload_speed > 500))
			rating = 5;
		else if ((akamai_speed > 1000) && (actual_upload_speed > 250))
			rating = 4;
		else if ((akamai_speed > 500) && (actual_upload_speed > 125))
			rating = 3;
		else if ((akamai_speed > 100) && (actual_upload_speed > 62))
			rating = 2;
		else
			rating = 1;
	}		
	if (detailed < 0)
		return rating;
	else if (rating == 0)
		return error_message
	else if (detailed == 0)
		return "Your download throughput to a nearby server is " + parseInt(akamai_speed) + " KB/s, and your calculated upload throughput is " 
			+ parseInt(actual_upload_speed) + " KB/s which corresponds to "
			+ characterize_rating(rating) + "<br /><br />"
			+ characterize_rating(5) + ((rating == 5) ? "<b>" : "") + ' Download 2000 KB/s or more and upload 500 KB/s or more ' + ((rating == 5) ? "</b>" : "") + '<br /> '
			+ characterize_rating(4) + ((rating == 4) ? "<b>" : "") + ' Download 1000 KB/s or more and upload 250 KB/s or more ' + ((rating == 4) ? "</b>" : "") + '<br /> '
			+ characterize_rating(3) + ((rating == 3) ? "<b>" : "") + ' Download 500 KB/s or more and upload 125 KB/s ' + ((rating == 3) ? "</b>" : "") + '<br /> '
			+ characterize_rating(2) + ((rating == 2) ? "<b>" : "") + ' Download 250 KB/s or more and upload 62 KB/s or more ' + ((rating == 2) ? "</b>" : "") + '<br /> '
			+ characterize_rating(1) + ((rating == 1) ? "<b>" : "") + ' Download 249 KB/s or less and upload 61 KB/s or less' + ((rating == 1) ? "</b>" : "") + '<br /> ';
	
	else return "Your download throughput to a nearby server is " + parseInt(akamai_speed) + " KB/s"
			+ "<br />Your download throughput to the origin server is " + parseInt(dl_speed) + " KB/s"
			+ "<br />Your upload throughput to the origin server is " + parseInt(upl_speed) + " KB/s"
			+ "<br />Your calculated upload throughput to a nearby server is " + parseInt(actual_upload_speed) + " KB/s";
}

function characterize_rating(rating) {
	stars = "<span style='white-space: nowrap;'>";
	for (i = 0; i < 5; i++) 
		stars += (rating > i) ? "<img src='star.gif' />" : "<img src='star_grey.gif' />";
	stars += "</span>";
	return stars;
}

// Function that produces span for detailed info to be moused over
function get_detailed_info_text() {
	return "<span class= 'detailed_info'> detailed info </span>";
}

// Function that draws graph for session history
// Level1, level2 and level3 are activity descriptors (example level1="news" level2="cnn")
function drawGraph(level1, level2, level3) {
	var start_date = new Date(parseInt(start_measurement_time));	
	var week_days = new Array('Sunday', 'Monday', 'Tuesday','Wednesday', 'Thursday', 'Friday', 'Saturday');
	var months = new Array('January', 'February', 'March','April', 'May','June', 'July', 'August', 'September','October', 'November', 'December');
	var start_date_string = (week_days[start_date.getDay()] + ", " + months[start_date.getMonth()]) + " " + start_date.getDate() + ", " + start_date.getFullYear()
							+ ", " + add_zeros(start_date.getHours()) + ":" + add_zeros(start_date.getMinutes()) + ":" + add_zeros(start_date.getSeconds());
	
	if (!level1)
		return; // We don't know which results we need
	var d1 = [];
	for (var time in session_results) {
		// previous_rating should be session_results[time][level1][level2][level3] as long as the next hash value is not null
		var previous_rating = session_results[time][level1];		
		if ((level2 != null) && (previous_rating)) {
			previous_rating = previous_rating[level2];
		}
		if ((level3 != null) && (previous_rating)) {
			previous_rating = previous_rating[level3];
		}
		if (previous_rating) {
			previous_rating = previous_rating.rating;
			if (!isNaN(previous_rating) && (previous_rating != 0)) {
				var time_date = new Date(parseInt(time));
				d1.push([Date.UTC(time_date.getFullYear(),  time_date.getMonth() + 1, time_date.getDate(), time_date.getHours(), time_date.getMinutes(), time_date.getSeconds()), previous_rating]);
			}
		}		
	}
	
	var chart = new Highcharts.Chart({
      chart: {
         renderTo: 'graph_div',
         type: 'spline'		 	
      },
	  credits: {
		disabled: true
	  },
	  exporting: {
        enabled: false
	  },
      title: {
         text: 'Rating Over Time',
		 style: {
			 color: '#000',
			 fontWeight: 'bold'
		 }
      },
      subtitle: {
         text: 'Starting from: ' + start_date_string,
		 style: {
			 color: '#000'
		 }
      },
      xAxis: {
	    lineColor: '#000',
		tickColor: '#000',
		labels: {
			style: {
				color: '#000',
				font: '11px Trebuchet MS, Verdana, sans-serif'
			}
		},
         title: {
			text: 'Time',
			style: {
				 color: '#000'
			}
		 },
		 type: 'datetime',
         dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
         }
		 
      },
      yAxis: {
	    labels: {
			style: {
				color: '#000',
				font: '11px Trebuchet MS, Verdana, sans-serif'
			}
		},
	     lineColor: '#000',
		 tickColor: '#000',
         title: {
            text: 'Rating',
			style: {
				 color: '#000'
			}
         },
         min: 0,
		 max: 6,
		 tickInterval: 1
		
		 
      },
      //tooltip: {
      //   formatter: function() {
      //             return '<b>'+ this.series.name +'</b><br/>'+
      //         Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y +' m';
      //   }
      //},
      series: [{
		 showInLegend: false,
         //name: 'Winter 2007-2008',
         data: d1,
		 color: '#339933'
      }]
   });
   
	
}

// Adding leading zeros (for time format)
function add_zeros(time_var) {
	if (time_var > 9)
		return time_var;
	return "0" + time_var;
}

// Getting the right preposition for different geographical areas (currently only Europe, US East Coast and US West Coast)
function get_preposition(area) {
	return (area == 'Europe') ? 'in' : 'on';
}
