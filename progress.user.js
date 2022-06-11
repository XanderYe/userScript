// ==UserScript==
// @name         视频网站全屏显示进度条
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  使视频网站在全屏后底栏缩小后还是能显示进度
// @author       XanderYe
// @supportURL   https://www.xanderye.cn/
// @match        http*://www.iqiyi.com/*
// @match        http*://v.qq.com/*
// @match        http*://v.youku.com/*
// ==/UserScript==

(function () {
  var barStyle = document.createElement("style");
  var host = location.host;
  var barNode;
  if (host.indexOf("iqiyi") > -1) {
    barNode = document.createTextNode(".iqp-bottom-hide .iqp-progress,.iqp-bottom-hide .iqp-progress .iqp-progress-bar {height: 120% !important;}");
  } else if (host.indexOf("v.qq") > -1) {
    barNode = document.createTextNode(".txp_autohide .txp_bottom {opacity: 1 !important; bottom: -50px !important} .plugin_ctrl_txp_bottom.txp_none {display: block !important; bottom: -90px !important}");
  } else if (host.indexOf("youku") > -1) {
    var dom = '<div class="h5player-dashboard custom-dashboard" style="z-index:9001"><div class="h5player-progress"><div class="progress-hover-container"><div class="progress-container"><div class="input-range-container progress-input-range custom-range" style="display: block;"><div class="input-range-thumb js-thumb custom-thumb"></div></div><div class="progress-loaded custom-loaded"></div><div class="progress-played custom-played"></div></div></div></div></div></div>';
    $("body").append(dom);
    setInterval(function () {
      $(".custom-dashboard").css("display", $(".ykplayer-dashboard-hidden").length > 0 ? "block" : "none");
      $(".custom-thumb").css("left", $(".input-range-thumb.js-thumb").eq(1).css("left"));
      $(".custom-loaded").css("width", $(".progress-loaded").eq(1).css("width"));
      $(".custom-played").css("width", $(".progress-played").eq(1).css("width"));
    }, 200);
  }
  barStyle.appendChild(barNode);
  document.head.appendChild(barStyle);
})();
