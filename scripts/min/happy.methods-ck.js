var happy={USPhone:function(t){return/^\(?(\d{3})\)?[\- ]?\d{3}[\- ]?\d{4}$/.test(t)},USPhoneWithExtension:function(t){return/^\(?(\d{3})\)?[\- ]?\d{3}[\- ]?\d{4}(?:[ ]+x\d+)?$/.test(t)},USState:function(t){return/^[A-Z]{2}$/.test(t)},USZip:function(t){return/^[0-9]{5}(?:[\-][0-9]{4})?$/.test(t)},date:function(t){return/^(?:[1-9]|10|11|12)\/(?:[1-9]|[12][0-9]|3[01])\/(?:\d{4})/.test(t)},selectorIsEmpty:function(t){var n=jQuery.grep($j(t),function(t,n){var e=$j(t);return"checkbox"!=t.type&&"radio"!=t.type||0!=e.filter(":checked").length?!(""===e.val()):!1});return 0==n.length},requiredIfArgNotEmpty:function(t,n){return""!==t?!0:happy.selectorIsEmpty(n)},email:function(t){return/^[-a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~]+@[-a-zA-Z0-9\.]+\.[a-zA-Z]{2,4}$/.test(t)},minLength:function(t,n){return t.length>=n},maxLength:function(t,n){return t.length<=n},equal:function(t,n){return t==n},emptyOrDate:function(t){return""===t||happy.date(t)},emptyOrEmail:function(t){return""===t||happy.email(t)},emptyOrUSPhoneWithExtension:function(t){return""===t||happy.USPhoneWithExtension(t)}};