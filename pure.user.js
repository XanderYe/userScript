// ==UserScript==
// @name         网站净化助手
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  去掉各个网站的登录弹窗等辣鸡信息，优化某些功能
// @author       XanderYe
// @require      http://lib.baomitu.com/clipboard.js/1.7.1/clipboard.min.js
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @updateURL    https://cdn.jsdelivr.net/gh/XanderYe/userScript/pure.user.js
// @supportURL   https://www.xanderye.cn/
// @grant        GM_getValue
// @grant        GM_setValue
// @match        http*://zhuanlan.zhihu.com/p/*
// @match        http*://*.csdn.net/*
// @match        http*://www.iqiyi.com/*.html
// @match        http*://www.bilibili.com/*
// @match        http*://bbs.hupu.com/*.html
// @match        http*://jingyan.baidu.com/article/*
// @match        http*://dnf.qq.com/gift.shtml
// @match        http*://leetcode-cn.com/problems/*
// @match        http*://*.pcauto.com.cn/*

// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($){
    let selectorOrFunction;
    let callback;
    let waitOnce = true;
    let newStyle = document.createElement("style");
    let newNode;
    let func;

    initFunc();
    for (let key in func) {
        if (location.host.indexOf(key) > -1) {
            let isOff = GM_getValue(key) || false;
            if (!isOff) {
                func[key]();
            }
            break;
        }
    }

    if (newNode !== undefined) {
        newStyle.appendChild(newNode);
        document.head.appendChild(newStyle);
    }

    function initFunc() {
        func = {
            "zhuanlan.zhihu": () => {
                // 知乎干掉登录弹窗、推荐图书
                newNode = document.createTextNode("html {overflow: auto !important;} .Modal-backdrop, .MCNLinkCard {display: none !important} .Modal-closeIcon {fill: #8590a6 !important}");
                // 监控登录窗，干掉弹窗
                selectorOrFunction = ".signFlowModal";
                callback = () => {
                    var signFlowModal = $("body .signFlowModal");
                    if (signFlowModal.length > 0) {
                        signFlowModal.parent().parent().remove();
                    }
                };
            },
            "csdn": () => {
                // CSDN 隐藏登录弹窗 去除登录复制
                newNode = document.createTextNode(".passport-container,.passport-login-container,#passportbox,.passport-login-mark,.leftPop,.opt-box,.signin, #csdn-redpack {display: none !important} .comment-list-box {max-height: none !important} .htmledit_views code ol li{height: 26px !important} #content_views,code,pre {user-select: text!important}");
            },
            "iqiyi": () => {
                // 爱奇艺
                newNode = document.createTextNode("div[templatetype=common_pause] {display: none !important}");
            },
            "bilibili": () => {
                // B站
                newNode = document.createTextNode(".gg-floor-module, #slide_ad, .gg-window .operate-card,.banner-card.b-wrap:nth-of-type(1) {display: none !important}");
                // 复制后缀
                killCopyListener();
            },
            "hupu": () => {
                // 虎扑去除方向键上下页
                document.onkeydown = function(){}
            },
            "jingyan.baidu": () => {
                // 关闭百度经验浮动视频
                $(".video-originate-container").remove();
            },
            "dnf.qq.com": () => {
                newNode = document.createTextNode("#cpybtn {cursor: pointer}")
                $("#logined").append("<a id='cpybtn'  data-clipboard-text='" + document.cookie + "'>复制cookie</a>");
                var clipboard = new Clipboard('#cpybtn');
                clipboard.on('success', function(e) {
                    alert("复制成功");
                });
                clipboard.on('error', function(e) {
                    console.log(e);
                });
            },
            "leetcode": () => {
                killCopyListener();
            },
            "pcauto": () => {
                newNode = document.createTextNode("#hf-pop {display: none !important}");
            }
        };
        unsafeWindow.PureQAQ = {
            getDisabledConfig: () => {
                let disabledConfig = {};
                for (let key in func) {
                    disabledConfig[key] = GM_getValue(key) || false;
                }
                return disabledConfig;
            },
            enable: (key) => {
                GM_setValue(key, false);
            },
            disable: (key) => {
                GM_setValue(key, true);
            }
        }
    }

    function killCopyListener() {
        [...document.querySelectorAll('*')].forEach(item=>{
            item.oncopy = function(e) {
                e.stopPropagation();
            }
        });
    }

    if (selectorOrFunction && callback) {
        waitForKeyElements(selectorOrFunction, callback, waitOnce);
    }
})
