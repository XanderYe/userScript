// ==UserScript==
// @name         视频网站嗅探
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  获取视频网站m3u8下载链接，支持腾讯视频和爱奇艺视频；只能获取当前账户支持播放的视频流
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      http://lib.baomitu.com/clipboard.js/1.7.1/clipboard.min.js
// @updateURL    https://github.com/XanderYe/tampermonkey/raw/master/videosniffer.user.js
// @supportURL   https://www.xanderye.cn/
// @match        http*://v.qq.com/x/*
// @match        http*://www.iqiyi.com/v_*
// @match        http*://v.youku.com/v_show/*
// @grant        GM_setValue
// @grant        GM_getValue

// ==/UserScript==
var jQ = $.noConflict(true);
jQ(function ($) {

  if (!GM_getValue("visited")) {
    var r = confirm("注意：本脚本会在视频网站播放器内嵌下载按钮，单击即可下载视频m3u8，配合m3u8下载器即可下载视频。N_m3u8DL-CLI下载地址：https://github.com/nilaoda/N_m3u8DL-CLI/releases。单击确定下次将不再显示此提示。");
    if (r) {
      GM_setValue("visited", 1);
    }
  }

  setTimeout(initButton, 500);

  function initButton() {
    var prevDom;
    var btn;
    var clickEvent;
    var clipboard;
    var svg = $('<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M713.8 460.8L557.9 616.7V131.1c0-25.7-20.9-46.6-46.6-46.6-25.7 0-46.6 20.9-46.6 46.6v485.6L308.9 460.8c-18.2-18.2-47.7-18.2-65.9 0-18.2 18.2-18.2 47.7 0 65.9l235.4 235.4c4.3 4.3 9.5 7.8 15.3 10.1 0.2 0.1 0.5 0.1 0.7 0.2 5.3 2.1 11 3.3 17 3.3s11.7-1.2 17-3.3c0.2-0.1 0.5-0.1 0.7-0.2 5.8-2.4 10.9-5.8 15.3-10.1l235.4-235.4c18.2-18.2 18.2-47.7 0-65.9-18.3-18.2-47.8-18.2-66 0zM746.7 780.4H275.9c-25.7 0-46.6 20.9-46.6 46.6s20.9 46.6 46.6 46.6h470.8c25.7 0 46.6-20.9 46.6-46.6s-20.8-46.6-46.6-46.6z"></path></svg>');

    if (website("v.qq.com")) {
      svg.addClass("txp_icon");
      btn = $('<button class="txp_btn video-sniffer">' + svg[0].outerHTML + '<txp data-role="txp-ui-pip-btn-label" class="txp_icon_text">下载</txp></button>');
      prevDom = $(".txp_btn_popup");
      clickEvent = function() {
        var title = PLAYER._DownloadMonitor.context.dataset.title;
        var text = PLAYER._DownloadMonitor.context.dataset.ckc?PLAYER._DownloadMonitor.context.dataset.currentVideoUrl:PLAYER._DownloadMonitor.context.dataset.currentVideoUrl.replace(/:.*qq.com/g,"://defaultts.tc.qq.com/defaultts.tc.qq.com");
        showModal(title + "(相对路径, 建议直接复制地址到下载器)", text);
      }
      function showModal(title, text) {
        var link = document.createElement("link");
        link.href = "//vm.gtimg.cn/tencentvideo/vstyle/wr-web-layer/style/css/x_download.css";
        link.rel = "stylesheet";
        link.type = "text/css";
        document.getElementsByTagName("head")[0].append(link);
        var modal = '<div class="x_modal_download" style="display: block"><button class="z_btn_close" id="client-close"><svg class="z_svg_icon z_svg_icon_close" viewBox="0 0 10 10" width="10" height="10"><path d="M9.4 8.9l-.5.5-3.9-4-3.9 4-.5-.5 4-3.9-4-3.9.4-.4 4 3.9L8.9.7l.4.4L5.4 5l4 3.9z" fill="currentColor"></path></svg></button><div class="z_modal_hd" id="_core_client_text"><p>' + title + '</p><p style="white-space: nowrap;overflow-y: hidden;">' + text + '</p></div><div class="z_modal_fd"><button class="z_btn_normal" id="client-copy" data-clipboard-text="' + text + '">复制</button></div></div>'
        $("body").append(modal);
        $("#client-close").unbind().bind("click", function () {
          $(".x_modal_download").remove();
        })
        if(clipboard){
          clipboard.destroy();
        }
        clipboard = new Clipboard('#client-copy');
        clipboard.on('success', function(e) {
          alert("复制成功");
        });
      }
    } else if (website("iqiyi")) {
      prevDom = $(".iqp-screenshot-type ul li:nth-child(2)")
      $(".iqp-screenshot-type").css("height", "168px");
      svg.addClass("iqp-icon iqp-icon-gif");
      btn = '<li class="video-sniffer">' + svg[0].outerHTML + '</li>';
      clickEvent = function () {
        try{var info=playerObject._player._core._movieinfo.originalData.data.program.video;info.forEach(function(item,index){if(item._selected){var m3u8Content="";if(item.m3u8==undefined){try{if(typeof(eval(cmd5x))=="function"){}}catch(e){var req1=new XMLHttpRequest();req1.open("GET","https://static.iqiyi.com/js/common/f6a3054843de4645b34d205a9f377d25.js",false);req1.onload=function(){var script=document.createElement("script");script.text=req1.responseText;document.getElementsByTagName("head")[0].appendChild(script)};req1.send(null)}var fs=item.fs;var content="#EXTM3U\n";fs.forEach(function(fs_i,fs_index){var url=fs_i.l;var prefix="https://data.video.iqiyi.com/videos";var api=prefix+url;try{var t=playerObject._player._core._movieinfo.originalData.data.boss.data.t;api=prefix+url+"&cross-domain=1&t="+t+"&QY00001="+/qd_uid=(\d+)/g.exec(url)[1]+"&ib=4&ptime=0&ibt="+cmd5x(t+/\/(\w{10,})/g.exec(url)[1])}catch(err){}var req=new XMLHttpRequest();req.overrideMimeType("application/json");req.open("GET",api,false);req.onload=function(){var jsonResponse=JSON.parse(req.responseText);content+="#EXTINF:0\n"+jsonResponse["l"]+"\n"};req.send(null)});content+="#EXT-X-ENDLIST";m3u8Content=content}else{m3u8Content=item.m3u8}var blob=new Blob([m3u8Content],{type:"text/plain"});var url=URL.createObjectURL(blob);var title=(document.title.indexOf("-")!=-1?document.title.substring(0,document.title.indexOf("-")):document.title.replace(/\s/,""))+"_"+item.scrsz+"_"+(item.code==2?"H264":"H265")+"_"+document.getElementsByClassName("iqp-time-dur")[0].innerText.replace(/:/,".")+"_"+(item.vsize/1024/1024).toFixed(2)+"MB.m3u8";var aLink=document.createElement("a");aLink.href=url;aLink.download=title;aLink.style.display="none";var event;if(window.MouseEvent){event=new MouseEvent("click")}else{event=document.createEvent("MouseEvents");event.initMouseEvent("click",true,false,window,0,0,0,0,0,false,false,false,false,0,null)}aLink.dispatchEvent(event)}})}catch(err){var info1=playerObject._player.package.engine.adproxy.engine.movieinfo.vidl;info1.forEach(function(item1,index1){if(item1.responseData!=undefined){var info=item1.responseData.data.program.video;info.forEach(function(item,index){if(item._selected){var m3u8Content="";if(item.m3u8==undefined){try{if(typeof(eval(cmd5x))=="function"){}}catch(e){var req1=new XMLHttpRequest();req1.open("GET","https://static.iqiyi.com/js/common/f6a3054843de4645b34d205a9f377d25.js",false);req1.onload=function(){var script=document.createElement("script");script.text=req1.responseText;document.getElementsByTagName("head")[0].appendChild(script)};req1.send(null)}var fs=item.fs;var content="#EXTM3U\n";fs.forEach(function(fs_i,fs_index){var url=fs_i.l;var prefix="https://data.video.iqiyi.com/videos";var api=prefix+url;try{var t=playerObject._player.package.engine.adproxy.engine.movieinfo.current.boss.data.t;api=prefix+url+"&cross-domain=1&t="+t+"&QY00001="+/qd_uid=(\d+)/g.exec(url)[1]+"&ib=4&ptime=0&ibt="+cmd5x(t+/\/(\w{10,})/g.exec(url)[1])}catch(err){console.error(err)}var req=new XMLHttpRequest();req.overrideMimeType("application/json");req.open("GET",api,false);req.onload=function(){var jsonResponse=JSON.parse(req.responseText);content+="#EXTINF:0\n"+jsonResponse["l"]+"\n"};req.send(null)});content+="#EXT-X-ENDLIST";m3u8Content=content}else{m3u8Content=item.m3u8}var blob=new Blob([m3u8Content],{type:"text/plain"});var url=URL.createObjectURL(blob);var title=(document.title.indexOf("-")!=-1?document.title.substring(0,document.title.indexOf("-")):document.title.replace(/\s/,""))+"_"+item.scrsz+"_"+(item.code==2?"H264":"H265")+"_"+document.getElementsByClassName("iqp-time-dur")[0].innerText.replace(/:/,".")+"_"+(item.vsize/1024/1024).toFixed(2)+"MB.m3u8";var aLink=document.createElement("a");aLink.href=url;aLink.download=title;aLink.style.display="none";var event;if(window.MouseEvent){event=new MouseEvent("click")}else{event=document.createEvent("MouseEvents");event.initMouseEvent("click",true,false,window,0,0,0,0,0,false,false,false,false,0,null)}aLink.dispatchEvent(event)}})}})}
      }
    } else if (website("youku")) {
      prevDom = $("#videoQuality");
      svg.addClass("iconfont");
      svg.css({"fill": "white"});
      btn = '<div class="control-icon control-quality-icon video-sniffer">' + svg[0].outerHTML + '</div>';
      $(".play-fn-li[name=download]").addClass("video-sniffer");
      var backDom = $(".play-fn-li[name=download]").prev();
      var downloadHtml = $(".play-fn-li[name=download]")[0].outerHTML;
      $(".play-fn-li[name=download]").remove();
      backDom.after(downloadHtml);
      clickEvent = function () {
        var url;var size=0;Array.from(videoPlayer.getData()._playlistData.stream).forEach(function(element,index,array){if(element.audio_lang==videoPlayer.getConfig().language&&element.size>size){url=element.m3u8_url;size=element.size}});
        var link = document.createElement('a');
        link.download = videoPlayer.getData()._videoData.title+"_"+videoPlayer.getConfig().language+"_"+(size/1024/1024).toFixed(2)+"MB";
        link.style.display = 'none';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    if (prevDom.length == 1) {
      prevDom.after(btn);
      $(".video-sniffer").unbind().bind("click", clickEvent);
    } else {
      setTimeout(initButton, 500);
    }
  }

  function website(keyword) {
    return location.hostname.indexOf(keyword) > -1;
  }
})