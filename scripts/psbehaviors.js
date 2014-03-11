//JavaScript Document

/*====================================================================
//NOTE: Requires jQuery 1.9.1 or greater and jQueryUI 1.10.0 or greater
======================================================================*/

var $j = $j || jQuery.noConflict();
var psRTELoaded = false;
var psTableToGridLoaded = false;
var radioSliderLoaded = false;
var restoreSessionBox;

function loadWidget(widgetType, jqWidgetElement, widgetValidationJSON, isUnvalidated, widgetFormat) {
	var result = false;
	jqWidgetElement.attr('data-validation', widgetValidationJSON);
	$j(jqWidgetElement).addClass('noIndicator');
	if ( widgetType == 'psNumWidget' ) {
	    result = loadPsNumWidget(jqWidgetElement, isUnvalidated);
	} else if ( widgetType == 'psDateWidget' ) {
		result = loadPsDateWidget(jqWidgetElement, isUnvalidated, widgetFormat);
	}

	return result;
}

function loadPsNumWidget(jQueryElement, isUnvalidated) {
	if( typeof jQueryElement != 'undefined' && jQueryElement.length ) {
		readyDataValidation(jQueryElement);

		require(['psNumWidget'], function(psNumWidget){
			psNumWidget.initializeNumWidget();
		});
		// mark elements initially with unvalidated class, so we know what's been touched later
		if ( isUnvalidated ) {
			$j(jQueryElement).addClass('unvalidated');
		}
	}
	
	return true;
}

function loadPsDateWidget(jQueryElement, isUnvalidated, widgetFormat) {
	if( typeof jQueryElement != 'undefined' && jQueryElement.length ) {
		readyDataValidation(jQueryElement);
		
		if (widgetFormat != undefined && widgetFormat == 'noformat') {
			$j(jQueryElement).addClass('noformat');
		}

		require(['psDateValidate'], function(dv){
		    psDateValidate = dv;
		    psDateValidate.initializeDateValidate();
		});

		
		// mark elements initially with unvalidated class, so we know what's been touched later
		if ( isUnvalidated ) {
			$j(jQueryElement).addClass('unvalidated');
		}
		
		$j('input.psDateWidget').closest("form").addClass('validatedForm');
		
		if( $j( 'input.psDateWidget.psDateHighlight' ).length ){
			$j.getScript("/scripts/psDateWidgetHighlight.js", function(){});	
		}
	}
	
	return true;
}

function readyDataValidation(psWidget)
{
	var data = $j.parseJSON(psWidget.attr("data-validation"));
	if (data.type != null) {
		if (data.type == "number") { //add number type-specific cases 
			$j(psWidget).addClass("psNumWidget");
			if (data.minValue != null) {
				$j(psWidget).attr("data-minvalue", data.minValue);
			} 
			if (data.maxValue != null) {
				$j(psWidget).attr("data-maxvalue", data.maxValue);
			}
			if (data.isinteger != null) {
				if (data.isinteger == "true") {
					$j(psWidget).attr("data-isinteger", "true");
				}
			}				
		} else if (data.type == "date") { //add date type-specific cases
			$j(psWidget).addClass("psDateWidget");
			if (data.minValue != null){
				$j(psWidget).attr("data-mindate", data.minValue);
			}
			if (data.maxValue != null) {
				$j(psWidget).attr("data-maxdate", data.maxValue);
			}
		} 
		if (data.minlength != null) {
			$j(psWidget).attr("minlength", data.minlength);
		} 
		if (data.maxlength != null) {
			$j(psWidget).attr("maxlength", data.maxlength);
		}
		if (data.required == "true") { //add required flag
			$j(psWidget).addClass("required");
		}
	}
}

//psDateWidget was here...
//This script loads external .js files if the dependent objects exist on a page
var __maxlength_count = 0;
var __maxlength_tracker = {};	// key = id, value = function to call when it has focus
var __maxlength_curFocus = null;
var psFilePickerWidget = {}; //file picker isn't a validation function - should be available anywhere

//Data Validation Global functions
if ($j('body[data-validation="exclude"]').length == 0) { //Only load if the page is not excluded from validation
	//Data Validation Modules (these are initialized later through "require" calls)
	var validationFunctions = {};
	var psDateValidate = {};	
	var psDateWidget = {};
	var psFormValidate = {};
	var psNumWidget = {};
	var psRequired = {};
	var psTextWidget = {};
	
	//These functions should eventually be deprecated. Please use access them through the above modules (along with other validation functions).
	var validateForm = {};
	var validateDate = {};
	var getListOfErrors = {};
	var validateDateAfterMin = {};
	var validateDateBeforeMax = {};
	var i18nStringToDate = {};
	var validatedSubmitHandler = {};
	var updateFeedback_Alert = {};
	var setFeedback_Alert = {};
}

function handleTextAreaMaxLength(el, maxlen) {
	if (maxlen > 0) {
		// If the textarea does not have an id, give it one. We need the id to
		// track when the textarea gets focus.
		var textAreaId = el.attr("id");
		if (!textAreaId) {
			textAreaId = "__maxlength_textarea"+__maxlength_count;
			el.attr("id", textAreaId);
		}
		
		// Add in the display part
		var id = "__maxlength_count"+__maxlength_count;
		
		// See which message to use. If the field is < 1000 characters, don't even need to worry
		// about possibly exceeding the 4000B limit, so we'll just say n characters left instead of
		// about n left.
		var charsLeftKey = "psx.js.scripts.psbehaviors.n_characters_left";
		if (maxlen > 1000) charsLeftKey = "psx.js.scripts.psbehaviors.about_n_characters_left";
		
		el.after ("<p class='textareaCounter'>"+pss_text(charsLeftKey, ["<span id='"+id+"'>"+maxlen+"</span>"])+"</p>");
		__maxlength_tracker[textAreaId] = function () {
			var e2 = el.get(0);
			maxlength(e2, maxlen, id);
		};
		__maxlength_tracker[textAreaId]();		// Call it once to set the initial # characters
		
		// Finally, add on focus/blur events to keep track of which of these guys has focus
		el.focus (function () {
			__maxlength_curFocus = $j(this).attr("id");
		});
		el.blur (function () {
			if (__maxlength_curFocus == $j(this).attr("id")) {
				__maxlength_curFocus = null;
			}
		});
		__maxlength_count++;
	}
}

