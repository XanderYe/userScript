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
// @match        http*://jjg.spc.org.cn/resmea/view/stdonline
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  init();

  let fileBlob;

  function init() {
    if (website("gb688")) {
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
    } else if (website("jjg.spc")) {
      var downloadBtn = $("li[data-action=download]");
      if (downloadBtn.length != 0) {
        downloadBtn.css({"color": "white", "cursor": "pointer"});
        downloadBtn.unbind("click").bind("click", function () {
          var pdf = $(".current[data-role=docProperties]").find(".fwr-rb-file-table2").eq(0).find("td").eq(1).html();
          var url = "http://jjg.spc.org.cn/resmea/view/" + pdf.substring(0, pdf.lastIndexOf("."));
          downloadFile(url, enc);
        })
      } else {
        setTimeout(function () {
          init();
        }, 100);
      }
    }
  }

  function website(keyword) {
    return location.host.indexOf(keyword) > -1;
  }

  function downloadFile(url, myfoxit) {
    if (fileBlob) {
      savePdf();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader("Content-Type", "application/pdf;charset=UTF-8");
      xhr.setRequestHeader("myfoxit", myfoxit);
      xhr.responseType = "blob";
      xhr.onload = function () {
        if (this.status === 201) {
          fileBlob = this.response;
          savePdf();
        }
      }
      xhr.send();
    }
  }

  function savePdf() {
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(fileBlob, { type: 'application/pdf;charset=utf-8'});
    link.download = "document.pdf";
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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