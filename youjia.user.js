// ==UserScript==
// @name         有驾对比增强
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  有驾对比页面高亮不一样的配置
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/youjia.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://youjia.baidu.com/view/constrast*
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($){

  compare();

  function compare() {
    // 参数长度 纵轴
    var len = $(".car-item").eq(0).children(".item-subname").length;
    if (len && len != 0) {
      // 型号数 横轴
      var carItemLen = $(".car-item").length - $(".car-item.user-custom").length;
      for (var i = 0; i < len; i++) {
        var equal = true;
        for (var j = 1; j < carItemLen; j++) {
          var a = $(".car-item").eq(j - 1);
          var b = $(".car-item").eq(j);
          var itemA = a.children(".item-subname").eq(i).html();
          var itemB = b.children(".item-subname").eq(i).html();
          if (itemA != itemB) {
            equal = false;
            break;
          }
        }
        if (!equal) {
          for (var j = 0; j < carItemLen; j++) {
            var item = $(".car-item").eq(j).children(".item-subname").eq(i);
            item.css("color", "red");
            item.find(".parameter-std").css("background", "red");
            item.find(".parameter-line").css("border-bottom", "1px solid red");
          }
        }
      }
    } else {
      setTimeout(function () {
        compare();
      }, 100);
    }
  }
})