function jsLazyLoader(){
	// Deal with maxlength annotations. We'd like to just use the maxlength attribute,
	// but unfortunately struts2 doesn't let you pass that.
	if ( $j('textarea[class^="maxlength"]').length) {
		$j('textarea[class^="maxlength"]').each (function() {
			var el = $j(this);
			var classList = el.attr('class').split(/\s+/);
			var maxlen = 0;
			$j.each( classList, function(index, item){
			    maxlen = item.substr(9);
			});
			handleTextAreaMaxLength(el, maxlen);
		});
	}

	if ( $j('textarea[maxlength]').length) {
		$j('textarea[maxlength]').each (function() {
			var el = $j(this);
			handleTextAreaMaxLength(el, el.attr("maxlength"));
		});
	}

	// If there were any max length counter areas set up, set up a periodic length checker.
	if (__maxlength_count) {
		setInterval(function() {
			// Get the current focus id. This allows us to only do checking on the textarea
			// that currently has focus.
			if (__maxlength_curFocus && __maxlength_tracker[__maxlength_curFocus]) {
				__maxlength_tracker[__maxlength_curFocus]();
			}
		}, 250);
	}

	if ($j('body[data-validation="exclude"]').length == 0) { //Only load if the page is not excluded from validation
		// Sprinkle submitOnce on all forms for double-click prevention
		$j('form:not(.noSubmitLoading)').addClass('submitOnce'); 

		// Existing submitOnceCond classes should be removed, as submitOnce will handle conditional events
		$j('form.submitOnceCond').removeClass('submitOnceCond');
		var _form = null;
		require(['psValidationFunctions'], function(vf){
			validationFunctions = vf; 
			if (vf != null) {
		//Parse data-validation JSON and handle for data types
				validationFunctions.parseJSONrules($j('[data-validation]:not("[type=hidden]")'));
					} 
		//Loads required widget
		if( $j( 'input.required' ).length ){
				require(['psRequired'], function(r){
					psRequired = r;
					psRequired.initializeRequired();
				});				
			$j('input.required').closest("form").addClass('validatedForm');
	
			// mark elements initially with unvalidated class, so we know what's been touched later
				// Ajax requests, or js that calls initBehaviors may call this multiple times... 'tag' requireds so we don't repeatedly tack multiple asterisks
				$j('input.required:not(.tagged), select.required:not(.tagged)').not('.noIndicator').addClass('unvalidated').addClass('tagged').after('<em>*</em>');
				writeToLegend('<em>*</em> - ' + pss_text('psx.js.scripts.psbehaviors.required'), 'psRequired');
		}
		//Loads numeric entry widget
		if( $j( 'input.psNumWidget' ).length ){
				require(['psNumWidget'], function(n){
					psNumWidget = n;
					psNumWidget.initializeNumWidget();
				});
			$j('input.psNumWidget').closest("form").addClass('validatedForm');
	
			// mark elements initially with unvalidated class, so we know what's been touched later
			$j('input.psNumWidget').addClass('unvalidated');
		}
			
			//Loads text entry widget
			if( $j( 'input.psTextWidget' ).length ){
				require(['psTextWidget'], function(t){
					psTextWidget = t;
					psTextWidget.initializeTextWidget();
				});
				$j('input.psTextWidget').closest("form").addClass('validatedForm');

				// mark elements initially with unvalidated class, so we know what's been touched later
				$j('input.psTextWidget').addClass('unvalidated');
			}
		
			//Loads calendar injection code
	if( $j( 'input.psDateWidget' ).length ){
				require(['psDateWidget'], function(dw, dv){
					psDateWidget = dw;
					//Populating global wrappers
					i18nStringToDate = psDateWidget.i18nStringToDate;
					require(['psDateValidate'], function(dv){
						psDateValidate = dv;
						//Populating global wrappers
						validateDate = psDateValidate.validateDate;
						validateDateAfterMin = psDateValidate.validateDateAfterMin;
						validateDateBeforeMax = psDateValidate.validateDateBeforeMax;
						
						psDateValidate.initializeDateValidate();
					});
				});
				
		$j('input.psDateWidget').closest("form").addClass('validatedForm');
		// mark elements initially with unvalidated class, so we know what's been touched later
		$j('input.psDateWidget').addClass('unvalidated');
		if($j('#validationIcons').find('#calendarIcon').length == 0){
			writeToLegend('<img src="/images/icon-calendar.png" id="calendarIcon"></img> - ' + pss_text('psx.js.scripts.psbehaviors.date_entry'), 'psDateWidget');
		}
			}
			
			if( $j('table#textMaskTable').length ){
				require(['psTextMaskAdministration'], function(tma){
					psTextMaskAdmin = tma;
					psTextMaskAdmin.init();
				});
			}
				
				//widgetLoader.loadDate();
					
			// Forms that contain validated elements have validation functionality tacked onto it
			if ( $j('form.validatedForm').length ) {
				require(['psFormValidate'], function(fv){
					psFormValidate = fv;
					psFormValidate.initializeFormValidate();
					updateFeedback_Alert = psFormValidate.updateFeedback_Alert;
					validateForm = psFormValidate.validateForm;
					getListOfErrors = psFormValidate.getListOfErrors;
					validatedSubmitHandler = psFormValidate.validatedSubmitHandler;
					setFeedback_Alert = psFormValidate.setFeedback_Alert;
				});
				$j('form.validatedForm').each(function(){
					//push the value into a different attribute - so the default onsubmit is not executed
					var onsubmitContents = $j(this).attr('onsubmit');
					$j(this).attr('data-onsubmit', onsubmitContents);
					$j(this).removeAttr('onsubmit');
					//if submitOnce, nuke class
					$j(this).removeClass('submitOnce');
				});
			}else if($j('.unvalidated').length){
				//for widgets that validation is desired but are not in a form - grabs the necessary functions to make them work. 
				require(['psFormValidate'], function(fv){
					psFormValidate = fv;
					updateFeedback_Alert = psFormValidate.updateFeedback_Alert;
					getListOfErrors = psFormValidate.getListOfErrors;
					setFeedback_Alert = psFormValidate.setFeedback_Alert;
				});
		}
		});		
	}
	//end if ($j('body[data-validation="exclude"]').length == 0)
	if( $j( 'input.psDateWidget.psDateHighlight' ).length ){
		$j.getScript("/scripts/psDateWidgetHighlight.js", function(){});	
	}

	
	//load legend for time-entry widgets - these are not lazy loaded :-(
	if ($j('input[class^="timeEntry"]').length) {
		if ($j('input.timeEntry').length){
			writeToLegend('<img src="/images/img/icon-time.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.time_entry'), 'timeEntry');
		}
		if ($j('input.timeEntry5').length){
			writeToLegend('<img src="/images/img/icon-time-5.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.time_entry_x', [pss_text('psx.js.scripts.psbehaviors.interval_five')]), 'timeEntry5');
		}
		if ($j('input.timeEntry05To22').length){
			writeToLegend('<img src="/images/img/icon-time-5.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.time_entry_x', [pss_text('psx.js.scripts.psbehaviors.interval_five')]), 'timeEntry5');
		}
		if ($j('input.timeEntry15').length){
			writeToLegend('<img src="/images/img/icon-time-15.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.time_entry_x', [pss_text('psx.js.scripts.psbehaviors.interval_fifteen')]), 'timeEntry15');
		}
		if ($j('input.timeEntry30').length){
			writeToLegend('<img src="/images/img/icon-time-30.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.time_entry_x', [pss_text('psx.js.scripts.psbehaviors.interval_thirty')]), 'timeEntry30');
		}
		if ($j('input.timeEntryHourOnly').length){
			writeToLegend('<img src="/images/img/icon-time-60.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.time_entry_x', [pss_text('psx.js.scripts.psbehaviors.interval_hour')]), 'timeEntry60');
	}
	}
	
	lazyLoadTableToGrid();
	if( $j('textarea.psRTE').length && !psRTELoaded) {
		$j.getScript("/scripts/markitup/jquery.markitup.js", function() {
			$j.getScript("/scripts/markitup/sets/html/set.js", function() {
				$j.getScript("/scripts/singleField_translation.js", function() {
				
				initPsRTE();		// instead of loading psRTE.js
				
				//Load style sheets for the html widget
				$j("head").append("<link>");
				skinsCSS = $j("head").children(":last");
				skinsCSS.attr({
				      rel:  "stylesheet",
				      type: "text/css",
				      href: "/scripts/markitup/skins/simple/style.css"
				    });
				$j("head").append("<link>");
				setCSS = $j("head").children(":last");
				setCSS.attr({
				      rel:  "stylesheet",
				      type: "text/css",
				      href: "/scripts/markitup/sets/html/style.css"
				    });
				
				psRTELoaded = true;
				});
			});
		});
	}
	
	//Loads psRadioDiv code file using jQuery getScript()
	if( $j( 'select[radioDivPre], input[type="checkbox"].radioDivPre, input[type="radio"].radioDivPre' ).length ){
		$j.getScript("/scripts/psRadioDiv.js", function(){});
	}

	//Loads the "inlineDiff" presentation
	if( $j( 'ul.inlineDiff' ).length ){
		$j.getScript("/scripts/diff.js", function(){});
		
		// There might be more than one on the page ... want to treat each one separately.
		$j( 'ul.inlineDiff' ).each (function() {
			var el = $j(this);
			var parts = el.find("li");
			
			// Right now, only know how to deal with it when there are two <li> elements
			if (parts.length == 2) {
				// Hide the original list
				el.hide();

				// See if any title is desired
				var insTitleHTML, delTitleHTML;
				var delTitle = $j(parts[0]).attr("title");
				if (delTitle) delTitleHTML = pss_text("psx.js.scripts.psbehaviors.deleted_xx", [delTitle]); else delTitleHTML = pss_text("psx.js.scripts.psbehaviors.deleted");
				var insTitle = $j(parts[1]).attr("title");
				if (insTitle) insTitleHTML = pss_text("psx.js.scripts.psbehaviors.added_xx", [insTitle]); else insTitleHTML = pss_text("psx.js.scripts.psbehaviors.added");
				
				wDiffHtmlDeleteStart = '<del title="'+delTitleHTML+'">';
				wDiffHtmlDeleteEnd   = '</del>';
				wDiffHtmlInsertStart = '<ins title="'+insTitleHTML+'">';
				wDiffHtmlInsertEnd   = '</ins>';

				// Create new element
				var oldText = $j(parts[0]).html();
				var newText = $j(parts[1]).html();
				var newElHTML = "<p>"+WDiffString(oldText,newText)+"</p>";
				el.after($j(newElHTML));
			}
		});

	}
	
	 if ($j('input[type="checkbox"].selectAllFor').length) {
		  $j('input[type="checkbox"].selectAllFor').each (function (index, el) {
		    var that = $j(el);
		    
		    // Get the target off the checkbox - that target should have a bunch of
		    // checkboxes under it.
		    var target = that.attr('data-target');
		    if (target) {
		      that.click (function () {
		        $j(target).find(':checkbox').prop('checked', this.checked);
		      });
			}

			// Now, if it also has a startSelected class, start the subs all checked.	
			if (that.hasClass("startSelected")) {
				that.prop('checked', 'true');
				$j(target).find(':checkbox').prop('checked', 'true');
			}
		  });
		}

		if( $j( 'button.next, a.button.next' ).length ){
			dropPointySubElements($j( 'button.next, a.button.next' )).append("<em>&nbsp;</em>");
		}
		if( $j( 'button.prev, a.button.prev' ).length ){
			dropPointySubElements($j( 'button.prev, a.button.prev' )).prepend("<em>&nbsp;</em>");
		}

	/*if( $j( '.tableToGrid' ).length ){
		$j.getScript("/scripts/jqgrid-i18n/grid.locale-en.js", function(){});
		$j.getScript("/scripts/jquery.jqGrid.min.js", function(){});
	}*/
	//Require pageReloader
	if( $j( '.autoReloadPage' ).length ){
		require(['psReloader/psReloader-min'], function(reloader){
			reloader.init();
		});
	}
	
	if ( $j('.tlistCollectionTable').length) {
		require(['tlistCollectionTable'], function(tlistCollectionTable){
			tlistCollectionTable.init();
		});
	}

	//Loads table filters
	if( $j( 'table[data-pstablefilter]' ).length ){
		require(['psTableFilter'], function(tbf){
			psTableFilter = tbf;
			psTableFilter.init();
		});
	}
    
	if( $j('.psFilePicker').length) {
		require(['psFilePicker'], function(filePicker){
			psFilePickerWidget = filePicker;
			psFilePickerWidget.initializeFilePicker();
		});
	}
    
    //Check to see if we should add a dirty state handler to the page.
    if($j('.watchDirtyState').length){
        require(['psDirtyStateController'],function(dirtyStateController){
            var pageDirtyStateController = $j('html').data('dirty_state_controller');
            //If we don't already have one for the page, make it.
            if(!pageDirtyStateController){
                //Save the thing so that it will only ever initialize one per page.
                $j('html').data('dirty_state_controller',dirtyStateController);
                dirtyStateController.init();
            }
        });
    }
}

