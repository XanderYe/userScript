// ==UserScript==
// @name         GTA玩家信息对比
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  可对比不公开的非好友玩家信息，并计算收支差距
// @author       XanderYe
// @require      https://lib.baomitu.com/jquery/3.5.0/jquery.min.js
// @require      https://lib.baomitu.com/echarts/5.3.2-rc.1/echarts.min.js
// @supportURL   https://www.xanderye.cn/
// @match        https://socialclub.rockstargames.com/games/gtav/pc/career/overview/gtaonline
// @grant        GM_addStyle
// ==/UserScript==

let jQ = $.noConflict(true);
jQ(function($){
  let userInfo = [];
  let chart = null;

  addStyle();
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
        },
        error: function (err) {
          console.log(err);
          reject("查询错误");
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
        if ([0, 3].indexOf(dotIndex) > -1 && firstLineName !== "收支差距") {
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
          "totalSvc": moneyStrToNum(data.Rows[40].Values[i].FormattedValue),
          "moneyEarnJobs": moneyStrToNum(data.Rows[32].Values[i].FormattedValue),
          "moneyEarnSellingVh": moneyStrToNum(data.Rows[33].Values[i].FormattedValue),
          "moneyEarnBetting": moneyStrToNum(data.Rows[34].Values[i].FormattedValue),
          "moneyEarnGoodSport": moneyStrToNum(data.Rows[35].Values[i].FormattedValue),
          "moneyEarnPickUp": moneyStrToNum(data.Rows[36].Values[i].FormattedValue),
          "moneyEarnJobShared": moneyStrToNum(data.Rows[38].Values[i].FormattedValue)
        };
        userInfo[i].unknownSource = userInfo[i].totalEvc - (userInfo[i].moneyEarnJobs + userInfo[i].moneyEarnSellingVh
          + userInfo[i].moneyEarnBetting + userInfo[i].moneyEarnGoodSport + userInfo[i].moneyEarnPickUp + userInfo[i].moneyEarnJobShared);
        userInfo[i].blackMoney = userInfo[i].totalSvc + userInfo[i].wallet + userInfo[i].bank - userInfo[i].totalEvc;
      }
      console.log(userInfo);
    }
  }

  function appendBlackMoney() {
    let calcDom = '<tr><td class="descr"><div class="name">收支差距（点击金额查看详情）<p></p></div></td>';
    for (let i = 0; i < userInfo.length; i++) {
      let calcStr = moneyNumToStr(userInfo[i].blackMoney, userInfo[i].unit);
      if (i === 0) {
        calcDom += '<td class="active">';
      } else {
        calcDom += '<td>';
      }
      calcDom += '<div class="pos" style="cursor: pointer">' + calcStr + '</div></td>';
    }
    calcDom += '<td class="adduser"></td></tr>';
    $("#table-data-one").find("tbody").prepend(calcDom);
    let userInfoCopy = JSON.parse(JSON.stringify(userInfo));
    userInfoCopy.sort((a, b) => {
      return b.blackMoney - a.blackMoney;
    })
    for (let i = 0; i < userInfoCopy.length; i++) {
      let dom = $("#table-data-one").find("tbody tr").eq(0).find(".pos").eq(userInfoCopy[i].index - 1);
      dom.addClass("p" + (i + 1));
      dom.unbind().bind("click", function () {
        showChart(userInfoCopy[i]);
      })
    }
  }

  function showChart(user) {
    let parent = $("<div id='gta-chart-mask'></div>");
    var div = $("<div id='gta-chart-container'></div>");
    div.append("<div id='gta-chart'></div>");
    parent.append(div);
    $("body").append(parent);
    let container = document.getElementById("gta-chart");
    chart = echarts.init(container);
    let option = {
      title: {
        text: '收支分析',
        left: 'center',
        textStyle: {
          color: 'white'
        }
      },
      legend: {
        orient: 'horizontal',
        x:'center',
        y:'5%',
        left: 'center',
        padding: [5,5,10,5],
        textStyle: {
          color: 'white'
        }
      },
      graphic: {
        type: "text",
        left: '45%',
        top: '46%',
        style: {
          text: '收入来源\n' + moneyNumToStr(user.totalEvc + user.blackMoney),
          textAlign: 'center',
          fontSize: '20',
          fontWeight: 'bold',
          fill: 'white'
        }
      },
      tooltip: {
        trigger: 'item',
        extraCssText: 'width:300px; white-space:pre-wrap',
        formatter: (params) => {
          let total = user.totalEvc + user.blackMoney;
          let percent = params.value / total * 100;
          return `<div><p>${params.name}：${moneyNumToStr(params.value)}（${percent.toFixed(2)}%）</p>
            <p>${params.data.description}</p></div>`;
        }
      },
      series: [
        {
          name: '收入来源',
          type: 'pie',
          radius: ['40%', '70%'],
          label: {
            textStyle: {
              color: 'white'
            },
            formatter: (params) => {
              return params.name + "\n" + moneyNumToStr(params.value);
            }
          },
          data: [
            { value: user.moneyEarnJobs, name: '差事', description: '游戏内差事收入，包括各种类型的联系人差事、抢劫等收入', itemStyle: {color:'#f3903b'} },
            { value: user.moneyEarnBetting, name: '下注', description: '游戏内赌博的收入，主要来源是名钻赌场的下注收入和筹码套现', itemStyle: {color:'#f4c34a'} },
            { value: user.moneyEarnJobShared, name: '分成', description: '早期完成差事后获得的收入可以分享给别人，可以认为17年以后不再存在获得此项收入的方式', itemStyle: {color:'#62b1dc'} },
            { value: user.moneyEarnSellingVh, name: '车辆销售额', description: '出售街车和个人载具（购买和改装的六折）的收入', itemStyle: {color:'#b65657'} },
            { value: user.moneyEarnGoodSport, name: '表现良好奖励', description: '游戏内单战局满一天且玩家状态为表现良好时能收到2000', itemStyle: {color:'#f3903b'} },
            { value: user.moneyEarnPickUp, name: '拾取金额', description: '', itemStyle: {color:'#cb3694'} },
            { value: user.unknownSource, name: '未记录来源收入', description: '未列出、查询服务未登记的收入来源。包括但不限于部分战局活动和另一角色活动', itemStyle: {color:'#72ccff'} },
            { value: user.blackMoney, name: '收支差距', description: 'R星不会将购买的鲨鱼卡和客服对金钱的操作计入总收入、部分时段的某些收入也不会计入统计、官方部分在线活动奖励未被统计。修改器篡改数据和卡分红也会产生收支差距！有一定数量的收支差距或者说黑钱（常见标准为10-30M）很正常', itemStyle: {color:'#fe0000'} }
          ],
          labelLine: {
            show: true,
            length:20,
            length2: 50,
          },
        }
      ]
    };
    chart.setOption(option);
    $("#gta-chart-container").unbind().bind("click", function (e) {
      e.stopPropagation();
    });
    $("#gta-chart-mask").unbind().bind("click", function () {
      closeChart();
    });
  }

  function closeChart() {
    if (chart != null) {
      echarts.dispose(chart);
      chart = null;
    }
    $("#gta-chart-mask").remove();
  }

  function addStyle() {
    let style = `
    #gta-chart-mask {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
      }
      #gta-chart-container {
        width: 800px;
        height: 600px;
        border-radius: 5px;
        position: fixed;
        top: calc(50% - 300px);
        left: calc(50% - 400px);
        background: rgba(0,0,0,.87);
        z-index: 100;
      }
      #gta-chart {
        width: 100%;
        height: 100%;
      }
    `;
    GM_addStyle(style);
  }

  function moneyStrToNum(str) {
    str = str.substring(1);
    let money = parseFloat(str.substring(0, str.length - 1));
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
        money = parseFloat(str.replace(",", ""));
        break;
    }
    return money;
  }
  
  function moneyNumToStr(num, unit) {
    if (!unit) {
      if (num > 1000000000) {
        unit = "B";
      } else if (num > 1000000) {
        unit = "M";
      } else if (num > 1000) {
        unit = "K";
      } else {
        unit = "";
      }
    }
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

/**
 * @description waitForKeyElements.js v1.2
 * @author CoeJoder
 * @param selectorOrFunction
 * @param callback
 * @param waitOnce
 * @param interval
 * @param maxIntervals
 */
function waitForKeyElements(selectorOrFunction,callback,waitOnce,interval,maxIntervals){if(typeof waitOnce==="undefined"){waitOnce=true;}if(typeof interval==="undefined"){interval=300;}if(typeof maxIntervals==="undefined"){maxIntervals=-1;}var targetNodes=(typeof selectorOrFunction==="function")?selectorOrFunction():document.querySelectorAll(selectorOrFunction);var targetsFound=targetNodes&&targetNodes.length>0;if(targetsFound){targetNodes.forEach(function(targetNode){var attrAlreadyFound="data-userscript-alreadyFound";var alreadyFound=targetNode.getAttribute(attrAlreadyFound)||false;if(!alreadyFound){var cancelFound=callback(targetNode);if(cancelFound){targetsFound=false;}else{targetNode.setAttribute(attrAlreadyFound,true);}}});}if(maxIntervals!==0&&!(targetsFound&&waitOnce)){maxIntervals-=1;setTimeout(function(){waitForKeyElements(selectorOrFunction,callback,waitOnce,interval,maxIntervals);},interval);}}