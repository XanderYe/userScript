// ==UserScript==
// @name         收藏猫匿名下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  无需登录即可下载插件
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://chrome.pictureknow.com/extension*
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($) {
  function initData() {
    var dataDom = $("#__NEXT_DATA__");
    if (dataDom.length > 0 && dataDom[0].innerText) {
      var data = JSON.parse(dataDom[0].innerText);
      var downloadUrl = data.props.pageProps.result.data.crx_three;
      changeBtn(downloadUrl);
    } else {
      setTimeout(function () {
        initData();
      }, 100)
    }
  }

  function changeBtn(downloadUrl) {
    setTimeout(function () {
      $(".link span a").remove();
      var btn = $("<span>", {
        text: "下载插件手动安装",
        click: function () {
          location.href = downloadUrl;
        }
      }).css({
        cursor: "pointer",
        margin: "0 auto 20px",
        display: "inline-block",
        height: "40px",
        padding: "0 20px",
        "line-height": "40px",
        color: "#fff",
        "border-radius": "50px",
        "text-align": "center",
        "background-color": "#222",
        "transition": "all 0.2s ease",
        "text-decoration": "none!important",
        "margin-right": "20px"});
      $(".link span").append(btn);
    }, 200);
  }

  initData();
});
