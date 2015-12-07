/**
  * message transfer
 */
window.easemobIM = window.easemobIM || function () {};
easemobIM.Transfer = (function () {
    
    var Message = function ( iframeId ) {
        if ( !(this instanceof Message) ) {
             return new Message();
        }
        this.iframe = document.getElementById(iframeId);
        this.origin = location.protocol + '//' + document.domain + location.port;
    };

    Message.prototype.send = function ( msg ) {

        msg.origin = this.origin;
        msg = JSON.stringify(msg);

        if ( this.iframe ) {
            this.iframe.contentWindow.postMessage(msg, '*');
        } else {
            window.parent.postMessage(msg, this.targetOrigin);
        }
        return this;
    };

    Message.prototype.listen = function ( callback ) {
        window.onmessage = function ( e ) {
            if ( JSON && JSON.parse ) {
                var msg = e.data;
                msg = JSON.parse(msg);
                this.targetOrigin = msg.data.origin;
                typeof callback === 'function' && callback(msg);
            }
        };
        return this;
    };

    return Message;
}());
