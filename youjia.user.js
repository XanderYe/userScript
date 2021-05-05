// ==UserScript==
// @name         有驾对比增强
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  有驾对比增强，支持对比列表勾选车型对比
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/youjia.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://youjia.baidu.com/view/carTrain*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

var jQ = $.noConflict(true);
jQ(function($){

  addCss();
  init();

  function init() {
    var compareBtn = $(".fixed-box");
    if (compareBtn.length > 0) {
      compareBtn.bind("click", function () {
        initBtn();
      })
    } else {
      setTimeout(function () {
        init();
      }, 100);
    }
  }

  function initBtn() {
    var checkedModels = GM_getValue("checkedModels");
    var btn = $(".start-btn");
    var dataV = getAttr(btn, "data-v");
    getCompareModel(function (data) {
      var list = data.Result.arrData.list;
      var selectPDoms = $(".selected .selected-item");
      for (var i in selectPDoms) {
        var selectPDom = selectPDoms.eq(i);
        if (selectPDom.length > 0 && selectPDom.find(".select-box").length == 0) {
          var modelId = list[i].modelId;
          var nodes;
          if (checkedModels && checkedModels.indexOf(modelId) > -1) {
            nodes = '<span class="c-checkbox--input is-checked"><span class="c-checkbox--inner"></span>' +
              '<input type="checkbox" class="select-box c-checkbox--original" checked ';
          } else {
            nodes = '<span class="c-checkbox--input"><span class="c-checkbox--inner"></span>' +
              '<input type="checkbox" class="select-box c-checkbox--original" ';
          }
          nodes = nodes + 'model-id="' + modelId + '"></span>';
          selectPDom.find("p").before(nodes);
        }
      }
      $(".c-checkbox--inner").unbind().bind("click", function () {
        var checkBoxDom = $(this).next();
        if (checkBoxDom.attr("checked")) {
          checkBoxDom.attr("checked", false);
          $(this).parent(".c-checkbox--input").removeClass("is-checked");
        } else {
          checkBoxDom.attr("checked", true);
          $(this).parent(".c-checkbox--input").addClass("is-checked");
        }
        changeCompareBtnStatus();
      });
      changeCompareBtnStatus();
    });
    if ($("#compare-btn").length == 0) {
      btn.after('<div ' + dataV + ' class="start-btn" id="compare-btn">选择对比</div>');
      changeCompareBtnStatus();
      $("#compare-btn").unbind().bind("click", function () {
        if ($(this).hasClass("disabled")) {
          return;
        }
        var modelIds = [];
        console.log($(".select-box:checked"));
        $.each($(".select-box:checked"), function (index, val) {
          if ($(val).attr("model-id")) {
            modelIds.push($(val).attr("model-id"));
          }
        })
        if (modelIds.length == 0) {
          alert("请勾选车型");
        } else {
          GM_setValue("checkedModels", modelIds);
          var open = window.open('_blank');
          open.location = "https://youjia.baidu.com/view/constrast?type=model&modelIds=" + modelIds.join(",");
        }
      })
    }
  }

  function changeCompareBtnStatus() {
    if ($(".select-box:checked").length < 2) {
      $("#compare-btn").addClass("disabled");
    } else {
      $("#compare-btn").removeClass("disabled");
    }
  }
  
  function getCompareModel(callback) {
    $.ajax({
      url: "/compare/getmodel?token=1_526c1239fc0b0512a2bd13ac6b962f5f",
      success: function (data) {
        callback(data);
      }
    });
  }

  function getAttr(dom, key) {
    var attrs = dom.attrs();
    if (attrs) {
      for (var k in attrs) {
        if (k.indexOf(key) > -1) {
          return k;
        }
      }
    }
  }

  function addCss() {
    var newStyle = document.createElement("style");
    var newNode = document.createTextNode('.c-checkbox--input {position: relative; vertical-align: middle; line-height: 1}' +
      '.c-checkbox--input.is-checked .c-checkbox--inner {border-color: #00cecf; background-color: #00cecf}' +
      '.c-checkbox--input .c-checkbox--inner {display: inline-block; position: relative; border: 1px solid #dcdfe6; border-radius: 2px; -webkit-box-sizing: border-box; box-sizing: border-box; width: 12px; height: 12px; background-color: #fff; z-index: 1; -webkit-transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46); transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);}' +
      '.c-checkbox--input.is-checked .c-checkbox--inner:after {-webkit-transform: rotate(45deg) scaleY(1); transform: rotate(45deg) scaleY(1);}' +
      '.c-checkbox--input .c-checkbox--inner:after {-webkit-box-sizing: content-box; box-sizing: content-box; content: ""; border: 1px solid #fff; border-left: 0; border-top: 0; width: 2px; height: 5px; left: 4px; position: absolute; top: 1px; -webkit-transform: rotate(45deg) scaleY(0); transform: rotate(45deg) scaleY(0); -webkit-transition: -webkit-transform .15s ease-in .05s; transition: -webkit-transform .15s ease-in .05s; transition: transform .15s ease-in .05s; transition: transform .15s ease-in .05s,-webkit-transform .15s ease-in .05s; -webkit-transform-origin: center; transform-origin: center;}' +
      '.c-checkbox--original {position: absolute; outline: none; width: 0; height: 0; margin: 0; opacity: 0; z-index: -1}' +
      '.selected .selected-item p {margin-left: 10px}');
    newStyle.appendChild(newNode);
    document.head.appendChild(newStyle);
  }

  $.fn.attrs = function() {
    if(arguments.length === 0) {
      if(this.length === 0) {
        return null;
      }

      var obj = {};
      $.each(this[0].attributes, function() {
        if(this.specified) {
          obj[this.name] = this.value;
        }
      });
      return obj;
    }

    return old.apply(this, arguments);
  };
})
