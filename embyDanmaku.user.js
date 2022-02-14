// ==UserScript==
// @name         Emby加载弹幕
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  使用B站弹幕源，让Emby也显示弹幕
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @require      https://cdn.jsdelivr.net/npm/danmaku/dist/danmaku.min.js
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

  }

  function initButton() {
    let searchBtn = $("<button>搜索</button>");
    searchBtn.unbind().bind("click", searchEvent);
    $("body").append(searchBtn);
    let showOrHideBtn = $("<button>显示/隐藏弹幕</button>");
    showOrHideBtn.unbind().bind("click", showOrHideEvent);
    let div = $("<div style='position:absolute;z-index:999'></div>");
    div.append(searchBtn);
    div.append(showOrHideBtn);
    $("body").append(div);
  }

  function searchEvent() {
    let name = prompt("请输入视频名称","");
    searchBilibili(name).then(dataList => {
      let msg = "";
      for (let i in dataList) {
        let data = dataList[i];
        msg += i + "：" + data.title.replace('<em class="keyword">', '').replace('</em>', '') + "\n";
      }
      msg += "请输入序号选择视频";
      let i = prompt(msg,"");
      if (i === null || i === undefined) {
        return;
      }
      let video = dataList[i];

      let eps = video.eps;
      let playUrl = video.url;
      console.log(eps);
      if (eps) {
        // 剧集
        let episode = getEpisode();
        console.log(episode);
        playUrl = eps[episode - 1].url;
      }
      console.log("获取到视频地址：" + playUrl);
      getDanmuUrl(playUrl);
    }, (err) => {
      alert(err);
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
          alert("链接解析失败");
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

  //waitForKeyElements("div[class='mdl-spinner hide']", init);
  waitForKeyElements("video[class='htmlvideoplayer moveUpSubtitles']", initButton, false);
})