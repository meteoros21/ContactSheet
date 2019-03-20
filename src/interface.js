/**
 * 
 */

var defaultColumnList = [
			{label:"Full name", type:"Name", width:"180px", key: "full-name", visible:true}, 
			{label:"Family name", type:"Name", width:"100px", key:"family-name", visible:true},
			{label:"Middle name", type:"Name", width:"100px", key:"middle-name", visible:true},
			{label:"Given name", type:"Name", width:"100px", key:"given-name", visible:true}, 
			{label:"E-mail(home)", type:"Email-home", width:"220px", key:"email-home", visible:true},
			{label:"E-mail(work)", type:"Email-work", width:"220px", key:"email-work", visible:true},
			{label:"E-mail(other)", type:"Email-other", width:"220px", key:"email-other", visible:true},
			{label:"Phone(home)", type:"Phone-Home", width:"140px", key:"phone-home", visible:true},
			{label:"Phone(work)", type:"Phone-Work", width:"140px", key:"phone-work", visible:true}, 
			{label:"Phone(mobile)", type:"Phone-mobile", width:"140px", key:"phone-mobile", visible:true}, 
			{label:"Organization name", type:"Organization", width:"200px", key:"org-name", visible:true},
			{label:"Organization title", type:"Position", width:"150px", key:"org-title", visible:true},
			{label:"Contact group", type:"Group", width:"200px", key:"groups", visible:true},
			{label:"Postal address", type:"postal-address", width:"200px", key:"postal-address", visible:true},
			{label:"Note", type:"note", width:"200px", key:"note", visible:true}];

var userColumnList = null;

function showWaitScreen()
{
	return new Promise(function(resolve) {
		if ($('#wait-back').length == 0)
		{
			waitScreen = $('<div id="wait-back"><div class="loader"></div></div>');
			$(document.body).append(waitScreen);
		}
		window.setTimeout(function() {
			resolve('completed');
		}, 200);
		//resolve('completed');
	});
}

function hideWaitScreen()
{
	waitScreen.remove();
}

// Option Dialog에서 OK가 눌려질 경우, 호출된다.
function userOptionChanged()
{
	showWaitScreen().then(function() {
		userColumnList = new Array();

		var table = $('#field-option-list');
		for (var i = 1; i < table[0].rows.length; i++)
		{
			var item = new Object();
			var td1 = $(table[0].rows[i].cells[0]);
			var chk = td1.find('input');
			var visible = chk.is(":checked");
			item.visible = visible;

			var td2 = $(table[0].rows[i].cells[1]);
			var label = td2.text().trimRight();
			item.label = label;

			var key = chk.attr('name').substring(2);
			var td3 = $(table[0].rows[i].cells[2]);
			var width = td3.find('input').val();
			item.width = width;
			item.key = key;

			userColumnList.push(item);
		}

		saveUserOption(userColumnList);
		

		//var option = createUserOption(userColumnList);
		//mySheet.reinit($('.table_wrap'), option);
	
		hideWaitScreen();

		window.location.reload();
	});
}

// function logout()
// {
// 	window.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:8080/googlecontacts/login.ion";
// }

function loadUserOption(callback)
{
	chrome.storage.sync.get('option', function(data) {
		var optionString = data['option'];
		
		if (optionString != null && optionString != '')
		{
			//console.log(optionString);
			callback(JSON.parse(optionString));
		}
		else
		{
			callback(null);
		}
	});
}

function saveUserOption(userOption)
{
	var optionString = JSON.stringify(userOption);
	chrome.storage.sync.set({"option": optionString});
}

// 검색버튼 클릭 시 호출
function onQueryContacts()
{
	var form = document.forms['form-navi'];
	var idx = form.groupId.selectedIndex;
	var groupId = '';
	if (idx >= 0)
		groupId = form.groupId.options[idx].value;
	var keyword = document.forms['form-navi'].keyword.value;
	
	showWaitScreen();
	
	contactIO.loadContactList(groupId, keyword, 1, 20000, function(contactList) {
		contactIO.sortContactList(contactList, 'full-name', 'family-name');
		mySheet.setContactList(null, contactList);
		mySheet.resetSortColumn();
		hideWaitScreen();
	});

	return false;
}

// 새로고침 클릭 시 호출
function onRefresh()
{
	setTimeout(function() {
		loadContacts();
		mySheet.resetSortColumn();
	}, 100);
}

