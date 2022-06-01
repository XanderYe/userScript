// ==UserScript==
// @name         格式化输出bt-tracker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  格式化输出bt-tracker，用于aria2
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @supportURL   https://www.xanderye.cn/
// @match        https://ngosang.github.io/trackerslist/trackers_best.txt
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($){
  var originalData = $("pre").html();
  var res = originalData.split(/\s+/g);
  res.pop();
  $("pre").text(res.join(","));
})