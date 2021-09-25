// ==UserScript==
// @name         去广告/去弹窗/优化
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  去掉各个网站的登录弹窗等辣鸡信息，优化某些功能
// @author       XanderYe
// @require      http://lib.baomitu.com/clipboard.js/1.7.1/clipboard.min.js
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/optimize.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://www.zhihu.com/question/*
// @match        http*://zhuanlan.zhihu.com/p/*
// @match        http*://*.csdn.net/*
// @match        http*://www.iqiyi.com/*.html
// @match        http*://www.bilibili.com/*
// @match        http*://bbs.hupu.com/*.html
// @match        http*://jingyan.baidu.com/article/*
// @match        http*://dnf.qq.com/gift.shtml
// @match        http*://leetcode-cn.com/problems/*
// @match        http*://www.770dy.com/*/*.html
// @match        http*://*.pcauto.com.cn/*
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($){
    var newStyle = document.createElement("style");
    var newNode;
    if (website("zhuanlan.zhihu")) {
        // 知乎干掉登录弹窗、推荐图书
        newNode = document.createTextNode("html {overflow: auto !important;} .Modal-backdrop, .MCNLinkCard {display: none !important} .Modal-closeIcon {fill: #8590a6 !important}");
        // 监控登录窗，干掉2次弹窗
        var interval = setInterval(function () {
            signFlowModal = $("body .signFlowModal");
            if (signFlowModal.length > 0) {
                signFlowModal.parent().parent().remove();
                clearInterval(interval);
            }
        },100);
    } else if (website("zhihu")) {
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
        // CSDN 隐藏登录弹窗 去除登录复制
        newNode = document.createTextNode(".passport-container,#passportbox,.passport-login-mark,.leftPop,.opt-box,.signin {display: none !important} .comment-list-box {max-height: none !important} .htmledit_views code ol li{height: 26px !important} code {user-select: text!important}");
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
    } else if (website("leetcode")) {
        [...document.querySelectorAll('*')].forEach(item=>{
            item.oncopy = function(e) {
                e.stopPropagation();
            }
        });
    } else if (website("770dy")) {
        $("body").on("click", ".fed-conv-btn", function () {
            console.log($(this).html())
            if ($(this).html() == "影片下载") {
                var linkDoms = $("body > div.fed-main-info.fed-min-width > div > div > div.fed-main-left.fed-col-xs12.fed-col-md9 > div > div.fed-conv-info.fed-part-layout.fed-margin-right.fed-back-whits > div.fed-conv-deta > div.fed-conv-boxs.fed-conv-down.fed-tabs-info.fed-tabs-down.fed-conv-double.fed-hidden.fed-show > div:nth-child(2) > div.fed-tabs-foot > ul > li > div.fed-conv-input.fed-col-xs4.fed-col-sm3 > input");
                var linkArray = [];
                for (linkDom of linkDoms) {
                    linkArray.push($(linkDom).val());
                }
                var links = linkArray.join("\r\n");
                $(".fed-tabs-head").eq(3).find(".fed-tabs-top").eq(0).append('<a rel="nofollow" id="cpybtn" class="fed-tabs-btn fed-btns-info fed-rims-info fed-part-eone fed-btns-green" href="javascript:;" data-clipboard-text="' + links + '" style="width: 140px;position: absolute;top: 8px;left: 60px">一键复制链接</a>');
            }
        })
        var clipboard = new Clipboard('#cpybtn');
        clipboard.on('success', function(e) {
            alert("复制成功");
        });
        clipboard.on('error', function(e) {
            console.log(e);
        });
    } else if (website("pcauto")) {
        newNode = document.createTextNode("#hf-pop {display: none !important}");
    }

    if (newNode !== undefined) {
        newStyle.appendChild(newNode);
        document.head.appendChild(newStyle);
    }

    function website(keyword) {
        return location.host.indexOf(keyword) > -1;
    }
})
