$(document).ready(function(){	
	var universities = new Bloodhound({
	  datumTokenizer: function(datum) {
	  	return Bloodhound.tokenizers.whitespace(datum.name);
	  },
	  queryTokenizer: Bloodhound.tokenizers.whitespace,
	  // url points to a json file that contains an array of country names, see
	  // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
	  prefetch: {
	        url: '/university-domains-list/world_universities_and_domains.json',
            cache: true//,
            // transform: function(response) {
            //     return $.map(response, function (tag) {
            //         return {
            //             name: tag.name,
            //             id: tag.domain
            //         }
            //     });
            // }
        }
	});

	universities.initialize()
	// passing in `null` for the `options` arguments will result in the default
	// options being used
	$('#prefetch-universities .typeahead').typeahead({
		hint: false,
	    highlight: true,
	    minLength: 1
	}, {
	  name: 'Universities-dataset',
	  source: universities,
	  onselect: function (obj) {
      	alert('Selected '+obj)
      },
	  displayKey: 'name'
	});

	var clubs = [{name: "Enter your club"}];

	var club_names = new Bloodhound({
	  datumTokenizer: function(datum) {
	  	return Bloodhound.tokenizers.whitespace(datum.name);
	  },
	  queryTokenizer: Bloodhound.tokenizers.whitespace,
	  local: clubs
	});

	club_names.initialize()

	$('#prefetch-clubs .typeahead').typeahead({
		hint: false,
	    highlight: true,
	    minLength: 1
	}, {
	  name: 'clubs-dataset',
	  source: club_names,
	  displayKey: 'name'
	});

	// passing in `null` for the `options` arguments will result in the default
	// options being used
	

	$('#uni-input-typeahead').bind('typeahead:selected', function(obj, datum, name) {
		club_names.clear()
		
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
	          club_names.initialize();

	          
	         
	          	var club_names2 = new Bloodhound({
		            datumTokenizer: function(datum) {
		            	return Bloodhound.tokenizers.whitespace(datum.name);
		            },
		            queryTokenizer: Bloodhound.tokenizers.whitespace,
		            local: clubs
	          	});
	           $('#prefetch-clubs .typeahead')
	            .typeahead('destroy').typeahead({
		        	hint: false,
		            highlight: true,
		            minLength: 1
		        }, {
		          name: 'clubs-dataset2',
		          source: club_names2,
		          displayKey: 'name',
		          templates: {
		          	empty: [
		                `<div class="empty-message">
		                  We couldn't find any clubs from your university on glasshopper.
		                  <span class="club-register"> Click here</span> to register your club
		                </div>`
		              ].join('\n')
		          }
		        });
 

	       		if (clubs){
		          // Update the placeholder text.
		          $(this).attr("placeholder", "e.g. " + clubs[0].name);
		      }
		      else{
		      	$(this).placeholder = "Sorry, there are no clubs from your university on glasshopper"
		      }
	        } else {
	          // An error occured :(
	          $(this).placeholder = "Couldn't load datalist options :(";
	        }
	      }
	    };

	    // // Update the placeholder text.
	    // input.placeholder = "Loading options...";

	    // Set up and make the request.
	    var university_link = $(this).val().toLowerCase().replace(/ /g, "-")

	    request.open('GET', '/'+ university_link + '?method=json', true);
	    request.send();
	});
	/*$('#prefetch .typeahead').typeahead({
	  minLength: 0,
	  highlight: true
	},
	{
	  source: function (query, process) {
	  		var map = {}
		    var universities = [];
		 	var data;
		    $.getJSON('../university-domains-list/world_universities_and_domains.json', function (json) {
			    data = json
			  })
		 
		    $.each(data, function (university) {
		        map[university.name] = university;
		        universities.push(university.name);
		    });

		    alert(data.length)
		 
		    process(universities);
		}
	});*/
});