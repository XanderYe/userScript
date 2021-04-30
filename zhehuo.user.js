// ==UserScript==
// @name         这货怎么样破解
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  这货怎么样破解收费，不用输入密码就能看
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/zhehuo.user.js
// @supportURL   https://www.xanderye.cn/
// @match        *://www.xincanshu.com/*.html
// @match        *://www.xincanshu.com/*/pk*
// ==/UserScript==

var newStyle = document.createElement("style");
var newNode = document.createTextNode(".denglutishi, .logobq, .zheceng, .zheceng2021 {display: none} .paofenjietu, #chart-wrapper {filter: unset !important} .sy{background-image: unset !important}");
newStyle.appendChild(newNode);
document.head.appendChild(newStyle);

var jQ = $.noConflict(true);
jQ(function ($) {
  $("div[class^='denglutishi']").css("display", "none");
})