function restoreSession(restore, pageExcluded){
	// if true  restore session
	if(sessionStorage.restore){
		// clean up sessionStorage variable to avoid repeating the sequence
		sessionStorage.removeItem('timedOut');
		// if framedPage is true send the user to the framed page
		if(sessionStorage.framedPage === 'true'){
			var frameContent = parent.document.getElementById('frameContent') ? parent.document.getElementById('frameContent') : parent.document.getElementsByName('content')[0]; 
			if(sessionStorage.url !== undefined && sessionStorage.url !== null){
				// check if there are necessary rns needed to display properly
				if(sessionStorage.rns !== undefined && sessionStorage.rns !== null){
					var rns = sessionStorage.rns.split(',');
					$j(rns).each(function(index, name){
						if(name!==undefined){
							var contentUrl = sessionStorage.frameContentUrl;
							if(contentUrl.indexOf('?'+name)===-1&&contentUrl.indexOf('&'+name)===-1){
								if(contentUrl.indexOf('?')===-1){
									sessionStorage.frameContentUrl += '?'+name+'='+sessionStorage.getItem(name);
								}else{
									sessionStorage.frameContentUrl += '&'+name+'='+sessionStorage.getItem(name);
								}
							}
						}
					});
				}
				window.location = sessionStorage.url;
				// clean up variable
				sessionStorage.removeItem('url');
				return;
			}else if(frameContent!==undefined&&frameContent!==null){
				// puts the correct page in the target frame
				if(!pageExcluded){
					frameContent.src = sessionStorage.frameContentUrl;
					// clears the rest of the sessionStorage variables
					sessionStorage.clear();
				}else{
					// clears the rest of the sessionStorage variables
					sessionStorage.clear();
					return;
				}
			}
			
		}else{
			if(!pageExcluded && sessionStorage.url !==undefined && sessionStorage.url !== null){
				// returns the user to the correct page last visited and clear sessionStorage variables
//				if(sessionStorage.xselecttype !==undefined && sessionStorage.xselecttype !== null){
//					if(sessionStorage.xselecttype === 'xselectstudent'){
//						if(sessionStorage.url.indexOf('?select')===-1){
//							sessionStorage.url = sessionStorage.url+'?selectstudent='+sessionStorage.xselect;
//							if(sessionStorage.homesearch!==undefined && sessionStorage.homesearch !== null){
//								sessionStorage.url = sessionStorage.url+'&homesearch='+sessionStorage.homesearch;
//							}
//						}
//					}else if(sessionStorage.xselecttype === 'xselectteacher'){
//						if(sessionStorage.url.indexOf('?select')===-1){
//							sessionStorage.url = sessionStorage.url+'?selectteacher='+sessionStorage.xselect;
//						}
//					}
//				}
				window.location = sessionStorage.url;
				// clears the rest of the sessionStorage variables
				sessionStorage.clear();
				return;
			}else{
				restoreSessionBox.hide();
				// clears the rest of the sessionStorage variables
				sessionStorage.clear();
				window.location.reload();
				return;
			}
		}		
	}else{
		restoreSessionBox.hide();
		// clears the rest of the sessionStorage variables
		sessionStorage.clear();
		return;
	}
	
	
}

function lazyLoadTableToGrid() {
	if($j( 'table.tableToGrid' ).length && !psTableToGridLoaded) {
		$j( '.tableToGrid' ).each(function (index, table) {
			$j(table).hide();
			var divElement = $j('<div class="tableToGridLoadingImage" style="height:100%; padding:100px;"><img src="/images/img/jquery/ui-anim_basic_16x16.gif" /> <strong> '+pss_text("psx.common.loading")+'</strong> </div></div>');
			$j(table).before(divElement);
		});
		
		
		$j.getScript("/scripts/psTableToGridWidget.js", function() {});
		psTableToGridLoaded = true;
	}
}

/**
 * Go through a jquery object that holds a list of elements and drop out the ones that
 * already have the <em>&nbsp;</em> required to make them pointy (aka the pointified ones).
 * This is to avoid double-pointy elements when psbehaviors.js is called again (as well as
 * avoiding them if the <em>&nbsp;</em> is manually put in the button).
 * @param element the jquery object, which should contain zero or more matching elements
 * @returns a new jquery object with the same elements except the ones that are already pointified
 */
function dropPointySubElements(element) {
	var ret = [];
	element.each(function (idx, el) {
		var jel = $j(el);
		var hadOne = false;
		jel.find("em").each(function (idx2, el2) {
			var jel2 = $j(el2);
			if (jel2.html() == "&nbsp;") {
				hadOne = true;
			}
		});
		
		if (!hadOne) {
			ret.push(el);
		}
	});
	return $j(ret);
}

function initPsRTE() {
	var ccEditor = $j('.psRTE');
	
	ccEditor.each (function (index, el) {
		// Check for search hints class
		var settings = {
			    nameSpace:       "html", // Useful to prevent multi-instances CSS conflict
			    onShiftEnter:    {keepDefault:false, replaceWith:'<br />\n'},
			    onCtrlEnter:     {keepDefault:false, openWith:'\n<p>', closeWith:'</p>\n'},
			    onTab:           {keepDefault:false, openWith:'    '},
			    previewInWindow: 'width=800, height=600, resizable=yes, scrollbars=yes',
			    markupSet:  [
			        {name:'Heading 1', key:'1', openWith:'<h1(!( class="[![Class]!]")!)>', closeWith:'</h1>', placeHolder:'Your title here...' },
			        {name:'Heading 2', key:'2', openWith:'<h2(!( class="[![Class]!]")!)>', closeWith:'</h2>', placeHolder:'Your title here...' },
			        {name:'Heading 3', key:'3', openWith:'<h3(!( class="[![Class]!]")!)>', closeWith:'</h3>', placeHolder:'Your title here...' },
			        {name:'Heading 4', key:'4', openWith:'<h4(!( class="[![Class]!]")!)>', closeWith:'</h4>', placeHolder:'Your title here...' },
			        {name:'Heading 5', key:'5', openWith:'<h5(!( class="[![Class]!]")!)>', closeWith:'</h5>', placeHolder:'Your title here...' },
			        {name:'Heading 6', key:'6', openWith:'<h6(!( class="[![Class]!]")!)>', closeWith:'</h6>', placeHolder:'Your title here...' },
			        {name:'Paragraph', openWith:'<p(!( class="[![Class]!]")!)>', closeWith:'</p>'  },
			        {separator:'---------------' },
			        {name:'Bold', key:'B', openWith:'<strong>', closeWith:'</strong>' },
			        {name:'Italic', key:'I', openWith:'<em>', closeWith:'</em>'  },
			        {name:'Stroke through', key:'S', openWith:'<del>', closeWith:'</del>' },
			        {name:'Underline', key:'U', openWith:'<span style="text-decoration: underline">', closeWith:'</span>' },
			        {separator:'---------------' },
			        {name:'Ul', openWith:'<ul class="text">\n', closeWith:'</ul>\n' },
			        {name:'Ol', openWith:'<ol class="text">\n', closeWith:'</ol>\n' },
			        {name:'Li', openWith:'<li>', closeWith:'</li>' },
			        {separator:'---------------' },
			        {name:'Picture', key:'P', replaceWith:'<img src="[![Source:!:http://]!]" alt="[![Alternative text]!]" />' },
			        {name:'Link', key:'L', openWith:'<a href="[![Link:!:http://]!]"(!( title="[![Title]!]")!)>', closeWith:'</a>', placeHolder:'Your text to link...' },
			        {separator:'---------------' },
			        {name:'Box', replaceWith:'\n<div class=\"box-round\">\n    <h2>Your title here...<\/h2>\n    <p>Your content here...<\/p> \n<\/div>\n' },
			        {name:'Table', replaceWith:'\n<!-- This is a standards driven table. there are no styles, borders, widths and there is a header row--> \n   <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"grid\" id=\"tableUniqueID\"> \n   <CAPTION>This text appears above the table<\/CAPTION>\n   <thead> \n     <tr> \n       <th>H1 content<\/th> \n       <th>H2 content<\/th> \n       <th>H3 content<\/th> \n     <\/tr> \n   <\/thead> \n   <tfoot> \n     <tr> \n       <td colspan=\"3\">This will display at the bottom of the table. Ideal for legends.<\/td> \n         <\/tr> \n   <\/tfoot> \n   <tbody> \n     <tr> \n       <td>R1C1 content<\/td> \n       <td>R1C2 content<\/td> \n       <td>R1C3 content<\/td> \n     <\/tr> \n     <tr> \n       <td>R2C1 content<\/td> \n       <td>R2C2 content<\/td> \n       <td>R2C3 content<\/td> \n     <\/tr> \n    <\/tbody> \n   <\/table> \n' }
			    ]
			};
		
		var jel = $j(el);
		if (jel.hasClass("psRTESearch")) {
			 settings = $j.extend(true, {}, settings);
			 var markupSet = settings.markupSet;

			 markupSet.push({name:'Translation Hints', call: function() { 
				 var toLangField = $j(el).attr('tolang');
				 
				 var fromLanguage = $j($j(el).attr('fromlang')).val(); 
				 var toLanguage = $j(toLangField).val(); 
				 
				 handleSelectedText(fromLanguage, toLanguage);
			 }});
		}
		jel.markItUp(settings);
	});
}

