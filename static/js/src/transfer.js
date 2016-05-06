window.easemobIM = window.easemobIM || function () {};
window.easemobim = window.easemobim || function () {};

easemobim.Transfer = easemobIM.Transfer = (function () {
	'use strict'
	
    var handleMsg = function ( e, callback ) {
        if ( JSON && JSON.parse ) {
            var msg = e.data;
            msg = JSON.parse(msg);
            typeof callback === 'function' && callback(msg);
        }
    };

    var Message = function ( iframeId ) {
        if ( !(this instanceof Message) ) {
             return new Message(iframeId);
        }
        this.iframe = document.getElementById(iframeId);
        this.origin = location.protocol + '//' + location.host;
    };

    Message.prototype.send = function ( msg ) {

        msg.origin = this.origin;
        msg = JSON.stringify(msg);

        if ( this.iframe ) {
            this.iframe.contentWindow.postMessage(msg, '*');
        } else {
            window.parent.postMessage(msg, '*');
        }
        return this;
    };

    Message.prototype.listen = function ( callback ) {

        if ( window.addEventListener ) {
            window.addEventListener('message', function ( e ) {
                handleMsg(e, callback);
            }, false);
        } else if ( window.attachEvent ) {
            window.attachEvent('onmessage', function ( e ) {
                handleMsg(e, callback);
            });
        }
        return this;
    };

    return Message;
}());
