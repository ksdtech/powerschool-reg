/*jslint devel: true, undef: true, continue: true, sloppy: true, vars: true, nomen: true, plusplus: true, white: true, maxerr: 50, indent: 4 */
/*global $j, jQuery */

var $j = $j || jQuery.noConflict();

var DIALOG_Z_INDEX = 99000;	// Bigger than most everything else on any other PowerSchool page. Should support cross browsers to 2^31, but breaks on FF if set at 1,000,000+

var wizardPages;
var wizardIndex = 0;

/*====================================================================
 *===================== Various Widget Codes =========================
 *====================================================================*/

// Create a single instance of the loading dialog controller.
var loadingDialogInstance = (function () {
	var loadingDiv, keys = [], messages = [];
	var addKey = function (k, m) {
		keys.push(k);
		messages.push(m);
	};
	var removeKey = function (k) {
		var i = $j.inArray(k, keys);
		if (i === 0 && keys.length > 1) {
			keys.shift();
			messages.shift();
			return messages[0];	// The first key in the list was removed, return the message for the next key.
		}
		if (i !== -1) {
			keys.splice(i, 1);
			messages.splice(i, 1);
		}
	};
	var hasKeys = function () {
		return keys.length > 0;
	};
	var dialogIsOpen = function () {
		return !!loadingDiv && loadingDiv.length === 1 && loadingDiv.is(':ui-dialog') && loadingDiv.dialog('isOpen');
	};
	var instance ={};
	instance.open = function (message, lockkey) {
		if (!loadingDiv) {
		loadingDiv = $j('#loading');
			if (loadingDiv.length === 0) {
				loadingDiv = $j('<div/>', {'id': 'loading'}).appendTo('body');
			}
		}
		if (!message) {
			pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.loading');
			message = pss_text('psx.js.scripts.psutils.loading');
		}
		addKey(lockkey, message);
		if (!dialogIsOpen()) {
		loadingDiv.dialog({
			title: message,
			width: 250,
			height: 35,
			resizable: false,
			modal: true,
			dialogClass: 'dialogLoading'});
		}
	};
	instance.closeDialog = function (unlockkey) {
		var newMsg = removeKey(unlockkey); // returns the next message if it needs to be changed.
		if (newMsg) {
			loadingDiv.dialog('option', 'title', newMsg);
		} else if (!hasKeys() && dialogIsOpen()) {
			loadingDiv.dialog('destroy').hide();
		}
	};
	instance.forceClose = function () {
		keys.length = 0;
		messages.length = 0;
		this.closeDialog();
	};
	instance.setTitle = function(newTitle) {
		loadingDiv.dialog('option', 'title', newTitle);
	};
	return instance;
}());
function loadingDialog (message, lockkey) {
	loadingDialogInstance.open(message, lockkey);
}
function closeLoading (unlockkey) {
	if (unlockkey === undefined) {
		// Not passing an unlock key should force the loading dialog to close. This allows backwards compatibility with existing behavior of loadingDialog() and closeLoading().
		loadingDialogInstance.forceClose();
	} else {
		loadingDialogInstance.closeDialog(unlockkey);
	}
}
//forcing dialog title from what was originally set
function setLoadingDialogTitle(message) {
	loadingDialogInstance.setTitle(message);
}

function psAlert (options, details, callback) {
	if (typeof options === 'string') {
		options = {message: options};
		if (typeof details === 'string') {
			options.details = details;
		} else {
			callback = details;
		}
		if (typeof callback === 'function') {
			options.callback = callback;
		}
	} else {
		options = options || {};
	}
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.show_details');
	if (typeof options.message === 'string') {
		options.content = $j('<div/>').append($j('<span/>').html(options.message));
		if (options.details) {
			$j('<br/>').appendTo(options.content);
			var showDetails = $j('<a/>', {href: '', text: pss_text('psx.js.scripts.psutils.show_details')}).appendTo(options.content);
			var hideDetails = $j('<a/>', {href: '', text: pss_text('psx.js.scripts.psutils.hide_details')}).appendTo(options.content).hide();
			$j('<br/>').appendTo(options.content);
			var detailsField = $j('<textarea/>', {cols: 50, rows: 5, readonly: 'readonly', text: options.details}).appendTo(options.content).hide();
			showDetails.click(function(){showDetails.hide(); hideDetails.show(); detailsField.show(); return false;});
			hideDetails.click(function(){hideDetails.hide(); showDetails.show(); detailsField.hide(); return false;});
		}
	}
	if (typeof options.callback === 'function') {
		options.close = options.callback;	// Call it when dialog is closed
	}
	options.dialogClass = options.dialogClass || 'psAlert';
	options.type = options.type || 'dialogM';
	if (typeof options.title === 'undefined') {
		options.title = pss_text('psx.js.scripts.psutils.alert');
	}
	options.buttons = [{
	    id: (options.okid || 'button-ok'),
		text: (options.oktext || pss_text('psx.js.scripts.psutils.ok1')),
		click: function () {
			psDialogClose();
		}
	}];
	psDialog(options);
}

function psConfirm (options, ok, cancel) {
	if (typeof options === 'string') {
		options = {message: options};
		if (typeof ok === 'function') {
			options.ok = ok;
		}
		if (typeof cancel === 'function') {
			options.cancel = cancel;
		}
	} else {
		options = options || {};
	}
	if (typeof options.message === 'string') {
		options.content = $j('<div/>').append($j('<span/>').html(options.message));
	}
	var okBtnClicked = false;
	if (typeof options.cancel === 'function') {
		options.close = function () {	// Called when dialog is closed
			if (!okBtnClicked) {
				options.cancel.apply(this, arguments);
			}
		};
	}
	options.dialogClass = options.dialogClass || 'psConfirm';
	options.type = options.type || 'dialogM';
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.ok2');
	options.buttons = [{
		id: (options.cancelid || 'button-cancel'),
		text: (options.canceltext || pss_text('psx.js.scripts.psutils.cancel1')),
		click: function () {
			psDialogClose();
		}
	}, {
		id: (options.okid || 'button-ok'),
		text: (options.oktext || pss_text('psx.js.scripts.psutils.ok2')),
		click: function () {
			okBtnClicked = true;
			psDialogClose();
			if (typeof options.ok === 'function') {
				options.ok(options);
			}
		}
	}];
	psDialog(options);
}