function initAccordionWizard (accElem, param) {
	/* Accordion Wizard script
	* This code automatically adds next and previous buttons, as well as the count, and steps for the wizard.
	* Also hides the first Previous, and the last next
	*/
	var accWiz = $j('.accordion.wizard'),
		thisAccID =  '',
		thisAcc =  '',
		whichBtn = '',
		whichAcc = '',
		whichStep = '',
		accHeaders = '',
		accCont = '',
	    totSteps = '',
	    thisStep = '',
	    accStep = '',
	    stepText = pss_text('psx.js.scripts.psbehaviors.wizstep'),
	    prevText = pss_text('psx.js.scripts.psbehaviors.wizprevious'),
	    nextText = pss_text('psx.js.scripts.psbehaviors.wiznext');

	if (param == 'rebuild') {
		accElem.find('.button-row-wizard').remove();
		accElem.removeData('accWizInitialized');
		accElem.accordion('destroy');
		accElem.accordion();
	}
	
	accWiz.each( function (index,elem) {
		thisAcc = $j(this);
		if ( thisAcc.data('accWizInitialized') ) {
			return;
		}
		if ( thisAcc.attr('id').length ){
			thisAccID = thisAcc.attr('id');
		} else {
			thisAccID = 'accWiz' + index;
			thisAcc.attr('id', thisAccID);
		}
		accCont = thisAcc.find('.ui-accordion-content');
		accHeaders = thisAcc.find('.ui-accordion-header');
		totSteps = accCont.length;
		accHeaders.each( function (index) {
			thisStep = index + 1;
			if ( $j(this).find('.wizStep').length == 0 ){
				$j(this).prepend('<span class="wizStep">' + stepText + ' ' + thisStep + ': </span>');
			};
		});
		accCont.each( function (index) {
			thisStep = index + 1;
			$j(this).append('<div class="button-row-wizard">\
					<p><span class="thisStep">' + thisStep + '</span> / <span class="totStep">' + totSteps + '</span></p>\
					</div>');
			if ( index !== 0 ){
				$j(this).find('.button-row-wizard').prepend('<button type="button" class="prev">' + prevText + '</button>');
			}
			if ( index != totSteps-1 ){
				$j(this).find('.button-row-wizard').append('<button type="button" class="next">' + nextText + '</button>');
			}
		})
		thisAcc.data('accWizInitialized', true);
	})
	if ( !$j(document).data('accWizBtnsInitialized') ) {
		$j(document).on('click', '.accordion.wizard button, .accordion.wizard h3', function () {
			whichBtn = $j(this);
			whichAcc = whichBtn.closest('.accordion.wizard');
			whichStep = whichAcc.accordion('option', 'active');
			
			overrideFn = whichAcc.data('accWizOverride');
			if ( overrideFn && !overrideFn(whichAcc, whichStep, whichBtn) ){
				return;
			}
			if ( $j(this).hasClass('prev') ){
				
				whichAcc.accordion('option', 'active',  whichStep - 1);
			}
			if ( $j(this).hasClass('next') ){
				whichAcc.accordion('option', 'active',  whichStep + 1);
			}	

		});
	}
	$j(document).data('accWizBtnsInitialized', true);
	/* end Accordion Wizard */
}

//A way to initiate some common UI widgets from dialogs
function initBehaviors(){
	jsLazyLoader();

	$j('div.tabs').tabs();
	$j('.accordion').accordion();
	initAccordionWizard();
	$j(document).on('click','.psDialog button.cancel',function(){psDialogClose();});
	//Zebra stripes
	$j('fieldset > div:odd:visible').addClass('alt');
	$j('fieldset > div:even:visible').removeClass('alt');
	//YUI style kill later
	$j('.bd tr:even').addClass('alt');
	
	// For any dialog with class "linkClose", unless the specific links have "noClose" on them,
	// close the dialog when the user clicks them.
	$j('.linkClose a:not(.noClose)').click(function(){psDialogClose();});
	
	$j('.dialog, .dialogC, .dialogM, .dialogR, .dialogF, .dialogDiv, .dialogDivC, .dialogDivM, .replaceNext').css('visibility','visible'); //Dialog links are hidden till ready this reveals them
	var dialogObjects = '.dialog, .dialogC, .dialogM, .dialogR, .dialogF, .dialogDiv, .dialogDivC, .dialogDivM';
	$j(dialogObjects).each(function() {
		var url = $j(this).attr('href');
		$j(this).attr('href', ''); //to avoid clicking on link if page did not load completely
		if (url == '') {
			url = $j(this).attr('dialogContent');
		}
		if (url) {
			$j(this).attr('dialogContent', url); //will be restored to href in function psDialog()
		}
	});

	if(!radioSliderLoaded){
		$j( 'input.radioSlider' ).each(function() {
			var dis = $j(this),
			    el = dis.attr('id'),
			    state = dis.prop('checked'),
			    labelId = el + 'Label',
			    onText = dis.attr("data-text-on"),
			    offText = dis.attr("data-text-off");
			// Allow changing of the text with data-text-on and data-text-off
			if (!onText) {
				onText = pss_text('psx.js.scripts.psbehaviors.on');
			}
			if (!offText) {
				offText = pss_text('psx.js.scripts.psbehaviors.off');
			}
			dis.after('<label for="' + el + '" class="radioSlider" id="' + labelId +'"><span class="txtOn">'+onText+'</span><em>&nbsp;</em><span class="txtOff">' + offText + '</span></label>');
			radioSliderState(el, state);
			if (isIEBelow(9)) {
				$j('label[for='+el+']').click(function() {
					var x = $j(this).attr('for');
					var cb = $j('#'+x);
					if ( cb.is(':checked') ) {
						cb.prop('checked','false');
					} else {
						cb.prop('checked', 'true');
					}
				});
			}
		})
		radioSliderLoaded=true;
	}

	$j( 'input.radioSlider' ).bind(isIEBelow(9)?'propertychange':'change', function () {
		var el = $j(this).attr('id'),
		    state = $j(this).prop('checked');
		radioSliderState(el, state);
	});
	dataInjection();
	// Verify browser supports SessionStorage
	if(typeof(Storage)!==undefined){
		// If the user was logged out sessionStorage.timedOut will be true 
		if(sessionStorage.timedOut){
			if(sessionStorage.framedPage === 'true'){
				var path = sessionStorage.frameContentUrl;
				path = path.substring(path.indexOf(getPortal()));
				if(path.indexOf('?')>-1){
					path = path.substring(path.indexOf('?'));
				}
			}else{
				var path = sessionStorage.url;
				path = path.substring(path.indexOf(getPortal()));
				if(path.indexOf('?')>-1){
					path = path.substring(path.indexOf('?'));
				}
			}
			var signInScreen = false;
			// Verify the user has a timed out session
			$j.ajax({ 
				url : '/ws/session/check-timedout-user',
				type : "POST",
				data : JSON.stringify({ "excluded_path": {"path" : path, 'uid': sessionStorage.uid }}),
				contentType: "application/json; charset=utf-8",
				dataType: "json", 
				cache : false,
				success: function(data){
					sessionStorage.correctUser = data.ValidUser.valid;
					sessionStorage.excludedPage = data.ValidUser.excluded;
                    if($j('#sessionrestore').length === 0) {
					displayReanimateSessionBanner();
                    }
				},
				statusCode: {
					401: function() {
					}
				},
				error: function(){
				}
			});
		}
		// Finishes returning the user to the last framed page they were on
		if(sessionStorage.restore){
			restoreSession(true, (sessionStorage.excludedPage === 'true'));
		}		
	}
}

	blinker('.blink', 20);//Blink tag function selector, repeat value
//	psTip(); //instantiate tooltip code

function displayReanimateSessionBanner(){
	// If the user has a timed out session display Session Restoration bar
	if(sessionStorage.correctUser === "true"){
		restoreSessionBox = $j('<div />',{id:'sessionrestore', style:'display: none'});
		sessionRestoreContainer = $j('<div/>',{ id:'sessionRestoreBox'});
		if((sessionStorage.framedPage === 'true'&& sessionStorage.excludedPage ==="true") || sessionStorage.excludedPage ==="false"){
			sessionRestoreContainer.append($j('<h2/>',{ 'class':'warning', text:pss_text('psx.js.scripts.psbehaviors.reload_last_page')}));
			sessionRestoreContainer.append($j('<p/>',{ 'class':'warning', style:'width:85%',text:pss_text('psx.js.scripts.psbehaviors.would_you_like_to_reload_the_last_page_you_were_viewing')}));
		}else{
			sessionRestoreContainer.append($j('<h2/>',{ 'class':'warning', text:pss_text('psx.js.scripts.psbehaviors.restore_selections_school_and_term')}));
			sessionRestoreContainer.append($j('<p/>',{ 'class':'warning', style:'width:85%', text:pss_text('psx.js.scripts.psbehaviors.would_you_like_to_restore_your_selections_school_and_term')}));
		}
		restoreSessionButtonRow = $j('<div/>',{'class':'buttons'});
		sessionRestoreContainer.append(restoreSessionButtonRow);
		restoreSessionButtonRow.append($j('<button/>',{'class':'warning continueButton',text: pss_text('psx.js.scripts.psbehaviors.yes'),
									id: 'yes',
									click: function () {
										// Restore Session
										loadingDialog();
										restoreSessionBox.hide();
										sessionStorage.restore=true;
										$j.ajax({
											url : '/ws/session/restore-session?restore=true',
											type : 'PUT',
											dataType : 'json',
											cache : false,
											complete:function(){
												restoreSession(true, (sessionStorage.excludedPage === 'true'));
											}
										});	
									}
								}));
		restoreSessionButtonRow.append($j('<button/>',{ 'class':'warning continueButton',text: pss_text('psx.js.scripts.psbehaviors.no'),
			id: 'no',
			click: function () {
				// Clear Timed Out Session
					sessionStorage.clear();
					restoreSessionBox.hide();
					$j.ajax({
						url : '/ws/session/restore-session?restore=false',
						type : 'PUT',
						dataType : 'json',
						cache : false,
						complete:function(){restoreSession(false); $j('#overlay').remove();}
					});	
			}}));
		restoreSessionBox.append(sessionRestoreContainer);
		$j(document.body).append(restoreSessionBox);
		restoreSessionBox.show();
		$j('body').append($j('<div/>', {id: 'overlay' ,'class':'ui-widget-overlay ui-front'}));
		closeLoading();
	}else{
		sessionStorage.clear();
	}
}
	
	
function radioSliderState(el, state) {
	if (state === true || state === 'checked') {
		$j('#' + el + 'Label').addClass('on').removeClass('off'); 
	} else {
		$j('#' + el + 'Label').addClass('off').removeClass('on'); 
	}
}

