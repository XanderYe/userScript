// ==UserScript==
// @name         百度云下载链接
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  百度云下载链接
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://lib.baomitu.com/snap.svg/0.5.1/snap.svg-min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/src/main/resources/js/baidupan.user.js
// @supportURL   https://www.xanderye.cn/
// @match        *://pan.baidu.com/*
// @match        *://yun.baidu.com/*
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function ($) {
  var parsePanUrl = "http://pan.naifei.cc/?share=" + getShareId();
  getPwd(function (pwd) {
    if (pwd) {
      parsePanUrl = parsePanUrl + "&pwd=" + pwd;
    }
    initButton(parsePanUrl);
  });


  function getStrPoint(str) {
    if (str.length < 2) {
      return "0:0";
    }

    var path = "";
    var current, last = str[0].charCodeAt();
    var sum = last;
    for (var i = 1; i < str.length; i++) {
      current = str[i].charCodeAt();
      if (i == 1) {
        path = path + "M";
      } else {
        path = path + " L";
      }
      path = path + current + " " + last;
      last = current;
      sum = sum + current;
    }
    path = path + " Z";
    var index = sum % str.length;
    var data = getSnap().path.getPointAtLength(path, str[index].charCodeAt());
    return data.m.x + ":" + data.n.y;
  }

  function getShareId() {
    var match;

    match = location.href.match(/share\/init\?surl=([a-z0-9-_]+)/i);
    if (match) {
      return match[1];
    }

    match = location.pathname.match(/\/s\/1([a-z0-9-_]+)/i);
    if (match) {
      return match[1];
    }

    return null;
  }

  function getPwd(callback) {
    var shareId = getShareId(location.href);
    var params = {
      share_id: shareId,
      share_source: "baidu",
      share_point: getStrPoint(shareId),
      share_link: location.href
    };
    var pwd;
    $.ajax({
      url: "https://api.newday.me/share/disk/query",
      type: "POST",
      data: params,
      async: false,
      success: function (data) {
        if (data.code == 1) {
          pwd = data.data.share_pwd;
        }
        if (callback) {
          callback(pwd);
        }
      },
      error: function () {
        if (callback) {
          callback(pwd);
        }
      }
    })
  }

  function getSnap() {
    if (typeof Snap != "undefined") {
      return Snap;
    } else {
      return window.Snap;
    }
  }

  function showDialog(body, footer) {
    var dialog = require("system-core:system/uiService/dialog/dialog.js").verify({
      title: "度云简易分享链接提取",
      img: "img",
      vcode: "vcode"
    });

    // 内容
    $(dialog.$dialog).find(".dialog-body").html(body);

    $(dialog.$dialog).find(".dialog-footer").html(footer);

    dialog.show();
  }

  function require(name) {
    return unsafeWindow.require(name);
  }

  function initButton(parsePanUrl) {
    if ($(".x-button-box").length) {
      var html = '<a href="' + parsePanUrl + '" target="_blank" class="g-button parse-button"><span class="g-button-right"><em class="icon icon-disk" title="下载"></em><span class="text">解析链接</span></span></a>';
      $(".x-button-box").append(html);
    } else {
      setTimeout(initButton, 500);
    }
  }

  function initButtonEvent(parsePanUrl) {
    $(document).on("click", ".parse-button", function () {
      var iframe = $("<iframe></iframe>");
      iframe.attr("src", parsePanUrl);
      showDialog(iframe, "");
    });
  }
})
