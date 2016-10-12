$(document).ready(function(){
  $('.rating').rating('refresh', {min:0, max:5, step:1, disabled: false, showClear: false, showCaption: false});
  $("#test1 *").attr("disabled", "disabled").off('click');
  $("#test2 *").attr("disabled", "disabled").off('click');
  $('#club-input-typeahead').bind('typeahead:selected', function(obj, datum, name){
  	$('#test1 *').prop('disabled', false).on('click');
  	$('#test2 *').prop('disabled', false).on('click');
  })

  // not doing anything
  // $("#submitbtn").on('click', function (event) {
  //   var $target = $( event.target );
  //   $target.closest("form").submit();
  // });

  $(".membership_status").on('click',function(){
    $("#duration_para").text(($("#former_radio_button").is(':checked')) ? "I was involved with the organization for...":"I've been involved with the organization for...")
    var month_form_group = `<div id="month_form_group" class="form-group">
                              <div class="col-sm-4 label-column">
                                <label id="duration_para" class="control-label">Last month I was involved was...</label>
                              </div>
                              <div class="col-sm-4 input-column">
                                <select data-style="btn-info" name="last_month_involved" id="last_month_involved" type="number" class="selectpicker">
                                  <option value="1">January</option>
                                  <option value="2">February</option>
                                  <option value="3">March </option>
                                  <option value="4">April</option>
                                  <option value="5">May</option>
                                  <option value="6">June</option>
                                  <option value="7">July</option>
                                  <option value="8">August</option>
                                  <option value="9">September</option>
                                  <option value="10">October</option>
                                  <option value="11">November</option>
                                  <option value="12">December</option>
                                </select>
                                <input type="number" name="last_year_involved" id="last_year_involved" min="2008" max="2016" value="2015" class="number_input"/>
                              </div>
                            </div>`
    if ($("#former_radio_button").is(':checked')){
      $("#disable_part_1").append(month_form_group)
    }
    else{
      $("#month_form_group").remove()
    }
  })

  // $("#overall_recommend").change(function(){
  // 	$("#overall_recommend_label").html(($(this).is(':checked')) ? 'Overall, I would recommend <br> this organization ':'Overall, I would not recommend <br> this organization')
  // })
  // $("#approve_leadership").change(function(){
  // 	$("#approve_leadership_label").html(($(this).is(':checked')) ? ' I approve of the leadership of <br>  this organization ':' I do not approve of the leadership of <br> this organization ')
  // })
});