/**
 * @param version version to check
 * @returns true if browser is (1) IE and (2) less than the given version
 * Less Hacky in that it looks for a class injected if IE is below 9, by IE Meta Tag
 */
function isIEBelow(version) {
	var ltIEVer = $j('html').data('ltie');
	if ( ltIEVer < version && ltIEVer != undefined ) {
		return true;
	} else {
		return false;
	};
}

//Parent portal active nav highlighting function
function setActive() {
	var setActive = $j('#activeNav').val();
	$j(setActive).addClass('selected');
}

//expands or collapses an h2 with class="toggle collapsed" or class="toggle expanded" and has a span with a checkbox
function psEnableCheck(){
	$j('h2 input:checkbox:enabled').each( function() {
	var checked = $j(this).prop('checked');
	var heading = $j(this).parentsUntil('.box-round').last();
	var content = $j(this).parentsUntil('.box-round').next();
		 if(checked){
			content.show();
			heading.removeClass('collapsed').addClass('toggle expanded');//adds classes if they aren't present
		 }else{
			 content.hide();
			 heading.removeClass('expanded').addClass('toggle collapsed');
		}
	});
}

//turns h2 with class="toggle collapsed" or class="toggle expanded" toggle-able widget	
function psToggle(){
	//this is a toggle replacement for the flipvis code
	var togCol = $j(this).hasClass("expanded");
//	changes the class on the header/control
	if (togCol) {
        hideCollapseClasses($j(this));
        hideCollapseText($j(this));
	} else{
		showExpandClasses($j(this));
		showExpandText($j(this));
	}
	toggleTarget($j(this));
}
function initToggle () {
    $j('.toggle.collapsed').each(function(index) {
        hideCollapseTarget($j(this));
    });
}
//Toggles all the toggles on a page, constrained to an id'd parent object
function psToggleAll(direction, target){
	var targEl = target + ' .toggle';
	if (direction == 'expand') {
		$j(targEl).each(function(){
            showExpandClasses($j(this));
            showExpandText($j(this));
			showExpandTarget($j(this));
		});
	} else if (direction == 'collapse'){
		$j(targEl).each(function(){
            hideCollapseClasses($j(this));
            hideCollapseText($j(this));
            hideCollapseTarget($j(this));
		});
	}
	
}

//allows the toggling of an element other than the next sibling element
function toggleTarget(jQueryElement) {
	var toggleTarget = jQueryElement.attr('data-target');
	if (toggleTarget != undefined) {
		var target = $j("#" + toggleTarget);
		if (target.length) {
			target.toggle(); //we were actually able to get a handle on something, so toggle it
			return;
		}
	}
	jQueryElement.next().toggle();//hides/shows the next sibling object (div, fieldset, etc)
}

//looks for a specifically named attributes within the toggle element
//if present, the html is swapped for the value within the attribute
function toggleText(jQueryElement, toggleAttribute) {
	var toggleText = jQueryElement.attr(toggleAttribute);
	if (toggleText != undefined) {
		jQueryElement.html(toggleText);
	}
}

function showExpandTarget(jQueryElement) {
    var toggleTarget = jQueryElement.attr('data-target');
    if (toggleTarget && toggleTarget != undefined) {
        var target = $j('#' + toggleTarget);
        if (target && target.length) {
            target.show();
        }
    }
    else {
        jQueryElement.next().show();
    }
}

function hideCollapseTarget(jQueryElement) {
    var toggleTarget = jQueryElement.attr('data-target');
    if (toggleTarget && toggleTarget != undefined) {
        var target = $j('#' + toggleTarget);
        if (target && target.length) {
            target.hide();
        }
    }
    else {
        jQueryElement.next().hide();
    }
}

function showExpandText(jQueryElement) {
    if (jQueryElement) {
        toggleText(jQueryElement, 'data-text-expanded');
    }
}

function hideCollapseText(jQueryElement) {
    if (jQueryElement) {
        toggleText(jQueryElement, 'data-text-collapsed');
    }
}

function showExpandClasses(jQueryElement) {
    if (jQueryElement) {
        jQueryElement.removeClass('collapsed').addClass('expanded');
    }
}

function hideCollapseClasses(jQueryElement) {
    if (jQueryElement) {
        jQueryElement.removeClass('expanded').addClass('collapsed');
    }
}

function goToSchool(value, field) {
	field = field || "Schoolid";
	var form = $j("<form />");
	form.attr("action", "/admin/home.html");
	form.attr("method", "post");
	form.attr("target", "_top");
	form.html('<INPUT TYPE="hidden" NAME="ac" VALUE="setschool"><INPUT TYPE="hidden" NAME="'+field+'" VALUE="'+value+'">');
	$j("html").append(form);
	form.submit();
}

function goToTeacherSchool(value, field) {
	field = field || "Schoolid";
	var form = $j("<form />");
	form.attr("action", "/teachers/home.html");
	form.attr("method", "post");
	form.attr("target", "_top");
	form.html('<INPUT TYPE="hidden" NAME="ac" VALUE="setschool"><INPUT TYPE="hidden" NAME="'+field+'" VALUE="'+value+'">');
	$j("html").append(form);
	form.submit();
}

function goToTerm(value, target, field) {
	field = field || "termid";
	var form = $j("<form />");
	form.attr("action", target);
	// if you define function goToTermTargetOverride in your page, override targets there if needed
	if (typeof goToTermTargetOverride == 'function'){
		goToTermTargetOverride(form, value); // pass current form and value
	}
	form.attr("method", "post");
	form.html('<INPUT TYPE="hidden" NAME="ac" VALUE="changeterm"><INPUT TYPE="hidden" NAME="'+field+'" VALUE="'+value+'">');
	$j("html").append(form);
	form.submit();
}

function replaceNext(event){
	var content = $j(this).attr("href");
	var curID = $j(this).attr('id');
	var nextID = $j(this).next().attr('id');
	$j(this).next().psLoad(content, function(){initBehaviors();
		if ( curID == "schoolContext" || "termContext"){
			setTimeout(function() {
				$j('#'+ nextID).find('select').focus();
			}, 100);
		}
	});
	event.preventDefault();
} 

if(!_messages) var _messages = {};
/**
 * Get texts from the server based on a prefix.
 * @param prefix the prefix to use
 * @param onlyIfNotPresent (optional) if passed, check to see if message is present yet; only fetch the
 *   texts from the server if this key is not present
 */
if (typeof pss_get_texts != 'function') pss_get_texts = function (prefix, onlyIfNotPresent) {
  if (onlyIfNotPresent && _messages[onlyIfNotPresent]) return;
  
  jQuery.ajax ({async: false, 
    url:'/getMessages.action', 
    data:{prefix: prefix, locale: get_locale()},
    dataType:'json',
    success: function (msgs) {
      jQuery.each(msgs, function (key, value) {
        _messages[key] = value;
      });
    }
  });
}

