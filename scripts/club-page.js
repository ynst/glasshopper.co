var p_list = [];
$(document).on('ready', function(){

  $('[data-toggle="popover"]').popover();
  
  $('.rating').rating('refresh', {disabled: false, showClear: false, showCaption: false});
  // $('p').one('ready',function(){
  	$('p').each(function(){
  		
	  	if ($(this).html().length > 200){
	  		var long_p = $(this).html();
	  		long_p = long_p.substr(0,200) + '...' + '<br><span id='+ (p_list.push(long_p) -1)+' class="continue_reading" style="color:#aaa; font-size: 12px; text-decoration:underline;"> Show more</span>';
	  		$(this).html(long_p);
	  	}
	  })
  // })

  $(".follow_button, .following_button").on('click', function(){
    var club_id =$(this).attr('id')
    $.ajax({
        method: 'POST', 
        url:'/follow/' + club_id
    })
    .always(function() {
      var button= $("#"+club_id)
      if (button.hasClass("following_button")){
        button.removeClass("following_button");
        button.addClass("follow_button");
        button.html("Follow on Glasshopper")  
      }
      else{
        button.removeClass("follow_button");
        button.addClass("following_button");
        button.html("Following")  
      }
    })
  })

  $('.review_options').bind('click', function (){
    if ($(this).text() == "Edit"){
      review_make_ajax_call('edit', $(this).attr("id"))
    }
    else if ($(this).text() == "Delete"){
      review_make_ajax_call('delete', $(this).attr("id"))
    }
    else if ($(this).text() == "Report"){
      review_make_ajax_call('report', $(this).attr("id"))
    }
  })

});

function review_make_ajax_call (action, id){
  $.ajax({
      method: 'POST', 
      url:'/reviews/' + id + '/'+ action
  })
  .always(
    $('#'+id).text($('#'+id).text() + 'ed')
  )
}

$(document).on('ready', function(){
  $('.continue_reading').on('click', function(){
  	var para = p_list[$(this).attr("id")]
  	$(this).parent().html(para)
  })
});
