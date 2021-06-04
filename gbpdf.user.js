// ==UserScript==
// @name         下载国标加密文档
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  gb688.cn支持下载加密文档
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/gbpdf.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://c.gb688.cn/bzgk/gb/showGb*
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  init();

  function init() {
    if (PDFViewerApplication) {
      var sourceEventType = "download";
      PDFViewerApplication.download = function () {
        var title = $(document).attr("title");
        var url = "";
        var fileName = title.split("|")[1] || getUrlParam("hcno") || "document" + ".pdf";
        PDFViewerApplication.pdfDocument.getData().then(function (data) {
          const blob = new Blob([data], {
            type: "application/pdf"
          });
          PDFViewerApplication.downloadManager.download(blob, url, fileName, sourceEventType);
        }).catch(function(){
          PDFViewerApplication.downloadManager.downloadUrl(url, fileName);
        });
      }

      $("#presentationMode").after('<button id="download" class="toolbarButton download hiddenMediumView" title="下载" tabindex="34" data-l10n-id="download">' +
        '<span data-l10n-id="download_label">下载</span>' +
        '</button>');
      $("#download").unbind("click").bind("click", function () {
        PDFViewerApplication.download();
      })
    } else {
      setTimeout(function () {
        init();
      }, 100);
    }
  }
  function getUrlParam(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  }
})