//4D Table formatting injection script: custom field pages lack some basic styling, this fixes them: Remove when we fix 4D
function fourDTableFix(){
	$j('.fourDTable').prepend('<tr class="hide"><td></td><td></td></tr>');
	$j('.fourDTable tr:odd').addClass('alt');
	$j('.fourDTable td:first-child').wrapInner('<strong />');
}
//Blinker code to animate content
function blinker(el, c){
	$j(el).effect("pulsate", { times: c }, 1000, function () {})
}
//Animation Codes for UI notification
function shaker(el, c){
	$j(el).effect("shake", { times:c, distance:2, direction: "up" }, 100, function () {})
}
//view-events/data collection floating feedback widget
function psSystemFeedback(){
	if(typeof feedbackEnabled != 'undefined' && feedbackEnabled){
		if ($j('#feedbackSend').size() == 0)
		{
			   if(!recordingActivated){
				   $j('body:not(body.pslogin)').append('<div id="feedbackSend" class="group">' +
							'<div class="button" id="recordingStart">' + pss_text("psx.js.scripts.psbehaviors.recording_start") + '</div>' +
							'<div class="button" id="pageFeedback">' + pss_text("psx.js.scripts.psbehaviors.send_report") + '</div>' + 
							'<div class="button hide" id="recordingStop">' + pss_text("psx.js.scripts.psbehaviors.recording_stop") + '</div>' +
							'<div class="button hide" id="commentaryAddition">' + pss_text("psx.js.scripts.psbehaviors.add_issue_comment") + '</div>' +
							'<div class="button hide" id="recordingCancel">' + pss_text("psx.js.scripts.psbehaviors.recording_cancel") + '</div>' +
						 '</div>');
			   }else{
				   $j('body:not(body.pslogin)').append('<div id="feedbackSend" class="group">' +
							'<div class="button hide" id="recordingStart">' + pss_text("psx.js.scripts.psbehaviors.recording_start") + '</div>' +
							'<div class="button hide" id="pageFeedback">' + pss_text("psx.js.scripts.psbehaviors.send_report") + '</div>' + 
							'<div class="button" id="recordingStop">' + pss_text("psx.js.scripts.psbehaviors.recording_stop") + '</div>' +
							'<div class="button" id="commentaryAddition">' + pss_text("psx.js.scripts.psbehaviors.add_issue_comment") + '</div>' +
							'<div class="button" id="recordingCancel">' + pss_text("psx.js.scripts.psbehaviors.recording_cancel") + '</div>' +
				   '</div>');
			   }
			   
			   $j('#reportIssueLink').addClass('hide');
			   
			   $j('#pageFeedback').click(function(ev){
				   feedbackwindow();
				   $j('#feedbackSend').remove();
				   $j('#reportIssueLink').removeClass('hide');
				   $j(this).blur();
				   return false;
			   });
			   
			   $j('#recordingStart').click(function(ev){
				   //Hide feedbackSend and recordingStart buttons
				   $j('#pageFeedback, #recordingStart').addClass('hide');
				   //Show recordingStop and commentaryAddition buttons
				   $j('#recordingStop, #commentaryAddition, #recordingCancel').removeClass('hide');
				   $j(this).blur();
				   var referringDoc = window.document;
				   var url = referringDoc.URL;	       
				   var htmlTag = referringDoc.getElementsByTagName("html")[0];
				   var screenshot = htmlTag.innerHTML;
				   var queryString = window.location.search;
				   var responseText = submitScreenShot(screenshot, url, queryString);
				   return false;
			   });
			   
			   $j('#recordingStop').click(function(ev){
				   recordingWindow();
				   $j(this).blur();
				   return false;
			   });
			   
			   $j('#commentaryAddition').click(function(ev){
				   commentsWindow();
				   $j(this).blur();
				   return false;
			   });
			   
			   $j('#recordingCancel').click(function(ev){
				   cancelRecording();
				   //Remove hover buttons
				   $j('#feedbackSend').remove();
				   $j('#reportIssueLink').removeClass('hide');
				   $j(this).blur();
				   recordingActivated=false;
				   return false;
			   });
		   }
	}
}

// *********************************************
// ****** General Widget Message Handling ******
// *********************************************

// to be used sparingly (Please don't). Written speicifically for dates used in incident_actions.js
// which is controlled by incident management validation. The popup is a single page include that can
// be used multiple times before the data is submitted. Only used to make sure errors aren't propogated
// from one action to another. 
// clears all errors under the passed in element
function clearAndResetAllErrors(jQueryElement) {
	//children of the passed in element and clear any error messages
    var children = jQueryElement.find('.error');
    if (children.length) {
    	children.each(function(){ 
    		clearError($j(this));
    		//set it back as if it were just loaded
    		$j(this).addClass("unvalidated");
    		$j(this).removeClass("hasHadError");
    	});
    }
}

// utility to clear widget errors for a given element
function clearError(jQueryElement) {
	// clear error class from the element
	jQueryElement.removeClass("error");
	jQueryElement.removeClass("unvalidated");
	// find the element's error message display element
	var errorMessageBlock = findMsgBlockForElement(jQueryElement, false);
	// clear the error message display element if necessary
	if (errorMessageBlock.length == 1 ) {
		// if we've previously had errors, lets just hide the error display element
		errorMessageBlock.hide();
		errorMessageBlock.html("");
	}
	updateFeedback_Alert(jQueryElement, false);
}

// utility to set widget errors for a given element
function setError(jQueryElement, errorMsg) {
	jQueryElement.addClass("error"); 
	//flag that isn't cleared - lets the js know to keep an eye on this rascal
	jQueryElement.addClass("hasHadError"); 
	// find the element's error message display element
	var errorMessageBlock = findMsgBlockForElement(jQueryElement, true);
	// just to make sure nothing hinkie happened
	if (errorMessageBlock.length == 1) {
		// set the passed message to the display element
		errorMessageBlock.html(errorMsg);
		// make sure we show it
		errorMessageBlock.show();
	}
	updateFeedback_Alert(jQueryElement, true);
}

// given an element, find an existing error message block and 
// return a handle to it
// if one does not exist and genIfMissing is true, create one to hand back
// if one does not exist and genIfMissing is false, hand back an empty referrence
function findMsgBlockForElement(jQueryElement, genIfMissing) {

	// get the id of the element
	var elementID = getElementID(jQueryElement);
	
	// does this element have an error block (elementID_error)?
	var errorBlockID = elementID + "_error";
	var errorMessageBlock = $j('#' + errorBlockID);
	
	// if we don't have a message display element already
	if (errorMessageBlock.length == 0 ) {
		
		if (genIfMissing) {
			// we are setting an error, lets create the element
			jQueryElement.parent().append("<p id ='" + errorBlockID + "' class='error-message'></p>");
			// now grab ahold of it
			errorMessageBlock = $j('#' + errorBlockID);
		}
		// else we are clearing a message element... if it doesn't exist, don't worry about it

	}
	// else we have a message display element alvalidateValueBeforeMax, return that

	return errorMessageBlock;
}

// counter for generated IDs
var generatedIdCounter = 1;

// wrapper function for jQuery function.
// returns the elements ID attribute. If an ID attribute
// does not exist, the function will create a unique ID on the
// element and return that newly created value
function getElementID(jQueryElement) {

	var theID = jQueryElement.attr('id');
	//if the element doesn't have an id, let's make one
	if (theID == null || theID == "") {
		jQueryElement.attr('id', 'ldv_generatedID' + generatedIdCounter++);
		theID = jQueryElement.attr('id');
	}
	return theID;

}

// ******************** End ********************
// ****** General Widget Message Handling ******
// *********************************************

// *********************************************
// ******* General Form Message Handling *******
// *********************************************


			
		
// *********************************************
// *************** Dynamic Legend **************
// *********************************************

var _dynamicLegendItems = {};
		
//take a piece of text to write to the legend, pass a key for the item to ensure its only ever added once
function writeToLegend(appendText, itemKey) {
	//The legend is hidden by default, we are writting to it, so show it
	$j('#legend').show();
	if (itemKey != undefined && itemKey != null) {
		//we need to check to see if we add this
		if (_dynamicLegendItems[itemKey]) {
			//key exists - we've added this already
			return;
	}
		else {
			//key didn't exist - lets add the key before we add the legend item
			_dynamicLegendItems[itemKey] = "true";
		}
	}
	$j('#validationIcons').append('&nbsp; '+ appendText + ' |');

}

	
// ******************** End ********************
// *************** Dynamic Legend **************
// *********************************************
		
/*
 * future script for handling script loading at page load or on an already loaded page.
var widgetLoader = new function() {
	
	var loadedWidgets = {};
		
	//when you want to know if a widget has been loaded, ask this function
	this.isWidgetLoaded = function(widgetName){
		if (loadedWidgets[widgetName] === undefined) {
			//no entry for this widget
			return false;
		}
		else {
			//we have an entry, it is loaded
			return true;
	}
	};
		
	//when a widget is loaded, tell this function
	this.registerWidget = function(widgetName){
		loadedWidgets[widgetName] = true;
	};
		
	this.loadDate = function() {
		//Loads calendar injection code file using jQuery getScript()
		if( $j( 'input.psDateWidget' ).length ){
			if (!this.isWidgetLoaded("psDateWidget")) { //if the script isn't loaded, yet, load it
				$j.getScript("/scripts/psDateWidget.js", function(){});
				$j.getScript("/scripts/psDateValidate.js", function(){});
				this.registerWidget("psDateWidget");
				writeToLegend('<img src="/images/icon-calendar.png"</img> - ' + pss_text('psx.js.scripts.psbehaviors.date_entry'));
	}
	else {
				//reinit function
				initializeDateWidget();
				initializeDateValidate();
	}
	
			$j('input.psDateWidget').closest("form").addClass('validatedForm');

			// mark elements initially with unvalidated class, so we know what's been touched later
			$j('input.psDateWidget:not(.error)').addClass('unvalidated');

		}
	};
	
};
*/



//Send screen shot. Should only be called when page is loaded (on DOM is ready) and recording is active
function sendRecordingScreenShot(){
	var referringDoc = window.document;
	var url = referringDoc.URL;
	var htmlTag = referringDoc.getElementsByTagName("html")[0];
	var screenshot = htmlTag.innerHTML;
	var queryString = window.location.search;
	var responseText = submitScreenShot(screenshot, url, queryString);			
}

function submitScreenShot(screenshot, url, queryString)
{
	var base = "/recordingAJAX.action";
	var postData = "screenshot=" + escape(screenshot);
	postData = postData + "&url=" + encodeURIComponent(url);
	postData = postData + "&params=" + escape(queryString);
	
	var request = new XMLHttpRequest();
	request.open("POST", base, false);
	//Send the proper header information along with the request
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Content-length", postData.length);
	request.setRequestHeader("Connection", "close");
	request.send(postData);
	return request.responseText;
}

