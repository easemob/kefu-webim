window.easemobim = window.easemobim || {};

//每页历史记录条数
easemobim.LISTSPAN = 10;

//支持的图片格式
easemobim.PICTYPE = {
	jpg: true,
	gif: true,
	png: true,
	bmp: true
};

//自定义支持的文件格式
easemobim.FILETYPE = {
	zip: true,
	doc: true,
	docx: true,
	txt: true,
	gif: true
};

//loading element
easemobim.LOADING = !easemobim.utils.isQQBrowserInAndroid && !(easemobim.utils.getIEVersion && easemobim.utils.getIEVersion === 9)
    ? ["<div class='easemobWidget-loading'><svg version='1.1' id='图层_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'",
    " viewBox='0 0 70 70' enable-background='new 0 0 70 70' xml:space='preserve'>",
    "<circle opacity='0.3' fill='none' stroke='#000000' stroke-width='4' stroke-miterlimit='10' cx='35' cy='35' r='11'/>",
    "<path fill='none' stroke='#E5E5E5' stroke-width='4' stroke-linecap='round' stroke-miterlimit='10' d='M24,35c0-6.1,4.9-11,11-11",
    "c2.8,0,5.3,1,7.3,2.8'/><image src='//kefu.easemob.com/webim/static/img/loading.gif' width='20' style='margin-top:10px;' /></svg></div>"].join('')
    : "<img src='//kefu.easemob.com/webim/static/img/loading.gif' width='20' style='margin-top:10px;'/>";

//当前支持的所有主题
easemobim.THEME = {
    '天空之城': {
        css: 'body .theme-color{color:#42b8f4;}body .bg-color{background-color:#42b8f4}.border-color{border:1px solid #00a0e7}.hover-color{background-color:#7dcdf7}'
    }
    , '丛林物语': {
        css: 'body .theme-color{color:#00b45f;}body .bg-color{background-color:#00b45f}.border-color{border:1px solid #009a51}.hover-color{background-color:#16cd77}'
    }
    , '红瓦洋房': {
        css: 'body .theme-color{color:#b50e03;}body .bg-color{background-color:#b50e03}.border-color{border:1px solid #811916}.hover-color{background-color:#e92b25}'
    }
    , '鲜美橙汁': {
        css: 'body .theme-color{color:#ffa000;}body .bg-color{background-color:#ffa000}.border-color{border:1px solid #f69000}.hover-color{background-color:#ffb63b}'
    }
    , '青草田间': {
        css: 'body .theme-color{color:#9ec100;}body .bg-color{background-color:#9ec100}.border-color{border:1px solid #809a00}.hover-color{background-color:#bad921}'
    }
    , '湖光山色': {
        css: 'body .theme-color{color:#00cccd;}body .bg-color{background-color:#00cccd}.border-color{border:1px solid #12b3b4}.hover-color{background-color:#38e6e7}'
    }
    , '冷峻山峰': {
        css: 'body .theme-color{color:#5b799a;}body .bg-color{background-color:#5b799a}.border-color{border:1px solid #48627b}.hover-color{background-color:#6a8eb5}'
    }
    , '月色池塘': {
        css: 'body .theme-color{color:#3977cf;}body .bg-color{background-color:#3977cf}.border-color{border:1px solid #2b599b}.hover-color{background-color:#548bdc}'
    }
};

//表情包
Easemob.im.EMOTIONS = {
    path: 'static/img/faces/'
    , map: {
        '[):]': 'ee_1.png',
        '[:D]': 'ee_2.png',
        '[;)]': 'ee_3.png',
        '[:-o]': 'ee_4.png',
        '[:p]': 'ee_5.png',
        '[(H)]': 'ee_6.png',
        '[:@]': 'ee_7.png',
        '[:s]': 'ee_8.png',
        '[:$]': 'ee_9.png',
        '[:(]': 'ee_10.png',
        '[:\'(]': 'ee_11.png',
        '[:|]': 'ee_12.png',
        '[(a)]': 'ee_13.png',
        '[8o|]': 'ee_14.png',
        '[8-|]': 'ee_15.png',
        '[+o(]': 'ee_16.png',
        '[<o)]': 'ee_17.png',
        '[|-)]': 'ee_18.png',
        '[*-)]': 'ee_19.png',
        '[:-#]': 'ee_20.png',
        '[:-*]': 'ee_21.png',
        '[^o)]': 'ee_22.png',
        '[8-)]': 'ee_23.png',
        '[(|)]': 'ee_24.png',
        '[(u)]': 'ee_25.png',
        '[(S)]': 'ee_26.png',
        '[(*)]': 'ee_27.png',
        '[(#)]': 'ee_28.png',
        '[(R)]': 'ee_29.png',
        '[({)]': 'ee_30.png',
        '[(})]': 'ee_31.png',
        '[(k)]': 'ee_32.png',
        '[(F)]': 'ee_33.png',
        '[(W)]': 'ee_34.png',
        '[(D)]': 'ee_35.png'
    }
};
