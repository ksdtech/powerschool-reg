$j(document).ready(function(){var t=$j("#reg_enroll").val(),e=null!=t&&/^nr-/.test(t);e&&$j(".enrolling").hide(),$j(".chk_status").each(function(){$j(this).bind("click",function(){return!1});var t="#"+$j(this).attr("id").replace("_status","_updated_at"),e=$j(t).val().match(/^(\d\d\d\d-\d\d-\d\d)/);e&&e[1]&&e[1].localeCompare("2013-03-25")>=0&&$j(this).attr("checked","checked")})});