function cancelRecording(){
	var base = "/cancelRecordingAJAX.action";
	
	var request = new XMLHttpRequest();
	var postData = "";
	request.open("POST", base, false);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Content-length", postData.length);
	request.setRequestHeader("Connection", "close");
	request.send(postData);
	return request.responseText;
}

//Functions that makes the windows calls, same as commonscript.ftl, coz the changes done there were no reflected.
function recordingWindow () {
	window.showModalDialog('/stopRecording.action','stop_recording','dialogWidth:640px; dialogHeight:500px; scroll:no;');
}

function commentsWindow () {
	window.showModalDialog('/getRecordCommentaryForm.action','add_commentary','dialogWidth:900px; dialogHeight:400px; scroll:no;');
}

	
//Change the buttons visualization
function changeStopButton(){
    $j('#feedbackSend').remove();
    $j('#reportIssueLink').removeClass('hide');
	$j('#recordingStop, #commentaryAddition, #recordingCancel').addClass('hide');
	$j('#pageFeedback, #recordingStart').removeClass('hide');
}

//Extract URL parameter values
//Returns String 'null' if parameter is not present
function getURLParameter(name, uriString) {
	if(uriString == undefined){
		uriString = location.search;
	}
    return unescape(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(uriString)||[,null])[1]
    );
}

$j(document).ready(function () {
	//Set keyboard focus to the first component on the first form and select the text, now excludes attendance forms
	$j('form:not(#attendance) :input:visible:enabled:first:not(:button, :checkbox, :radio, \[readonly=\"readonly\"\])').each(function (idx, el) {
		el.focus();
		if (el.type == "text") {
			el.select();
		}
	});
	
	initBehaviors();
	
	setActive();
	// Remove the Report an Issue link if the feature is disabled
	if(typeof feedbackEnabled != 'undefined' && !feedbackEnabled){
		$j("#reportIssueLink").remove();
	} 
	//  This is now activated by a link on the bottom of the page. Only do this here when recording is active	
	//  Also only activate link on the bottom of the page if it isn't of class pslogin and frameMenu
	var temp = $j('body:not(.pslogin,.frameMenu)').length;
	if (recordingActivated && temp>0)
	{
		psSystemFeedback();
	}
	psEnableCheck();
	fourDTableFix();
		
	// Checks if the recording function is active. if it does, the info page is submitted to the recording action
	if (recordingActivated){
		sendRecordingScreenShot();	
	}

	/*Invoke widgets, and hooks into DOM*/

	$j(document).on('click','a.dialog, a.dialogDiv, a.dialogDivC, a.dialogDivM, a.dialogC, a.dialogM, a.dialogR, a.dialogF', psDialog);//Listen for clicks on links with these classes

	$j(document).on('click','a.replaceNext',replaceNext);

	
	$j(document).on('click','#expand_all_changes-button',function(){psToggleAll('expand', '#change_reasons_div');});//YUI dialogs' buttons to expand all
	$j(document).on('click','#collapse_all_changes-button',function(){psToggleAll('collapse', '#change_reasons_div');});//YUI dialogs' buttons to collapse all
	$j(document).on('click','.expandAll',function(){psToggleAll('expand', '#content-main');});//buttons to expand all toggles: 'class','parent constraint'
	$j(document).on('click','.collapseAll',function(){psToggleAll('collapse', '#content-main');});//buttons to collapse all toggles: 'class','parent constraint'
	$j(document).on('click','h2.toggle, h3.toggle, th.toggle', psToggle);//turns h2 with class="toggle collapsed" or class="toggle expanded" toggle-able widget
	initToggle();
	
	$j(document).on('click','button.toggle', function(){$j(this).addClass('hide').next().removeClass('hide');});//toggles next element
	$j(document).on('click','button.toggleParent', function(){$j(this).parent().addClass('hide').prev().removeClass('hide');});//toggles parent tag off, used with toggle above
	
	$j('button#btnSubmit.disabled').attr('disabled','true');//workaround for disabling button to aid LoadRunner
	
//Confirmation for buttons that need it. Prepends the existing string with "confirm" message key---------------*
	$j.fn.makeConfReqButton = function () {

		$j(this).each(function (el) {
			var crBtn = $j(this);
			var text = crBtn.html();
			var crBtnConfTxt = pss_text("psx.js.scripts.psbehaviors.confirm") + text;// Replacement text for real delete button
			var crFake = $j('<button type="button" id="btnConfirmProxy">' + text + '</button>');// substitute delete button, replaces real delete, to add additional click before delete
			var crCancel = $j('<button type="button" id="btnConfirmCancel">' + pss_text("psx.js.scripts.psbehaviors.cancel") + '</button>').addClass('hide');// this button returns buttons to default state, fake delete visible, others hidden

			crFake.click(function () { // this event shows the real delete, and cancel button hide the fake delete
				"use strict";
				$j(this).toggleClass('hide');
				$j(crCancel).toggleClass('hide');
				$j(crBtn).toggleClass('hide');
			});
			crCancel.click(function () { // this event hides the real delete and cancel, shows the fake delete
				"use strict";
				$j(this).toggleClass('hide');
				$j(crBtn).toggleClass('hide');
				$j(crFake).toggleClass('hide');
			});
			crBtn.click(function () { // this event hides the real delete and cancel, shows the fake delete
				"use strict";
				$j(this).toggleClass('hide');
				$j(crCancel).toggleClass('hide');
				$j(crFake).toggleClass('hide');
			});
			crBtn.text(crBtnConfTxt).addClass('hide'); // hides the real delete button
			crBtn.after(crFake).after(crCancel); // injects the two new buttons dynamically
		});
	};
	var confBtn = $j('button.confirmationReq, a.confirmationReq');// buttons and anchors with confirmationReq class
	confBtn.makeConfReqButton();

//end action confirm code---------------------------*

	$j('form.submitOnce').submit(function(){if(typeof submitOnce_shouldShow != 'undefined'){if(submitOnce_shouldShow){loadingDialog();}}else{loadingDialog();}});
	$j('form.submitOnceCond').submit(function(){if(submitOnce_shouldShow){loadingDialog()}});
	
	$j('a.popWin').click(function(){
		var winURL = $j(this).attr('href');
		window.open(winURL);
		return false;
	});
	//$j( 'div#statsBuddy table' ).addClass('tableToGrid');

	//jQgrid convert table to grid...
	//tableToGrid('.tableToGrid', {altRows: true, altclass: 'alt', width: "100%",height: "200", scrollOffset:0, pager: '#pagernav'});

	//These functions create a button next to an input classed with 'massFill' that will copy the value from that input to all inputs in that column
	$j(document).on('focus', 'input.massFill', function(){
		var button = $j(this).siblings().filter('button.btnMassFill');
		if (button.length === 0){
			$j(this).parent().append('<button type="button" class="btnMassFill"><span>&nbsp</span></button>');
		}
	});
	$j(document).on('click','button.btnMassFill', function(){
		var source = $j(this).siblings().filter('input').val();
		$j(this).parents('table').find('td:nth-child(' + ($j(this).parent().index() + 1) + ') input').val(source);
	});

	//initially implemented to open requestformpreview.html from admin portal
	if (getURLParameter('mode') == 'preview' && $j('#header a').length) {
		$j('#header a, #usercontext-bar a, #nav-main a').removeAttr('href');
		$j('#header a, #nav-main a').css('color', 'grey');
		$j('#userName span').css('text-decoration', 'line-through').css('color', 'gray');
		$j('#header a, #nav-main a, #tools2 a').removeClass();
	}
	
	require(['jquery','jquery.cookie'], function($j){
		 initUIControls();
	});

	var isMac = navigator.appVersion.indexOf("Mac")!=-1;
	if (isMac) {
		$j('.ifIsMacHide').hide();
	} else {
		$j('.ifIsMacShow').hide();
	}
	if ( (!('content' in parent) && typeof parent.psAlert == 'function') || ('content' in parent && typeof parent.content.psAlert == 'function')){
	   displayAlert();
	} 
	
	var isWin = navigator.appVersion.indexOf("Win")!=-1;
	if (isWin) {
		$j('.ifIsWinHide').hide();
	} else {
		$j('.ifIsWinShow').hide();
	}
	
	//generic message banner
	if (getURLParameter('confirm_message') != 'null') {
		//get the key from the param
		var messagekey = getURLParameter('confirm_message');
		var messageprefix = "psx.js.scripts.psbehaviors.confirmbanner.";
		var messagekey = messageprefix + messagekey;
		
		pss_get_texts(messageprefix, messagekey);
		var messagetext = pss_text(messagekey);
		
		//first pass - assume the element exists for placing this
		if ($j('#feedback-message').length) {
			$j('#feedback-message').addClass("feedback-confirm").append('<p>' + messagetext + '</p>').removeClass("hide");
		}
		
	}

    // Keep track of the last loaded page
    require(['jquery','jquery.cookie'], function($, cookie){
        $.cookie('lastHref', $(location).attr('href'), { path: '/', expires: 1 });
    });

/*End DOC Ready*/
});

function displayAlert() {
	require(['jquery', 'jquery.cookie'], function($, cookie){
		var alertMsg = $.cookie('_alert_message');
		if(alertMsg !== undefined){
			$.removeCookie('_alert_message');
			var msgText = pss_text('psx.js.scripts.psbehaviors.' + alertMsg);
			if ('content' in parent) {
				parent.content.psAlert({width: '50%', message: msgText});
			} else {
				parent.psAlert({width: '50%', message: msgText});
			}
		}
	});
}

