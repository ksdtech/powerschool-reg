function onForm4Submit(){$j(".copy_address").each(function(e){var t=this.id.replace(/^mailing_/,"#");this.value=$j(t).val()});var e=$j("#family2_no");e&&e.attr("checked")&&($j("#form5_upd_by").val($j("#userid").val()),$j("#form5_upd_at").val(timestamp_now()),$j("#nextpage").val($j("#alt_nextpage").val()),$j("#nexttitle").val($j("#alt_nexttitle").val())),onRegFormSubmit()}$j(document).ready(function(){$j("#form4").isHappy({onSubmit:onForm4Submit,fields:{"#street":{required:!0,message:"Required field."},"#city":{required:!0,message:"Required field."},"#state":{required:!0,clean:setCAIfBlank,test:happy.USState,message:'Required field: format as "CA".'},"#zip":{required:!0,test:happy.USZip,message:'Required field: format as "94904" or "94904-0001"'},"#home_phone":{required:!0,clean:reformatPhone415,test:happy.USPhoneWithExtension,message:"Required field: format as (415) 333-2222 x5555."},".family2":{default_radio:"#family2_no"},".inet_access":{default_radio:"#inet_yes",required:!0,message:"Required field."},".printed_material":{default_radio:"#printed_no",required:!0,message:"Required field."},".spanish_material":{default_radio:"#spanish_no",required:!0,message:"Required field."},"#mother_last":{required:"sometimes",test:happy.requiredIfArgNotEmpty,arg:"#mother_first",message:"Required field."},"#mother_rel":{required:"sometimes",test:happy.requiredIfArgNotEmpty,arg:"#mother_first",message:"Required field."},".mother_guardian":{required:"sometimes",test:happy.requiredIfArgNotEmpty,arg:"#mother_first",message:"Required field."},"#mother_work_phone":{required:"sometimes",clean:reformatPhone415,test:happy.emptyOrUSPhoneWithExtension,message:"Please format as (415) 333-2222 x5555."},"#mother_home_phone":{required:"sometimes",clean:reformatPhone415,test:happy.emptyOrUSPhoneWithExtension,message:"Please format as (415) 333-2222 x5555."},"#mother_cell":{required:"sometimes",clean:reformatPhone415,test:happy.emptyOrUSPhoneWithExtension,message:"Please format as (415) 333-2222 x5555."},"#mother_email":{required:"sometimes",test:happy.emptyOrEmail,message:"Must be a valid email address."},"#father_last":{required:"sometimes",test:happy.requiredIfArgNotEmpty,arg:"#father_first",message:"Required field."},"#father_rel":{required:"sometimes",test:happy.requiredIfArgNotEmpty,arg:"#father_first",message:"Required field."},".father_guardian":{required:"sometimes",test:happy.requiredIfArgNotEmpty,arg:"#father_first",message:"Required field."},"#father_work_phone":{required:"sometimes",clean:reformatPhone415,test:happy.emptyOrUSPhoneWithExtension,message:"Please format as (415) 333-2222 x5555."},"#father_home_phone":{required:"sometimes",clean:reformatPhone415,test:happy.emptyOrUSPhoneWithExtension,message:"Please format as (415) 333-2222 x5555."},"#father_cell":{required:"sometimes",clean:reformatPhone415,test:happy.emptyOrUSPhoneWithExtension,message:"Please format as (415) 333-2222 x5555."},"#father_email":{required:"sometimes",test:happy.emptyOrEmail,message:"Must be a valid email address."}}})});