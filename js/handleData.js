function log(testType, object_load_start,t, test_number, file_location, file_size, frame_number){
	
	// Clear timeout timer for this frame
	request_executed = 1; 
	clearTimeout(timeout_timer[frame_number]);
	timeout_timer[frame_number] = "";
	
	// End Date
	var d = new Date();
	var object_load_end = d.getTime();	
	
	add_test(file_size, object_load_end - object_load_start); // Send data back to add_test function
	
}

var objectData;
function give_file(file_type){
	//alert(file_type);
	var link;
	var object_size;
	if(file_type >=0 && file_type <= 13){
		link = web_file_root + objectData[file_type].link;
	}else{
		link = objectData[file_type].link;
	}
	
	if(objectData[file_type].hasOwnProperty("size")){
		object_size = objectData[file_type].size;
	}
	
	//alert(link);
	
	return [link, object_size];
}