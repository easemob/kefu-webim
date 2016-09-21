easemobim.EventEnumDom = (function () {

    return {
        get: function ( msg, custom ) {
            var word = msg || '',
                dom = null;

            //根据需求custom 当前只控制排队中
            if ( msg !== easemobim.eventEnum.LINK || custom !== 'hide' ) {
                dom = document.createElement('div');
                easemobim.utils.html(dom, custom || word);
                easemobim.utils.addClass(dom, 'easemobWidget-event');
            }
            return dom;
        }
    }
}());
