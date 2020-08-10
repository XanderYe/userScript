// ==UserScript==
// @name         视频网站嗅探
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  获取视频网站m3u8下载链接
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/videosniffer.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://v.qq.com/*

// ==/UserScript==
var jQ = $.noConflict(true);
jQ(function($){

    initButton();

  function initButton() {
    var parentDom;
    var clickEvent;
    if (website("v.qq.com")) {
      var svg = '<svg class="txp_icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M713.8 460.8L557.9 616.7V131.1c0-25.7-20.9-46.6-46.6-46.6-25.7 0-46.6 20.9-46.6 46.6v485.6L308.9 460.8c-18.2-18.2-47.7-18.2-65.9 0-18.2 18.2-18.2 47.7 0 65.9l235.4 235.4c4.3 4.3 9.5 7.8 15.3 10.1 0.2 0.1 0.5 0.1 0.7 0.2 5.3 2.1 11 3.3 17 3.3s11.7-1.2 17-3.3c0.2-0.1 0.5-0.1 0.7-0.2 5.8-2.4 10.9-5.8 15.3-10.1l235.4-235.4c18.2-18.2 18.2-47.7 0-65.9-18.3-18.2-47.8-18.2-66 0zM746.7 780.4H275.9c-25.7 0-46.6 20.9-46.6 46.6s20.9 46.6 46.6 46.6h470.8c25.7 0 46.6-20.9 46.6-46.6s-20.8-46.6-46.6-46.6z"></path></svg>';
      var btn = $('<button class="txp_btn video-sniffer">' + svg + '<txp data-role="txp-ui-pip-btn-label" class="txp_icon_text">下载</txp></button>');
      parentDom = $(".txp_top_btns");
      clickEvent = function() {
        var a = prompt(PLAYER._DownloadMonitor.context.dataset.title,PLAYER._DownloadMonitor.context.dataset.ckc?PLAYER._DownloadMonitor.context.dataset.currentVideoUrl:PLAYER._DownloadMonitor.context.dataset.currentVideoUrl.replace(/:.*qq.com/g,"://defaultts.tc.qq.com/defaultts.tc.qq.com"));
      }
    }
    if (parentDom.length == 1) {
      parentDom.append(btn);
      $(".video-sniffer").bind("click", clickEvent);
    } else {
      setTimeout(initButton, 500);
    }
  }

  function website(keyword) {
    return location.hostname.indexOf(keyword) > -1;
  }
})