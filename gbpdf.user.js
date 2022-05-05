// ==UserScript==
// @name         下载国标加密文档
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  支持部分国标文档网下载加密文档
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @updateURL    https://cdn.jsdelivr.net/gh/XanderYe/userScript/gbpdf.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://c.gb688.cn/bzgk/gb/showGb*
// @match        http*://jjg.spc.org.cn/resmea/standard/*
// @match        http*://jjg.spc.org.cn/resmea/view/stdonline
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  let selectorOrFunction;
  let callback;
  let waitOnce = true;
  let newStyle = document.createElement("style");
  let newNode;
  let func;

  initFunc();

  for (let key in func) {
    if (location.host.indexOf(key) > -1) {
      func[key]();
    }
  }

  if (newNode !== undefined) {
    newStyle.appendChild(newNode);
    document.head.appendChild(newStyle);
  }

  function initFunc() {
    func = {
      "jjg.spc": () => {
        if (location.pathname.indexOf("/standard/") > -1) {
          $("#detail-info > div.content > div > div.btnbox > a").unbind().bind("click", function () {
            let standNo = $(this).attr("onclick");
            standNo = standNo.substring(standNo.indexOf("'") + 1, standNo.lastIndexOf("'"));
            GM_setValue("standNo", standNo);
          });
          return;
        }
        let standNo = GM_getValue("standNo");
        let fileBlob;
        let filename;
        selectorOrFunction = "li[data-action=download]";
        callback = () => {
          var downloadBtn = $("li[data-action=download]");
          downloadBtn.css({"color": "white", "cursor": "pointer"});
          downloadBtn.unbind("click").bind("click", function () {
            download();
          })
          $(".fwr-rb-tab[component-name=component-5]").append('<li component-name="component-19"><div class="fwr_layout_flow horizontal gap_md" id="download-btn"><div class="fwr_layout_flow_item"><a class="fwr_button" component-name="component-1f"><i class="fwr-rb-icons-32 fwr-rb-toolbar-download-32"></i><span data-i18n="PCLng.ToolBar.Download" class="text">下载</span></a></div></div></li>');
          $("#download-btn").unbind("click").bind("click", function () {
            download();
          })
          function download() {
            getEnc(standNo, (newEnc, newToken) => {
              var url = "http://jjg.spc.org.cn/resmea/view/onlinereading?token=" + newToken;
              downloadFile(url, newEnc);
            });
          }
        };
        function getEnc(standNo, callback) {
          if (!standNo) {
            callback(enc, rc);
            return;
          }
          $.ajax({
            url: "http://jjg.spc.org.cn/resmea/view/stdonline",
            type: "POST",
            data: {
              "a100": standNo
            },
            success: function(html) {
              let script = html.substring(html.indexOf('var enc'), html.indexOf("var myVar;"));
              let variables = script.split(";");
              let enc = variables[0].trim().substring(11, variables[0].trim().lastIndexOf('"'));
              let token = variables[2].trim().substring(10, variables[2].trim().lastIndexOf('"'));
              if (callback) {
                callback(enc, token);
              }
            }
          })
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
      },
    };
  }

  if (selectorOrFunction && callback) {
    waitForKeyElements(selectorOrFunction, callback, waitOnce);
  }
})
