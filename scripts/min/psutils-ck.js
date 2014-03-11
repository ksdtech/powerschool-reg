function loadingDialog(e,t){loadingDialogInstance.open(e,t)}function closeLoading(e){void 0===e?loadingDialogInstance.forceClose():loadingDialogInstance.closeDialog(e)}function setLoadingDialogTitle(e){loadingDialogInstance.setTitle(e)}function psAlert(e,t,s){if("string"==typeof e?(e={message:e},"string"==typeof t?e.details=t:s=t,"function"==typeof s&&(e.callback=s)):e=e||{},pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.show_details"),"string"==typeof e.message&&(e.content=$j("<div/>").append($j("<span/>").html(e.message)),e.details)){$j("<br/>").appendTo(e.content);var i=$j("<a/>",{href:"",text:pss_text("psx.js.scripts.psutils.show_details")}).appendTo(e.content),n=$j("<a/>",{href:"",text:pss_text("psx.js.scripts.psutils.hide_details")}).appendTo(e.content).hide();$j("<br/>").appendTo(e.content);var a=$j("<textarea/>",{cols:50,rows:5,readonly:"readonly",text:e.details}).appendTo(e.content).hide();i.click(function(){return i.hide(),n.show(),a.show(),!1}),n.click(function(){return n.hide(),i.show(),a.hide(),!1})}"function"==typeof e.callback&&(e.close=e.callback),e.dialogClass=e.dialogClass||"psAlert",e.type=e.type||"dialogM","undefined"==typeof e.title&&(e.title=pss_text("psx.js.scripts.psutils.alert")),e.buttons=[{id:e.okid||"button-ok",text:e.oktext||pss_text("psx.js.scripts.psutils.ok1"),click:function(){psDialogClose()}}],psDialog(e)}function psConfirm(e,t,s){"string"==typeof e?(e={message:e},"function"==typeof t&&(e.ok=t),"function"==typeof s&&(e.cancel=s)):e=e||{},"string"==typeof e.message&&(e.content=$j("<div/>").append($j("<span/>").html(e.message)));var i=!1;"function"==typeof e.cancel&&(e.close=function(){i||e.cancel.apply(this,arguments)}),e.dialogClass=e.dialogClass||"psConfirm",e.type=e.type||"dialogM",pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.ok2"),e.buttons=[{id:e.cancelid||"button-cancel",text:e.canceltext||pss_text("psx.js.scripts.psutils.cancel1"),click:function(){psDialogClose()}},{id:e.okid||"button-ok",text:e.oktext||pss_text("psx.js.scripts.psutils.ok2"),click:function(){i=!0,psDialogClose(),"function"==typeof e.ok&&e.ok(e)}}],psDialog(e)}function psSaveDialog(e,t,s,i){"string"==typeof e?(e={message:e},"function"==typeof t&&(e.yes=t),"function"==typeof s&&(e.no=s),"function"==typeof i&&(e.cancel=i)):e=e||{},"string"==typeof e.message&&(e.content=$j("<div/>").append($j("<span/>").html(e.message)));var n=!1;"function"==typeof e.cancel&&(e.close=function(){n||e.cancel.apply(this,arguments)}),e.dialogClass=e.dialogClass||"psSaveDialog",e.type=e.type||"dialogM",pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.yes"),e.buttons=[{text:e.canceltext||pss_text("psx.js.scripts.psutils.cancel2"),click:function(){psDialogClose()}},{id:e.noid||"button-no",text:e.notext||pss_text("psx.js.scripts.psutils.no"),click:function(){n=!0,psDialogClose(),"function"==typeof e.no&&e.no(e)}},{id:e.yesid||"button-yes",text:e.yestext||pss_text("psx.js.scripts.psutils.yes"),click:function(){n=!0,psDialogClose(),"function"==typeof e.yes&&e.yes(e)}}],psDialog(e)}function psWizard(e){if(!("object"==typeof e&&e instanceof Array))throw"invalid_parameters: expecting array";wizardPages=[],wizardIndex=0;for(var t=null,s=0;s<e.length;s++){var i={};i.tableClass=e[s].tableClass||null,i.title=e[s].title,i.header=e[s].header,i.nextText=e[s].nextText||pss_text(s+1===e.length?"psx.js.scripts.psutils.finish":"psx.js.scripts.psutils.next"),i.nextFunction=e[s].nextFunction,i.cancelText=e[s].cancelText||pss_text("psx.js.scripts.psutils.cancel5"),i.fields=e[s].fields,i.backFunction=e[s].backFunction;for(var n=0;n<e[s].fields.length;n++){var a=e[s].fields[n];a.type=a.type||"text",a.required=e[s].fields[n].required||!1}t&&(i.previous=t,t.next=i),t=i,wizardPages.push(i)}for(var o={},r=$j("<div/>",{name:"wizardcontent"}),l,s=0;s<wizardPages.length;s++){var p=$j("<div/>",{name:"page"+s}).appendTo(r),c;c=wizardPages[s].tableClass?$j("<table/>",{"class":wizardPages[s].tableClass}).appendTo(p):$j("<table/>").appendTo(p),c.css({height:"auto",width:"auto",margin:"0px 5px 10px 5px"}),l=$j("<tbody/>").appendTo(c),wizardPages[s].header&&$j("<tr/>").append($j("<td/>",{name:"wizardHeader",colspan:2,text:wizardPages[s].header}).append($j("<br/>"))).appendTo(c);for(var n=0;n<wizardPages[s].fields.length;n++){var d=wizardPages[s].fields[n],u=$j("<tr/>",{id:"p"+s+"_r"+n}).css("vertical-align","top").appendTo(c),f=2;if(d.label&&($j("<td/>",{text:d.label}).css({"text-align":"left","padding-right":"12px"}).appendTo(u),f=1),d.input)d.input&&$j("<td/>",{colspan:f}).append(d.input.jQueryObject).appendTo(u);else{var g={};$j.extend(g,d.options);var h=createInput(d.type,"wizardField"+s+"_"+n,d.value||"",g);$j("<td/>",{colspan:f}).append(h).appendTo(u)}}}o.content=r,o.dialogClass="psPrompt",o.type="dialogM",o.buttons=[{text:wizardPages[0].nextText,name:"wizardNextButton",click:function(){var e=getWizardValues(),t=wizardIndex,s=wizardPages[t].nextFunction;wizardIndex+1===wizardPages.length?(wizardPages=null,psDialogClose()):changeWizardPage(++wizardIndex),s&&s.apply(this,e)}},{text:wizardPages[0].cancelText,name:"wizardCancelButton",click:function(){wizardPages[wizardIndex].cancelFunction&&wizardPages[wizardIndex].cancelFunction.apply(this,values),psDialogClose(),wizardPages=null}},{text:pss_text("psx.js.scripts.psutils.back"),name:"wizardBackButton",click:function(){changeWizardPage(--wizardIndex),wizardPages[wizardIndex+1].backFunction&&wizardPages[wizardIndex+1].backFunction.apply(this,getWizardValues())}}],o.title=wizardPages[0].title,psDialog(o),changeWizardPage(wizardIndex),$j('[name="wizardBackButton"]').css({"float":"left","margin-left":"5px"})}function changeWizardPage(e){0===e?$j('[name="wizardBackButton"]').prop("disabled",!0):$j('[name="wizardBackButton"]').prop("disabled",!1),wizardIndex=e,$j('[name^="page"]').hide(),$j('[name="page'+wizardIndex+'"]').show(),$j('[name="wizardCancelButton"]').html(wizardPages[wizardIndex].cancelText),$j('[name="wizardNextButton"]').html(wizardPages[wizardIndex].nextText),$j(".ui-dialog-title").html(wizardPages[wizardIndex].title)}function createInput(e,t,s,i){var n={type:e,id:t,value:s};switch($j.extend(n,i),e){case"text":case"password":return $j("<input/>",n);case"textarea":return $j("<textarea/>",n).css("resize",n.resize||"both");case"checkbox":var a=n.text||"";delete n.text;var o=$j("<div/>").append($j("<input/>",n));return $j("<span/>",{text:a}).appendTo(o),o;case"select":var r=n.choices,l=n.selected;delete n.choices,delete n.selected;for(var o=$j("<select/>",n),p=0;p<r.length;p++){var c=r[p],s="",a="";if("string"==typeof c)s=c,a=c;else{if(!("object"==typeof c&&c instanceof Array&&c.length>0))throw"invalid_arguments";s=c[0],a=c.length>1?c[1]:s}var d={value:s,text:a};s===l&&(d.selected="selected"),$j("<option/>",d).appendTo(o)}return o;case"radio":var r=n.choices,l=n.selected,u=t;delete n.choices,delete n.selected,n.name=t;for(var o=$j("<div/>"),p=0;p<r.length;p++){n.id=u+"-"+p;var c=r[p],s="",a="";if("string"==typeof c)s=c,a=c;else{if(!("object"==typeof c&&c instanceof Array&&c.length>0))throw"invalid_arguments";s=c[0],a=c.length>1?c[1]:s}n.value=s,s===l?n.checked="checked":delete n.checked,p>0&&$j("<br/>").appendTo(o),$j("<input/>",n).appendTo(o),$j("<span/>",{text:a}).appendTo(o)}return o;default:return $j("<br/>")}}function getWizardValues(){for(var e=[],t=0;t<wizardPages.length;t++){for(var s=wizardPages[t],i=[],n=0;n<s.fields.length;n++){var a=s.fields[n];i.push(a.input?a.input.valueFunction.apply(this,e):"checkbox"===a.type?$j("#wizardField"+t+"_"+n).is(":checked")?!0:!1:"radio"===a.type?$j('[name="wizardField'+t+"_"+n+'"]:checked').val():$j("#wizardField"+t+"_"+n).val())}e.push(i)}return e}function psPrompt(e){var t=[],s,i="psPrompt",n,a=!1;if("string"==typeof e){for(n=0;n<arguments.length&&"string"==typeof arguments[n];n++)t.push({id:n,label:arguments[n],"data-retString":!0});a=!0}else{if(!("object"==typeof e&&e instanceof Array))throw"invalid_parameters";for(n=0;n<e.length;n++)if("string"==typeof e[n])t.push({id:n,label:e[n],"data-retString":!0});else{if("object"!=typeof e[n])throw"invalid_parameters";if(!e[n].label)throw"invalid_parameters";t.push(e[n])}n=1}if(n===arguments.length)throw"invalid_parameters";if("object"==typeof arguments[n]){if(s=arguments[n],"function"!=typeof s.ok&&"function"!=typeof arguments[n+1])throw"invalid_parameters";n++}else s={};if(n<arguments.length||"function"==typeof arguments[n])s.ok=arguments[n],n++,(n<arguments.length||"function"==typeof arguments[n])&&(s.cancel=arguments[n]);else if("function"!=typeof s.ok)throw"invalid_parameters";var o=$j("<tbody/>");s.content=$j("<table/>",{"class":"linkDescList"}).append(o);var r,l,p,c,d,u,f,g,h,x=["button","checkbox","file","hidden","image","password","radio","reset","submit","text"];for(n=0;n<t.length;n++)for(r=$j("<td/>").appendTo($j("<tr/>").append($j("<td/>",{text:t[n].label})).appendTo(o)),$j.isArray(t[n].items)?l=t[n].items:(delete t[n].label,"undefined"!=typeof t[n].items&&delete t[n].items,"undefined"==typeof t[n].id&&(t[n].id=n),l=[$j.extend({"data-returnSingle":!0},t[n])],t[n].items=l),p=0;p<l.length;p++)if("string"!=typeof l[p].type&&(l[p].type="text"),"br"===l[p].type)$j("<br/>").appendTo(r);else{if(g=l[p].id,l[p].id=i+("undefined"!=typeof l[p].id?l[p].id:n+"_"+p),"select"===l[p].type){u=l[p].options,delete l[p].type,delete l[p].options;var j=$j("<select/>",l[p]).appendTo(r);for(c=0;c<u.length;c++)$j("<option/>",u[c]).appendTo(j);l[p].type="select",l[p].options=u}else f=l[p].type,-1!==$j.inArray(l[p].type,x)?d="<input/>":(h=l[p]["for"],"label"===l[p].type&&"undefined"!=typeof l[p]["for"]&&(l[p]["for"]=i+l[p]["for"]),d="<"+l[p].type+"/>",delete l[p].type),$j(d,l[p]).appendTo(r),void 0===h?delete l[p]["for"]:l[p]["for"]=h,l[p].type=f;void 0===g?delete l[p].id:l[p].id=g}var y=!1;"function"==typeof s.cancel&&(s.close=function(){y||s.cancel.apply(this,arguments)}),s.dialogClass=s.dialogClass||"psPrompt",s.type=s.type||"dialogM",pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.ok3"),s.buttons=[{id:s.okid||"button-ok",text:s.oktext||pss_text("psx.js.scripts.psutils.ok3"),click:function(){y=!0,psDialogClose();var e=[];for(n=0;n<t.length;n++)if(t[n]["data-retString"])e.push($j("#"+i+t[n].id,o).val());else if($j.isArray(t[n].items)){for(l=t[n].items,p=0;p<l.length;p++)"br"!==l[p].type&&(g="#"+i+("undefined"!=typeof l[p].id?l[p].id:n+"_"+p),"checkbox"===l[p].type||"radio"===l[p].type?l[p].value="checked"===$j(g,o).attr("checked"):(-1!==$j.inArray(l[p].type,x)||"select"===l[p].type||"textarea"===l[p].type)&&(l[p].value=$j(g,o).val()));l[0]["data-returnSingle"]&&(t[n].value=l[0].value,delete t[n].items),e.push(t[n])}a?(e.push(s),s.ok.apply(this,e)):s.ok.call(this,e,s)}},{id:s.cancelid||"button-cancel",text:s.canceltext||pss_text("psx.js.scripts.psutils.cancel3"),click:function(){psDialogClose()}}],psDialog(s)}function psForm(e){if("string"==typeof e)return void psForm({url:e});if("object"!=typeof e)throw"invalid_parameters";if(e instanceof jQuery)return void psForm({content:e});e=e||{};var t=!1;"function"==typeof e.cancel&&(e.close=function(){t||e.cancel.apply(this,arguments)}),pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.error_occurred_opening_the_dialog1");var s=e.preValidate;e.preValidate=function(e){var t=$j("form",e.dialogDiv);return 1!==t.length?(psAlert(pss_text("psx.js.scripts.psutils.error_occurred_opening_the_dialog1"),pss_text(0===t.length?"psx.js.scripts.psutils.no_forms_were_found_after_init_psform":"psx.js.scripts.psutils.too_many_forms_were_found_after_init_psform")),!1):t.attr("action")?"function"==typeof s?s(e):!0:(psAlert(pss_text("psx.js.scripts.psutils.error_occurred_opening_the_dialog2"),pss_text("psx.js.scripts.psutils.html_form_created_by_psform_does_not_have_an_action")),!1)},e.dialogClass=e.dialogClass||"psForm",e.type=e.type||"dialogM",e.buttons=[{id:e.cancelid||"button-cancel",text:e.canceltext||pss_text("psx.js.scripts.psutils.cancel4"),click:function(){psDialogClose()}},{id:e.okid||"button-ok",text:e.oktext||pss_text("psx.js.scripts.psutils.ok4"),click:function(){t=!0,"function"==typeof e.ok&&e.ok(e);var s=$j("form",e.dialogDiv);psAjax({url:s.attr("action"),data:s.serialize(),success:function(t,s,i){psDialogClose();var n=!0;"function"==typeof e.formSuccess&&(n=e.formSuccess(t,s,i)),t&&n!==!1&&psDialog("string"==typeof n?{content:n}:{content:t})},error:function(e,t,s){psAlert(pss_text("psx.js.scripts.psutils.error_occurred_submitting_the_form"),t+(s?": "+s:""))}})}}],psDialog(e)}function psAjax(e,t,s){if("string"==typeof e)$j.ajax(psAjaxWrapper({url:e,success:t,error:s}));else{if("object"!=typeof e||"string"!=typeof e.url)throw"invalid_parameters";$j.ajax(psAjaxWrapper(e))}}function psAjaxWrapper(e){e=e||{},e.showLoading!==!1&&(e.showLoading=!0,loadingDialog(e.loadingMessage)),"undefined"!=typeof sn&&sn.analytics&&sn.analytics.trackEvent&&(void 0===e.generateEvent||e.generateEvent)&&sn.analytics.trackEvent("ajax","load",e.url),e.error||(e.error=function(e,t,s){psAjaxError()});var t=e.success;return e.success=function(s,i,n){psCheckAjaxResponse(s,i,n,e),t&&t(s,i,n),e.showLoading===!0&&closeLoading()},e}function psLoad(e){if("object"!=typeof e||"string"!=typeof e.url||!e.el)throw"invalid_parameters";e.type=e.type||"GET",e.cache=e.cache||!1;var t=e.success;e.success=function(s,i,n){$j(e.el).html(s),t&&t(s,i,n)},psAjax(e)}function psCheckAjaxResponse(e,t,s,i){if(s.status&&(s.status<200||s.status>299)){if(i&&"function"==typeof i.error&&i.error(e,t,s)===!1)return;psAjaxError()}if(e&&"string"==typeof e){e=e.toLowerCase();var n=!1,a;for(a=0;a<e.length;a++)if(!(" 	\n\r".indexOf(e.charAt(a))>=0)){if(e.indexOf("<html",a)===a||e.indexOf("<!doctype",a)===a){n=!0;break}if(e.indexOf("<!--",a)===a){var o=e.indexOf("-->",a+1);if(o>=0){a=o+2;continue}break}break}if(n){var r=/type\s*=\s*["']password["'].*name\s*=\s*["'](password|pw)["']/i;if(e.match(r)){if(i&&"function"==typeof i.logoutError&&i.logoutError(e,t,s)===!1)return;psLogoutError()}else{if(i&&"function"==typeof i.error&&i.error(e,t,s)===!1)return;psAjaxError()}}}}function psLogoutError(){pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.you_have_been_logged_out"),alert(pss_text("psx.js.scripts.psutils.you_have_been_logged_out"));var e=window.location.href.split("/")[3],t;throw t="guardian"!==e?"/"+e+"/~loff":"/"+e+"/home.html?ac=logoff",window.location=t,"ajax_logout"}function psAjaxError(){throw pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.an_error_was_detected_contacting_server"),alert(pss_text("psx.js.scripts.psutils.an_error_was_detected_contacting_server")),closeLoading(),"ajax_error"}function parseResponseHeaders(e){var t={};if(!e)return t;var s=e.split("\n"),i;for(i=0;i<s.length;i++){var n=s[i],a=n.indexOf(": ");if(a>0){var o=$j.trim(n.substring(0,a)),r=$j.trim(n.substring(a+2));t[o]=r}}return t}function psDialog(e){if("string"!=typeof e){if("object"!=typeof e)throw"invalid_parameters";if(e.currentTarget&&e.currentTarget===this)return psDialogLazyWidget.call(this,e);if(e.content instanceof jQuery||"string"==typeof e.content&&e.contentIsText===!0);else{if("undefined"==typeof e.content){if("string"==typeof e.url){e.ajaxOptions=e.ajaxOptions||{},e.ajaxOptions.url=e.url,e.ajaxOptions.generateEvent=!1;var t=e.ajaxOptions.success;return e.ajaxOptions.success=function(s,i,n){var a=null;try{a=$j.parseJSON(s)}catch(o){}if(null===a?(e.content=s,e.contentIsText=!0):$j.extend(e,a),"function"==typeof t&&t(s,i,n),"string"==typeof e.dialogType)switch(e.dialogType){case"psAlert":psAlert(e);break;case"psConfirm":psConfirm(e);break;case"psForm":psForm(e);break;default:psDialog(e)}else psDialog(e)},void psAjax(e.ajaxOptions)}throw"invalid_parameters"}e.content=$j(e.content)}"undefined"!=typeof sn&&sn.analytics&&sn.analytics.trackEvent&&sn.analytics.trackEvent("dialog","open",e.url),e.type=e.type||"dialogC";var s={closeText:"",width:"auto",height:"dialogR"===e.type?500:"auto",minWidth:200,minHeight:40,resizable:"dialogR"===e.type,position:{my:"center",at:"center",of:window},draggable:!0,modal:-1!==$j.inArray(e.type,["dialogM","dialogR"]),autoOpen:!1,persistContent:!0};if($j.extend(e,$j.extend(s,e)),e.position&&e.position instanceof jQuery){var i=[e.position.offset().left,e.position.offset().top-$j(document).scrollTop()];e.position=i}e.dialogDiv?e.dialogDiv=$j(e.dialogDiv):(e.dialogDiv=$j("#psDialog"),0===e.dialogDiv.length&&(e.dialogDiv=$j("<div/>",{id:"psDialog","class":"psDialog"}).appendTo("body"))),e.dialogDiv.is(":data(ui-dialog)")&&(e.dialogDiv.dialog("isOpen")&&e.dialogDiv.dialog("close"),e.dialogDiv.dialog("destroy").hide()),e.dialogDiv.empty(),"string"==typeof e.content&&e.contentIsText===!0?e.dialogDiv.html(e.content):e.dialogDiv.append(e.persistContent?e.content:$j(e.content).clone()),"string"==typeof e.beforeOpenLoadJS?psGetScript(e.beforeOpenLoadJS,function(){psDialogEnd(e)}):psDialogEnd(e)}else if("reopen"===e)$j("#psDialog").dialog("open");else if("option"===e){var n=$j("#psDialog");n.dialog.apply(n,arguments)}else psDialog({url:e})}function psDialogEnd(e){var t=!1;if("function"==typeof e.beforeOpen)e.beforeOpen(e);else if("string"==typeof e.beforeOpen&&""!==e.beforeOpen){var s=e.beforeOpen.split("."),i=window,n;for(n=0;n<s.length;n++)i=i[s[n]];"function"==typeof i?i(e):t=!0}if(closeLoading(),e.dialogDiv.dialog(e),e.initBehaviors!==!1&&initBehaviors(),("function"!=typeof e.preValidate||e.preValidate(e))&&(e.dialogDiv.dialog("open"),$j("#psDialog :input:visible:enabled:first").focus(),t))throw new ReferenceError("The referenced function "+e.beforeOpen+"() could not be found.")}function psDialogClose(e){e=e||$j("#psDialog"),e.is(":ui-dialog")&&e.dialog("isOpen")&&e.dialog("close")}function psDialogLazyWidget(e){var t={title:$j(this).attr("title")},s=$j(this).attr("href");t.persistContent=$j(this).data("persistcontent")===!0;var i=$j(this).data("beforeopenloadjs");i&&(t.beforeOpenLoadJS=i);var n=$j(this).attr("data-beforeopen");if(n&&(t.beforeOpen=n),""===s){var a=$j(this).attr("dialogContent");a&&(s=a)}var o=$j(this).attr("class"),r=o.split(/\s+/g),l=$j(this),p=!1;if($j.each(r,function(e,s){switch(s){case"dialogDiv":p=!0;case"dialog":return t.type="dialog",t.position=l,!1;case"dialogDivC":p=!0;case"dialogC":return t.type="dialogC",!1;case"dialogDivM":p=!0;case"dialogM":return t.type="dialogM",!1;case"dialogR":return t.type="dialogR",!1}return!0}),p){t.width=$j(s).width(),t.width||delete t.width;var c=$j(s);t.content=c.children().detach(),t.close=function(e,s){c.append(t.content.detach())},psDialog(t)}else t.beforeOpen||(t.beforeOpen=function(e){postPsDialogSTUMCheck()}),t.url=s,t.ajaxOptions={cache:!1,success:function(e,s,i){var n=$j(t.content);if(n instanceof jQuery){var a=n.filter("div");0===a.length&&(a=$j("div:first-child",n)),0!==a.length&&(t.width=a.width())}t.width||delete t.width}},psDialog(t);return!1}function postPsDialogSTUMCheck(){$j("#errorMsg").hide(),$j("#InboundRequests").click(function(e){$j.ajax({url:"/admin/studentmobility/notificationsInstitutionAJAX.action",type:"GET",dataType:"json",success:function(e){"true"==e.success?($j("#errorMsg").hide(),window.open($j("#InboundRequests").attr("href"),"popup")):$j("#errorMsg").show()},error:function(e){psAjaxError()}}),e.preventDefault()})}function toggleDrawerPanel(e,t,s){"expanded"===s?($j("body").addClass("drawerPanelExpanded"),$j("#"+t).css({"z-index":DIALOG_Z_INDEX}).show(),$j("#"+e).css({"z-index":DIALOG_Z_INDEX+1}).show().switchClass("collapsed","expanded",750,"swing")):"collapsed"===s&&($j("body").removeClass("drawerPanelExpanded"),$j("#"+e).switchClass("expanded","collapsed",500,"swing",function(){$j("#"+e).hide(),$j("#"+e+" .content").animate({scrollTop:0})}),$j("#"+t).hide())}function toggleSmartDrawerPanel(e,t,s){e.length<=0||("expanded"===t?($j("body").addClass("drawerPanelExpanded"),$j(".drawerModalOverlay",e).css({"z-index":DIALOG_Z_INDEX}).show(),$j(".rightSideDrawerPanel",e).css({"z-index":DIALOG_Z_INDEX+1}).show().switchClass("collapsed","expanded",750,"swing")):"collapsed"===t&&($j("body").removeClass("drawerPanelExpanded"),$j(".rightSideDrawerPanel",e).switchClass("expanded","collapsed",500,"swing",function(){$j(".rightSideDrawerPanel",e).hide(),$j(".rightSideDrawerPanel .content",e).animate({scrollTop:0})}),$j(".drawerModalOverlay",e).hide()))}function toggleModAccessDrawerPanel(e,t){var s=$j("#frameContent",top.document),i;i=s.length>0?$j("#modAccessDrawerContainer",top.frames.content.document):$j("#modAccessDrawerContainer"),"expanded"===e?i.length>0?$j("#modAccessPageContent",i).psLoad("/admin/security/modaccessSlideDrawer.html",function(e,t,s){toggleSmartDrawerPanel(i,"expanded"),jsLazyLoader()}):void 0!==t&&(s.length>0?top.frames.content.location.href=t:window.location.href=t):"collapsed"===e&&i.length>0&&toggleSmartDrawerPanel(i,"collapsed")}var $j=$j||jQuery.noConflict(),DIALOG_Z_INDEX=99e3,wizardPages,wizardIndex=0,loadingDialogInstance=function(){var e,t=[],s=[],i=function(e,i){t.push(e),s.push(i)},n=function(e){var i=$j.inArray(e,t);return 0===i&&t.length>1?(t.shift(),s.shift(),s[0]):void(-1!==i&&(t.splice(i,1),s.splice(i,1)))},a=function(){return t.length>0},o=function(){return!!e&&1===e.length&&e.is(":ui-dialog")&&e.dialog("isOpen")},r={};return r.open=function(t,s){e||(e=$j("#loading"),0===e.length&&(e=$j("<div/>",{id:"loading"}).appendTo("body"))),t||(pss_get_texts("psx.js.scripts.psutils.","psx.js.scripts.psutils.loading"),t=pss_text("psx.js.scripts.psutils.loading")),i(s,t),o()||e.dialog({title:t,width:250,height:35,resizable:!1,modal:!0,dialogClass:"dialogLoading"})},r.closeDialog=function(t){var s=n(t);s?e.dialog("option","title",s):!a()&&o()&&e.dialog("destroy").hide()},r.forceClose=function(){t.length=0,s.length=0,this.closeDialog()},r.setTitle=function(t){e.dialog("option","title",t)},r}(),psGetScript=function(){var e={};return function(t,s,i){if("string"==typeof t)psGetScript({url:t,success:s,error:i});else{if("object"!=typeof t||"string"!=typeof t.url)throw"invalid_parameters";if(e[t.url])t.success&&t.success();else{t.dataType="script",t.cache=!0;var n=t.success;t.success=function(s,i,a){e[t.url]=!0,n&&n()},$j.ajax(psAjaxWrapper(t))}}}}();$j.fn.psLoad=function(e,t){if("string"==typeof e){var s=e;e={url:s,success:t}}else if("object"!=typeof e||"string"!=typeof e.url)throw"invalid_parameters";e.el=this,psLoad(e)};var getScrollWidth=function(){var e=null;return $j(window).resize(function(){e=null}),function(){if(null===e){var t=$j("<div/>").css({width:100,height:100,overflow:"scroll",position:"absolute",top:-9999}).appendTo("body");e=t.get(0).offsetWidth-t.get(0).clientWidth,t.remove()}return e}}();!function(){$j.fn.hasScrollBars=function(e){var t=this.get(0),s;if("horz"!==e&&t.scrollHeight>t.clientHeight){if(s=this.css("overflow-y"),"auto"===s||"scroll"===s)return!0;if(!s&&(s=this.css("overflow"),"auto"===s||"scroll"===s))return!0}if("vert"!==e&&t.scrollWidth>t.clientWidth){if(s=this.css("overflow-x"),"auto"===s||"scroll"===s)return!0;if(!s&&(s=this.css("overflow"),"auto"===s||"scroll"===s))return!0}return!1}}();var htmlEntities=function(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},convertToSize=function(e,t){if(0>t||t>4)return"";switch(t){case 1:e/=1024;break;case 2:e/=1048576;break;case 3:e/=1073741824;break;case 4:e/=1099511627776;break;case 0:return e}return e=(Math.floor(100*e)/100).toFixed(2)},convertFromBytesToString=function(e){pss_get_texts("psx.js.scripts.psfilepicker");var t=pss_text("psx.js.scripts.psfilepicker.bytes");return 0==$j.isNumeric(e)?"":(e>1099511627776?(e=convertToSize(e,4),t=pss_text("psx.js.scripts.psfilepicker.terabytes")):e>1073741824?(e=convertToSize(e,3),t=pss_text("psx.js.scripts.psfilepicker.gigabytes")):e>1048576?(e=convertToSize(e,2),t=pss_text("psx.js.scripts.psfilepicker.megabytes")):e>1024&&(e=convertToSize(e,1),t=pss_text("psx.js.scripts.psfilepicker.kilobytes")),""!==e&&(e=e+" "+t),e)};