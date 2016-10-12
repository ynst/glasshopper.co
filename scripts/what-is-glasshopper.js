$(document).ready(function (){
  $(function() {
     if($(window).width() <= 700) {
       $("img.pie_chart").each(function() {
         $(this).attr("src", $(this).attr("src").replace("PIE CHART_transparent_web.png", "PIE CHART_mobile.png"));
       });
     }
   });
})