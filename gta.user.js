// ==UserScript==
// @name         GTA玩家信息获取
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  通过好友对比的方式获取不公开的玩家信息
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @updateURL    https://cdn.jsdelivr.net/gh/XanderYe/userScript/gta.user.js
// @supportURL   https://www.xanderye.cn/
// @match        https://socialclub.rockstargames.com/games/gtav/pc/career/overview/gtaonline
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  init();

  function init() {
    const selectorOrFunction = "#compare-choose-wrap";
    const callback = () => {
      let searchBtn = $("<a class='btn' href='#'>搜索</a>");
      searchBtn.css({"width": "10%", "margin": "8px 0 0 8px"});
      searchBtn.unbind().bind("click", addUser);
      $("#compare-choose-wrap h2").after(searchBtn);
    }
    waitForKeyElements(selectorOrFunction, callback, true);
  }


  function addUser() {
    var nickname = prompt("请输入玩家昵称");
    if (!nickname) {
      return;
    }
    getRockstarId(nickname).then(rockstarId => {
      console.log(rockstarId);
      var compareUserDom = `<div class="greyPanel" data-id="${rockstarId}">
        <img width="32" height="32" src="https://a.rsg.sc/n/${nickname}/s" onerror="this.onerror=null;this.src='https://s.rsg.sc/sc/images/avatars/default.png';">
          <div class="text">
            <h5>${nickname}</h5>
          </div>
          <button class="resetButton compare-trigger remove" aria-label="关闭比较：${nickname}">
            <i></i>
          </button>
        </div>`
      $("#compare-selected-users").append(compareUserDom);
    }).catch(err => {
      alert(err);
    });
  }
  function getRockstarId(nickname) {
    var cookie = document.cookie;
    var token = cookie.substring(cookie.indexOf("BearerToken") + 12);
    token = token.substring(0, token.indexOf(";"));
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "https://scapi.rockstargames.com/profile/getprofile?nickname=" + nickname + "&maxFriends=3",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Authorization": "Bearer " + token
        },
        success: function (data) {
          if (data.status) {
            var account = data.accounts[0];
            var rockstarId = account.rockstarAccount.rockstarId;
            resolve(rockstarId);
          } else {
            reject("未查询到玩家，请检查昵称");
          }
        }
      })
    })
  }
})
