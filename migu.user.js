// ==UserScript==
// @name         咪咕音乐下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  咪咕音乐免费下载无损音乐
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://music.migu.cn/v3/music/player/audio
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){

  init();

  function init() {
    let downloadBtn = $(".cf-player-download");
    if (downloadBtn.length > 0) {
      initBtn();
    } else {
      setTimeout(function () {
        init();
      }, 100);
    }
  }

  function initBtn() {
    var downloadBtn = $(".cf-player-download");
    downloadBtn.parent().removeClass("J_OrderLink");
    downloadBtn.unbind().bind("click", function () {
      var link = document.createElement('a');
      link.download = getFilename();
      link.style.display = 'none';
      link.target = "_blank";
      link.href = $("#migu_audio").attr("src");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  function getFilename() {
    var as = $(".song-mate").find("a");
    var filename = as.eq(0).html() + "-";
    if (as.length > 1) {
      for (var i = 1; i < as.length; i++) {
        filename += as.eq(i).html() + "/";
      }
    }
    return filename.substring(0, filename.length - 1);
  }
})
