var utils =	require("@/common/kit/utils");


module.exports = {
	CLICK: utils.isMobile && ("ontouchstart" in window) ? "touchstart" : "click",

	eachElement: function(elementOrNodeList, fn /* *arguments */){
		var nodeList;
		var extraArgs = [];
		var i, l, tmpElem;
		if(typeof fn !== "function") return;
		nodeList = _isNodeList(elementOrNodeList) ? elementOrNodeList : [elementOrNodeList];
		// parse extra arguments
		for(i = 2, l = arguments.length; i < l; ++i){
			extraArgs.push(arguments[i]);
		}
		for(i = 0, l = nodeList.length; i < l; ++i){
			(tmpElem = nodeList[i]) && fn.apply(null, [tmpElem].concat(extraArgs));
		}
	},

	// 触发事件，对于 ie8 只支持原生事件，不支持自定义事件
	trigger: function(element, eventName){
		var ev;
		if(document.createEvent){
			ev = document.createEvent("HTMLEvents");
			ev.initEvent(eventName, true, false);
			element.dispatchEvent(ev);
		}
		else{
			element.fireEvent("on" + eventName);
		}
	},

	addClass: function(elementOrNodeList, className){
		this.eachElement(elementOrNodeList, _addClass, className);
		return elementOrNodeList;
	},

	removeClass: function(elementOrNodeList, className){
		this.eachElement(elementOrNodeList, _removeClass, className);
		return elementOrNodeList;
	},

	hasClass: function(elem, className){
		if(!elem) return false;
		return _hasClass(elem, className);
	},

	toggleClass: function(element, className, stateValue){
		var ifNeedAddClass;
		if(!element || !className) return;

		ifNeedAddClass = typeof stateValue === "undefined"
			? !_hasClass(element, className)
			: stateValue;

		if(ifNeedAddClass){
			_addClass(element, className);
		}
		else{
			_removeClass(element, className);
		}
	},

	appendHTMLTo: function(element, html){
		var children;
		var el;
		var tmpDiv = document.createElement("div");
		var documentFragment = document.createDocumentFragment();

		if(!element) return false;

		tmpDiv.innerHTML = html;
		children = tmpDiv.childNodes;
		el = children[0];
		while(children.length > 0){
			documentFragment.appendChild(children[0]);
		}
		element.appendChild(documentFragment);
		return el;
	},

	appendHTMLToBody: function(html){
		return this.appendHTMLTo(document.body, html);
	},

	createElementFromHTML: function(html){
		var tmpDiv = document.createElement("div");
		tmpDiv.innerHTML = html;
		return tmpDiv.childNodes[0];
	},

	removeDom: function(elem){
		if(!elem) return;
		if(elem.remove){
			elem.remove();
		}
		else if(elem.parentNode){
			elem.parentNode.removeChild(elem);
		}
		else{

		}
	},
};

function _isNodeList(nodes){
	var stringRepr = Object.prototype.toString.call(nodes);
	return typeof nodes === "object"
		&& /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr)
		&& typeof nodes.length === "number"
		&& (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
}

function _addClass(elem, className){
	if(!_hasClass(elem, className)){
		elem.className += " " + className;
	}
}

function _removeClass(elem, className){
	if(_hasClass(elem, className)){
		elem.className = (
			(" " + elem.className + " ")
			.replace(new RegExp(" " + className + " ", "g"), " ")
		).trim();
	}
}

function _hasClass(elem, className){
	return !!~(" " + elem.className + " ").indexOf(" " + className + " ");
}
