// ==UserScript==
// @name         网站净化助手
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  去掉各个网站的登录弹窗等辣鸡信息，优化某些功能
// @author       XanderYe
// @require      http://lib.baomitu.com/clipboard.js/1.7.1/clipboard.min.js
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @supportURL   https://www.xanderye.cn/
// @grant        GM_getValue
// @grant        GM_setValue
// @match        http*://zhuanlan.zhihu.com/p/*
// @match        http*://*.csdn.net/*
// @match        http*://www.iqiyi.com/*.html*
// @match        http*://www.bilibili.com/*
// @match        http*://bbs.hupu.com/*.html
// @match        http*://jingyan.baidu.com/article/*
// @match        http*://dnf.qq.com/gift.shtml
// @match        http*://leetcode-cn.com/problems/*
// @match        http*://*.pcauto.com.cn/*
// @match        http*://www.ithome.com/0/*/*.htm

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
                // 修改复制事件
                $("#content_views").unbind("copy").bind("copy", (e) => {
                    let text = window.getSelection().toString();
                    if (text) {
                        e.preventDefault();
                        navigator.clipboard.writeText(text);
                    }
                });
                // CSDN 隐藏登录弹窗 去除登录复制
                newNode = document.createTextNode(".passport-container,.passport-login-container,#passportbox,.passport-login-mark,.leftPop,.opt-box,.signin, #csdn-redpack {display: none !important} .comment-list-box {max-height: none !important} .htmledit_views code ol li{height: 26px !important} #content_views,code,pre {user-select: text!important}");
            },
            "iqiyi": () => {
                // 爱奇艺
                newNode = document.createTextNode("div[templatetype=common_pause] {display: none !important}");
                selectorOrFunction = ".iqp-contrls-right";
                callback = () => {
                    if ($(".iqp-player-innerlayer .iqp-btn.iqp-btn-webscreen").length > 0) {
                        return;
                    }
                    var webScreenBtn = `<iqpdiv class="iqp-btn iqp-btn-webscreen" data-player-hook="webfullenter"> 
                                  <svg id="iqp-btn-webscreen-in" class="iqp-icon iqp-icon-webscreen-inner iqp-icon-webscreen-inner-enter" aria-hidden="true"> 
                                    <use class="iqp-svg-symbol" xlink:href="#iqp-svg-webscreen-inner-enter"></use> 
                                  </svg> 
                                  <svg id="iqp-btn-webscreen-out" class="iqp-icon iqp-icon-webscreen-inner iqp-icon-webscreen-inner-exit" aria-hidden="true" style="display: none"> 
                                    <use class="iqp-svg-symbol" xlink:href="#iqp-svg-webscreen-inner-exit"></use> 
                                  </svg>
                                </iqpdiv>`;
                    $(".iqp-player-innerlayer .iqp-btn.iqp-btn-fullscreen").after(webScreenBtn);
                    $(".iqp-player-innerlayer").on("click", "#iqp-btn-webscreen-in", function () {
                        $("#iqp-btn-webscreen-in").hide();
                        $("#iqp-btn-webscreen-out").show();
                        $(".iqp-player").addClass("iqp-web-screen");
                        $("#block-A").hide();
                    })
                    $(".iqp-player-innerlayer").on("click", "#iqp-btn-webscreen-out", function () {
                        $("#iqp-btn-webscreen-in").show();
                        $("#iqp-btn-webscreen-out").hide();
                        $(".iqp-player").removeClass("iqp-web-screen");
                        $("#block-A").show();
                    })
                    document.onkeydown = function(event){
                        if (event.key === "Escape") {
                            $("#iqp-btn-webscreen-in").show();
                            $("#iqp-btn-webscreen-out").hide();
                            $(".iqp-player").removeClass("iqp-web-screen");
                            $("#block-A").show();
                        }
                    }
                };
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
            },
            "ithome": () => {
                selectorOrFunction = ".post-img-list";
                waitOnce = false;
                callback = () => {
                    let imgList = $(".post-img-list .img-placeholder");
                    for (let i = 0; i < imgList.length; i++) {
                        let imgDom = imgList.eq(i);
                        let encodedUrl = imgDom.attr("data-s");
                        let url = atob(encodedUrl);
                        imgDom.html(`<img src="${url}" style="width: 120px; cursor:zoom-in;" onclick="" />`);
                    }
                };
                $("body").delegate(".img-placeholder", "click", function(n) {
                    n.preventDefault();
                    imageViewer.show(n.target, n.target.href, n.originalEvent);
                });
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

/**
 * @description waitForKeyElements.js v1.2
 * @author CoeJoder
 * @param selectorOrFunction
 * @param callback
 * @param waitOnce
 * @param interval
 * @param maxIntervals
 */
function waitForKeyElements(selectorOrFunction,callback,waitOnce,interval,maxIntervals){if(typeof waitOnce==="undefined"){waitOnce=true;}if(typeof interval==="undefined"){interval=300;}if(typeof maxIntervals==="undefined"){maxIntervals=-1;}var targetNodes=(typeof selectorOrFunction==="function")?selectorOrFunction():document.querySelectorAll(selectorOrFunction);var targetsFound=targetNodes&&targetNodes.length>0;if(targetsFound){targetNodes.forEach(function(targetNode){var attrAlreadyFound="data-userscript-alreadyFound";var alreadyFound=targetNode.getAttribute(attrAlreadyFound)||false;if(!alreadyFound){var cancelFound=callback(targetNode);if(cancelFound){targetsFound=false;}else{targetNode.setAttribute(attrAlreadyFound,true);}}});}if(maxIntervals!==0&&!(targetsFound&&waitOnce)){maxIntervals-=1;setTimeout(function(){waitForKeyElements(selectorOrFunction,callback,waitOnce,interval,maxIntervals);},interval);}}