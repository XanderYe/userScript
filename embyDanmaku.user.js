// ==UserScript==
// @name         Emby加载弹幕
// @namespace    http://tampermonkey.net/
// @version      0.3
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
    let divDoms = `
        <div class='flex flex-direction-row align-items-center'>
            <button title='搜索弹幕' id="danmakuSearchBtn" class='paper-icon-button-light danmaku-btn'><i class='md-icon'>manage_search</i></button>
        </div>
        <div class='flex flex-direction-row align-items-center'>
            <button title='显示/隐藏弹幕' id="showOrHideBtn" class='paper-icon-button-light danmaku-btn'><i class='md-icon'>toggle_on</i></button>
        </div>
    `;
    $(".videoOsdBottom-buttons-right").prepend(divDoms);
    $("#danmakuSearchBtn").unbind().bind("click", searchEvent);
    $("#showOrHideBtn").unbind().bind("click", showOrHideEvent);
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
    $("#danmakuBack,#danmakuDialog").unbind("click").bind("click", function () {
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
    $("#danmakuOkBtn,#danmakuDialog").unbind("click").bind("click", function () {
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
    /*const css = `

    `
    GM_addStyle(css);*/
  }

  waitForKeyElements("video[class='htmlvideoplayer moveUpSubtitles']", init);
})