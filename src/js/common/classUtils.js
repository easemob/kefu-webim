var domUtils =	require("@/common/domUtils");

var _eventSplitter = /\s+/;
var _delegateEventSplitter = /^(\S+)\s*(.*)$/;
var _cid = 0;
var _slice = [].slice;

var _Events = {
	// Bind an event to a `callback` function.
	// Passing `"all"` will bind the callback to all events fired.
	on: function(name, callback, context){
		var events;
		// name 将递归分解到单位长度
		if(
			!_eventsApi(this, "on", name, [callback, context])
			|| !callback
		){
			return this;
		}
		// name 单位长度时，记录
		this._events || (this._events = {});
		events = this._events[name] || (this._events[name] = []);
		events.push({
			callback: callback,
			context: context,
			ctx: context || this
		});
		return this;
	},
	// Bind an event to only be triggered a single time. After the first time
	// the callback is invoked, it will be removed.
	once: function(name, callback, context){
		var me = this;
		var once;
		if(
			!_eventsApi(this, "once", name, [callback, context])
			|| !callback
		){
			return this;
		}
		once = _.once(function(){
			me.off(name, once);
			// 这个 this 不是外面的 this
			callback.apply(this, arguments);
		});
		once._callback = callback;
		return this.on(name, once, context);
	},
	// Remove one or many callbacks.
	// If `context` is null, removes all callbacks with that function.
	// If `callback` is null, removes all callbacks for the event.
	// If `name` is null, removes all bound callbacks for all events.
	off: function(name, callback, context){
		var retain,	//
			ev,
			events,
			names,
			i,
			l,
			j,
			k;
		// name 将递归分解到单位长度
		if(
			!this._events
			|| !_eventsApi(this, "off", name, [callback, context])
		){
			return this;
		}
		// name 单位长度时，off events
		if(!name && !callback && !context){
			this._events = void 0;
			return this;
		}
		names = name ? [name] : _.keys(this._events);
		for(i = 0, l = names.length; i < l; i++){
			name = names[i];
			events = this._events[name];
			if(events){
				this._events[name] = retain = [];
				if(callback || context){
					for(j = 0, k = events.length; j < k; j++){
						ev = events[j];
						if(
							(
								callback && callback !== ev.callback
								&& callback !== ev.callback._callback
							)
							||
							(
								context && context !== ev.context
							)
						){
							retain.push(ev);
						}
					}
				}
				// 逐个剔除
				if(!retain.length){
					delete this._events[name];
				}
			}
		}
		return this;
	},
	// Trigger one or many events, firing all bound callbacks.
	// Callbacks are passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to receive the true name of the event as the first argument).
	trigger: function(name){
		var args;
		var events;
		var allEvents;
		if(!this._events){
			return this;
		}
		args = _slice.call(arguments, 1);
		// name 将递归分解到单位长度
		if(!_eventsApi(this, "trigger", name, args)){
			return this;
		}
		// name 单位长度时，trigger events
		events = this._events[name];
		// 如果 on 过 all，拿出 all 下的所有 cbObj 逐一执行，不管 name 匹配
		allEvents = this._events.all;
		if(events){
			_triggerEvents(events, args);
		}
		if(allEvents){
			_triggerEvents(allEvents, arguments);
		}
		return this;
	},
	listen: function(obj, name, callback, once){
		// 此时 this 是 view 实例
		var listeningTo = this._listeningTo || (this._listeningTo = {});
		var id = obj._listenId || (obj._listenId = _.uniqueId("l"));
		// 信使被记录，随机的 id 作为 key
		listeningTo[id] = obj;
		// 本句忽略，不常用
		if(!callback && typeof name === "object"){
			callback = this;
		}
		// this 是这里绑定的
		once
			? obj.once(name, callback, this)
			: obj.on(name, callback, this);
		return this;
	},
	listenTo: function(obj, name, callback){
		return this.listen(obj, name, callback, false);
	},
	listenToOnce: function(obj, name, callback){
		return this.listen(obj, name, callback, true);
	},
	// Tell this object to stop listening to either specific events ... or
	// to every object it's currently listening to.
	stopListening: function(obj, name, callback){
		var listeningTo = this._listeningTo;
		var id;
		var remove;
		if(!listeningTo){
			return this;
		}
		remove = !name && !callback;
		if(!callback && typeof name === "object"){
			callback = this;
		}
		if(obj){
			(listeningTo = {})[obj._listenId] = obj;
		}
		for(id in listeningTo){
			obj = listeningTo[id];
			obj.off(name, callback, this);
			if(remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
		}
		return this;
	}
};

var clzUtils = {
	//
	createClass: function(protoProps, staticProps, clz){
		// var clzname = constructor.toString().match(/^function (.*)\(/)[1];
		// if(clzname) throw new Error("Class must provide a name.");
		// 代理类构造器
		clz = clz || function(){
			this.cid = ++_cid;
			this.init.apply(this, arguments);
		};
		clz.prototype.init = function(){};
		staticProps && _.extend(clz, staticProps);
		// 所有类 100% 具备 trigger 能力
		protoProps && _.extend(clz.prototype, _Events, protoProps);
		return clz;
	},

	// 具备 dom events 处理能力
	createView: function(protoProps, staticProps, name){
		var _liveEvents;
		var viewProto;
		var clz = name ? congrets : clzz;
		function clzz(){
			this.cid = ++_cid;
			this.init.apply(this, arguments);
			this.delegateEvents();
		}
		function congrets(){
			this.cid = ++_cid;
			this.init.apply(this, arguments);
			this.delegateEvents();
		}
		// 折中一下，放到类定义闭包里
		_liveEvents = {
			findWrapped: function(dom, event, oriHandler, cid){
				var targetEvtInfo;
				// _.filter return []
				var targetIndex = _.findIndex(
					this[event][cid],
					function(efo){
						return efo.elem == dom && efo.handler == oriHandler;
					}
				);
				if(~targetIndex){
					targetEvtInfo = this[event][cid][targetIndex];
					return {
						// 被 dom、eventType、oriHandler 唯一锁定的 wrapped
						wrapped: targetEvtInfo.wrapped,
						idx: targetIndex
					};
				}
			},
			isWatching: function(){
				return this.findWrapped.apply(this, arguments);
			},
			createPackage: function(cid, event){
				this[event] = this[event] || {};
				this[event][cid] = this[event][cid] || [];
			}
		};
		// 能作为索引的，尽量剥离一层，使得循环更少，对比简单
		// _liveEvents: {
		// 	event: {
		//		// 加一层 cid 是为了支持 unwatch 整个 dom
		// 		cid: [
		// 			// handler & elem 不能作为索引，就得借助一个索引
		//			{
		// 				elem: dom,
		// 				handler: handler,
		// 				wrapped: wrapped,
		// 			}
		//		]
		// 	}
		// }
		viewProto = {
			cid: -1,
			$el: document.createElement("div"),
			// 不冒泡的、延迟监听的、非子节点的、View 的，不能走 events
			events: {},
			// 修改 this 指向的 on，并缓存，否则 off 不了了就
			watchDom: function(elementsOrSelector, event, oriHandler, once){
				var selector;
				var elements;
				var wrappedHandler;
				var me = this;
				_liveEvents.createPackage(this.cid, event);
				(typeof elementsOrSelector === "string")
					? interWatch()
					: directWatch();
				function interWatch(){
					selector = elementsOrSelector;
					if(_liveEvents.isWatching(me.$el, event, oriHandler, me.cid)){
						throw new Error("重复监听");
					}
					// wrappedHandler 要处理 srcElement
					wrappedHandler = _live(
						selector,
						event,
						_.bind(oriHandler, me),
						me.$el
					);
					_liveEvents[event][me.cid].push({
						elem: me.$el,
						event: event,
						handler: oriHandler,
						wrapped: wrappedHandler,
						selector: selector,
					});
				}
				function directWatch(){
					elements = elementsOrSelector;
					if(_liveEvents.isWatching(elements, event, oriHandler, me.cid)){
						throw new Error("重复监听");
					}
					// wrappedHandler 要处理 srcElement
					wrappedHandler = _.bind(function(e){
						e.target = e.target || e.srcElement;
						oriHandler.apply(this, arguments);
					}, me);
					once
						? _one(elements, event, wrappedHandler)
						: _on(elements, event, wrappedHandler);
					_liveEvents[event][me.cid].push({
						elem: elements,
						event: event,
						handler: oriHandler,
						wrapped: wrappedHandler,
						selector: "",
					});
				}
			},
			watchDomOnce: function(elementsOrSelector, event, oriHandler){
				this.watchDom(elementsOrSelector, event, oriHandler, true);
			},
			unWatchDom: function(elements, event, oriHandler){
				var wrappedInfo;
				var wrappedInfos;
				_liveEvents.createPackage(this.cid, event);
				wrappedInfos = _liveEvents[event][this.cid];
				if(oriHandler && event && elements){
					wrappedInfo = _liveEvents.findWrapped(elements, event, oriHandler, this.cid);
					if(wrappedInfo){
						_off(elements, event, wrappedInfo.wrapped);
						wrappedInfos.splice(wrappedInfo.idx, 1);
					}
				}
				// 否则就消除改 dom 全部事件
				else if(elements){
					_.each(_liveEvents, function(typeInfo, event){
						_.each(typeInfo, function(instanceListenTo, cid){
							_.each(instanceListenTo, function(evtInfo, idx){
								_off(elements, event, evtInfo.wrapped);
								instanceListenTo.splice(idx, 1);
							});
						});
					});
				}
			},
			delegateEvents: function(events){
				return _domEventAction.apply(this, [events, true]);
			},
			undelegateEvents: function(events){
				return _domEventAction.apply(this, [events, false]);
			},
			remove: function(){
				this.removing();
				this.undelegateEvents();
				domUtils.removeDom(this.$el);
				this.stopListening();
				return this;
			},
			removing: function(){},
		};
		_.extend(viewProto, protoProps);
		return this.createClass(viewProto, staticProps, clz);
	},

	extendClass: function(parent, protoProps, staticProps){
		// 链式回溯所有上级构造器
		var child = function(){ return parent.apply(this, arguments); };
		function surrogate(){ this.constructor = child; }
		surrogate.prototype = parent.prototype;
		child.prototype = new surrogate();
		//
		staticProps && _.extend(child, parent, staticProps);
		protoProps && _.extend(child.prototype, protoProps);
		return child;
	},

	getEventsProto: function(){
		return _.clone(_Events);
	},

};

// VIEW 事件
function _eventsApi(obj, action, name, rest){
	var names;
	var i, l;
	if(!name){
		return true;
	}
	// 是否是多个 name
	if(_eventSplitter.test(name)){
		names = name.split(_eventSplitter);
		for(i = 0, l = names.length; i < l; i++){
			// on/off 执行
			obj[action].apply(obj, [names[i]].concat(rest));
		}
		return false;
	}
	return true;
}

function _triggerEvents(events, args){
	var ev,
		i = -1,
		l = events.length,
		a1 = args[0],
		a2 = args[1],
		a3 = args[2];
	switch(args.length){
	case 0:
		while(++i < l) (ev = events[i]).callback.call(ev.ctx); return;
	case 1:
		while(++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
	case 2:
		while(++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
	case 3:
		while(++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
	default:
		while(++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
	}
}

// VIEW dom event
// 需要绑定 this
function _domEventAction(events, isDelegate){
	var key;
	var method;
	var match;
	var eventName;
	var selector;
	if(!(events || (events = _.result(this, "events")))){
		return this;
	}
	isDelegate && this.undelegateEvents();
	for(key in events){
		method = events[key];
		if(!_.isFunction(method)){
			method = this[events[key]];
		}
		if(!method){
			// continue;
			throw new Error(key + " " + events[key] + ": handler is not a function");
		}
		match = key.match(_delegateEventSplitter);
		eventName = match[1];
		selector = match[2];
		// method = _.bind(method, this);
		// eventName += ".delegateEvents" + this.cid;
		if(isDelegate){
			this.watchDom(
				selector === "" ? this.$el : selector,
				eventName,
				method
			);
		}
		else{
			// 这里都是遍历 events 的，所以 off 一定是 $el
			this.unWatchDom(
				this.$el,
				eventName,
				method
			);
		}
	}
	return this;
}

function _bind(elem, evt, handler, isCapture){
	if(elem.addEventListener){
		elem.addEventListener(evt, handler, isCapture);
	}
	else if(elem.attachEvent){
		elem.attachEvent("on" + evt, handler);
	}
}
function _unbind(elem, evt, handler){
	if(elem.removeEventListener && handler){
		elem.removeEventListener(evt, handler);
	}
	else if(elem.detachEvent){
		elem.detachEvent("on" + evt, handler);
	}
}
function _on(elements, event, handler, isCapture){
	domUtils.eachElement(elements, _bind, event, handler, isCapture);
}
function _off(elements, event, handler){
	domUtils.eachElement(elements, _unbind, event, handler);
}
function _one(element, ev, handler, isCapture){
	if(!element || !ev){
		return;
	}
	_bind(element, ev, tempFn, isCapture);
	function tempFn(){
		handler.apply(this, arguments);
		_unbind(element, ev, tempFn);
	}
}
function _live(selector, ev, handler, wrapper){
	var container = wrapper || document;
	_on(container, ev, wrappedHandler);
	function wrappedHandler(e){
		var evt = e || window.event;
		var target = evt.target = evt.target || evt.srcElement;
		var parentOfTarget = target.parentNode;
		var targetList;
		var i;
		var l;
		var currentElement;
		// 兼容多种 selector 类型
		if(typeof selector === "string"){
			targetList = container.querySelectorAll(selector);
		}
		else{
			targetList = selector.length ? selector : [selector];
		}
		for(i = 0, l = targetList.length; i < l; ++i){
			currentElement = targetList[i];
			if(currentElement === target){
				handler.call(target, evt);
			}
			else if(currentElement === parentOfTarget){
				handler.call(parentOfTarget, evt);
			}
		}
	}
	return wrappedHandler;
}


module.exports = clzUtils;
