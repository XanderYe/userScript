// ==UserScript==
// @name         懂车帝增强对比
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  懂车帝对比支持自定义勾选列表中的车型
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @supportURL   https://www.xanderye.cn/
// @match        https://www.dongchedi.com/auto/series/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){

  var len = 0;

  addCss();

  function initBtn() {

    initCompareBtn();
    waitForKeyElements(() => {
      const list = $("ul.list");
      if (list && list.length > 0) {
        return list.get(0).children;
      }
      return null;
    }, initCheckbox, false);
  }

  function initCompareBtn() {
    var compareBtn = `<div class="compare-btn tw-fixed" style="left:8px;bottom:8px;cursor:pointer;z-index:2000">
      <div class="tw-rounded-2 tw-bg-common-yellow tw-pt-16 tw-pb-16 tw-pl-12 tw-pr-12 tw-flex tw-items-center">
        <p class="tw-text-common-black tw-text-14">车型对比</p>
      </div>
    </div>`;
    $("#__next").append(compareBtn);
    $(".compare-btn").unbind("click").bind("click", () => {
      if ($(".new-pk-list").hasClass("show-pk-list")) {
        $(".new-pk-list").removeClass("show-pk-list");
      } else {
        $(".new-pk-list").addClass("show-pk-list");
      }
    });
  }

  function initCheckbox() {
    let checkedCars = GM_getValue("checkedCars");
    let selectDoms = $(".new-pk-list ul li");
    let list = getPkList();
    for (let i in selectDoms) {
      if (i >= list.length) {
        return;
      }
      let selectDom = selectDoms.eq(i);
      if (selectDom.length > 0 && selectDom.find(".select-box").length === 0) {
        let carIdStr = list[i].carId + "";
        let checked = checkedCars && checkedCars.indexOf(carIdStr) > -1;
        let nodes = `
          <span style="padding-right:8px;line-height:20px;">
            <input type="checkbox" class="select-box" ${checked ? "checked" : ''} car-id="${carIdStr}"/>
          </span>
          `;
        selectDom.find(".car-name").before(nodes);
      }
    }
    bindCheckbox();
  }

  function bindCheckbox() {
    $(".select-box").unbind().bind("click", function () {
      let checkBoxDom = $(this);
      if (checkBoxDom.attr("checked")) {
        checkBoxDom.attr("checked", false);
      } else {
        checkBoxDom.attr("checked", true);
      }
      GM_setValue("checkedCars", getCarIds());
      changeCompareLink();
    });
    changeCompareLink();
  }

  function changeCompareLink() {
    console.log("=============>", getCarIds());
    let carIdStr = getCarIds().join(",");
    $(".new-pk-list").find("a").attr("href", "/auto/auto_compare/params?carIds=" + carIdStr);
  }

  function getPkList() {
    return JSON.parse(localStorage["pk-list"]);
  }

  function getCarIds() {
    let carIds = [];
    $.each($(".select-box:checked"), (index, val) => {
      if ($(val).attr("car-id")) {
        carIds.push($(val).attr("car-id"));
      }
    })
    return carIds;
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

  waitForKeyElements("#__next", initBtn, true);
})

/**
 * @description waitForKeyElements.js v1.2
 * @author CoeJoder
 * @param selectorOrFunction
 * @param callback
 * @param waitOnce
 * @param interval
 * @param maxIntervals
 */
function waitForKeyElements(selectorOrFunction,callback,waitOnce,interval,maxIntervals){if(typeof waitOnce==="undefined"){waitOnce=true;}if(typeof interval==="undefined"){interval=300;}if(typeof maxIntervals==="undefined"){maxIntervals=-1;}var targetNodes=(typeof selectorOrFunction==="function")?selectorOrFunction():document.querySelectorAll(selectorOrFunction);var targetsFound=targetNodes&&targetNodes.length>0;if(targetsFound){targetNodes.forEach(function(targetNode){var attrAlreadyFound="data-userscript-alreadyFound";var alreadyFound=targetNode.getAttribute(attrAlreadyFound)||false;if(!alreadyFound){var cancelFound=callback(targetNode);if(cancelFound){targetsFound=false;}else{targetNode.setAttribute(attrAlreadyFound,true);}}});}if(maxIntervals!==0&&!(targetsFound&&waitOnce)){maxIntervals-=1;setTimeout(function(){waitForKeyElements(selectorOrFunction,callback,waitOnce,interval,maxIntervals);},interval);}}