// ==UserScript==
// @name         去广告/去弹窗/优化
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  去掉各个网站的登录弹窗等辣鸡信息，优化某些功能
// @author       XanderYe
// @require      http://lib.baomitu.com/clipboard.js/1.7.1/clipboard.min.js
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/optimize.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://www.zhihu.com/question/*
// @match        http*://*.csdn.net/*
// @match        http*://www.iqiyi.com/*.html
// @match        http*://www.bilibili.com/*
// @match        http*://bbs.hupu.com/*.html
// @match        http*://jingyan.baidu.com/article/*
// @match        http*://dnf.qq.com/gift.shtml
// @match        http*://www.pianku.tv/py/*
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($){
    var newStyle = document.createElement("style");
    var newNode;
    if (website("zhihu")) {
        // 知乎干掉登录弹窗、推荐图书
        newNode = document.createTextNode("html {overflow: auto !important;} .Modal-backdrop, .MCNLinkCard {display: none !important} .Modal-closeIcon {fill: #8590a6 !important}");
        // 监控登录窗，干掉2次弹窗
        var signFlowModal = null;
        var count = 0;
        var interval = setInterval(function () {
            signFlowModal = $("body .signFlowModal");
            if (signFlowModal.length > 0) {
                signFlowModal.parent().parent().remove();
                count++;
            }
            if (count == 2) {
                clearInterval(interval);
            }
        },100);
        // 知乎不加载图片的问题
        var images = $("img");
        for(var i = 0; i < images.length; i++) {
            var src = images.eq(i).attr("src");
            if(src.indexOf("data") > -1) {
                images.eq(i).attr("src", images.eq(i).attr("data-actualsrc"));
            }
        }
    } else if (website("csdn")) {
        // CSDN
        newNode = document.createTextNode(".login-mark,.login-box,.leftPop,.opt-box {display: none !important} .comment-list-box {max-height: none !important} .htmledit_views code ol li{height: 26px !important}");
    } else if (website("iqiyi")) {
        // 爱奇艺
        newNode = document.createTextNode("div[templatetype=common_pause] {display: none !important}");
    } else if (website("bilibili")) {
        // B站
        newNode = document.createTextNode(".gg-floor-module, #slide_ad, .gg-window .operate-card,.banner-card.b-wrap:nth-of-type(1) {display: none !important}");
    }  else if (website("hupu")) {
        // 虎扑去除方向键上下页
        document.onkeydown = function(){}
    } else if (website("jingyan.baidu")) {
        // 关闭百度经验浮动视频
        $(".video-originate-container").remove();
    } else if (website("dnf.qq.com")) {
        newNode = document.createTextNode("#cpybtn {cursor: pointer}")
        $("#logined").append("<a id='cpybtn'  data-clipboard-text='" + document.cookie + "'>复制cookie</a>");
        var clipboard = new Clipboard('#cpybtn');
        clipboard.on('success', function(e) {
            alert("复制成功");
        });
        clipboard.on('error', function(e) {
            console.log(e);
        });
    } else if (website("pianku")) {
        remove();
        function remove() {
            if ($("#pp").length != 0) {
                adremove();
            } else {
                setTimeout(function () {
                    remove();
                }, 500);
            }
        }
    }
    if (newNode !== undefined) {
        newStyle.appendChild(newNode);
        document.head.appendChild(newStyle);
    }

    function website(keyword) {
        return location.host.indexOf(keyword) > -1;
    }
})