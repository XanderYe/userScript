// ==UserScript==
// @name         有驾对比增强
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  有驾对比增强，支持对比列表勾选车型对比
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/youjia.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://www.yoojia.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){

  addCss();
  init();
  clickClose();

  function init() {
    if (location.pathname.startsWith("/s-")) {
      let compareBtn = $(".fixed-box");
      if (compareBtn.length > 0) {
        compareBtn.bind("click", function () {
          initBtn();
        })
        bindSelect();
        bindContrast();
        clickClose();
      } else {
        setTimeout(function () {
          init();
        }, 100);
      }
    }
  }

  function initBtn() {
    initCompareBtn();
    bindEmpty();
    initCheckbox();
    bindSelect();
  }

  function clickClose() {
    if (location.pathname.startsWith("/parameter/")) {
      let closeBtn = $(".close");
      console.log(closeBtn);
      if (closeBtn.length > 0) {
        closeBtn.click();
      } else {
        setTimeout(function () {
          clickClose();
        }, 100);
      }
    }
  }

  function initCompareBtn() {
    let btn = $(".start-btn");
    let dataV = getAttr(btn, "data-v");
    if ($("#compare-btn").length === 0) {
      btn.after('<div ' + dataV + ' class="start-btn" id="compare-btn">选择对比</div>');
      bindCompareBtn();
    }
  }

  function initCheckbox(callback) {
    let checkedModels = GM_getValue("checkedModels");
    getCompareModel( (data) => {
      let list = data.Result.arrData.list;
      let selectPDoms = $(".selected .selected-item");
      for (let i in selectPDoms) {
        let selectPDom = selectPDoms.eq(i);
        if (selectPDom.length > 0 && selectPDom.find(".select-box").length === 0) {
          let modelId = list[i].modelId;
          let checked = checkedModels && checkedModels.indexOf(modelId) > -1;
          let nodes = `
          <span class="c-checkbox--input ${checked ? 'is-checked' : ''}">
            <span class="c-checkbox--inner"></span>
            <input type="checkbox" class="select-box c-checkbox--original" ${checked ? "checked" : ''} model-id="${modelId}"/>
          </span>
          `;
          selectPDom.find("p").before(nodes);
        }
      }
      bindCheckbox();

      changeCompareBtnStatus();

      if (callback) {
        callback();
      }
    });
  }

  function bindCheckbox() {
    $(".c-checkbox--inner").unbind().bind("click", function () {
      let checkBoxDom = $(this).next();
      if (checkBoxDom.attr("checked")) {
        checkBoxDom.attr("checked", false);
        $(this).parent(".c-checkbox--input").removeClass("is-checked");
      } else {
        checkBoxDom.attr("checked", true);
        $(this).parent(".c-checkbox--input").addClass("is-checked");
      }
      changeCompareBtnStatus();
      GM_setValue("checkedModels", getModelIds());
    });
  }

  function bindCompareBtn() {
    $("#compare-btn").unbind().bind("click", function () {
      if ($(this).hasClass("disabled")) {
        return;
      }
      let modelIds = getModelIds();
      GM_setValue("checkedModels", modelIds);
      let open = window.open('_blank');
      open.location = "/constrast?type=model&modelIds=" + modelIds.join(",");
    })
  }

  function getModelIds() {
    let modelIds = [];
    $.each($(".select-box:checked"), (index, val) => {
      if ($(val).attr("model-id")) {
        modelIds.push($(val).attr("model-id"));
      }
    })
    return modelIds;
  }

  function bindEmpty() {
    $(".rtl h2 span").unbind().bind("click", function () {
      GM_setValue("checkedModels", []);
      changeCompareBtnStatus();
    });
  }

  function bindContrast() {
    $(document).on("click", ".list-btn.btn-contrast", function () {
      let link = $(this).prev();
      let href = link.attr("href");
      let hrefs = href.split("/");
      let modelId = hrefs[4].split("?")[0];
      let checkedModels = GM_getValue("checkedModels");
      if (checkedModels && checkedModels.length > 0) {
        checkedModels.push(modelId);
      } else {
        checkedModels = [modelId];
      }
      GM_setValue("checkedModels", checkedModels);
    })
  }

  function bindSelect() {
    $(".selector-title").unbind().bind("click", function () {
      $(".content-model").on("click", ".series", function () {
        let name = $(this).html();
        setTimeout(() => {
          initCheckbox(() => {
            let itemDom = $(".selected .item-name");
            for (let i = 0; i < itemDom.length; i++) {
              if (itemDom.eq(i).html() == name) {
                dom.prev().find(".select-box").attr("checked", true);
                break;
              }
            }
          });
        }, 100)
      })
    })
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
      url: "/api/compare/getmodel?token=1_526c1239fc0b0512a2bd13ac6b962f5f",
      success: function (data) {
        if (callback) {
          callback(data);
        }
      }
    });
  }

  function getAttr(dom, key) {
    let attrs = dom.attrs();
    if (attrs) {
      for (let k in attrs) {
        if (k.indexOf(key) > -1) {
          return k;
        }
      }
    }
  }

  function addCss() {
    let style = `
      .el-drawer__container .drawer-content {
        overflow-y: auto;
      }
      .c-checkbox--input {
        position: relative; 
        vertical-align: middle; 
        line-height: 1;
      }
      .c-checkbox--input.is-checked .c-checkbox--inner {
        border-color: #00cecf;
        background-color: #00cecf;
       }
      .c-checkbox--input .c-checkbox--inner {
        display: inline-block; 
        position: relative; 
        border: 1px solid #dcdfe6; 
        border-radius: 2px; 
        -webkit-box-sizing: border-box;
        box-sizing: border-box; 
        width: 12px; 
        height: 12px; 
        background-color: #fff; 
        z-index: 1;
        -webkit-transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46); 
        transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
      }
      .c-checkbox--input.is-checked .c-checkbox--inner:after {
        -webkit-transform: rotate(45deg) scaleY(1); 
        transform: rotate(45deg) scaleY(1);
      }
      .c-checkbox--input .c-checkbox--inner:after {
        -webkit-box-sizing: content-box; 
        box-sizing: content-box; 
        content: ""; 
        border: 1px solid #fff; 
        border-left: 0; 
        border-top: 0; 
        width: 2px; 
        height: 5px; 
        left: 4px; 
        position: absolute; 
        top: 1px; 
        -webkit-transform: rotate(45deg) scaleY(0); 
        transform: rotate(45deg) scaleY(0); 
        -webkit-transition: -webkit-transform .15s ease-in .05s; 
        transition: -webkit-transform .15s ease-in .05s; 
        transition: transform .15s ease-in .05s; 
        transition: transform .15s ease-in .05s,-webkit-transform .15s ease-in .05s; 
        -webkit-transform-origin: center; 
        transform-origin: center;
      }
      .c-checkbox--original {
        position: absolute; 
        outline: none; 
        width: 0; 
        height: 0; 
        margin: 0; 
        opacity: 0; 
        z-index: -1;
      }
      .selected .selected-item p {
        margin-left: 10px
      }
      
      .selector .container {
        z-index: 2;
      }
    `
    GM_addStyle(style);
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