function psSaveDialog (options, yes, no, cancel) {
	if (typeof options === 'string') {
		options = {message: options};
		if (typeof yes === 'function') {
			options.yes = yes;
		}
		if (typeof no === 'function') {
			options.no = no;
		}
		if (typeof cancel === 'function') {
			options.cancel = cancel;
		}
	} else {
		options = options || {};
	}
	if (typeof options.message === 'string') {
		options.content = $j('<div/>').append($j('<span/>').html(options.message));
	}
	var yesNoBtnsClicked = false;
	if (typeof options.cancel === 'function') {
		options.close = function () {	// Called when dialog is closed
			if (!yesNoBtnsClicked) {
				options.cancel.apply(this, arguments);
			}
		};
	}
	options.dialogClass = options.dialogClass || 'psSaveDialog';
	options.type = options.type || 'dialogM';
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.yes');
	options.buttons = [{
		text: (options.canceltext || pss_text('psx.js.scripts.psutils.cancel2')),
		click: function () {
			psDialogClose();
		}
	}, {
	    id: (options.noid || 'button-no'),
		text: (options.notext || pss_text('psx.js.scripts.psutils.no')),
		click: function () {
			yesNoBtnsClicked = true;
			psDialogClose();
			if (typeof options.no === 'function') {
				options.no(options);
			}
		}
	}, {
		id: (options.yesid || 'button-yes'),
		text: (options.yestext || pss_text('psx.js.scripts.psutils.yes')),
		click: function () {
			yesNoBtnsClicked = true;
			psDialogClose();
			if (typeof options.yes === 'function') {
				options.yes(options);
			}
		}
	}];
	psDialog(options);
}

function psWizard (label) { // [{title, header, fields[{label, value, options...} || {label, input{jQueryObject, valueFunction}}], nextText, nextFunction, cancelText}]
	if (typeof label === 'object' && label instanceof Array)
	{
		wizardPages = [];
		wizardIndex = 0;
		var prevPage = null;
		for (var i = 0; i < label.length; i++)
		{
			var page = {};
			page.tableClass = label[i].tableClass || null;
			page.title = label[i].title;
			page.header = label[i].header;
			page.nextText = label[i].nextText || (i + 1 === label.length ? pss_text('psx.js.scripts.psutils.finish') : pss_text('psx.js.scripts.psutils.next'));
			page.nextFunction = label[i].nextFunction;
			page.cancelText = label[i].cancelText || pss_text('psx.js.scripts.psutils.cancel5');
			page.fields = label[i].fields;
			page.backFunction = label[i].backFunction;

			for (var j = 0; j < label[i].fields.length; j++)
			{
				var next = label[i].fields[j];
				next.type = next.type || 'text';
				next.required = label[i].fields[j].required || false;
			}
			if (prevPage)
			{
				page.previous = prevPage;
				prevPage.next = page;
			}
			prevPage = page;
			wizardPages.push(page);
		}

		var options = {};
		var content = $j('<div/>', {name: 'wizardcontent'});
		var tbody;
		for (var i = 0; i < wizardPages.length; i++)
		{
			var pageDiv = $j('<div/>', {name: 'page' + i}).appendTo(content);
			var pageTable;
			if (wizardPages[i].tableClass) {
				pageTable = $j('<table/>', {'class': wizardPages[i].tableClass}).appendTo(pageDiv);
			} else {
				pageTable = $j('<table/>').appendTo(pageDiv);
			}
			pageTable.css({height: 'auto', width: 'auto', margin: '0px 5px 10px 5px'});
			tbody = $j('<tbody/>').appendTo(pageTable);
			if (wizardPages[i].header) {
				$j('<tr/>').append($j('<td/>', {name: 'wizardHeader', colspan: 2, text: wizardPages[i].header}).append($j('<br/>'))).appendTo(pageTable);
			}
			for (var j = 0; j < wizardPages[i].fields.length; j++)
			{
				var nextField = wizardPages[i].fields[j];
				var row = $j('<tr/>', {id: 'p' + i + '_r' + j}).css('vertical-align', 'top').appendTo(pageTable);
				var colspan = 2;
				if (nextField.label)
				{
					$j('<td/>', {text: nextField.label}).css({'text-align': 'left', 'padding-right': '12px'}).appendTo(row);
					colspan = 1;
				}
				if (!nextField.input)
				{
					var opts = {};
					$j.extend(opts, nextField.options);
					var input = createInput(nextField.type, 'wizardField' + i + '_' + j, nextField.value || '' , opts);
					$j('<td/>', {colspan: colspan}).append(input).appendTo(row);
				}
				else if (nextField.input)
				{
					$j('<td/>', {colspan: colspan}).append(nextField.input.jQueryObject).appendTo(row);
				}
			}
		}
		options.content = content;
		options.dialogClass = 'psPrompt';
		options.type = 'dialogM';
		options.buttons = [
		{
			text: wizardPages[0].nextText,
			name: 'wizardNextButton',
			click: function () {
				var values = getWizardValues();
				var curIndex = wizardIndex;
				var targetFunction = wizardPages[curIndex].nextFunction;

				if (wizardIndex + 1 === wizardPages.length)
				{
					wizardPages = null;
					psDialogClose();
				}
				else
				{
				    changeWizardPage(++wizardIndex);
				}
				if (targetFunction)
				{
					targetFunction.apply(this, values);
				}
			}
		},
		{
			text: wizardPages[0].cancelText,
			name: 'wizardCancelButton',
			click: function () {
				if (wizardPages[wizardIndex].cancelFunction)
				{
					wizardPages[wizardIndex].cancelFunction.apply(this, values);
				}
				psDialogClose();
				wizardPages = null;
			}
		},
		{
			text: pss_text('psx.js.scripts.psutils.back'),
			name: 'wizardBackButton',
			click: function () {
				changeWizardPage(--wizardIndex);
				if (wizardPages[wizardIndex + 1].backFunction) {
					wizardPages[wizardIndex + 1].backFunction.apply(this, getWizardValues());
				}
			}
		}
	];
		options.title = wizardPages[0].title;
		psDialog(options);
		changeWizardPage(wizardIndex);
		// Set the button styles
		$j('[name="wizardBackButton"]').css({'float': 'left', 'margin-left': '5px'});
	}
	else throw 'invalid_parameters: expecting array';
}

function changeWizardPage(pageNumber) {
	if (pageNumber === 0)
	{
		$j('[name="wizardBackButton"]').prop('disabled', true);
	}
	else
	{
		$j('[name="wizardBackButton"]').prop('disabled', false);
	}
	wizardIndex = pageNumber;
	$j('[name^="page"]').hide();
	$j('[name="page' + wizardIndex + '"]').show();
	$j('[name="wizardCancelButton"]').html(wizardPages[wizardIndex].cancelText);
	$j('[name="wizardNextButton"]').html(wizardPages[wizardIndex].nextText);
	$j('.ui-dialog-title').html(wizardPages[wizardIndex].title);
}

