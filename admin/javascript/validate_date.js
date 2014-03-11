<!--
    
// Purpose: Uses a range of date validation functions to insure proper date entry

function makeDateFromStr(dateStr) {
	var s = new String(dateStr);
	var d;   //  = new Date(dateStr);  // assumes OS date format
	var month, day, year;
    
	if (s=="") {
    	return null;
    }
	var matchArray = string2Date(s);
	
	if (matchArray == null) { 
		return null; 
	} 
	month = matchArray[1];  // parse date into variables
	day = matchArray[3]; 
	year = defaultTheCentury(matchArray[4]);
	
	d = new Date(year, month-1, day, 0, 0, 0);
	
	// Is this the date we were sent in the string? 
	// Date() will roll the date if the month or day in the
	// string are too large. It will not complain at all.
	if (d.getMonth() == new Number(month-1) 
		&& d.getDate() == new Number(day)
		&& d.getFullYear() % 100 == (new Number(year)) % 100) {
		return d;
	} else {
		return null;
	}
}

function defaultTheCentury(year, refDate, lookAheadYearCnt) {
	var yr = new Number(year);
	var d = refDate;
	
	if (yr >= 100) { // already have a century
		return year;
	}
	if (d === undefined || d === null || d.getTime() == 0) {
		d = new Date();
	}
	if (lookAheadYearCnt === undefined || lookAheadYearCnt === null || isNaN(lookAheadYearCnt)
			|| lookAheadYearCnt > 99) {
		lookAheadYearCnt = 10;
	}
	var yearNow = d.getFullYear();
	if ((yearNow % 100) + lookAheadYearCnt < yr) {
		yearNow = yearNow - 100;
	}
	var centuryNow = Math.floor(yearNow/100);
	var givenYear = new Number((centuryNow * 100) + yr);
	return givenYear.toString();
}

function makeStrFromDate (d) {
	return get_localized_date(d);
}

function endsWith(whole, part) {
  if (whole.length < part.length) return false;
  if (whole.substr(whole.length - part.length) == part) return true;
  return false;
}

/**
 * Convert a string to a Date. Return result compatible with the match()
 * method called currently: ret[1] = month ret[3] = day ret[4] = year NOTE:
 */
function string2Date(s) {
    // First we need to convert the string into a regex pattern
    var f = get_date_format();
    var regex = "^"+f+"$";
    var regexp;
    var	dateStr = s;
    var matchArray, outArray;
    var	pieces;
    var	sep;
    var idx = -1;
    
    // Get the character after the MM - this assumes that the first and second separator character
    // characters are always the same. If the MM is at the end, then use the dd.
    if (endsWith(f, "M")) {
    	idx = f.indexOf("dd");
    	if (idx >= 0) {
    		sep = f.charAt(idx+2);
    	} else {
    		idx = f.indexOf("d");
    		if (idx >= 0) {
    			sep = f.charAt(idx+1);
    		}
    	}
    } else {
    	if (f.indexOf("M") >= 0) {
	    	idx = f.indexOf("MM");
	    	if (idx >= 0) {
	    		sep = f.charAt(idx+2);
	    	} else {
	    		idx = f.indexOf("M");
	    		if (idx >= 0) {
	    			sep = f.charAt(idx+1);
	    		}
	    	}
    	}
    }

	regex = regex.replace("dd", "(\\xyz{1,2})");	// put xyz to avoid having the next replace function hose
	regex = regex.replace("d", "(\\d{1,2})"); 		// the 'd' that might have just been put in the string
	regex = regex.replace("xyz", "d");              // NOW, replace xyz
	regex = regex.replace("MM", "(\\d{1,2})");
	regex = regex.replace("M", "(\\d{1,2})");
	regex = regex.replace("yyyy", "(\\d{2}|\\d{4}|\\d{1})");
	regex = regex.replace("yyy", "(\\d{2}|\\d{4}|\\d{1})");	// so replace of single y does not leave y's hanging
	regex = regex.replace("yy", "(\\d{2}|\\d{4}|\\d{1})");
	regex = regex.replace("y", "(\\d{2}|\\d{4}|\\d{1})");
	regex = regex.replace(/\./g, "\\.");
	regexp = new RegExp(regex);
	
	matchArray = dateStr.match(regexp); // is the format ok?
	outArray = null;
	if (matchArray) {
		pieces = f.split(sep);
		outArray = new Array();
        for (var i = 0; i < pieces.length; i++) {
          var piece = pieces[i];
          if (piece === "MM" || piece === "M") {
			outArray[1] = matchArray[i+1];			
		  }
          else if (piece === "dd" | piece === "d") {
			outArray[3] = matchArray[i+1];
		  }
          else if (piece === "yyyy" || piece === "yy" || piece === "y") {
			outArray[4] = matchArray[i+1];
		  }
        }
    }
	return outArray;
}

