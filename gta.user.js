// ==UserScript==
// @name         GTA玩家信息对比
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  可对比不公开的非好友玩家信息，并计算黑钱
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @updateURL    https://cdn.jsdelivr.net/gh/XanderYe/userScript/gta.user.js
// @supportURL   https://www.xanderye.cn/
// @match        https://socialclub.rockstargames.com/games/gtav/pc/career/overview/gtaonline
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  let userInfo = [];

  init();

  function init() {
    waitForKeyElements("#compare-choose-wrap", () => {
      let searchBtn = $("<a class='btn' href='#'>搜索</a>");
      searchBtn.css({"width": "10%", "margin": "8px 0 0 8px"});
      searchBtn.unbind().bind("click", addUser);
      $("#compare-choose-wrap h2").after(searchBtn);
    }, true);

    tableChange();
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

  function tableChange() {
    waitForKeyElements("#table-data-one", () => {
      setTimeout(() => {
        let dotIndex = 0;
        let dots = $("div.owl-dot");
        for (let i = 0; i < dots.length; i++) {
          if (dots.eq(i).hasClass("active")) {
            dotIndex = i;
            break;
          }
        }
        let firstLineName = $("#table-data-one").find("tbody tr").eq(0).find(".name").text().replace(/\s/g, "");
        if ([0, 3].indexOf(dotIndex) > -1 && firstLineName !== "黑钱") {
          getUserInfo();
          appendBlackMoney();
        }
      }, 200);
    }, false);
  }

  function getUserInfo() {
    userInfo = [];
    let data = SCSettings.Data;
    if (data) {
      for (let i = 0; i < data.HeaderRow.length; i++) {
        let totalEvcValue = data.Rows[39].Values[i].FormattedValue;
        userInfo[i] = {
          "index": data.HeaderRow[i].Index,
          "nickname": data.HeaderRow[i].Nickname,
          "unit": totalEvcValue.substring(totalEvcValue.length - 1),
          "wallet": moneyStrToNum(data.Rows[2].Values[i].FormattedValue),
          "bank": moneyStrToNum(data.Rows[3].Values[i].FormattedValue),
          "totalEvc": moneyStrToNum(totalEvcValue),
          "totalSvc": moneyStrToNum(data.Rows[40].Values[i].FormattedValue)
        };
        userInfo[i].blackMoney = moneyNumToStr(userInfo[i].totalSvc + userInfo[i].wallet + userInfo[i].bank - userInfo[i].totalEvc, userInfo[i].unit);
      }
      console.log(userInfo);
    }
  }

  function appendBlackMoney() {
    let calcDom = '<tr><td class="descr"><div class="name">黑钱<p></p></div></td>';
    for (let i = 0; i < userInfo.length; i++) {
      let calcStr = userInfo[i].blackMoney;
      if (i === 0) {
        calcDom += '<td class="active">';
      } else {
        calcDom += '<td>';
      }
      calcDom += '<div class="pos">' + calcStr + '</div></td>';
    }
    calcDom += '<td class="adduser"></td></tr>';
    $("#table-data-one").find("tbody").prepend(calcDom);
    let userInfoCopy = JSON.parse(JSON.stringify(userInfo));
    userInfoCopy.sort((a, b) => {
      return moneyStrToNum(b.blackMoney) - moneyStrToNum(a.blackMoney);
    })
    for (let i = 0; i < userInfoCopy.length; i++) {
      $("#table-data-one").find("tbody tr").eq(0).find(".pos").eq(userInfoCopy[i].index - 1).addClass("p" + (i + 1));
    }
  }

  function moneyStrToNum(str) {
    let money = parseFloat(str.substring(1, str.length - 1));
    if (isNaN(money)) {
      return 0;
    }
    let unit = str.substring(str.length - 1);
    switch (unit) {
      case "K":
        money *= 1000;
        break;
      case "M":
        money *= 1000000;
        break;
      case "B":
        money *= 1000000000;
        break;
      default:
        break;
    }
    return money;
  }
  
  function moneyNumToStr(num, unit) {
    switch (unit) {
      case "K":
        num /= 1000;
        break;
      case "M":
        num /= 1000000;
        break;
      case "B":
        num /= 1000000000;
        break;
      default:
        break;
    }
    return "$" + num.toFixed(1) + unit;
  }
})