// Context menu에서 group 클릭 시 호출
// 그룹 설정 다이얼로그를 표시한다.
function onGroup(selectedGroups)
{
	if (typeof groupDialog == 'undefined')
	{
		groupDialog = $('#group-dialog').dialog({
			autoOpen: false,
			width: 300,
			height: 280,
			modal: true,
			buttons: {
				"Ok": function() {
					var result = new Array();
					$('#ul-group').find('input[type="checkbox"]').each(function(idx, element) {
						if (element.checked)
						{
							var item = new Object();
							item.id = $(element).attr('id').substring(2);
							item.label = $(element).attr('value');
							result.push(item);
						}	
					});

					mySheet.setSelectedGroupList(result);
					groupDialog.dialog('close');
				},
				"Cancel": function() {
					groupDialog.dialog('close');
				}
			}
		});

		var ul = $('#ul-group');
		var dataList = mySheet.getGroupList();
		for (var i = 0; i < dataList.length; i++)
		{
			var li = $('<li><input type="checkbox" id="g-' + dataList[i].id + '" value="' + dataList[i].label + '"><label for="g-' + dataList[i].id + '"><span></span>' + dataList[i].label +'</label></li>');
			ul.append(li);
		}
	}

	$('#ul-group').find('input[type=checkbox]').each(function(idx, obj) {

		var groupId = $(obj).attr('id');
		if (selectedGroups != null)
		{
			var found = false;
			for (var i = 0; i < selectedGroups.length; i++)
			{
				if ('g-' + selectedGroups[i] == groupId)
				{
					found = true;
					break;
				}
			}

			if (found == true)
				$(obj).prop('checked', true);
			else
				$(obj).prop('checked', false);
		}
		else
		{
			$(obj).prop('checked', false);
		}
	});

	groupDialog.dialog('open');
}

// 찾기 버튼 클릭 시 호출
function onFind()
{
	if (typeof findDialog == 'undefined')
	{
		var obj = $('#find-dialog input[type=text][name=txtFind]');
		obj.keyup(function(e) {
			var cellText = mySheet.getCurrentCellText();
			findDialog.checkButtons(cellText);
		});
		
		findDialog = $('#find-dialog').dialog({
			autoOpen: false,
			width: 300,
			height: 280,
			modal: false,
			buttons: {
				"Find": function() {
					$('#find-dialog').parent().find('.ui-dialog-buttonset button').blur();
					var option = new Object();
					option.action = 1;
					
					var form = document.forms['form-find'];
					option.txtFind = form.txtFind.value;
					option.direction = $(form).find('[name=radioDirection]:checked').val();
					option.scope = $(form).find('[name=radioScope]:checked').val();
					
					mySheet.find(option);
				},
				"Replace/Find": function() {
					var option = new Object();
					var form = document.forms['form-find'];
					option.txtFind = form.txtFind.value;
					option.txtReplace = form.txtReplace.value;
					option.direction = $(form).find('[name=radioDirection]:checked').val();
					option.scope = $(form).find('[name=radioScope]:checked').val();

					mySheet.replace(option);
					mySheet.find(option);
				},
				"Replace": function() {
					$('#find-dialog').parent().find('.ui-dialog-buttonset button').blur();
					var option = new Object();
					var form = document.forms['form-find'];
					option.txtFind = form.txtFind.value;
					option.txtReplace = form.txtReplace.value;
					option.direction = $(form).find('[name=radioDirection]:checked').val();
					option.scope = $(form).find('[name=radioScope]:checked').val();

					mySheet.replace(option);
				},
				"Replace All": function() {
					var option = new Object();
					var form = document.forms['form-find'];
					option.txtFind = form.txtFind.value;
					option.txtReplace = form.txtReplace.value;
					option.direction = $(form).find('[name=radioDirection]:checked').val();
					option.scope = $(form).find('[name=radioScope]:checked').val();

					mySheet.replaceAll(option);
				}
			}
		});
		
		findDialog.checkButtons = function(cellText) {
			if ($('#find-dialog').css('display') != 'none')
			{
				var form = document.forms['form-find'];
				var findText = form.txtFind.value;
				var replaceText = form.txtReplace.value;
				
				$('#find-dialog').parent().find('.ui-dialog-buttonset button').each(function(idx, btn) {
					if (btn.innerText == 'Find' || btn.innerText == 'Replace All')
					{
						if (findText == '')
						{
							$(btn).prop('disabled', true);
							$(btn).addClass('disabled');
						}
						else
						{
							$(btn).prop('disabled', false);
							$(btn).removeClass('disabled');
						}
					}
					else if (btn.innerText == 'Replace/Find' || btn.innerText == 'Replace')
					{
						if (findText != '')
						{
							if (cellText.indexOf(findText) >= 0)
							{
								$(btn).prop('disabled', false);
								$(btn).removeClass('disabled');
							}
							else
							{
								$(btn).prop('disabled', true);
								$(btn).addClass('disabled');
							}
						}
						else
						{
							$(btn).prop('disabled', true);
							$(btn).addClass('disabled');							
						}
					}
				});
			}
		};
	}
	
	findDialog.dialog('open');
	var cellText = mySheet.getCurrentCellText();
	findDialog.checkButtons(cellText);
}

