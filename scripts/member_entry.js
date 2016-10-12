$(document).ready(function(){
  var number_member_emails = 0
  var member_emails  = []
  $("#emails").bind('keyup change', function(){
    number_member_emails = 0
    member_emails = []
    var input_splitted = $(this).val().split(/,|:|;|\n|\t| /)

    function isValidEmailAddress(emailAddress) {
      var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
      return pattern.test(emailAddress);
    };

    for (var i = 0; i < input_splitted.length; i++) {
      if ((input_splitted[i].indexOf(".edu") != -1 || input_splitted[i].indexOf(".ac") != -1) &&
        isValidEmailAddress(input_splitted[i])){
        number_member_emails++
        member_emails.push(input_splitted[i])
        // member_emails += input_splitted[i] + ((i < input_splitted.length - 1) ? ', ' : '')  
      }
    }

    var member_emails_html = ''
    for (var i = 0; i < member_emails.length; i++) {
      member_emails_html += member_emails[i] + ((i < member_emails.length - 1) ? ', ' : '')  
    }

    $('#members').attr('data-content', member_emails_html)
    $('#members').html(number_member_emails + ' members')
  })

  $('[data-toggle="popover"]').popover();

  $("#submit_emails").bind('click', function () {
    var club_id  = getUrlParameter('club')
    if (club_id) {
      $.ajax({
          method: 'POST', 
          url:'/verify/' + club_id,
          data: {'member_emails' : member_emails},
          success: function (data, textStatus, jqXHR){ 
            window.location = JSON.parse(data).redirect
            }
      })
    }
    else{
      window.location = '/'
    }
  })
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};