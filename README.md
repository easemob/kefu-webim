环信移动客服网页端开发者版集成说明：



一.集成方式

1.下载源码：https://github.com/easemob/kefu-webim/releases tag:open_1.0

2.解压源码包，将其放到您的服务器所指向的文件目录

3.将路径static/js/中的easemob.js 引入到</body>前即可完成集成



二.文件目录

demo.html: 集成环信网页端客服demo页

h5.html: 单独使用环信网页端客服demo页

static/css/font: 网页端客服引用的iconfont

static/css/im.css: 网页端客服相关的样式

static/js/easemob.js: 包括网页端客服的配置项，引入的依赖项等。其中配置项包括见下面自定义配置示例。

static/js/im.js: 包含现有网页端客服的所有交互模块

    1.common: 简化window.URL & 添加通用日期format

    2.utils: 简单的原生js工具类

    3.autogrow: 移动端输入框高度随内容变化的插件

    4.notify: 浏览器通知方法,仅支持该方法的浏览器可用

    5.imgView: 点击图片放大

    6.ctrl + v粘贴发送截图: 仅pc端火狐，ie11，谷歌，safari等webkit内核浏览器支持

    7.聊天窗口拖拽

    8.satisfaction: 满意度评价

    9.leaveMessage: 留言，如需修改留言引导语，找到留言对应的代码模块即可修改相关代码

    10.titleSlide: 不在当前tab或聊天窗口最小化则浏览器标题滚动

    11.chat: 聊天窗口的所有交互

    12.Message: 当前所有消息类型封装，文本消息，图片消息等，开发者可改写或自定义添加类型

    13.Emotions: 环信webim自定义表情包扩展




三.配置示例

以下示例在demo.html和h5.html均有包含

<!--CONFIG DEMO-->

<script>

var easemobIM = { config: {} };

////必填////

easemobIM.config.tenantId = '';//企业id

easemobIM.config.to = '';//必填, 指定关联对应的im号

easemobIM.config.appKey = '';//必填, appKey

////非必填////

easemobIM.config.buttonText = '联系客服';//设置小按钮的文案

easemobIM.config.hide = false;//是否隐藏小的悬浮按钮

easemobIM.config.mobile = /mobile/i.test(navigator.userAgent);//是否做移动端适配

easemobIM.config.dragEnable = true;//是否允许拖拽

easemobIM.config.dialogWidth = '400px';//聊天窗口宽度,建议宽度不小于400px

easemobIM.config.dialogHeight = '500px';//聊天窗口高度,建议宽度不小于500px

easemobIM.config.defaultAvatar = 'static/img/avatar.png';//默认头像

easemobIM.config.minimum = true;//是否允许窗口最小化，如不允许则默认展开

easemobIM.config.visitorSatisfactionEvaluate = false;//是否允许访客主动发起满意度评价

easemobIM.config.soundReminder = true;//是否启用声音提醒

easemobIM.config.fixedButtonPosition = {x: '10px', y: '10px'};//悬浮初始位置，坐标以视口右边距和下边距为基准

easemobIM.config.dialogPosition = {x: '10px', y: '10px'};//窗口初始位置，坐标以视口右边距和下边距为基准

easemobIM.config.titleSlide = true;//是否允许收到消息的时候网页title滚动

easemobIM.config.error = function ( error ) { alert(error); };//错误回调

easemobIM.config.onReceive = function ( from, to, message ) { /*console.log('收到一条消息', arguments);*/ };//收消息回调

easemobIM.config.authMode = 'token' || 'password';//验证方式

easemobIM.config.user = {

    //可集成自己的用户，如不集成，则使用当前的appkey创建随机访客

    name: '',//集成时必填

    password: '',//authMode设置为password时必填,与token二选一

    token: ''//authMode设置为token时必填,与password二选一

};

</script>

配置项需要在引入easemob.js前配置完毕，接下来引入easemob.js

<script src='static/js/easemob.js'></script>




四.修改主题

static/css/im.css文件最底部包含了主题样式的设定（theme-color,bg-color,border-color,hover-color共四个属性）



五.集成用户

参考环信服务器端用户体系集成http://docs.easemob.com/doku.php?id=start:100serverintegration:20users

获取环信后台userid和password写入easemobIM.config.user完成集成指定用户




六.技能组绑定

在环信客服管理员操作面板使用相同appkey创建多个关联，并使用关联绑定技能组功能。调用easemobIM（’技能组名称’，‘IM用户id’）方法并传入指定参数完成技能组绑定

例如自定义一个按钮<button onclick='easemobIM（’技能组名称’，‘IM用户id’）'>自定义按钮</button>即可完成指定技能组功能




七.自定义消息体：

例如需要传入访客相关信息：

    var msg = new Message('txt’, conn.getUniqueId());

        msg.set({value: ‘这是一条文本消息', to: toUser});

            utils.extend(msg.body, {

            ext: {

                    weichat: {

                visitor: {

                    trueName: "张杰”,

                    qq: "123456”,

                    phone: "15811111111”,

                    companyName: "环信”,

                    userNickname: "张杰”,

                    description: "描述信息”,

                    email: "123456@qq.com”

                }

            }

        }

        });

        conn.send(msg.body);//发送消息