// 설정 버튼 클릭 시 호출
function onSetOption()
{
	var table = $('#field-option-list');
	table.find('tr').each(function(index, obj) {
		if (index != 0)
			$(obj).remove();
	});

	for (var i = 0; i < userColumnList.length; i++)
	{
		var cinfo = userColumnList[i];
		var tr = $('<tr></tr>');

		var cname = 'c-' + cinfo.key;
		if (cinfo.visible == true)
		{
			var td1 = $('<td><input type="checkbox" name="' + cname + '" value="1" checked="checked"></td>');
			tr.append(td1);
		}
		else
		{
			var td1 = $('<td><input type="checkbox" name="' + cname + '" value="1"></td>');
			tr.append(td1);
		}

		var td2 = $('<td>' + cinfo.label + '</td>');
		tr.append(td2);

		var lname = 'l-' + cinfo.key;
		var td3 = $('<td><input type="text" name="' + lname + '" value="' + cinfo.width + '" class="ipt"></td>');
		tr.append(td3);

		table.append(tr);
	}

	$('#field-option-list').find('tbody').sortable();
	$('#option-dialog').dialog("open");
}

// 저정버튼 클릭 시 호출
function onSave()
{
	chrome.identity.getAuthToken({interactive:true}, function(token) {
		authToken = token;
		mySheet.syncContacts(contactIO);
	});
}

function onAddContact()
{
	mySheet.prepareAddContact();
}


var contactIO = null;

// 서버로부터 주소록을 가져온다.
// 성공적으로 가져온 경우, 화면에 표시한다.
function loadContacts()
{
	//getAuthToken({interactive:true}, function(token) {
	chrome.identity.getAuthToken({interactive:true}, function(token) {
		authToken = token;
		console.log('token' + token);

		contactIO.loadContactGroupList(function(groupList) {
			showWaitScreen();
			var contactGroupList = groupList;
			
			contactIO.loadContactList(null, null, 1, 20000, function(contactList) {
				
				var key = userColumnList[0].key;
				var subkey = 'family-name';

				if (key == 'full-name')
					subkey = 'family-name';
				else
					subkey = 'full-name';

				contactIO.sortContactList(contactList, key, subkey);
				mySheet.setContactList(contactGroupList, contactList);
				
				hideWaitScreen();
			});

		});
	});
}

function createUserOption(columnList)
{
	var userOption = new Object();
	var userColumnList = new Array();

	for (var i = 0; i < columnList.length; i++)
	{
		if (columnList[i].visible)
		{
			var ci = new Object();
			ci.label = columnList[i].label;
			ci.key = columnList[i].key;
			ci.width = columnList[i].width;
			userColumnList.push(ci);
		}
	}

	userOption['columnInfo'] = userColumnList;
	return userOption;
}

