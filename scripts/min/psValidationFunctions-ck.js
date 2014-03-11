define(["jquery","underscore"],function(e,t){var a={},n=[],l=function(e,t,n,l){var i={dependentKey:e,relationship:n,type:l};if(void 0===a[t])a[t]=[],a[t][0]=i;else{var r=a[t].length;a[t][r]=i}},i={parseJSONrules:function(a){if(void 0!==a&&void 0!==a.length&&0!==a.length){var i={};if(a.each(function(){var t=e.parseJSON(e(this).attr("data-validation"));null!=t.type&&(null!=t.key&&e(this).attr("data-key",t.key),"number"==t.type?(e(this).addClass("psNumWidget"),null!=t.minValue&&e(this).attr("data-minvalue",t.minValue),null!=t.ref_minValue&&(e(this).attr("data-ref_minvalue",t.ref_minValue),l(t.key,t.ref_minValue,"data-minvalue",t.type)),null!=t.maxValue&&e(this).attr("data-maxvalue",t.maxValue),null!=t.ref_maxValue&&(e(this).attr("data-ref_maxvalue",t.ref_maxValue),l(t.key,t.ref_maxValue,"data-maxvalue",t.type)),null!=t.isinteger&&"true"==t.isinteger&&e(this).attr("data-isinteger","true"),null!=t.minlength&&e(this).attr("minlength",t.minlength),null!=t.maxlength&&e(this).attr("maxlength",t.maxlength)):"date"==t.type?(e(this).addClass("psDateWidget"),null!=t.minValue&&e(this).attr("data-mindate",t.minValue),null!=t.ref_minValue&&(e(this).attr("data-ref_mindate",t.ref_minValue),l(t.key,t.ref_minValue,"data-mindate",t.type)),null!=t.maxValue&&e(this).attr("data-maxdate",t.maxValue),null!=t.ref_maxValue&&(e(this).attr("data-ref_maxdate",t.ref_maxValue),l(t.key,t.ref_maxValue,"data-maxdate",t.type))):"text"==t.type&&(e(this).addClass("psTextWidget"),null!=t.minlength&&e(this).attr("minlength",t.minlength),null!=t.maxlength&&e(this).attr("maxlength",t.maxlength),null!=t.textMask&&null!=t.key&&("undefined"==typeof i.textMaskDefs&&(i.textMaskDefs=[]),-1==e.inArray(t.textMask,i.textMaskDefs)&&i.textMaskDefs.push(t.textMask),e(this).attr("data-textmask",t.textMask)),null!=t.excludechars&&null!=t.key&&("undefined"==typeof i.fields&&(i.fields=[]),-1==e.inArray(t.key,i.fields)&&i.fields.push(t.key),null!=t.excludechars&&e(this).attr("data-excludechars","true"))),"true"==t.required&&e(this).addClass("required"))}),t.keys(i).length>0){var r=JSON.stringify(i);jQuery.ajax({async:!1,url:"/getValidationTextMap.action",data:{jsonString:r},dataType:"json",cache:!1,success:function(e){n=e}})}}},getTextDataMapAttribute:function(e,t,a){return"undefined"==typeof e||"undefined"==typeof t||"undefined"==typeof a||null==e||null==t||null==a||"undefined"==typeof n[e]||null==typeof n[e]||"undefined"==typeof n[e][t.toLowerCase()]||null==typeof n[e][t.toLowerCase()]||null==typeof n[e][t.toLowerCase()][a]||"undefined"==typeof n[e][t.toLowerCase()][a]?null:n[e][t.toLowerCase()][a]},sendChangeNotification:function(t){var n=t.attr("data-key");if(void 0!==n&&void 0!==a[n]){var l=a[n].length,i=t.val(),r=!1;""===i&&(r=!0),"date"===a[n][0].type&&"function"==typeof psDateValidate.isZeroDate&&psDateValidate.isZeroDate(i)&&(r=!0);var u=0;for(u=0;l>u;u++){var s=a[n][u].dependentKey,d=e('[data-key="'+s+'"]'),f=a[n][u].relationship;d.each(function(){if(r)e(this).removeAttr(f);else{var t;if("date"===a[n][u].type){var l=i18nStringToDate(i);t=""+(l.getMonth()+1)+"/"+l.getDate()+"/"+l.getFullYear()}else"number"===a[n][u].type&&(t=deLocalizeNumber(i));e(this).attr(f,t)}"date"===a[n][u].type&&psDateValidate.validateDate(e(this)),"number"===a[n][u].type&&psNumWidget.validateNumber(e(this))})}}}};return i});