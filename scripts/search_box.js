$(document).ready(function () {

	$(document).one('ready',function(){
	    /* visible/invisible plugins that work well with css */
		jQuery.fn.visible = function() {
		    return this.css('visibility', 'visible');
		};

		jQuery.fn.invisible = function() {
		    return this.css('visibility', 'hidden');
		};

		jQuery.fn.visibilityToggle = function() {
		    return this.css('visibility', function(i, visibility) {
		        return (visibility == 'visible') ? 'hidden' : 'visible';
		    });
		};

		$("#club-input-typeahead, #nav_button_main_page, #club_search_label, #club_nav_button_main_page").invisible()
	});

	$("#uni-input-typeahead").bind('input keyup change',function (){
	  $("#club-input-typeahead, #nav_button_main_page, #club_search_label, #club_nav_button_main_page").invisible()
	});

	$("#club-input-typeahead").bind('input keyup change',function (){
	  $("#club_nav_button_main_page").invisible()
	});

	$('#uni-input-typeahead').bind('typeahead:selected', function show_hide (obj, datum, name){
	  $(".typed-element-container").css('height', '200px');
	  $("#club-input-typeahead, #nav_button_main_page, #club_search_label").visible()
	  //$("#nav_button_main_page").attr("href", "/" + $("#uni-input-typeahead").val().toLowerCase().replace(/ /g, "-"));
	  $("#nav_button_main_page").text("Browse all clubs at " + $("#uni-input-typeahead").val())
	  $("#nav_button_main_page").attr('href', '/browse' + '?uni='+ $("#uni-input-typeahead").val())
	})

	$("#club-input-typeahead").bind('typeahead:selected', function change_nav_button (obj, datum, name){
		$("#club_nav_button_main_page").attr("href", "/" + $("#uni-input-typeahead").val().toLowerCase().replace(/ /g, "-") + "/" + $("#club-input-typeahead").val().toLowerCase().replace(/ /g, "-"));
		$("#club_nav_button_main_page").visible()
		$("#club_nav_button_main_page").text("Go to " + $("#club-input-typeahead").val()+  "\'s page directly")
	})
});