function createInput(type, id, value, opts) {
	var allOpts = {type: type, id: id, value: value};
	$j.extend(allOpts, opts);
	switch (type)
	{
		case 'text':
		case 'password':
			return $j('<input/>', allOpts);
		case 'textarea':
			return $j('<textarea/>', allOpts).css('resize', allOpts.resize || 'both');
		case 'checkbox':
			var text = allOpts.text || '';
			delete allOpts.text;
			var retVal = $j('<div/>').append($j('<input/>', allOpts));
			$j('<span/>', {text: text}).appendTo(retVal);
			return retVal;
		case 'select':
			var choices = allOpts.choices;
			var selected = allOpts.selected;
			delete allOpts.choices;
			delete allOpts.selected;
			var retVal = $j('<select/>', allOpts);

			for (var i = 0; i < choices.length; i++)
			{
				var detail = choices[i];
				var value = '';
				var text = '';
				if (typeof detail === 'string')
				{
					value = detail;
					text = detail;
				}
				else if (typeof detail === 'object' && detail instanceof Array && detail.length > 0)
				{
					value = detail[0];
					if (detail.length > 1)
					{
						text = detail[1];
					}
					else text = value;
				}
				else throw 'invalid_arguments';
				var nextOpts = {value: value, text: text};
				if (value === selected)
				{
					nextOpts.selected = 'selected';
				}
				$j('<option/>', nextOpts).appendTo(retVal);
			}
			return retVal;
		case 'radio':
			var choices = allOpts.choices;
			var selected = allOpts.selected;
			var idPrefix = id;
			delete allOpts.choices;
			delete allOpts.selected;
			allOpts.name = id;
			var retVal = $j('<div/>');
			for (var i = 0; i < choices.length; i++)
			{
				allOpts.id = idPrefix + '-' + i;
				var detail = choices[i];
				var value = '';
				var text = '';
				if (typeof detail === 'string')
				{
					value = detail;
					text = detail;
				}
				else if (typeof detail === 'object' && detail instanceof Array && detail.length > 0)
				{
					value = detail[0];
					if (detail.length > 1)
					{
						text = detail[1];
					}
					else text = value;
				}
				else throw 'invalid_arguments';

				allOpts.value = value;
				if (value === selected)
				{
					allOpts.checked = 'checked';
				}
				else
				{
					delete allOpts.checked;
				}
				if (i > 0)
				{
					$j('<br/>').appendTo(retVal);
				}
				$j('<input/>', allOpts).appendTo(retVal);
				$j('<span/>', {text: text}).appendTo(retVal);
			}
			return retVal;
		default:
			return $j('<br/>');
	}
}

function getWizardValues () {
	var values = [];
	for (var j = 0; j < wizardPages.length; j++)
	{
		var p = wizardPages[j];
		var pageValues = [];
		for (var k = 0; k < p.fields.length; k++)
		{
			var f = p.fields[k];
			if (f.input)
			{
				pageValues.push(f.input.valueFunction.apply(this, values));
			}
			else if (f.type === 'checkbox')
			{
				pageValues.push($j('#wizardField' + j + '_' + k).is(':checked') ? true : false);
			}
			else if (f.type === 'radio')
			{
				pageValues.push($j('[name="wizardField' + j + '_' + k + '"]:checked').val());
			}
			else
			{
				pageValues.push($j('#wizardField' + j + '_' + k).val());
			}
		}
		values.push(pageValues);
	}
	return values;
}

function psPrompt (label) { // function calls (string, string ..., [options], [ok], [cancel]) or ([array of strings/objects], [options], [ok], [cancel])
	var prompts = [];
	var options;
	var prefix = 'psPrompt';
	var i;
	var argsAsStrings = false;
	if (typeof label === 'string') {
		for (i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] !== 'string') {
				break;
			}
			prompts.push({id: i, label: arguments[i], 'data-retString': true});
		}
		argsAsStrings = true;
	} else if (typeof label === 'object' && label instanceof Array) {
		for (i = 0; i < label.length; i++) {
			if (typeof label[i] === 'string') {
				prompts.push({id: i, label: label[i], 'data-retString': true});
			} else if (typeof label[i] === 'object') {
				if (!label[i].label) {
					throw 'invalid_parameters';	// Expecting at least an a label attribute
				}
				prompts.push(label[i]);
			} else {
				throw 'invalid_parameters';	// Expected array of strings or objects only.
			}
		}
		i = 1;
	} else {
		throw 'invalid_parameters';	// Expected a string, array, or object as the first function argument
	}
	if (i === arguments.length) {
		throw 'invalid_parameters';	// An ok function or list of options is required but missing
	} else if (typeof arguments[i] === 'object') {
		options = arguments[i];
		if (typeof options.ok !== 'function' && typeof arguments[i + 1] !== 'function') {
			throw 'invalid_parameters';	// An ok function is required
		}
		i++;
	} else {
		options = {};
	}
	if (i < arguments.length || typeof arguments[i] === 'function') {
		options.ok = arguments[i];
		i++;
		if (i < arguments.length || typeof arguments[i] === 'function') {
			options.cancel = arguments[i];
		}
	} else if (typeof options.ok !== 'function') {
		throw 'invalid_parameters';	// An ok function is required
	}

	var tbody = $j('<tbody/>');
	options.content = $j('<table/>', {'class': 'linkDescList'}).append(tbody);
	var inputTd, items, j, k, domTag, selectOptions, tmpType, tmpId, tmpFor;
	var inputTypes = ['button', 'checkbox', 'file', 'hidden', 'image', 'password', 'radio', 'reset', 'submit', 'text'];	// We'll probably only use checkbox, password, radio, and text. The others don't make sense in psPrompt()
	for (i = 0; i < prompts.length; i++) {
		inputTd = $j('<td/>').appendTo($j('<tr/>').append($j('<td/>', {text: prompts[i].label})).appendTo(tbody));
		if ($j.isArray(prompts[i].items)) {
			items = prompts[i].items;
		} else {
			delete prompts[i].label;
			if (typeof prompts[i].items !== 'undefined') {
				delete prompts[i].items;
			}
			if (typeof prompts[i].id === 'undefined') {
				prompts[i].id = i;
			}
			items = [$j.extend({'data-returnSingle': true}, prompts[i])];
			prompts[i].items = items;
		}

		for (j = 0; j < items.length; j++) {
			if (typeof items[j].type !== 'string') {
				items[j].type = 'text';
			}
			if (items[j].type === 'br') {
				$j('<br/>').appendTo(inputTd);
			} else {
				tmpId = items[j].id;
				items[j].id = prefix + (typeof items[j].id !== 'undefined' ? items[j].id : i + '_' + j);
				if (items[j].type === 'select') {
					selectOptions = items[j].options;
					delete items[j].type;
					delete items[j].options;
					var selectDropDown = $j('<select/>', items[j]).appendTo(inputTd);
					for (k = 0; k < selectOptions.length; k++) {
						$j('<option/>', selectOptions[k]).appendTo(selectDropDown);
					}
					items[j].type = 'select';
					items[j].options = selectOptions;
				} else {
					tmpType = items[j].type;
					if ($j.inArray(items[j].type, inputTypes) !== -1) {
						domTag = '<input/>';
					} else {	// primarily as support for type === 'label' and type === 'textarea', possible even type === 'span'
						tmpFor = items[j]['for'];
						if (items[j].type === 'label' && typeof items[j]['for'] !== 'undefined') {
							items[j]['for'] = prefix + items[j]['for'];
						}
						domTag = '<' + items[j].type + '/>';
						delete items[j].type;
					}
					$j(domTag, items[j]).appendTo(inputTd);
					if (tmpFor === undefined) {
						delete items[j]['for'];
					} else {
						items[j]['for'] = tmpFor;
					}
					items[j].type = tmpType;
				}
				if (tmpId === undefined) {
					delete items[j].id;
				} else {
					items[j].id = tmpId;
				}
			}
		}
	}
	var okBtnClicked = false;
	if (typeof options.cancel === 'function') {
		options.close = function () {	// Called when dialog is closed
			if (!okBtnClicked) {
				options.cancel.apply(this, arguments);
			}
		};
	}
	options.dialogClass = options.dialogClass || 'psPrompt';
	options.type = options.type || 'dialogM';
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.ok3');
	options.buttons = [{
	    id: (options.okid || 'button-ok'),
		text: (options.oktext || pss_text('psx.js.scripts.psutils.ok3')),
		click: function () {
			okBtnClicked = true;
			psDialogClose();
			var values = [];
			for (i = 0; i < prompts.length; i++) {
				if (prompts[i]['data-retString']) {
					values.push($j('#' + prefix + prompts[i].id, tbody).val());
				} else if ($j.isArray(prompts[i].items)) {	// prompts is guaranteed to be an array, but we'll doublecheck here anyways.
					items = prompts[i].items;
					for (j = 0; j < items.length; j++) {
						if (items[j].type === 'br') {
							continue;
						} else {
							tmpId = '#' + prefix + (typeof items[j].id !== 'undefined' ? items[j].id : i + '_' + j);
							if (items[j].type === 'checkbox' || items[j].type === 'radio') {
								items[j].value = $j(tmpId, tbody).attr('checked') === 'checked';
							} else if ($j.inArray(items[j].type, inputTypes) !== -1 || items[j].type === 'select' || items[j].type === 'textarea') {
								items[j].value = $j(tmpId, tbody).val();
							}
						}
					}
					if (items[0]['data-returnSingle']) {
						prompts[i].value = items[0].value;
						delete prompts[i].items;
					}
					values.push(prompts[i]);
				}
			}

			if (argsAsStrings) {
				values.push(options);
				options.ok.apply(this, values);
			} else {
				options.ok.call(this, values, options);
			}
		}
	}, {
	    id: (options.cancelid || 'button-cancel'),
		text: (options.canceltext || pss_text('psx.js.scripts.psutils.cancel3')),
		click: function () {
			psDialogClose();
		}
	}];

	psDialog(options);
}

