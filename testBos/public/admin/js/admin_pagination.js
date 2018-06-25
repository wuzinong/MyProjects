var params = new Array();
var url = '';
function setPage(container, count, pageindex, url, $params) {
	if(count == 0)return;
	var container = container;
	var count = parseInt(count);
	var pageindex = parseInt(pageindex);
	var a = [];
	params = $params;
	url = url;
	a[a.length] = '<ul class="pagination">';
	if (pageindex == 1) {
		a[a.length] = '<li class="prev disabled"><a class="paginate_button previous">« 上一页</a></li>';
	} else {
		a[a.length] = "<li class='prev'><a class='paginate_button previous'>« 上一页</a>";
	}
	function setPageList() {
		if (pageindex == i) {
			a[a.length] = '<li class="disabled current"><a class="paginate_button">'+i+'</a></li>';
		} else {
			a[a.length] = '<li class=""><a class="paginate_button">' + i + '</a></li>';
		}
	}
	if (count <= 10) {
		for (var i = 1; i <= count; i++) {
			setPageList();
		}
	} else {
		if (pageindex <= 4) {
			for (var i = 1; i <= 5; i++) {
				setPageList();
			}
			a[a.length] = '&nbsp;&nbsp;<li class=""><a class="paginate_button">' + count + '</a></li>';
		} else if (pageindex >= count - 3) {
			a[a.length] = "<li class=''><a class='paginate_button'>1</a></li>&nbsp;&nbsp;";
			for (var i = count - 4; i <= count; i++) {
				setPageList();
			}
		} else {
			a[a.length] = "<li class=''><a class='paginate_button'>1</a></li>  ";
			for (var i = pageindex - 2; i <= pageindex + 2; i++) {
				setPageList();
			}
			a[a.length] = "&nbsp;&nbsp;<li class=''><a class='paginate_button'>" + count + "</a></li>";
		}
	}
	if (pageindex == count) {
		a[a.length] = "<li class='next disabled'><a class='paginate_button'>下一页 »</a></li>";
	} else {
		a[a.length] = "<li class='next'><a class='paginate_button'>下一页 »</a></li>";
	}
	a[a.length] = '</ul>';
	container.innerHTML = a.join("");
	
	$('#pagination_container li:not(.disabled)').on('click', function(){
		if($(this).hasClass('next')){
			pageindex = parseInt($('#pagination_container .current').text()) + 1;
		}
		else if($(this).hasClass('prev')){
			pageindex = parseInt($('#pagination_container .current').text()) - 1;
		}
		else{
			pageindex = $(this).text();
		}
		page_redirect(pageindex, params);
	})
}

var page_redirect = function(pageindex, params){
	var param = '?curpage='+pageindex;
	for(key in params){
		if($('.'+params[key]).val() != '' && $('.'+params[key]).val() != undefined)param += '&'+params[key]+'='+$('.'+params[key]).val();
	}
	window.location.href = url+param;
}

