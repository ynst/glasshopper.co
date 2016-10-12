$(document).ready(function(){
	$(".loading_p").hide()
	var clubs, university_link

	var clubs_searched = []

	var template = 
	`<a href="{{glasshopper_url}}">
	<div class="white-bg-container suggested-clubs"> 
			<div class="row result">
			    <div class="img col-sm-4"><img src="{{logo_url}}" class="cropped"/></div>
			    <div class="col-sm-8">
			      <h3>{{name}}</h3>
			      <p>{{description}}</p>
			    </div>
	    	</div>
	</div>
    </a>`;

    function is_in_array (club_id, clubs_searched){
    	for (var i = 0; i < clubs_searched.length; i++) {
    		if (clubs_searched[i].ID == club_id){
    			return true;
    		}
    	}
    	return false;
    }

	function update_results(university_link, clubs, type_id, rank_by, is_recruiting, keyword) {
		var clubs_searched = []
		if (!rank_by){
			rank_by = $("#rank_by").val()
		}
		if (!type_id){
			type_id = $("#club_type_id").val()
		}
		is_recruiting = $("#is_recruiting").prop('checked')

		for (var i = 0; i < clubs.length; i++) {
			var all_club_text =  (clubs[i].description + clubs[i].name + clubs[i].manager_1_name + clubs[i].manager_2_name).toLowerCase()
			if((type_id == -1 ||
			 clubs[i].club_type_id == type_id) &&
			 (clubs[i].is_recruiting == is_recruiting || !is_recruiting) && 
			 (all_club_text.indexOf(keyword) != -1 || keyword == '' || !keyword)) {
				clubs_searched.push(clubs[i])
			}
		}

		clubs_searched.sort(function(a,b){
				if (rank_by==1)
					return a.name.localeCompare(b.name)
				else if(rank_by==-1) 
					return null
				else if (rank_by == 0 )
					return a.score- (b.score)
				else if(rank_by == 2)
					return a.star_rating- (b.star_rating)
				else if(rank_by == 3)
					return a.approval- (b.approval)
				else if(rank_by == 4)
					return a.recommend- (b.recommend)
		})

		var html2add = ""
		if (clubs_searched.length == 0){
			$(".loading_p").text("No matching clubs")
			$(".loading_p").show()
		    $("#results_container").html(html2add)	
		}
		else{
			$(".loading_p").hide()
			for (var i = 0; i < clubs_searched.length; i++) {
				if (!clubs_searched[i].logo_url){
					clubs_searched[i].logo_url = "/images/club_placeholder.png"
				}
				var glasshopper_url_splitted = clubs_searched[i].glasshopper_url.split("/")
				clubs_searched[i].glasshopper_url = '/'+ university_link + '/' + glasshopper_url_splitted[glasshopper_url_splitted.length - 1];
				html2add += Mustache.render(template, clubs_searched[i]);
			}
		    $("#results_container").html(html2add)	
		}	
	};

	function search_unis (input_element) {

		// Set up the request.
		university_link = input_element.val().toLowerCase().replace(/ /g, "-")
		
	    // Create a new XMLHttpRequest.
	    var request = new XMLHttpRequest();

	    // Handle state changes for the request.
	    request.onreadystatechange = function(response) {
	      // var length = dataList.options.length;
	      // for (i = 0; i < length; i++) {
	      //   dataList.options[i] = null;
	      // }
	      if (request.readyState === 4) {
	        if (request.status === 200) {
	          // Parse the JSO
	          	clubs = JSON.parse(request.responseText);
	         	update_results(university_link, clubs)
	        } else {
	          // An error occured :(
	          input_element.placeholder = "Couldn't load datalist options :(";
	        }
	      }
	    };

		$(".loading_p").show()
	    // // Update the placeholder text.
	    // input.placeholder = "Loading options...";

	    request.open('GET', '/'+ university_link + '?method=json', true);
	    request.send();
	}

	$('#uni-input-typeahead').bind('typeahead:selected', function (){
		search_unis($(this))
	});
	
	$('#club_type_id, #rank_by, #is_recruiting, #club_input').change(function() {
		update_results(university_link, clubs, $('#club_type_id').val(), $('#rank_by').val(), $("#is_recruiting").prop('checked'), $('#club_input').val().toLowerCase())
	})

	$('#club_input').bind('input keyup', function() {
		update_results(university_link, clubs, $('#club_type_id').val(), $('#rank_by').val(), $("#is_recruiting").prop('checked'), $('#club_input').val().toLowerCase())
	})

	if ($('#uni-input-typeahead').val()!=''){
		// $(".typeahead").eq(0).val("Uni").trigger("input");
		search_unis($('#uni-input-typeahead'))
	}
});

// function type_dots(dots_object, upper_bound)
// {
// 	dots = 0 
//     if(dots < upper_bound)
//     {
//         dots_object.append('.');
//         dots++;
//     }
//     else
//     {
//         dots_object.html('');
//         dots = 0;
//     }
// }