function checkDates(vDate) {
	var dateElement = document.forms[0].elements[vDate];
	return checkDatesByRef(dateElement);
}

function checkDatesByRef(dateElement) {
	var dateStr = dateElement.value;
	var defaultValue = dateElement.defaultValue;	//keeps the previous value
	var month, day, year, d;
    if(dateStr=="") {
    	return true;
    }

	var matchArray = string2Date(dateStr);
	if (matchArray == "") {
		return true;
	}
	if (matchArray == null) { 
		alert(pss_text('psx.js.admin_javascript.validate_date.date_format_must_be', [get_date_text()]));
		dateElement.value = defaultValue;
		return false; 
	} 
	month = matchArray[1]; // parse date into variables
	day = matchArray[3]; 
	year = matchArray[4]; 

	// validations
	if ((parseInt(month) + parseInt(day) + parseInt(year)) === 0)  // empty date is OK
		return true;

	year = defaultTheCentury(year);
		
	if (month > 12) { 
		alert(pss_text('psx.js.admin_javascript.validate_date.month_must_be_between_1_and_12')); 
		dateElement.value = defaultValue;
		return false; 
	} 
	if (day > 31) {
		alert(pss_text('psx.js.admin_javascript.validate_date.day_must_be_between_1_and_31')); 
		dateElement.value = defaultValue;
		return false; 
	} 
	if ((month==4 || month==6 || month==9 || month==11) && day==31) {
		alert(pss_text('psx.js.admin_javascript.validate_date.month_1')+month+pss_text('psx.js.admin_javascript.validate_date._doesnt_have_31_days'));
		dateElement.value = defaultValue;
		return false;
	} 
	if (month == 2) { // check for February 29th
		var isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)); 
		if (day>29 || (day==29 && !isleap)) { 
			alert(pss_text('psx.js.admin_javascript.validate_date.february_') + year + pss_text('psx.js.admin_javascript.validate_date._doesnt_have_') + day + pss_text('psx.js.admin_javascript.validate_date._days')); 
			dateElement.value = defaultValue;
			return false; 
		} 
	}
	// update the input
	d = new Date(year, month-1, day, 0,0,0);
	dateElement.value = get_localized_date(d);
	
	return true; // date is valid
}

function checkDatesByPtr (TextFldPtr) {
	if (TextFldPtr === null) {
		return true;
	}
	return checkDates(TextFldPtr.id);  
}

function checkDates_Blank(vDate)
{	// Call checkDates and clear the field if it is invalid
	var vValidated_b = checkDates(vDate);
	if (vValidated_b == false)
	{
		document.forms[0].elements[vDate].value = "";
		return false;
	}
	else
		return true;
}

function checkDates_DefaultValue(vDate)
{	//returned default value if the date field is cleared; otherwise call checkDates
	//Most often it is called for a required field
	var dateStr = document.forms[0].elements[vDate].value;
 	if(dateStr=="") {
		document.forms[0].elements[vDate].value = document.forms[0].elements[vDate].defaultValue;
    	return true;
   }
   return checkDates(vDate); 
}
// -->