//Frame nav, and Left nav hide: 
function setUICookie(cookie, state) { // sets cookie for nav state
	'use strict';
	if ( typeof($j && jQuery.cookie) == 'function' ){
		jQuery.cookie(cookie, state, { path: '/', expires: 1 });
	}
}
var frameSet = $j('#frameSet', top.document);
function frameStatus(s) {
    'use strict';
	if (s === 'off') {
		frameSet.attr('cols', '0,*');
	} else if (s === 'on') {
		frameSet.attr('cols', '208,*');
	}
	//Hack for IE 10 to force redraw for frames
	top.document.getElementById('frameSet').rows = top.document.getElementById('frameSet').rows;
	//end hack
}
var uiStateSetListeners = [];
/**
 * Bind a callback function to the UI State change event (frame-nav/left-nav expand/collapse events).
 * The callback will be invoked whenever one of the events is fired.
 * To supply a context value for 'this' when the callback is invoked, pass the optional context argument.
 * 
 * @param callback  The function to call when the UI State is changed.
 * @param context   (optional) The context to run the function as.
 */
function addUiStateSetListener(callback, context) {
	uiStateSetListeners.push({callback: callback, context: context || this});
}
/**
 * Remove a previously-bound callback function monitoring the UI State change event.
 * If no context is specified, all of the versions of the callback with different contexts will be removed.
 * If no callback is specified, all callbacks for the event will be removed.
 * 
 * @param callback  (optional) The function to remove. If not specified, all functions will be removed (a context can still be specified).
 * @param context   (optional) To limit the removal to callbacks bound to a specific context. If not specified, all versions of the callback with different contexts will be removed.
 */
function removeUiStateSetListener(callback, context) {
	var i;
	for (i = uiStateSetListeners.length - 1; i >= 0; i--) {
		if ((!callback || uiStateSetListeners[i].callback === callback) && (!context || uiStateSetListeners[i].context === context)) {
			uiStateSetListeners.splice(i, 1);
		}
	}
}
function uiStateSet(ui, title, cookie, state, frame) { // collapse code
	setUICookie(cookie, state);
	if (state === 'expanded') {
		$j('body').addClass('ui' + ui); //ui = NoNav, Max
		$j('#btn' + ui).addClass('expanded').removeClass('collapsed');
		$j('#btn' + ui).attr({'title': title});
	} else if (state === null) {
		$j('body').removeClass('ui' + ui);
		$j('#btn' + ui).removeClass('expanded').addClass('collapsed');
		$j('#btn' + ui).attr({'title': title});
	}
	if (frameSet.length != 0 && state === null ){
		frameSet.addClass('ui' + ui);
		frameStatus(frame);
	} else if (frameSet.length != 0 && state === 'expanded' ){
		frameSet.removeClass('ui' + ui);
		frameStatus(frame);
	}
	
	var i;
	for (i = 0; i < uiStateSetListeners.length; i++) {
		uiStateSetListeners[i].callback.apply(uiStateSetListeners[i].context, arguments);
		}
}
function initUIControls() {
	var btnNoNavExpTxt = pss_text('psx.js.scripts.psbehaviors.show_main_menu'),
		btnNoNavTxt = pss_text('psx.js.scripts.psbehaviors.hide_main_menu'),
		btnContMaxExpTxt = pss_text('psx.js.scripts.psbehaviors.show_header'),
		btnContMaxTxt = pss_text('psx.js.scripts.psbehaviors.hide_header'),
		btnNoNav = $j('<div id="btnNoNav" class="collapsed" title="' + btnNoNavTxt + '"><em>&nbsp;</em></div>'),
		btnContMax = $j('<div id="btnContMax" class="collapsed" title="' + btnContMaxExpTxt + '"><em>&nbsp;</em></div>');
	if ($j('#btnNoNav', top.document).length === 0) { // inject NoNav button that toggles left nav
		$j('#content-main').prepend(btnNoNav); // instantiate NoNav
	}
	if ($j('#btnContMax', top.document).length === 0) {
		$j('#content-main, #content-lunch').prepend(btnContMax); // instantiate
	}
	//console.log( typeof($j && jQuery.cookie) == 'function' );
	if ( typeof($j && jQuery.cookie) == 'function' ) {
		if (jQuery.cookie('uiStateNav') === 'expanded') { // checks cookie and set state of left nav
			uiStateSet('NoNav', btnNoNavExpTxt, 'uiStateNav', 'expanded', 'off');//uiStateSet(ui, title, cookie, state, frame)
		} else {
			uiStateSet('NoNav', btnNoNavTxt, 'uiStateNav', null, 'on');
		}
		if (jQuery.cookie('uiStateCont') === 'expanded') {
			uiStateSet('ContMax', btnContMaxExpTxt, 'uiStateCont', 'expanded');
		} else {
			uiStateSet('ContMax', btnContMaxTxt, 'uiStateCont', null);
		}
		btnNoNav.click(function () {

			if (jQuery.cookie('uiStateNav') === 'expanded') {
				uiStateSet('NoNav', btnNoNavTxt, 'uiStateNav', null, 'on');
				} else {
				uiStateSet('NoNav', btnNoNavExpTxt, 'uiStateNav', 'expanded', 'off');
				}
			});
		btnContMax.click(function () {
			if (jQuery.cookie('uiStateCont') === 'expanded') {
				uiStateSet('ContMax', btnContMaxTxt, 'uiStateCont', null);
			} else {
				uiStateSet('ContMax', btnContMaxExpTxt, 'uiStateCont', 'expanded');
			}
		});
	}
}
//End frame nav, and Left nav hide
/* ------------------------------------------------------
JS for inserting the selected field list item into the 
HTML object value, aka INPUT/TEXTAREA tag.

Parameters:
		inputObjName: ID of HTML object to have item inserted into.
		insertValue: The value to be inserted.
		option: Any additional options, number value.
			* If negative, add ^() around the insert value.
			* If 99 or -99, then add a carriage return after insert value.
			* If 5 or -5, then replace the value, aka oldValue=insertValue.
------------------------------------------------------ */
function ads (inputObjName, insertValue, option) {
	var inputObject = document.getElementById(inputObjName),
		s = 0;
	
	// verify and convert option to an integer.
	option = parseInt(option);
	
	/* Check to add code tag around value... If negative, add code tag */
	if (option<0) {
		insertValue="^("+insertValue+")";
		option=((-1)*option);
	}

 if (document.selection) { /* IE */
 	inputObject.focus();
 	if (option==5) {
 		inputObject.value=insertValue;
 	} else if (option==99) {
 		document.selection.createRange().text=insertValue+"\n";
 	} else {
 		document.selection.createRange().text=insertValue;
 	}
	} else { /* Mozilla/Netscape */
		s = inputObject.selectionStart;
		
		var startValue = inputObject.value.substring(0, s),
			endValue = inputObject.value.substring(s),
			insertReturn="";

		/* Replace the oldValue with insertValue */
		if (option==5) {
			inputObject.value=insertValue;
			startValue='';
			endValue='';
		}
		/* Check to add carriage return after value... */
		if ( (option==99) && endValue.substring(0, 1)!="\n" ) {
			insertReturn="\n";
		} 
		/* Check for carriage return between startValue and endValue */
		if (endValue.substring(0, 1)=="\n") {
			insertValue="\n"+insertValue;
		}
		
		insertValue=insertValue+insertReturn;
		inputObject.value = startValue+insertValue+endValue;
		//soz it can be used without needing YUI
		if(typeof setSelectionRange == 'function') {
		setSelectionRange(inputObject,s+insertValue.length,s+insertValue.length);
	}
	}
	//soz it can be used without needing YUI
	if(typeof oResizePanel.hide == 'function') {	
	oResizePanel.hide();
	/* oResizePanel.destroy(); */
	}
	inputObject.focus(1);
	//if you need your target to do something interesting once the selection is pushed back
	if(typeof postSetSelection == 'function') {
		postSetSelection();
	}
}

/*FUTURE Scripts*/

function logToConsole(msg) {
    if (window.console && window.console.log) {
        console.log(msg);
    }
}


/**
 * This function is currently designed to grab data in an injectable div
 * into one specified location. The more specific location (ex. "h1.title" or 
 * "#content-main h1") the less likely to cause any bugs. To utilize this function
 * specify a div with the class "injectable". Add the attribute "data-inject-location"
 * to specify where in the html the data will be injected. "data-inject-how" is an 
 * optional attribute by default it will replace anything in the specified location.
 * Append will grab the original data and append the injectable data before injecting. 
 */
var elementValue;
function dataInjection(){
	var injectable = $j('div.injectable');
	injectable.each(function (idx,el) {
		var jel = $j(el),
		    data = jel.html(),
		    loc = jel.attr('data-inject-location'),
		    how = jel.attr('data-inject-how');
		if(how === 'before'){
			jel.detach();
			$j('body').find(loc).before(data);
		} else if(how === 'after'){
			jel.detach();
			$j('body').find(loc).after(data);
		} else {
			if(!elementValue){
				elementValue = $j('body').find(loc).html();
			}
			if(how === 'append'){
				$j('body').find(loc).html(elementValue +" "+ data);
					} else if(how === 'insert'){
							$j('body').find(loc).html(data + " " + elementValue);
			}else{
				$j('body').find(loc).html(data);
			}
		}
	});
}
	
/**
 * Get the "portal" of the current window: "admin", "teachers", etc. Extracted from the URL.
 * @returns the portal of the current window
 */
function getPortal() {
	var path = window.location.pathname;
	var pos = path.indexOf('/', 1);
	if (pos > 0) {
		path = path.substring(1, pos);
	}
	return path;
}

