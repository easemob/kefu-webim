/*
 *config
 */
window.easemobConfig = {
    width: 300
    , height: 400
    , position: 'bottom'
};

/*
 *start
 */
(function(){
 
//is mobile
(function(){
    window.isMobile = /mobile/i.test(navigator.userAgent);
}());


//add css emlement
(function(){
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'imconfig.css';
    document.head.appendChild(css);

    if(isMobile) {
        css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'imconfig_m.css';
        document.head.appendChild(css);   
    }
}());


//set viewport and bind click on kefu-header if in mobile
isMobile && (function(){
    var meta = document.createElement('meta'),
        hasViewport = false;
    for(var i=0,n=document.head.childNodes,l=n.length;i<l;i++) {
        if(n[i].nodeName.toLowerCase() == 'meta'
            && n[i].getAttribute('name')
            && n[i].getAttribute('name').toLowerCase() == 'viewport') {
            hasViewport=true;
            break;
        }
    }
    if(!hasViewport) {
        meta.setAttribute('name', 'viewport');
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui');
        document.head.appendChild(meta);
    }
}());

//create im wrapper and iframe
({
    init: function(){
        
        //im wrapper
        this.easemobChat = document.getElementById('easemobChat');
        if(!!this.easemobChat) return;
        this.easemobChat = document.createElement('div');
        this.easemobChat.id = 'easemobChat';
        this.easemobChat.style.width = easemobConfig.width + 'px';
        switch(easemobConfig.position) {
            case 'bottom':
                this.easemobChat.className += ' e-bottom';
            default: break;
            //TO DO...
        }
        
        //iframe
        this.iframe = document.createElement('iframe');
        this.iframe.name = 'easemob_iframe';
        this.iframe.scrolling = 'no';
        this.iframe.src = 'im.html';
        this.easemobChat.appendChild(this.iframe);

        //header
        this.header = document.createElement('div');
        this.header.className += ' kefu-header';
        this.header.innerHTML = "<div><i></i></div><label>在线支持，联系客服</label>";
        this.easemobChat.appendChild(this.header);

        //add
        document.body.appendChild(this.easemobChat);

        if(isMobile) {
            //this.mobileLink = document.createElement('a');
            //this.mobileLink.setAttribute('href', 'im.html');
            //document.body.appendChild(this.mobileLink);
        }
        //open for the event of minize
        window.minIframe = this.minIframe();
        window.openDialog = this.openDialog;
        
        //bind events
        this.bind();
    }
    , on: function(obj, e, fn){
        if(window.addEventListener) {
            obj.addEventListener(e, fn, false);
        } else {
            obj.attachEvent('on'+e, fn);
        }
    }
    , bind: function(){
        var me = this;
        
        this.on(this.header, 'click', function(){
            !isMobile ? (
                this.style.height = 0,
                me.iframe.style.display = 'block',
                me.iframe.style.height = easemobConfig.height + 'px'
            ) : (
                location.href = 'im.html'
            );
        });

        this.on(document, 'click', function(e){
            var e = window.event || e;
            var t = e.srcElement || e.target;

            easemob_iframe && easemob_iframe.minFaceWrapper && easemob_iframe.minFaceWrapper();
        });
    }
    , minIframe: function(){
        var me = this;
        return function(){
            me.iframe.style.height = '40px';
            me.iframe.style.display = 'none';
            me.header.style.height = '40px';
        }
    }
    , openDialog: function(){
        minIframe();
        window.open ('im.html','_blank','height='+window.screen.height+',width=400,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
    }
}.init());
}());