function psForm (options) {	// TODO - Allow psForm() to take in a local jQuery object instead of querying the server for a form.
	if (typeof options === 'string') {
		psForm({url: options});
		return;
	}
	if (typeof options !== 'object') {
		throw 'invalid_parameters';
	} else if (options instanceof jQuery) {
		psForm({content: options});
		return;
	}
	options = options || {};
	var okBtnClicked = false;
	if (typeof options.cancel === 'function') {
		options.close = function () {	// Called when dialog is closed
			if (!okBtnClicked) {
				options.cancel.apply(this, arguments);
			}
		};
	}
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.error_occurred_opening_the_dialog1');
	var preValidateFunc = options.preValidate;
	options.preValidate = function (options) {
		var formEle = $j('form', options.dialogDiv);
		if (formEle.length !== 1) {
			psAlert(pss_text('psx.js.scripts.psutils.error_occurred_opening_the_dialog1'), (formEle.length === 0 ? pss_text('psx.js.scripts.psutils.no_forms_were_found_after_init_psform') : pss_text('psx.js.scripts.psutils.too_many_forms_were_found_after_init_psform')));
			return false;
		}
		if (!formEle.attr('action')) {
			psAlert(pss_text('psx.js.scripts.psutils.error_occurred_opening_the_dialog2'), pss_text('psx.js.scripts.psutils.html_form_created_by_psform_does_not_have_an_action'));
			return false;
		}
		if (typeof preValidateFunc === 'function') {
			return preValidateFunc(options);
		}
		return true;
	};
	options.dialogClass = options.dialogClass || 'psForm';
	options.type = options.type || 'dialogM';
	options.buttons = [{
	    id: (options.cancelid || 'button-cancel'),
		text: (options.canceltext || pss_text('psx.js.scripts.psutils.cancel4')),
		click: function () {
			psDialogClose();
		}
	},{
	    id: (options.okid || 'button-ok'),
		text: (options.oktext || pss_text('psx.js.scripts.psutils.ok4')),
		click: function () {
			okBtnClicked = true;
			if (typeof options.ok === 'function') {
				options.ok(options);
			}
			var formEle = $j('form', options.dialogDiv);
			psAjax({
				url: formEle.attr('action'),
				data: formEle.serialize(),
				success: function (data, textStatus, jqXHR) {
					psDialogClose();
					var formSuccessReturn = true;
					if (typeof options.formSuccess === 'function') {
						formSuccessReturn = options.formSuccess(data, textStatus, jqXHR);	// if there is data returned and not meant for a new psDialog, then formSuccess() must return false
					}
					if (data && formSuccessReturn !== false) {
						if (typeof formSuccessReturn === 'string') {
							psDialog({content: formSuccessReturn});	// return content is the new data
						} else {
							psDialog({content: data});
						}
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {	// TODO - Maybe have a better error handler?
					psAlert(pss_text('psx.js.scripts.psutils.error_occurred_submitting_the_form'), textStatus + (errorThrown ? ': ' + errorThrown : ''));
				}
			});
		}
	}];
	psDialog(options);
}







/*====================================================================
 *======================= AJAX Operations ============================
 *====================================================================*/
/**
 * Drop-in safer replacement for standard jQuery ajax method. The standard method is not
 * very graceful when it comes to session timeouts, etc. We'll deal with those situations here.
 * @param opts hash of options
 * @throws "ajax_error" if some error occurred other than session timeout/logoff from another user logging in
 */
function psAjax (options, success, error) {
	if (typeof options === 'string') {
		$j.ajax(psAjaxWrapper({url: options, success: success, error: error}));
	} else if (typeof options === 'object' && typeof options.url === 'string') {
		// Wrap the custom PS ajax options first, then make the real jQuery ajax call
		$j.ajax(psAjaxWrapper(options));
	} else {
		throw 'invalid_parameters';	// A url could not be found
	}
}

var psGetScript = (function () {
	var scriptsGotten = {};	// Static variable holding a hash of all scripts already gotten.

	return function (options, success, error) {
		if (typeof options === 'string') {
			psGetScript({url: options, success: success, error: error});
		} else if (typeof options === 'object' && typeof options.url === 'string') {
			if (!scriptsGotten[options.url]) {
				options.dataType = 'script';
				options.cache = true;
				var successHandler = options.success;
				options.success = function(data, textStatus, jqXHR) {
					scriptsGotten[options.url] = true;
					if (successHandler) {
						successHandler();	// This success handler does not expect any parameters.
					}
				};
				$j.ajax(psAjaxWrapper(options));
			} else {
				if (options.success) {
					options.success();	// This success handler does not expect any parameters.
				}
			}
		} else {
			throw 'invalid_parameters';	// A url could not be found
		}
	};
}());

function psAjaxWrapper (options) {
	options = options || {};

	if (options.showLoading !== false) {	// if undefined, null, or any other value, treat as default of true
		options.showLoading = true;
		loadingDialog(options.loadingMessage);
	}

    if (typeof sn !== "undefined" && sn.analytics && sn.analytics.trackEvent && (options.generateEvent === undefined || options.generateEvent)) {
        sn.analytics.trackEvent('ajax', 'load', options.url);
    }

    // If there's no error handler (likely there isn't), add it here. Let's *hope* the developer
	// doesn't just catch the error condition and ignore it. :-O
	if (!options.error) {
		options.error = function (jqXHR, textStatus, errorThrown) {
			psAjaxError();
		};
	}

	// Replace the success handler (if there is one) with a safer one.
	var successHandler = options.success;
	options.success = function(data, textStatus, jqXHR) {
		// Check that the response looks legal for an Ajax call. If it's not,
		// this method will never return.
		psCheckAjaxResponse(data, textStatus, jqXHR, options);

		// Looked ok, pass it on.
		if (successHandler) {
			successHandler(data, textStatus, jqXHR);
		}

		if (options.showLoading === true) {
			closeLoading();
		}
	};

	return options;
}

/**
 * Drop-in safe replacement for standard jQuery load method. The standard method is convenient, but it's not
 * very graceful when it comes to session timeouts, etc. We'll deal with those situations here.
 * @param options Either a url string or a set of parameters, parameters must include a 'url'
 * @param success success handler use if the first argument is the url, otherwise it is ignored
 * @throws "invalid_parameters" if parameters are invalid
 * @throws "ajax_logout" if some error occurred due to session timeout/logoff from another user logging in
 * @throws "ajax_error" if some error occurred other than session timeout/logoff from another user logging in
 */
$j.fn.psLoad = function (options, success) {
	if (typeof options === 'string') {	// This is to support legacy code
		var url = options;
		options = {url: url, success: success};
	} else if (typeof options !== 'object' || typeof options.url !== 'string') {
		throw 'invalid_parameters';	// A url could not be found
	}
	options.el = this;
	psLoad(options);
};

/**
 * Drop-in safe replacement for standard jQuery load method. The standard method is convenient, but it's not
 * very graceful when it comes to session timeouts, etc. We'll deal with those situations here.
 * @param options Either a url string or a set of parameters, parameters must include a 'url'
 * @param success success handler use if the first argument is the url, otherwise it is ignored
 * @throws "invalid_parameters" if parameters are invalid
 * @throws "ajax_logout" if some error occurred due to session timeout/logoff from another user logging in
 * @throws "ajax_error" if some error occurred other than session timeout/logoff from another user logging in
 */
function psLoad (options) {
	if (typeof options !== 'object' || typeof options.url !== 'string' || !options.el) {
		throw 'invalid_parameters';	// A url and target element could not be found
	}
	options.type = options.type || 'GET';
	options.cache = options.cache || false;
	var origSuccess = options.success;
	options.success = function(data, textStatus, xhr) {
		// If we get here, the response looks good. Replace the element.
		$j(options.el).html(data);
		// Finally, call the success callback
		if (origSuccess) {
			origSuccess(data, textStatus, xhr);
		}
	};
	psAjax(options);
}

/**
 * Check the ajax response back from the server to see if it looks like a response is supposed
 * to look. If it does not, then log off the user (if what came back looks like a login page)
 * or just display an error alert (otherwise).
 * @param data
 * @param textStatus
 * @param jqXHR
 * @param opts
 */
function psCheckAjaxResponse(data, textStatus, jqXHR, opts) {
	if (jqXHR.status && (jqXHR.status < 200 || jqXHR.status > 299)) {
		if (opts && typeof opts.error === 'function' && opts.error(data, textStatus, jqXHR) === false) {
			return;	// If false is returned, don't run psAjaxError()
		}
		psAjaxError();
	}

	if (!data || typeof data !== 'string') {
		return;
	}

	data = data.toLowerCase();

	var isDocument = false;
	var i;
	for (i = 0; i < data.length; i++) {
		// Ignore whitespace
		if (" \t\n\r".indexOf(data.charAt(i)) >= 0) {
			continue;
		}

		// If it's got an <html> or <!DOCTYPE> at the beginning, it's bad.
		if (data.indexOf("<html", i) === i || data.indexOf("<!doctype", i) === i) {
			isDocument = true;
			break;
		}

		// If it starts with a comment, skip it
		if (data.indexOf("<!--", i) === i) {
			var endPos = data.indexOf("-->", i+1);
			if (endPos >= 0) {
				i = endPos + 2;		// Skip to end of comment, but leave one for the loop incr
				continue;
			} else {
				// Comment to the end? OK, whatever...
				break;
			}
		}

		// Otherwise, if it survives, it's not a whole document.
		break;
	}

	if (isDocument) {
		// OK, it's a whole document. See if it looks like a login page.
		var loginRegex = /type\s*=\s*["']password["'].*name\s*=\s*["'](password|pw)["']/i;
		if (data.match(loginRegex)) {
			if (opts && typeof opts.logoutError === 'function' && opts.logoutError(data, textStatus, jqXHR) === false) {
				return;	// If false is returned, don't run psLogoutError()
			}
			psLogoutError();
		} else {
			// Not a login page, just throw up an error and quit loading
			if (opts && typeof opts.error === 'function' && opts.error(data, textStatus, jqXHR) === false) {
				return;	// If false is returned, don't run psAjaxError()
			}
			psAjaxError();
		}
	}
}

function psLogoutError() {
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.you_have_been_logged_out');
	alert(pss_text('psx.js.scripts.psutils.you_have_been_logged_out'));

	var portal = window.location.href.split('/')[3];
	var url;
	if (portal !== 'guardian') {
		url = '/' + portal + '/~loff';
	} else {
		url = '/' + portal + '/home.html?ac=logoff';
	}

	window.location = url;
	throw 'ajax_logout';
}

function psAjaxError() {
	pss_get_texts('psx.js.scripts.psutils.', 'psx.js.scripts.psutils.an_error_was_detected_contacting_server');
	alert(pss_text('psx.js.scripts.psutils.an_error_was_detected_contacting_server'));

	// In case it's open (doesn't hurt if not)
	closeLoading();

	throw 'ajax_error';
}

/**
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
 * This method parses that string into a user-friendly key/value pair object.
 *
 * This is a solution modified from: https://gist.github.com/706839
 * The modification is because the header lines may not end in CRLF. In FireFox 4, they only end in LF.
 * @param headerStr The HTTP response headers in string format
 * @returns	The headers as an object literal
 */
function parseResponseHeaders(headerStr) {
	var headers = {};
	if (!headerStr) {
		return headers;
	}
	var headerPairs = headerStr.split('\u000a');
	var i;
	for (i = 0; i < headerPairs.length; i++) {
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0) {
			var key = $j.trim(headerPair.substring(0, index));
			var val = $j.trim(headerPair.substring(index + 2));
			headers[key] = val;
		}
	}
	return headers;
}











/*====================================================================
 *======================== PS Dialog Code ============================
 *====================================================================*/
/**
 * TODO - options to document:
 * - All overridden properties from jQuery UI's dialog
 * - options.url
 * - options.ajaxOptions
 * - options.position
 * - options.type
 * - options.content
 * - options.contentIsText	(Treat as HTML or Text)
 * - options.persistContent
 * - options.beforeOpenLoadJS
 * - options.beforeOpen
 * - options.initBehaviors
 * - options.preValidate
 * - options.dialogDiv
 * - options.dialogType	(only from ajax json return)
 *
 * @param options
 * @returns
 */
function psDialog (options) {
	if (typeof options === 'string') {
		if (options === 'reopen') {
			$j('#psDialog').dialog('open');
		} else if (options === 'option') {
			var dialogDiv = $j('#psDialog');
			dialogDiv.dialog.apply(dialogDiv, arguments);
		} else {
			psDialog({url: options});
		}
		return;
	}
	if (typeof options === 'object') {
		if (options.currentTarget && options.currentTarget === this) {
			// If the psDialog call is invoked by a click from a user on a DOM element with one of the "psDialog" classes,
			// "this" is a DOM element and the first argument (options) may actually be a jQuery eventObject
			return psDialogLazyWidget.call(this, options);
		}
		if (options.content instanceof jQuery || (typeof options.content === 'string' && options.contentIsText === true)) {
			// This is sufficient. Continue.
		} else if (typeof options.content !== 'undefined') {
			options.content = $j(options.content);
		} else if (typeof options.url === 'string') {
			options.ajaxOptions = options.ajaxOptions || {};
			options.ajaxOptions.url = options.url;
			options.ajaxOptions.generateEvent = false;
			var ajaxSuccess = options.ajaxOptions.success;
			options.ajaxOptions.success = function (data, textStatus, xhr) {
				var parsedData = null;
				try {
					parsedData = $j.parseJSON(data);
				} catch (e) {}

				if (parsedData === null) {
					options.content = data;			// If we don't treat as text and existing AJAX content isn't wrapped by an HTML element (such as by a <div>), then it will not display properly
					options.contentIsText = true;
				} else {
					$j.extend(options, parsedData);
				}

				if (typeof ajaxSuccess === 'function') {
					ajaxSuccess(data, textStatus, xhr);
				}
				if (typeof options.dialogType === 'string') {
					switch (options.dialogType) {
					case 'psAlert':
						psAlert(options);
						break;
					case 'psConfirm':
						psConfirm(options);
						break;
					case 'psForm':
						psForm(options);
						break;
					default:
						psDialog(options);
						break;
					}
				} else {
					psDialog(options);
				}
			};
			psAjax(options.ajaxOptions);
			return;
		} else {
			throw 'invalid_parameters';
		}
	} else {
		throw 'invalid_parameters';
	}

	if (typeof sn !== "undefined" && sn.analytics && sn.analytics.trackEvent) {
		sn.analytics.trackEvent('dialog', 'open', options.url);
	}

    // All options jQuery UI's dialog supports will be supported here.
	options.type = options.type || 'dialogC';
	var defaultOptions = {
		closeText:		'',
		width:			'auto',
		height:			(options.type === 'dialogR' ? 500 : 'auto'),
		minWidth:		200,
		minHeight:		40,
		resizable:		(options.type === 'dialogR'),
		position:		{my:'center', at: 'center', of: window},	// A position must be set in the options for type 'dialog'
		draggable:		true,
		modal:			($j.inArray(options.type, ['dialogM', 'dialogR']) !== -1),
		autoOpen:		false,
		persistContent:	true
	};
	$j.extend(options, $j.extend(defaultOptions, options));	// So the original options (passed in by reference) also get set.
	if (options.position && options.position instanceof jQuery) {
		// On top of the standard dialog position values, we also support passing in a jQuery object, where that object's position is used.
		var actualPosition = [options.position.offset().left, options.position.offset().top - $j(document).scrollTop()];
		options.position = actualPosition;
	}
	if (!options.dialogDiv) {
		options.dialogDiv = $j('#psDialog');
		if (options.dialogDiv.length === 0) {
			options.dialogDiv = $j('<div/>', {id: 'psDialog', 'class': 'psDialog'}).appendTo('body');
		}
	} else {
		options.dialogDiv = $j(options.dialogDiv);
	}
	if (options.dialogDiv.is(':data(ui-dialog)')) {
		// Has already been initialized. We should close it and remove it before recreating.
		if (options.dialogDiv.dialog('isOpen')) {
			options.dialogDiv.dialog('close');
		}
		options.dialogDiv.dialog('destroy').hide();
	}
	options.dialogDiv.empty();	// Destroys all child elements. If a child needs to be kept, then use the dialogclose or dialogbeforeclose events to detach them from the DOM.
	if (typeof options.content === 'string' && options.contentIsText === true) {
		options.dialogDiv.html(options.content);	// Persist is not supported if content is text.
	} else {
		options.dialogDiv.append(options.persistContent ? options.content : $j(options.content).clone());	// Note: if content is a jQuery object, it should not be attached to the DOM and should not be hidden
	}
	if (typeof options.beforeOpenLoadJS === 'string') {
		psGetScript(options.beforeOpenLoadJS, function () {psDialogEnd(options);});
	} else {
		psDialogEnd (options);
	}
}

function psDialogEnd (options) {
	var beforeOpenError = false;
	if (typeof options.beforeOpen === 'function') {
		options.beforeOpen(options);
	} else if (typeof options.beforeOpen === 'string' && options.beforeOpen !== '') {
		// If a function name is passed it, we want to call the function without using eval while supporting namespaces.
		var namespaces = options.beforeOpen.split('.');
		var func = window;
		var i;
		for (i = 0; i < namespaces.length; i++) {
			func = func[namespaces[i]];
		}
		if (typeof func === 'function') {
			func(options);
		} else {
			beforeOpenError = true;
		}
	}
	closeLoading();
	options.dialogDiv.dialog(options);
	if (options.initBehaviors !== false) {	// if undefined, null, or any other value, treat as default of true
		initBehaviors();
	}
	if (typeof options.preValidate === 'function') {
		if (!options.preValidate(options)) {
			return;	// If validation fails, do not open the dialog window. If an error message needs to be output, then preValidate is responsible for that task.
		}
	}
	options.dialogDiv.dialog('open');
	$j('#psDialog :input:visible:enabled:first').focus();

	if (beforeOpenError) {	// Throw the error after running the remaining psDialog code.
		throw new ReferenceError('The referenced function ' + options.beforeOpen + '() could not be found.');
	}
}

function psDialogClose (dialogDiv) {	// Only closes it, does not destroy. Can pass in a jQuery div element.
	dialogDiv = dialogDiv || $j('#psDialog');
	if (dialogDiv.is(':ui-dialog') && dialogDiv.dialog('isOpen')) {
		dialogDiv.dialog('close');
	}
}

//Dialog widget
function psDialogLazyWidget (a) {
	// This documented way to invoke popup dialogs in the Admin UI Examples will invoke this function after proxying through psDialog() first
	// The tag in the page <a href="content.html" title="Dialog Title" class="dialog" or "dialogC" or "dialogM">Open Dialog</a>
	// The content page is wrapped with a <div  style="width:XXXpx">content</div> this sets the width of the dialog
	// NOTE: width:auto and width:XXXpx will work.  DO not specify nnn% width as that won't be interpreted by
	// jquery .width() in a pre-rendered state... it will be interpreted as pixels.
	var options = {title: $j(this).attr('title')};
	var content = $j(this).attr('href');
	options.persistContent = ($j(this).data('persistcontent') === true);	// Defaults to false when using legacy dialog
	var beforeOpenLoadJS = $j(this).data('beforeopenloadjs');
	if (beforeOpenLoadJS) {
		options.beforeOpenLoadJS = beforeOpenLoadJS;
	}
	var beforeOpen = $j(this).attr('data-beforeopen');
	if (beforeOpen) {
		options.beforeOpen = beforeOpen;
	}

	if (content === '' ) {
		var url = $j(this).attr('dialogContent'); //this is set in initBehaviors()
		if (url) {
			content = url;
		}
	}

	var dClass = $j(this).attr('class');
	var dClasses = dClass.split(/\s+/g);
	var $this = $j(this);
	var useDiv = false;
	$j.each(dClasses, function(index, dClassPart) {
		switch(dClassPart)
		{
		case 'dialogDiv':
			useDiv = true;
		case 'dialog':
			options.type = 'dialog';
			options.position = $this;
			return false;
		case 'dialogDivC':
			useDiv = true;
		case 'dialogC':
			options.type = 'dialogC';
			return false;
		case 'dialogDivM':
			useDiv = true;
		case 'dialogM':
			options.type = 'dialogM';
			return false;
		case 'dialogR':
			options.type = 'dialogR';
			return false;
		default:
			break;
		}
		return true;
	});

	if (useDiv) {
		options.width = $j(content).width();
		if (!options.width)
			delete options.width;	// if zero then delete it so it will be Auto
		var parentWrapper = $j(content);
		options.content = parentWrapper.children().detach();
		options.close = function (event, ui) {
			// This is to keep the original behavior. It basically returns the content back to its original location.
			parentWrapper.append(options.content.detach());
		};
		psDialog(options);
	} else {
		if (!options.beforeOpen) {
			options.beforeOpen = function (options) {
				postPsDialogSTUMCheck();	// TODO - This doesn't belong here. However, moving it has regression risks, so leaving the logic here for now.
			};
		}
		options.url = content;
		options.ajaxOptions = {
			cache: false,
			success: function(data, textStatus, xhr) {
				var tmpJQObject = $j(options.content);
				if (tmpJQObject instanceof jQuery) {
					// Find the first div available and use it's width.
					var tmpJQObjectDivs = tmpJQObject.filter('div');
					if (tmpJQObjectDivs.length === 0) {
						tmpJQObjectDivs = $j('div:first-child', tmpJQObject);	// If no top level DOM objects are divs, look into the children.
					}
					if (tmpJQObjectDivs.length !== 0) {
						options.width = tmpJQObjectDivs.width();
					}
				}
				if (!options.width)
					delete options.width;	// if zero then delete it so it will be Auto
			}
		};
		psDialog(options);
	}

	return false;
}


function postPsDialogSTUMCheck () {
	// This dependency was introduced in STUM-1213 changelist 95737, but future changelists may also depend on it.
	$j('#errorMsg').hide();
	$j('#InboundRequests').click(function(event) {
		$j.ajax({
			url : "/admin/studentmobility/notificationsInstitutionAJAX.action",
			type : "GET",
			dataType : "json",
			success : function(data) {
				if (data.success == "true") {
					$j('#errorMsg').hide();
					window.open($j('#InboundRequests').attr('href'), 'popup');
				} else {
					$j('#errorMsg').show();
				}
			},
			error : function(data) {
				psAjaxError();
			}
		});
		event.preventDefault();
	});
}












/*====================================================================
 *======================== Misc JS Utilities =========================
 *====================================================================*/


var getScrollWidth = function () {
	// Returns the thickness/width of the current browser's scrollbar in pixels as it differs between OS as well as browsers.
	var width = null;
	$j(window).resize(function () {
		width = null;	// Browser zoom events typically trigger resize events as well. Scrollbars need to be recalculated after zoom events.
	});
	return function () {
		if (width === null) {
			// Based off of the solution by David Walsh at: http://davidwalsh.name/detect-scrollbar-width
			var scrollDiv = $j('<div/>').css({width: 100, height: 100, overflow: 'scroll', position: 'absolute', top: -9999}).appendTo('body');
			width = scrollDiv.get(0).offsetWidth - scrollDiv.get(0).clientWidth;
			scrollDiv.remove();
		}
		return width;
	};
} ();


(function(){
	// Returns true if scrollbars exist on an element. You can specify to only check for 'vert' or 'horz' scrollbars.
	// This has not been fully cross-browser/version tested, but it works in these major browsers: FF4, IE8, Chrome 17, & Safari 5
	$j.fn.hasScrollBars = function (o) {
		var el = this.get(0), ofcss;
		if (o !== 'horz') {	// vert or both
			if (el.scrollHeight > el.clientHeight) {
				ofcss = this.css('overflow-y');
				if (ofcss === 'auto' || ofcss === 'scroll') {
					return true;
				} else if (!ofcss) {
					ofcss = this.css('overflow');
					if (ofcss === 'auto' || ofcss === 'scroll') {
						return true;
					}
				}
			}
		}
		if (o !== 'vert') {	// horz or both
			if (el.scrollWidth > el.clientWidth) {
				ofcss = this.css('overflow-x');
				if (ofcss === 'auto' || ofcss === 'scroll') {
					return true;
				} else if (!ofcss) {
					ofcss = this.css('overflow');
					if (ofcss === 'auto' || ofcss === 'scroll') {
						return true;
					}
				}
			}
		}
		return false;
	};
})();

// Sliding Drawer Panel
function toggleDrawerPanel(panelId, modalOverlayId, state) {
    if (state === 'expanded') {
        $j('body').addClass('drawerPanelExpanded');
        $j('#' + modalOverlayId).css({'z-index': DIALOG_Z_INDEX}).show();
        $j('#' + panelId).css({'z-index': DIALOG_Z_INDEX + 1}).show().switchClass('collapsed', 'expanded', 750, 'swing');
    }
    else if (state === 'collapsed') {
        $j('body').removeClass('drawerPanelExpanded');
        $j('#' + panelId).switchClass('expanded', 'collapsed', 500, 'swing', function() {
            $j('#' + panelId).hide();
            $j('#' + panelId + ' .content').animate({
                scrollTop: 0
            });
        });
        $j('#' + modalOverlayId).hide();
    }
}

//Sliding Drawer Panel for ModAccess
//NOTE only called from toggleModAccessDrawerPanel at the moment.
//TODO turn into a widget
function toggleSmartDrawerPanel(drawerContainerObj, state, callback) {
	if (drawerContainerObj.length <= 0) {
		return;
	}
	
    if (state === 'expanded') {
        $j('body').addClass('drawerPanelExpanded');
        $j('.drawerModalOverlay', drawerContainerObj).css({'z-index': DIALOG_Z_INDEX}).show();
        $j('.rightSideDrawerPanel', drawerContainerObj).css({'z-index': DIALOG_Z_INDEX + 1}).show().switchClass('collapsed', 'expanded', 750, 'swing');
    }
    else if (state === 'collapsed') {
        $j('body').removeClass('drawerPanelExpanded');
        $j('.rightSideDrawerPanel', drawerContainerObj).switchClass('expanded', 'collapsed', 500, 'swing', function() {
            $j('.rightSideDrawerPanel', drawerContainerObj).hide();
            $j('.rightSideDrawerPanel' + ' .content', drawerContainerObj).animate({
                scrollTop: 0
            });
        });
        $j('.drawerModalOverlay', drawerContainerObj).hide();
    }
}

/**
 * TODO Needs to be a widget
 * Loads the page for Mod Access in a new sliding drawer.
 * state - expanded or collapsed
 * oldPageUrl - if the new drawer container cannot be found, use the old way of doing things and load the old page.  This holds the url to the old page.  This is a fail-safe.
 */
function toggleModAccessDrawerPanel (state, oldPageUrl) {
	var isFramed = $j('#frameContent', top.document);
	var modAccessContainer;
		
	if (isFramed.length > 0) {
		modAccessContainer = $j('#modAccessDrawerContainer', top.frames['content'].document);
	}
	else {
		modAccessContainer = $j('#modAccessDrawerContainer');
	}
	
	if (state === 'expanded') {
		if (modAccessContainer.length > 0) {
			
			$j('#modAccessPageContent', modAccessContainer).psLoad('/admin/security/modaccessSlideDrawer.html',
					function(a,b,c) {
						toggleSmartDrawerPanel(modAccessContainer, 'expanded');
						//Loads table filters
						jsLazyLoader();
					}
			);
		}
		else {
			if (oldPageUrl !== undefined) {
				if (isFramed.length > 0) {
					top.frames['content'].location.href = oldPageUrl;
				}
				else {
					window.location.href = oldPageUrl;
				}
			}
		}
	}
	else if (state === 'collapsed') {
		if (modAccessContainer.length > 0) {
			toggleSmartDrawerPanel(modAccessContainer, 'collapsed');
		}
	}
}


// String Utilities
var htmlEntities = function (s) {
	// This method escapes all &, <, and > symbols in the string, making it safe to display the string on a web page without fear that it will be treated as HTML.
	return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};




//given a value (size in bytes) and a value to convert it to (Kilobyte, Megabyte, etc...)
//return the value in the requested size
//0 bytes - no change
//1 Kilobyte (Kb) - 1 Kb - 1024 Bytes
//2 Megabyte (Mb) - 1 Mb - 1048576 Bytes
//3 Gigabyte (Gb) - 1 Gb - 1073741824 Bytes
//4 Terabyte (Tb) - 1 Tb - 1099511627776 Bytes
var convertToSize = function(value, toValue) {
    if (toValue < 0 || toValue > 4) {
        //invalid conversion value
        return '';
    }
    switch (toValue) {
    case 1:
        value = value / 1024;
        break;
    case 2:
        value = value / 1048576;
        break;
    case 3:
        value = value / 1073741824;
        break;
    case 4:
        value = value / 1099511627776;
        break;
    case 0:
        return value;
    
    }
    //last - make sure the size is set to two decimal precision
    value = (Math.floor(value * 100) / 100).toFixed(2);
    
    return value;
};

// given a value in bytes, figure out the size with which to display
var convertFromBytesToString = function(value) {
    pss_get_texts('psx.js.scripts.psfilepicker');
    var label = pss_text('psx.js.scripts.psfilepicker.bytes');
    if ($j.isNumeric(value)==false ){
        //if the value isn't a number, return empty
        return '';
    }
    if (value > 1099511627776) {
        //terabyte
        value = convertToSize(value, 4);
        label = pss_text('psx.js.scripts.psfilepicker.terabytes');
    }
    else if (value > 1073741824) {
        //gigabyte
        value = convertToSize(value, 3);
        label = pss_text('psx.js.scripts.psfilepicker.gigabytes');
    }
    else if (value > 1048576) {
        //megabyte
        value = convertToSize(value, 2);
        label = pss_text('psx.js.scripts.psfilepicker.megabytes');
    }
    else if (value > 1024) {
        //kilobyte
        value = convertToSize(value, 1);
        label = pss_text('psx.js.scripts.psfilepicker.kilobytes');
    }
    
    if (value !== '') {
        value = value + ' ' + label;
    }
    return value;
};