// 프로그램 시작 시 호출되며, 프로그램을 초기화한다.
function main()
{
	contactIO = new ContactIO();

	String.prototype.replaceAll = function(org, dst) {
		return this.split(org).join(dst);
	};

	document.forms['form-navi'].onsubmit = onQueryContacts;
	
	// 메인 버튼의 핸들러를 등록한다.
	$('#btn-submit').on('click', onQueryContacts);
	$('#btn-option').on('click', onSetOption);
	$('#btn-refresh').on('click', onRefresh);
	$('#btn-find').on('click', onFind);
	$('#btn-save').on('click', onSave);

	$('#btn-add-contact').on('click', onAddContact);
	
	// Find-Dialog의 키보드 포커스를 뺏기위한 코드입니다.
	$('#test-input').on('keydown', function(event) {
		
		if (event.keyCode == 90) // 'z'
		{
			if (event.metaKey)
			{
				event.preventDefault();
				if (event.shiftKey)
				{
					mySheet.redo();									
				}
				else
				{
					mySheet.undo();
				}
				return;
			}
		}

	});

	// Copy명령을 처리하기 위한 핸들러
	$(document).bind('copy', function(e) {
		
		var tagName = event.target.tagName;
		var editing = $(event.target).attr('editing');

		if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && (typeof editing == 'undefined' || editing == 'true'))
			return;

		if ($(event.target).attr('editing') != 'true')
		{
			var selectedRows = mySheet.getSelectedRows();

			if (selectedRows != null && selectedRows.length > 0)
			{
				var text = mySheet.getCurrentCellText();
				e.originalEvent.clipboardData.setData('text', text);
				var jsonString = mySheet.getClipboardData();
				e.originalEvent.clipboardData.setData('text/json', jsonString);

				e.preventDefault();

				mySheet.clipboardData = new Object();
				mySheet.clipboardData.text = text;
				mySheet.clipboardData.jsonString = jsonString;
			}
			else
			{
				var text = mySheet.getCurrentCellText();
				e.originalEvent.clipboardData.setData('text', text);
				var jsonString = mySheet.getClipboardData();
				e.originalEvent.clipboardData.setData('text/json', jsonString);

				e.preventDefault();

				mySheet.clipboardData = new Object();
				mySheet.clipboardData.text = text;
				mySheet.clipboardData.jsonString = jsonString;
			}
		}
	});

	// Paste명령을 처리하기 위한 핸들러
	$(document).bind('paste', function(e) {
		
		var tagName = event.target.tagName;
		var editing = $(event.target).attr('editing');

		if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && (typeof editing == 'undefined' || editing == 'true'))
			return;

		if ($(event.target).attr('editing') != 'true')
		{
			var text = e.originalEvent.clipboardData.getData('text');
			var jsonString = e.originalEvent.clipboardData.getData('text/json');
			
			if (jsonString != null && jsonString != '')
			{
				mySheet.pasteClipboardData(jsonString);
			}
			else
			{
				mySheet.pasteText(text);
			}
			
			e.preventDefault();
		}
	});

	// Cut명령을 처리하기 위한 핸들러
	$(document).bind('cut', function(e) {
		
		var tagName = event.target.tagName;
		var editing = $(event.target).attr('editing');

		if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && (typeof editing == 'undefined' || editing == 'true'))
			return;
			
		if ($(event.target).attr('editing') != 'true')
		{
			if (mySheet.getSelectionCount() == 0)
			{
				var text = mySheet.getCurrentCellText();
				e.originalEvent.clipboardData.setData('text', text);
				var jsonString = mySheet.getClipboardData();
				e.originalEvent.clipboardData.setData('text/json', jsonString);

				e.preventDefault();

				mySheet.clipboardData = new Object();
				mySheet.clipboardData.text = text;
				mySheet.clipboardData.jsonString = jsonString;

				mySheet.deleteSelectedCellText();
			}
			else
			{
				var text = mySheet.getCurrentCellText();
				e.originalEvent.clipboardData.setData('text', text);
				var jsonString = mySheet.getClipboardData();
				e.originalEvent.clipboardData.setData('text/json', jsonString);
				
				mySheet.deleteSelectedCellText();
				mySheet.clearSelection();

				e.preventDefault();

				mySheet.clipboardData = new Object();
				mySheet.clipboardData.text = text;
				mySheet.clipboardData.jsonString = jsonString;
			}
		}
	});
	
	// 사용자 설정 정보를 읽어들이고, 설정 정보에 의거하여 시트를 작성한다.
	loadUserOption(function(columnList) {
		
		// 이전에 저장된 정보가 없으면 디폴트 정보를 저장한다.
		if (columnList == null || Array.isArray(columnList) == false)
		{
			saveUserOption(defaultColumnList);
			columnList = defaultColumnList;
		}

		userColumnList = columnList;
		var userOption = createUserOption(columnList);
		
		// 테이블 시트를 작성한다.
		mySheet = $('.table_wrap').ionContactSheet(userOption);
		
		// 설정 다이얼로그를 만든다.
		$('#option-dialog').dialog({
		    autoOpen : false, 
		    modal : true, 
		    show : "none", // effect 
		    hide : "none",
		    buttons: [{text: "확인", click:function() {userOptionChanged(); $(this).dialog('close');} },
		    		{text: "취소", click:function() { $(this).dialog('close');}}] 
		});

		// 시차를 두고 주소록을 읽어 들인다.
		setTimeout(function() {
			loadContacts();
		}, 200);
	});	
}

document.addEventListener('DOMContentLoaded', function () {
	main();
});
