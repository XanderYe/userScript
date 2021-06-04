// ==UserScript==
// @name         下载国标加密文档
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  支持部分国标文档网下载加密文档
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
  let filename;

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
          download();
        })
        $(".fwr-rb-tab[component-name=component-5]").append('<li component-name="component-19"><div class="fwr_layout_flow horizontal gap_md" id="download-btn"><div class="fwr_layout_flow_item"><a class="fwr_button" component-name="component-1f"><i class="fwr-rb-icons-32 fwr-rb-toolbar-download-32"></i><span data-i18n="PCLng.ToolBar.Download" class="text">下载</span></a></div></div></li>');
        $("#download-btn").unbind("click").bind("click", function () {
          download();
        })
        function download() {
          var pdf = $(".current[data-role=docProperties]").find(".fwr-rb-file-table2").eq(0).find("td").eq(1).html();
          var url = "http://jjg.spc.org.cn/resmea/view/" + pdf.substring(0, pdf.lastIndexOf("."));
          downloadFile(url, enc);
        }
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
          var headers = getHeaders(xhr.getAllResponseHeaders());
          var contentDisposition = headers['content-disposition'];
          filename = contentDisposition.substring(contentDisposition.indexOf("filename=\"") + 10, contentDisposition.length - 1);
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
    link.download = filename || "document.pdf";
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getHeaders(headersStr) {
    var headers = {};
    for (let headerStr of headersStr.substring(1, headersStr.length - 2).split("\r\n")) {
      let headerStrs = headerStr.split(":");
      headers[headerStrs[0]] = headerStrs[1].substring(1);
    }
    return headers;
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
