function makeDateFromStr(e){var t=new String(e),a,r,n,d;if(""==t)return null;var l=string2Date(t);return null==l?null:(r=l[1],n=l[3],d=defaultTheCentury(l[4]),a=new Date(d,r-1,n,0,0,0),a.getMonth()==new Number(r-1)&&a.getDate()==new Number(n)&&a.getFullYear()%100==new Number(d)%100?a:null)}function defaultTheCentury(e,t,a){var r=new Number(e),n=t;if(r>=100)return e;(void 0===n||null===n||0==n.getTime())&&(n=new Date),(void 0===a||null===a||isNaN(a)||a>99)&&(a=10);var d=n.getFullYear();r>d%100+a&&(d-=100);var l=Math.floor(d/100),s=new Number(100*l+r);return s.toString()}function makeStrFromDate(e){return get_localized_date(e)}function endsWith(e,t){return e.length<t.length?!1:e.substr(e.length-t.length)==t?!0:!1}function string2Date(e){var t=get_date_format(),a="^"+t+"$",r,n=e,d,l,s,u,i=-1;if(endsWith(t,"M")?(i=t.indexOf("dd"),i>=0?u=t.charAt(i+2):(i=t.indexOf("d"),i>=0&&(u=t.charAt(i+1)))):t.indexOf("M")>=0&&(i=t.indexOf("MM"),i>=0?u=t.charAt(i+2):(i=t.indexOf("M"),i>=0&&(u=t.charAt(i+1)))),a=a.replace("dd","(\\xyz{1,2})"),a=a.replace("d","(\\d{1,2})"),a=a.replace("xyz","d"),a=a.replace("MM","(\\d{1,2})"),a=a.replace("M","(\\d{1,2})"),a=a.replace("yyyy","(\\d{2}|\\d{4}|\\d{1})"),a=a.replace("yyy","(\\d{2}|\\d{4}|\\d{1})"),a=a.replace("yy","(\\d{2}|\\d{4}|\\d{1})"),a=a.replace("y","(\\d{2}|\\d{4}|\\d{1})"),a=a.replace(/\./g,"\\."),r=new RegExp(a),d=n.match(r),l=null,d){s=t.split(u),l=new Array;for(var _=0;_<s.length;_++){var c=s[_];"MM"===c||"M"===c?l[1]=d[_+1]:"dd"===c|"d"===c?l[3]=d[_+1]:("yyyy"===c||"yy"===c||"y"===c)&&(l[4]=d[_+1])}}return l}function checkDates(e){var t=document.forms[0].elements[e];return checkDatesByRef(t)}function checkDatesByRef(e){var t=e.value,a=e.defaultValue,r,n,d,l;if(""==t)return!0;var s=string2Date(t);if(""==s)return!0;if(null==s)return alert(pss_text("psx.js.admin_javascript.validate_date.date_format_must_be",[get_date_text()])),e.value=a,!1;if(r=s[1],n=s[3],d=s[4],parseInt(r)+parseInt(n)+parseInt(d)===0)return!0;if(d=defaultTheCentury(d),r>12)return alert(pss_text("psx.js.admin_javascript.validate_date.month_must_be_between_1_and_12")),e.value=a,!1;if(n>31)return alert(pss_text("psx.js.admin_javascript.validate_date.day_must_be_between_1_and_31")),e.value=a,!1;if((4==r||6==r||9==r||11==r)&&31==n)return alert(pss_text("psx.js.admin_javascript.validate_date.month_1")+r+pss_text("psx.js.admin_javascript.validate_date._doesnt_have_31_days")),e.value=a,!1;if(2==r){var u=d%4==0&&(d%100!=0||d%400==0);if(n>29||29==n&&!u)return alert(pss_text("psx.js.admin_javascript.validate_date.february_")+d+pss_text("psx.js.admin_javascript.validate_date._doesnt_have_")+n+pss_text("psx.js.admin_javascript.validate_date._days")),e.value=a,!1}return l=new Date(d,r-1,n,0,0,0),e.value=get_localized_date(l),!0}function checkDatesByPtr(e){return null===e?!0:checkDates(e.id)}function checkDates_Blank(e){var t=checkDates(e);return 0==t?(document.forms[0].elements[e].value="",!1):!0}function checkDates_DefaultValue(e){var t=document.forms[0].elements[e].value;return""==t?(document.forms[0].elements[e].value=document.forms[0].elements[e].defaultValue,!0):checkDates(e)}