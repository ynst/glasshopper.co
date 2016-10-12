// function  get_datalist (input_id, datalist_id, json_file){
// // Get the <datalist> and <input> elements.
// var dataList = document.getElementById(datalist_id);
// var input = document.getElementById(input_id);

// // Create a new XMLHttpRequest.
// var request = new XMLHttpRequest();

// // Handle state changes for the request.
// request.onreadystatechange = function(response) {
//   if (request.readyState === 4) {
//     if (request.status === 200) {
//       // Parse the JSON
//       var jsonOptions = JSON.parse(request.responseText);
  
//       // Loop over the JSON array.
//       jsonOptions.forEach(function(item) {
//         // Create a new <option> element.
//         var option = document.createElement('option');
//         // Set the value using the item in the JSON array.
//         option.value = item;
//         // Add the <option> element to the <datalist>.
//         dataList.appendChild(option);
//       });
      
//       // Update the placeholder text.
//       input.placeholder = "e.g. datalist";
//     } else {
//       // An error occured :(
//       input.placeholder = "Couldn't load datalist options :(";
//     }
//   }
// }

// // Update the placeholder text.
// input.placeholder = "Loading options...";

// // Set up and make the request.
// request.open('GET', json_file, true);
// request.send();
// })
var get_datalist = (function(input_id, datalist_id, json_file){
    // Get the <datalist> and <input> elements.
    var dataList = document.getElementById(datalist_id);
    var input = document.getElementById(input_id);

    // Create a new XMLHttpRequest.
    var request = new XMLHttpRequest();

    // Handle state changes for the request.
    request.onreadystatechange = function(response) {
      var length = dataList.options.length;
      for (i = 0; i < length; i++) {
        dataList.options[i] = null;
      }
      if (request.readyState === 4) {
        if (request.status === 200) {
          // Parse the JSON
          var jsonOptions = JSON.parse(request.responseText);
      
          // Loop over the JSON array.

          jsonOptions.forEach(function(item) {
            // Create a new <option> element.
            var option = document.createElement('option');
            // Set the value using the item in the JSON array.
            option.value = item.name;
            // Add the <option> element to the <datalist>.
            dataList.appendChild(option);
          });
          
          // Update the placeholder text.
          input.placeholder = "e.g. datalist";
        } else {
          // An error occured :(
          input.placeholder = "Couldn't load datalist options :(";
        }
      }
    };

    // Update the placeholder text.
    input.placeholder = "Loading options...";

    // Set up and make the request.
    request.open('GET', json_file, true);
    request.send();
  });

$(document).ready(function() {
  var club_names
  get_datalist('uni-input','uni-json-datalist', '/university-domains-list/world_universities_and_domains.json');
  $("#uni-input").on('change', function () {
        var university_link = $(this).val().toLowerCase().replace(/ /g, "-")
        console.log(university_link)
        // $.getJSON("/" + university_link, function (data) {
        //   club_names = data.map(function(d) { return d['name']; })
        // })
        get_datalist('club-input', 'club-json-datalist', '/'+university_link)
  })
  $("#uni-input").on('input', function () {
        if ($(this).val() == ''){
          $("#club-json-datalist").innerHTML = ''
        }
        
  })
})

// $( document ).ready(function () {
//   var uni_names, club_names;
//   $.getJSON( "/university-domains-list/world_universities_and_domains.json", function (data) {
//     uni_names = data.map(function(d) { return d['name']; })
//   });

//   $('#uni_search_box').on('click keyup', function (){
//     $("#matching_unis").css('visibility', 'visible')
//     max_unis_displayed = 5
//     name2search = $('#uni_search_box').val().toLowerCase()
//     var opts = ''
//     $.each(uni_names, function ( index, name ) {
//       if (max_unis_displayed > 0 && (name2search == '' || name.toLowerCase().indexOf(name2search) != -1))
//       {
//         var university_link = name.toLowerCase().replace(/ /g, "-")
//         opts += '<li><a class="university" href="' + university_link + '">' + name + '</a></li>';
//         max_unis_displayed = max_unis_displayed - 1

//       }
//       //return max_unis_displayed > 0;// breaks out of the loop when negative
//     })

//     if (opts == ''){
//       opts = 'Not in the list'
//     }

//     $("#matching_unis").html(opts);
//   });

//   $("body").on('click', 'a', function(){ 
//     $("#uni_search_box").val("This is work in progress, But you can do a search! Delete this and type yale")
//     //$("#matching_clubs #search-unis").css('display', 'none')

//     var university_link = $("#uni_search_box").val().toLowerCase().replace(/ /g, "-")
//     console.log(university_link)
//     $.getJSON("/" + university_link, function (data) {
//       club_names = data.map(function(d) { return d['name']; })
//     })
//   });

//   $('body').on('click keyup', '#club_search_box', function (){
//     max_clubs_displayed = 5
//     name2search = $('#club_search_box').val().toLowerCase()
//     var opts = ''
//     $.each(club_names, function ( index, name ) {
//       if (max_clubs_displayed > 0 && (name2search == '' || name.toLowerCase().indexOf(name2search) != -1))
//       {
//         opts += '<li><a href="#">' + name + '</a></li>';
//         max_clubs_displayed = max_clubs_displayed - 1
//       }
//       //return max_unis_displayed > 0;// breaks out of the loop when negative
//     })

//     if (opts == ''){
//       opts = 'Not in the list'
//     }

//     $("#matching_clubs").html(opts);
//   });
// });