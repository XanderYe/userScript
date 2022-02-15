// ==UserScript==
// @name         Emby加载弹幕
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  使用B站弹幕源，让Emby也显示弹幕
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @require      https://cdn.jsdelivr.net/npm/danmaku/dist/danmaku.min.js
// @updateURL    https://cdn.jsdelivr.net/gh/xanderye/tampermonkey/embyDanmaku.user.js
// @supportURL   https://www.xanderye.cn/
// @match        https://nas.xanderye.cn:8920/web/index.html
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  let danmaku = null;
  let isShow = true;

  let searchIcon = '<svg t="1644885329620" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2177" width="100%" height="100%"><path d="M290.1353 273.0824l204.7988 0c9.437945 0 17.0659-7.645955 17.0659-17.0659s-7.627955-17.0659-17.0659-17.0659l-204.7988 0c-9.437945 0-17.0659 7.645955-17.0659 17.0659S280.697355 273.0824 290.1353 273.0824z" p-id="2178" fill="#fff"></path><path d="M392.5347 546.1468 256.0015 546.1468c-9.437945 0-17.0659 7.645955-17.0659 17.0659 0 9.419945 7.627955 17.0659 17.0659 17.0659l136.5332 0c9.437945 0 17.0659-7.645955 17.0659-17.0659C409.6006 553.792755 401.972645 546.1468 392.5347 546.1468z" p-id="2179" fill="#fff"></path><path d="M341.335 460.8153c0-9.419945-7.627955-17.0659-17.0659-17.0659l-102.3994 0c-9.437945 0-17.0659 7.645955-17.0659 17.0659s7.627955 17.0659 17.0659 17.0659l102.3994 0C333.705045 477.8812 341.335 470.235245 341.335 460.8153z" p-id="2180" fill="#fff"></path><path d="M221.8677 375.4818 460.8003 375.4818c9.437945 0 17.0659-7.645955 17.0659-17.0659 0-9.419945-7.627955-17.0659-17.0659-17.0659L221.8677 341.35c-9.437945 0-17.0659 7.645955-17.0659 17.0659C204.8018 367.835845 212.429755 375.4818 221.8677 375.4818z" p-id="2181" fill="#fff"></path><path d="M529.0659 546.1468 460.8003 546.1468c-9.437945 0-17.0659 7.645955-17.0659 17.0659 0 9.419945 7.627955 17.0659 17.0659 17.0659l68.2656 0c9.437945 0 17.0659-7.645955 17.0659-17.0659C546.1338 553.792755 538.503845 546.1468 529.0659 546.1468z" p-id="2182" fill="#fff"></path><path d="M772.624473 676.110038c-6.655961 6.655961-6.655961 17.475898 0 24.131859l36.215788 36.215788c3.327981 3.34598 7.697955 4.999971 12.065929 4.999971 4.351975 0 8.721949-1.65599 12.065929-4.999971 6.655961-6.655961 6.655961-17.459898 0-24.131859l-36.197788-36.215788C790.100371 669.454077 779.296434 669.454077 772.624473 676.110038z" p-id="2183" fill="#fff"></path><path d="M998.995147 878.348853l-119.603299-119.585299c-3.191981-3.207981-7.525956-4.999971-12.065929-4.999971l-0.016 0c-4.521974 0-8.873948 1.809989-12.083929 5.017971l-48.127718 48.401716c-6.655961 6.689961-6.621961 17.475898 0.068 24.131859 6.707961 6.655961 17.493897 6.637961 24.131859-0.068l36.061789-36.249788 107.50137 107.48537c9.659943 9.675943 15.001912 22.527868 15.001912 36.197788s-5.341969 26.537845-15.001912 36.197788c-19.949883 19.949883-52.411693 19.983883-72.395576 0.018l-202.238815-202.238815c-6.655961-6.655961-17.459898-6.655961-24.131859 0-6.655961 6.673961-6.655961 17.475898 0 24.149858l202.238815 202.220815c16.621903 16.639903 38.467775 24.951854 60.313647 24.951854s43.723744-8.327951 60.347646-24.951854c16.109906-16.127906 25.001854-37.54578 25.001854-60.347646C1023.997 915.894633 1015.105052 894.458759 998.995147 878.348853z" p-id="2184" fill="#fff"></path><path d="M819.1982 409.6156c0-225.842677-183.754923-409.5976-409.5976-409.5976S0.003 183.772923 0.003 409.6156s183.754923 409.5976 409.5976 409.5976S819.1982 635.456277 819.1982 409.6156zM409.6006 785.0794c-207.034787 0-375.4638-168.429013-375.4638-375.4638S202.565813 34.1498 409.6006 34.1498s375.4638 168.429013 375.4638 375.4638S616.635387 785.0794 409.6006 785.0794z" p-id="2185" fill="#fff"></path><path d="M409.6006 68.2836c-188.210897 0-341.332 153.121103-341.332 341.332S221.389703 750.9456 409.6006 750.9456s341.332-153.121103 341.332-341.332S597.811497 68.2836 409.6006 68.2836zM409.6006 716.8138c-169.385008 0-307.1982-137.813193-307.1982-307.1982s137.813193-307.1982 307.1982-307.1982 307.1982 137.813193 307.1982 307.1982S578.985608 716.8138 409.6006 716.8138z" p-id="2186" fill="#fff"></path><path d="M597.3335 443.7474l-204.7988 0c-9.437945 0-17.0659 7.645955-17.0659 17.0659s7.627955 17.0659 17.0659 17.0659l204.7988 0c9.437945 0 17.0659-7.645955 17.0659-17.0659S606.771445 443.7474 597.3335 443.7474z" p-id="2187" fill="#fff"></path><path d="M597.3335 341.348l-68.2656 0c-9.437945 0-17.0659 7.645955-17.0659 17.0659 0 9.419945 7.627955 17.0659 17.0659 17.0659l68.2656 0c9.437945 0 17.0659-7.645955 17.0659-17.0659C614.3994 348.993955 606.771445 341.348 597.3335 341.348z" p-id="2188" fill="#fff"></path></svg>';
  let showOrHideIcon = '<svg t="1644885574221" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5733" width="100%" height="100%"><path d="M687.542857 590.628571h-347.428571c-69.485714 0-124.342857 56.685714-124.342857 124.342858v12.8c0 69.485714 56.685714 124.342857 124.342857 124.342857h347.428571c69.485714 0 124.342857-56.685714 124.342857-124.342857v-12.8c0-69.485714-56.685714-124.342857-124.342857-124.342858z m-341.942857 219.428572c-49.371429 0-87.771429-38.4-87.771429-87.771429s38.4-87.771429 87.771429-87.771428c49.371429 0 87.771429 38.4 87.771429 87.771428s-38.4 87.771429-87.771429 87.771429zM336.457143 431.542857h347.428571c69.485714 0 124.342857-56.685714 124.342857-124.342857v-12.8c0-69.485714-56.685714-124.342857-124.342857-124.342857h-347.428571c-69.485714 0-124.342857 56.685714-124.342857 124.342857v12.8c0 69.485714 56.685714 124.342857 124.342857 124.342857zM678.4 213.942857c49.371429 0 87.771429 38.4 87.771429 87.771429s-38.4 87.771429-87.771429 87.771428c-49.371429 0-87.771429-38.4-87.771429-87.771428S629.028571 213.942857 678.4 213.942857z" p-id="5734" fill="#fff"></path><path d="M883.2 0h-740.571429c-78.628571 0-142.628571 64-142.628571 142.628571v738.742858c0 78.628571 64 142.628571 142.628571 142.628571h738.742858c78.628571 0 142.628571-64 142.628571-142.628571V142.628571c0-78.628571-64-142.628571-140.8-142.628571zM175.542857 294.4c0-87.771429 71.314286-160.914286 160.914286-160.914286h347.428571c87.771429 0 160.914286 71.314286 160.914286 160.914286v12.8c0 87.771429-73.142857 160.914286-160.914286 160.914286h-347.428571c-87.771429 0-160.914286-71.314286-160.914286-160.914286v-12.8z m672.914286 433.371429c0 87.771429-73.142857 160.914286-160.914286 160.914285h-347.428571c-87.771429 0-160.914286-71.314286-160.914286-160.914285v-12.8c0-87.771429 71.314286-160.914286 160.914286-160.914286h347.428571c87.771429 0 160.914286 71.314286 160.914286 160.914286v12.8z" p-id="5735" fill="#fff"></path></svg>';

  function init() {
    addCss();
    let videoContainer = document.querySelector("video[class='htmlvideoplayer moveUpSubtitles']");
    videoContainer.addEventListener('loadstart',loadStartEvent);
    videoContainer.addEventListener('play',playEvent);
    waitForKeyElements(".videoOsdBottom-buttons-right", initButton, false);
  }

  function loadStartEvent() {
    console.log("reload");
  }

  function playEvent() {
    console.log("play");
  }

  function initButton() {
    let searchBtn = $("<button title='搜索弹幕' class='paper-icon-button-light danmaku-btn'></button>");
    searchBtn.html(searchIcon);
    searchBtn.unbind().bind("click", searchEvent);
    let showOrHideBtn = $("<button title='显示/隐藏弹幕' class='paper-icon-button-light danmaku-btn'></button>");
    showOrHideBtn.html(showOrHideIcon);
    showOrHideBtn.unbind().bind("click", showOrHideEvent);

    let searchDiv = $("<div class='flex flex-direction-row align-items-center'></div>");
    searchDiv.append(searchBtn);
    let showOrHideDiv = $("<div class='flex flex-direction-row align-items-center'></div>");
    showOrHideDiv.append(showOrHideBtn);

    let osdBtns = $(".videoOsdBottom-buttons-right");
    osdBtns.prepend(showOrHideDiv);
    osdBtns.prepend(searchDiv);
  }

  function searchEvent() {
    let name = getVideoTitle();
    if (!name) {
      openDialog("未获取到视频名称，请等待加载后重试");
      return;
    }
    console.log(`搜索视频【${name}】`);
    searchBilibili(name).then(dataList => {
      console.log(`搜索到视频数量：${dataList.length}`);
      searchResultDialog(dataList);
    }, (err) => {
      openDialog(err);
    })
  }

  function showOrHideEvent() {
    if (danmaku) {
      if (isShow) {
        danmaku.hide();
      } else {
        danmaku.show();
      }
      isShow = !isShow;
    } else {
      openDialog("请先加载弹幕");
    }
  }

  function searchBilibili(name) {
    let encodeName = encodeURI(name);
    let searchUrl = "https://api.bilibili.com/x/web-interface/search/all/v2?context=&search_type=media_ft&page=1&order=&keyword=" + encodeName;
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: searchUrl,
        headers: {
          "referer": searchUrl
        },
        data:"",
        onload: function(response){
          console.log("searchBilibili请求成功");
          if (response.status !== 200) {
            reject(response.statusText);
          }
          let res = JSON.parse(response.responseText);
          if (res.code !== 0) {
            reject(res.message);
          }
          resolve(parseVideoList(res));
        },
        onerror: function(response){
          console.log("searchBilibili请求失败");
          reject(response);
        }
      })
    })
  }

  function parseVideoList(res) {
    let dataList = [];
    if (res.data) {
      let result = res.data.result;
      for (let data of result) {
        if (data.result_type === "media_ft" || data.result_type === "media_bangumi") {
          dataList = dataList.concat(data.data);
        }
      }
    }
    return dataList;
  }

  function getVideoTitle() {
    let titleDom = document.querySelector("h3[class='videoOsdParentTitle']");
    if (titleDom) {
      return titleDom.innerHTML;
    }
    return null;
  }

  function getSeason() {
    let titleDom = document.querySelector("h3[class='videoOsdTitle']");
    let season = 1;
    if (titleDom) {
      let title = titleDom.innerHTML;
      let res = /S([0-9]*)/gi.exec(title);
      if (res) {
        season = Number(res[1]);
      }
    }
    return season;
  }

  function getEpisode() {
    let titleDom = document.querySelector("h3[class='videoOsdTitle']");
    let episode = 1;
    if (titleDom) {
      let title = titleDom.innerHTML;
      let res = /E([0-9]*)/gi.exec(title);
      if (res) {
        episode = Number(res[1]);
      }
    }
    return episode;
  }

  function getDanmuByVideo(v) {
    let eps = v.eps;
    let playUrl = v.url;
    console.log(eps);
    if (eps) {
      // 剧集
      let episode = getEpisode();
      console.log(episode);
      playUrl = eps[episode - 1].url;
    }
    console.log("获取到视频地址：" + playUrl);
    getDanmuUrl(playUrl);
  }

  function getDanmuUrl(videoUrl) {
    let url = "https://tool.xanderye.cn/api/video/danmu";
    GM_xmlhttpRequest({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      data: JSON.stringify({
        url: videoUrl
      }),
      onload: function(response){
        console.log("getDanmuUrl请求成功");
        let res = JSON.parse(response.responseText);
        if (res.code !== 0) {
          openDialog("链接解析失败");
          return;
        }
        console.log("获取到弹幕地址：" + res.data);
        getDanmu(res.data);
      },
      onerror: function(response){
        console.log("getDanmuUrl请求失败", response);
      }
    });
  }

  function getDanmu(url) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      data:"",
      onload: function(response){
        console.log("getDanmu请求成功");
        var string = response.responseText;
        var comments = parseXml(string);
        var container = document.querySelector("div[data-type='video-osd']")
        var media = document.querySelector("video[class='htmlvideoplayer moveUpSubtitles']")
        if(danmaku != null){
          danmaku.clear();
          danmaku.destroy();
          danmaku = null;
        }
        danmaku = createDanmaku(container, media, comments);
        var htmlvideoplayer = document.querySelector("video[class='htmlvideoplayer moveUpSubtitles']");
        htmlvideoplayer.setAttribute("test","test")
        var videoPlayerContainer = document.querySelector("div[class='videoPlayerContainer']");
        videoPlayerContainer.setAttribute("test","test")
        htmlvideoplayer.addEventListener('loadstart',function(){init()})
        new ResizeObserver(() => {
          console.log("resizing")
          danmaku.resize()
        }).observe(videoPlayerContainer)

      },
      onerror: function(response){
        console.log("getDanmu请求失败", response);
      }
    });
  }

  function parseXml(string) {
    const xml = new DOMParser().parseFromString(string, 'text/xml');
    const commentDoms = xml.getElementsByTagName("d");
    const direction = {6: 'ltr', 1: 'rtl', 5: 'top', 4: 'bottom'};
    let comments = [];
    for (let commentDom of commentDoms) {
      const p = commentDom.getAttribute("p");
      const attrs = p.split(',');
      const mode = direction[attrs[1]];
      if (!mode) return null;
      const fontSize = Number(attrs[2]) || 25;
      const color = `000000${Number(attrs[3]).toString(16)}`.slice(-6);
      const comment = {
        text: commentDom.textContent,
        mode,
        time: attrs[0] * 1,
        style: {
          font: `${fontSize}px sans-serif`,
          fontSize: `${fontSize}px`,
          color: `#${color}`,
          textShadow: color === '00000'
            ? '-1px -1px #fff, -1px 1px #fff, 1px -1px #fff, 1px 1px #fff'
            : '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000',
          fillStyle: `#${color}`,
          strokeStyle: color === '000000' ? '#fff' : '#000',
          lineWidth: 2.0,
        },
      };
      comments.push(comment);
    }
    return comments;
  }

  function createDanmaku(container, media, comments){
    return new Danmaku({
      container: container,
      media: media,
      comments: comments,
      engine: 'canvas'
    });
  }

  function searchResultDialog(dataList) {
    let dataListDom = "";
    let videoTitle = getVideoTitle();
    for (let i = 0; i < dataList.length; i++) {
      let data = dataList[i];
      let title = data.title.replace('<em class="keyword">', '').replace('</em>', '');
      dataListDom += `
        <div class="listItem listItem-border">
          <div class="listItemBody"><div class="listItemBodyText">${title}</div></div>
          <button class="danmakuDownload btnDownload listItemButton paper-icon-button-light" title="选择"
            aria-label="选择" data-index="${i}"><i class="md-icon">check</i>
          </button>
        </div>
      `;
    }
    let dialogDom = `
    <div id="danmakuDialog" class="dialogContainer dialogBackdrop dialogBackdropOpened">
      <div  id="danmakuDialogContainer" class="focuscontainer dialog dialog-animated dialog-fixedSize dialog-medium-tall formDialog opened">
          <div class="formDialogHeader">
              <button id="danmakuBack" class="btnCancel autoSize paper-icon-button-light" tabindex="-1"><i class="md-icon"></i></button>
              <h3 class="formDialogHeaderTitle" style="display:inline-block">弹幕</h3>
          </div>
          <div class="formDialogContent emby-scroller scrollY">
              <div class="scrollSlider scrollSliderY">
                  <div class="dialogContentInner dialog-content-centered padded-left padded-right padded-top">
                      <p class="originalFile secondaryText">${videoTitle}</p>
                      <div class="subtitleList hide"></div>
                      <div class="subtitleSearchContainer padded-top">
                          <h2>搜索B站视频</h2>
                          <div class="subtitleResults padded-top">${dataListDom}</div>
                          <p class="noSearchResults ${dataList.length===0?'show':'hide'}" style="text-align:center;">未找到结果</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
    `;
    $("body").append(dialogDom);
    $(".danmakuDownload").unbind("click").bind("click", function () {
      let index = $(this).attr("data-index");
      console.log(index);
      closeDialog();
      let video = dataList[index];
      getDanmuByVideo(video);
    });
    $("#danmakuBack").unbind("click").bind("click", function () {
      closeDialog();
    })
  }

  function openDialog(msg, ok) {
    let dialogDom = `
    <div id="danmakuDialog" class="dialogContainer">
      <div id="danmakuDialogContainer" class="focuscontainer dialog dialog-animated centeredDialog formDialog dialog-fullscreen-lowres dialog-blur opened">
          <div class="formDialogHeader formDialogHeader-clear justify-content-center" style="padding:1em .5em">
            <h2 class="formDialogHeaderTitle hide" style="margin-left:0;margin-top: .5em;padding: 0 1em;"></h2>
          </div>
          <div class="formDialogContent emby-scroller no-grow scrollY" style="width:100%;">
              <div class="scrollSlider dialogContentInner dialog-content-centered padded-left padded-right padded-top scrollSliderY"
                   style="padding:0 3em 1em 3em;text-align: center;">${msg}</div>
          </div>
          <div style="padding:1em;display:flex;justify-content:center">
              <button id="danmakuOkBtn" class="button-submit emby-button">
                      了解
              </button>
          </div>
      </div>
    </div>
    `;
    $("body").append(dialogDom);
    $("#danmakuOkBtn").unbind("click").bind("click", function () {
      closeDialog();
      if (ok) {
        ok();
      }
    })
  }

  function closeDialog() {
    $("#danmakuDialogContainer").removeClass("opened");
    $("#danmakuDialogContainer").addClass("dialog-close closed");
    setTimeout(() => {
      $("#danmakuDialog").remove();
    }, 200);
  }

  function addCss() {
    const css = `
      .danmaku-btn {
        width: 2.3em;
      }
    `
    GM_addStyle(css);
  }

  waitForKeyElements("video[class='htmlvideoplayer moveUpSubtitles']", init);
})