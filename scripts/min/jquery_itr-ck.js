function generate_h1_login(){""==$j("#h1_id").val()&&$j("#h1_id").val($j("#st_id").val()),""==$j("#h1_login").val()&&$j("#h1_login").val(new_ps_username($j("#st_last").val(),0)),""==$j("#h1_password").val()&&$j("#h1_password").val(new_ps_password()),$j("#h1_web_access").attr("checked","checked")}function generate_h2_number(){if(""==$j("#h2_id").val()){var e=$j("#st_id").val();""!=e&&$j("#h2_id").val(parseInt(e)+1e5)}}function generate_psst_login(){""==$j("#psst_login").val()&&$j("#psst_login").val(new_ps_username($j("#st_last").val(),1)),""==$j("#psst_password").val()&&$j("#psst_password").val(new_ps_password()),$j("#psst_web_access").attr("checked","checked")}function generate_st_login(){var e="104"==$j("#st_school").val();""==$j("#st_login").val()&&$j("#st_login").val(new_student_username($j("#st_last").val(),$j("#st_first").val(),e)),""==$j("#st_password").val()&&$j("#st_password").val(new_student_password(e))}function on_enrollment_change(){var e=$j("#reg_enroll option:selected").val(),n=null!=e&&/^nr-/.test(e);return n?($j("tr.enrolling").hide(),$j("tr.not_enrolling").show()):($j("tr.enrolling").show(),$j("tr.not_enrolling").hide(),on_grade_level_change()),!0}function on_grade_level_change(){$j("tr.by_grade").hide();var e=$j("#reg_grade_level option:selected").val();return""!=e&&"-1"!=e&&$j("tr.by_grade").filter(".grade_"+e).show(),!0}function set_form_updated(){return $j("#upd_by").val($j("#userid").val()),$j("#upd_at").val(timestamp_now()),!0}function set_entry_dates(e){$j(".entry_date").each(function(){(e||""==$j(this).val())&&$j(this).val($j("#entry_date").is("input")?$j("#entry_date").val():$j("#entry_date").text())}),$j(".entry_grade_level").each(function(){(e||""==$j(this).val())&&$j(this).val($j("#grade_level").text())})}function bind_login_generators(){$j(".pwgen").length>0&&$j(".pwgen").bind("click",function(){var e=$j(this).attr("id");genpass_fptrs[e]()})}function onItrFormSubmit(){$j("#upd_by").hasClass("disabled")||set_form_updated();var e=$j("#reg_enroll option:selected").val(),n=null!=e&&0==e.indexOf("nr-");if(n){$j("#nextpage").val(""),$j("#nexttitle").val("");var t=$j("#donetitle").val();""!=t&&$j("#backtitle").val(t)}}var genpass_fptrs=new Array;genpass_fptrs.generate_h1_login=generate_h1_login,genpass_fptrs.generate_h2_number=generate_h2_number,genpass_fptrs.generate_psst_login=generate_psst_login,genpass_fptrs.generate_st_login=generate_st_login,$j(document).ready(function(){$j("#admin_update").bind("click",function(){$j("#admin_update").attr("checked")&&set_form_updated()}),$j("#entry_check").bind("click",function(){set_entry_dates(1)}),$j("#reg_enroll").bind("change",function(){on_enrollment_change()}),$j("#reg_grade_level").bind("change",function(){on_grade_level_change()}),bind_login_generators(),$j(".private").hide(),on_enrollment_change()});