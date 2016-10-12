$(document).ready(function(){
  $("#university_name_group").hide()

  function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
  };

  $("#email").bind('change input keyup', function(){
    if(isValidEmailAddress($("#email").val())) {
      $.ajax({
          type : 'GET',
          dataType : 'json',
          async: true,
          url: '/university-domains-list/world_universities_and_domains.json',
          cache: true,
          success : function(data) {
              var matching_uni, email_val=$("#email").val()
              var dot_split = email_val.substr(email_val.indexOf("@") + 1).split(".")
              var domain_name_domestic = (dot_split.length < 2) ? "" : dot_split[dot_split.length - 2]+"."+dot_split[dot_split.length - 1]
              var domain_name_international = (dot_split.length >= 3) ? dot_split[dot_split.length - 3]+"."+ domain_name_domestic : domain_name_domestic
              $.each(data, function(index, uni){
                if (domain_name_domestic == uni.domain || domain_name_international == uni.domain){
                  matching_uni = uni
                }
              }); 
              if (matching_uni){
                $("#university_name_group").show()
                $("#university_name").val(matching_uni.name)
                $("#university_name").attr("readonly", true)
              }
              else{
                  $("#university_name_group").hide()
              }
          } 
      });
    }
    else{
      $("#university_name_group").hide()
      // if($("#university_name_group").length > 0){
      //   $("#university_name_group").remove()
      // }
    }
  })

  jQuery.fn.outerHTML = function() {
    return jQuery('<div />').append(this.eq(0).clone()).html();
  };

  var which_year_html = $("#which_year").outerHTML(), uni_email_label = $("#email_input_label").text()
  
  $(".is_university_student").bind('click', function (){
    if ($("#university_student").is(':checked')){
      $("#repeat_pw").after(which_year_html)
      $("#email_input_label").text(uni_email_label)
    }
    else{
      $(".which_year").remove()
      $("#email_input_label").text("Email")
    }
  })
});
