var myDate = new Date();

let nowTempurl =
  "https://devapi.qweather.com/v7/weather/now?key=6a74187b0b7c45e98d2b246752142dbc";
let futureTempurl =
  "https://www.tianqiapi.com/free/week?appid=42466199&appsecret=GScy5YjI&cityid=101044000";
let yesterdayurl =
  "https://datasetapi.qweather.com/v7/historical/weather?key=fa655f993c2246009b6df5a7ee8016bf&date=" +
  getYesterday();
let airLevelurl =
  "https://devapi.qweather.com/v7/air/now?key=6a74187b0b7c45e98d2b246752142dbc";
let hourlyurl =
  "https://devapi.qweather.com/v7/weather/24h?key=6a74187b0b7c45e98d2b246752142dbc";
let d3url =
  "https://devapi.qweather.com/v7/weather/3d?key=6a74187b0b7c45e98d2b246752142dbc";
let localurl =
  "https://apis.map.qq.com/ws/geocoder/v1/?output=jsonp&key=U3JBZ-YSC6D-NEO46-HDWMG-LP7TK-2LFLE";
let searchurl =
  "https://geoapi.qweather.com/v2/city/lookup?key=6a74187b0b7c45e98d2b246752142dbc";
let url =
  "https://geoapi.qweather.com/v2/city/lookup?key=6a74187b0b7c45e98d2b246752142dbc";
let history = [];
const searchInput = document.querySelector("#i-location");
const historyList = document.querySelector(".ls-city");
let loc = document.querySelector(".loc");
let search = document.querySelector(".search");
let btnCancel = document.querySelector("#btn-cancel");
let btnClean = document.querySelector("#btn-clean");
let searchBtn = document.querySelector("#icon-search");
let searchList = document.querySelector("#searchList");
var hour = [];
var cityname = { location: "" };
var localID = { location: "101044000" };
var cityID = { cityid: "101044000" };
let isCreate = false;
var chart = createChart();
request();

//重庆url
searchList.ontouchend = (e) => {
  addHistory(e);
  document.querySelector("#cityName").innerText = `${
    e.target.textContent.split(",")[1]
  } ${e.target.textContent.split(",")[2]}`;
  localID.location = e.target.id;
  cityID.location = e.target.id;
  search.style.animation = "hiddenSearch 0.2s linear forwards";
  searchList.style.visibility = "hidden";
  document.querySelector("body").style.overflow = "auto";
  request();
};
searchInput.onfocus = () => {
  searchList.style.visibility = "visible";
  searchList.innerHTML = "";
};
searchInput.onblur = () => {
  searchList.style.visibility = "hidden";
};
searchInput.oninput = debounce(() => {
  let pattern = new RegExp("^[\u4E00-\u9FA5]+$");
  if (pattern.test(searchInput.value)) {
    let text = { location: searchInput.value };
    ajaxGet(searchurl, text, false).then((req) => {
      let data = JSON.parse(req);
      let searchItem = "";
      for (let i = 0; i < data.location.length; i++) {
        searchItem += `<div class="cityshow" id="${data.location[i].id}">${data.location[i].adm1},${data.location[i].adm2},${data.location[i].name}</div>`;
      }
      searchList.innerHTML = searchItem;
    });
  } else if (searchInput.value == null) {
    let searchItem = "";
    searchList.innerHTML = searchItem;
  }
}, 1000);

function addHistory(e) {
  console.log(searchInput.value);
  document.querySelector("#ct-history").style.visibility = "visible";
  if (history.length >= 3) {
    history.pop();
  }
  history.unshift(e.target.textContent.split(",")[2]);
  searchInput.value = "";
  renderHistory();
}

function renderHistory() {
  let dom = "";
  history.forEach((item, index) => {
    if (index === 0 || index === 2) {
      dom += `<li class="opt-city">${item}</li>`;
    } else {
      dom += `<li class="opt-city-center">${item}</li>`;
    }
  });
  historyList.innerHTML = dom;
}
loc.ontouchend = () => {
  search.style.animation = "showSearch 0.2s linear forwards";
  document.querySelector("body").style.overflow = "hidden";
};
btnCancel.ontouchend = () => {
  search.style.animation = "hiddenSearch 0.2s linear forwards";
  searchList.style.visibility = "hidden";
  document.querySelector("body").style.overflow = "auto";
};
btnClean.ontouchend = () => {
  history = [];
  renderHistory();
  document.querySelector("#ct-history").style.visibility = "hidden";
};

function getWeek(dateString) {
  var dateArray = dateString.split("-");
  date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
  return "周" + "日一二三四五六".charAt(date.getDay());
}
function getYesterday() {
  let time = myDate.getTime() - 24 * 60 * 60 * 1000;
  let yesterday = new Date(time);
  return (
    yesterday.getFullYear() +
    "" +
    (yesterday.getMonth() > 9
      ? yesterday.getMonth() + 1
      : "0" + (yesterday.getMonth() + 1)) +
    +(yesterday.getDate() > 9 ? yesterday.getDate() : "0" + yesterday.getDate())
  );
}
function deleteYear(dateString) {
  return dateString.replace(/[0-9]{4}-/i, "").replace(/-/i, "/");
}

function isSame(date1, date2) {
  let num1 = parseInt(date1.match(/[0-9]{2}/i));
  let num2 = parseInt(date2.match(/[0-9]{2}/i));
  if (num1 === num2) {
    return true;
  } else {
    return false;
  }
}
function closeT(mask) {
  mask.setAttribute("class", "mask-off mask");
  airShow.style.animation = "hiddenAir 0.5s ease  forwards";
}
function ajaxGet(url, data, async = true) {
  return new Promise(function (resolve, reject) {
    let req = new XMLHttpRequest();
    let str = "";
    data = data || {};
    for (let i in data) {
      str += `&${i}=${data[i]}`;
    }
    url = url + str;
    req.open("GET", url, async);
    req.onreadystatechange = function () {
      if (req.readyState == 4 && req.status == 200) {
        resolve(req.responseText);
      }
    };
    req.onerror = function () {
      reject(new Error(req.statusText));
    };
    req.send();
  });
}
function debounce(fn, wait) {
  var timeout = null;
  return function () {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn, wait);
  };
}

function createChart() {
  var ctx = document.querySelector("#myChart").getContext("2d");
  var chart = new Chart(ctx, {
    // 要创建的图表类型
    type: "line",
    // 数据集
    data: {
      labels: ["0", "1", "2", "3", "4", "5", "6", "7"],
      datasets: [
        {
          labels: "max",
          backgroundColor: "#ffb74d",
          borderColor: "#ffb74d",
          data: [],
          fill: false,
          borderWidth: 2,
        },
        {
          labels: "min",
          backgroundColor: "#4fc3f7",
          borderColor: "#4fc3f7",
          data: [],
          fill: false,
          borderWidth: 2,
        },
      ],
    },

    // 配置选项
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: "",
      },
      legend: { display: false },
      scales: {
        xAxes: [
          {
            gridLines: { display: false },
            ticks: { fontColor: "white" },
          },
        ],
        yAxes: [{ gridLines: { display: false }, ticks: { display: false } }],
      },
      animation: {
        // 这部分是数值显示的功能实现
        onComplete: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;
          // 以下属于canvas的属性（font、fillStyle、textAlign...）
          ctx.font = Chart.helpers.fontString(
            Chart.defaults.global.defaultFontSize,
            Chart.defaults.global.defaultFontStyle,
            Chart.defaults.global.defaultFontFamily
          );
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          let flag = 0;
          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              if (index == 0) {
                ctx.fillStyle = "gray";
              } else {
                ctx.fillStyle = "black";
              }
              if (flag === 0) {
                var data = dataset.data[index];
                if (index === dataset.data.length - 1)
                  ctx.fillText(` ${data}°`, bar._model.x - 5, bar._model.y - 5);
                else ctx.fillText(` ${data}°`, bar._model.x, bar._model.y - 5);
              } else {
                var data = dataset.data[index];
                if (index === dataset.data.length - 1)
                  ctx.fillText(
                    ` ${data}°`,
                    bar._model.x - 5,
                    bar._model.y + 25
                  );
                else ctx.fillText(` ${data}°`, bar._model.x, bar._model.y + 25);
              }
              if (index === dataset.data.length - 1) {
                flag = 1;
              }
              0;
            });
          });
        },
      },
      hover: {
        animationDuration: 0, // 悬停项目时动画的持续时间
      },
      responsiveAnimationDuration: 0, // 调整大小后的动画持续时间
    },
  });
  return chart;
}

function request() {
  ajaxGet("./json/data.json", {}).then((req) => {
    //最下面那栏
    let pointdata = JSON.parse(req);
    let fpage = document.querySelector(".firstPage");
    let spage = document.querySelector(".secondPage");
    let btShow = document.querySelector(".btShow");
    let topItem = document.querySelector(".btShow .topItem");
    let text = document.querySelector(".btShow .text");
    let getBtn = document.querySelector(".btShow .get");
    let mask = document.querySelector(".btmask-off");
    let fpagehtml = "",
      spagehtml = "";
    for (let i = 0; i < 16; i++) {
      if (i < 8)
        fpagehtml += `<li>
          <img src="./images/${pointdata.data[i].pic}.png" class="bottomIcon">
          <div class="topDescribe">${pointdata.data[i].value}</div>
          <div class="bottomDescribe">${pointdata.data[i].topText.replace(
            /指数/i,
            ""
          )}</div>
        </li>`;
      else
        spagehtml += `<li>
          <img src="./images/${pointdata.data[i].pic}.png" class="bottomIcon">
          <div class="topDescribe">${pointdata.data[i].value}</div>
          <div class="bottomDescribe">${pointdata.data[i].topText.replace(
            /指数/i,
            ""
          )}</div>
        </li>`;
    }
    fpage.innerHTML = fpagehtml;
    spage.innerHTML = spagehtml;
    for (let i = 0; i < 16; i++) {
      if (i < 8)
        fpage.children[i].ontouchstart = debounce(() => {
          topItem.innerHTML = `${pointdata.data[i].topText}`;
          text.innerHTML = `${pointdata.data[i].text}`;
          topItem.style.backgroundColor = `${pointdata.data[i].bgcolor}`;
          btShow.style.animation = "showAir 0.5s ease  forwards";
          mask.setAttribute("class", "btmask-on");
          document.querySelector("body").style.overflow = "hidden";
          getBtn.style.backgroundColor = `${pointdata.data[i].bgcolor}`;
        }, 200);
      else {
        spage.children[i - 8].ontouchstart = debounce(() => {
          topItem.innerHTML = `${pointdata.data[i].topText}`;
          text.innerHTML = `${pointdata.data[i].text}`;
          topItem.style.backgroundColor = `${pointdata.data[i].bgcolor}`;
          btShow.style.animation = "showAir 0.5s ease  forwards";
          mask.setAttribute("class", "btmask-on");
          document.querySelector("body").style.overflow = "hidden";
          getBtn.style.backgroundColor = `${pointdata.data[i].bgcolor}`;
        }, 200);
      }
    }
    getBtn.ontouchend = () => {
      btShow.style.animation = "hiddenAir 0.5s ease  forwards";
      mask.setAttribute("class", "btmask-off");
      document.querySelector("body").style.overflow = "auto";
    };
    mask.ontouchend = () => {
      btShow.style.animation = "hiddenAir 0.5s ease  forwards";
      mask.setAttribute("class", "btmask-off");
      document.querySelector("body").style.overflow = "auto";
    };
  });

  ajaxGet(airLevelurl, localID)
    .then((req) => {
      let data = JSON.parse(req);
      let lable = "";
      let bgcolor = "";
      let airShow = document.querySelector(".airShow");
      let airLevel = document.querySelector(".airLevel");
      let airShowhtml = "";
      if (data.now.category == "轻度污染" || "良") {
        lable = "良";
        bgcolor = "#f0cc35";
      } else if (data.now.category == "优") {
        lable = "优";
        bgcolor = "#a3d765";
      } else {
        lable = "差";
        bgcolor = "brown";
      }
      airLevel.style.backgroundColor = bgcolor;
      airLevel.innerHTML = `<p id="til">${data.now.aqi}</p>
    <p id="value">${lable}</p>`;
      airShowhtml += `
      <img src="./images/close.png" class="close" />
  <div class="topText">空气质量指数</div>
  <div class="airPoint">${data.now.aqi}</div>
  <div class="airL" style="background-color: ${bgcolor};">${lable}</div>
  <div class="airItem">
    <div class="item">
      <div class="num">${data.now.pm2p5}</div>
      <div class="type">PM2.5</div>
    </div>
    <div class="item">
      <div class="num">${data.now.pm10}</div>
      <div class="type">PM10</div>
    </div>
    <div class="item">
      <div class="num">${data.now.so2}</div>
      <div class="type">SO2</div>
    </div>
    <div class="item">
      <div class="num">${data.now.no2}</div>
      <div class="type">NO2</div>
    </div>
    <div class="item">
      <div class="num">${data.now.o3}</div>
      <div class="type">O3</div>
    </div>
    <div class="item">
      <div class="num">${data.now.co}</div>
      <div class="type">CO</div>
    </div>
  </div>`;
      airShow.innerHTML = airShowhtml;
    })
    .then(() => {
      let closex = document.querySelector(".airShow .close");
      closex.ontouchend = closeT;
    });

  ajaxGet(hourlyurl, localID) //当天24小时
    .then((req) => {
      let data = JSON.parse(req);
      return data.hourly;
    })
    .then((hourly) => {
      ajaxGet(d3url, localID).then((req) => {
        //未来三天，拿日出日落
        console.log(hourly);
        let data = JSON.parse(req);
        let lable = "";
        let hourlyText = "";
        let clockTemp = document.querySelector(".hoursWeather ol");
        let sunrise = data.daily[0].sunrise;
        let sunset = data.daily[0].sunset;
        for (let i = 0; i < hourly.length; i++) {
          if (hourly[i].text.search(/雨/i)) {
            lable = "yu";
          } else if (hourly[i].text.search(/晴/i)) {
            lable = "qing";
          } else if (hourly[i].text.search(/阴/i)) {
            lable = "yin";
          } else {
            lable = "yun";
          }
          hourlyText += `<li>
            <p class="clockTxt">${hourly[i].fxTime.match(
              /[0-9]{1,4}:[0-9]{1,4}/i
            )}</p>
            <img class="weatherIcon" src="./images/day/${lable}.png" />
            <p class="clockTemp">${hourly[i].temp}</p>
          </li>`;
          if (
            isSame(hourly[i].fxTime.match(/[0-9]{1,4}:[0-9]{1,4}/i)[0], sunrise)
          ) {
            hourlyText += `<li>
            <p class="clockTxt">${sunrise}</p>
            <img class="weatherIcon" src="./images/rise.png" />
            <p class="clockTemp">日出</p>
          </li>`;
          }
          if (
            isSame(hourly[i].fxTime.match(/[0-9]{1,4}:[0-9]{1,4}/i)[0], sunset)
          ) {
            hourlyText += `<li>
            <p class="clockTxt">${sunset}</p>
            <img class="weatherIcon" src="./images/set.png" />
            <p class="clockTemp">日落</p>
          </li>`;
          }
        }
        clockTemp.innerHTML = hourlyText;
      });
    });

  ajaxGet(yesterdayurl, localID)
    .then((req) => {
      //昨日天气
      let data = JSON.parse(req);
      let futureTopText = "",
        futurebottomText = "";
      let dayTemp = [],
        nightTemp = [];
      dayTemp.push(parseInt(data.weatherHourly[12].temp));
      nightTemp.push(parseInt(data.weatherHourly[23].temp));
      console.log(dayTemp);
      futureTopText += `<li>
      <div class="top">昨天</div>
      <div class="topDate">${deleteYear(data.weatherDaily.date)}</div>
      <div class="weather">${data.weatherHourly[0].text}</div>
      <img src="./images/day/qing.png" class="weatherIcon" />
    </li>`;
      futurebottomText += `<li class="bottom">
      <img src="./images/night/qing.png" class="weatherIcon" />
      <div class="weather">${data.weatherHourly[0].text}</div>
      <div class="bottomWind">${data.weatherHourly[0].windDir}</div>
      <div class="windLevel">${data.weatherHourly[0].windScale}级</div>
    </li>`;
      return [futureTopText, futurebottomText, dayTemp, nightTemp];
    })
    .then((text) => {
      ajaxGet(futureTempurl, cityID).then((req) => {
        //未来七天天气
        let data = JSON.parse(req);
        let today = document.querySelector(".today");
        let tomorrow = document.querySelector(".tomorrow");
        let futureTop = document.querySelector(".topWeather");
        let futurebottom = document.querySelector(".bottomWeather");
        let futureTopText = text[0],
          futurebottomText = text[1];
        dayTemp = text[2];
        nightTemp = text[3];
        let dataLable = ["今天", "明天", "后天"];
        let lable = "";
        for (let i = 0; i < 7; i++) {
          if (i < 3) {
            lable = dataLable[i];
          } else {
            lable = getWeek(data.data[i].date);
          }
          dayTemp.push(parseInt(data.data[i].tem_day));
          nightTemp.push(parseInt(data.data[i].tem_night));
          futureTopText += `<li>
        <div class="top">${lable}</div>
        <div class="topDate">${deleteYear(data.data[i].date)}</div>
        <div class="weather">${data.data[i].wea.replace(
          /转[\u4E00-\u9FA5]{1,2}/i,
          ""
        )}</div>
        <img src="./images/day/${
          data.data[i].wea_img
        }.png" class="weatherIcon" />
      </li>`;
          futurebottomText += `<li class="bottom">
        <img src="./images/night/${
          data.data[i].wea_img
        }.png" class="weatherIcon" />
        <div class="weather">${data.data[i].wea.replace(
          /转[\u4E00-\u9FA5]{1,2}/i,
          ""
        )}</div>
        <div class="bottomWind">${data.data[i].win}</div>
        <div class="windLevel">${data.data[i].win_speed}</div>
      </li>`;
          futureTop.innerHTML = futureTopText;
          futurebottom.innerHTML = futurebottomText;
        }

        today.innerHTML = `<div class="top">
          <p class="data">今天</p>
          <p class="temp">${data.data[0].tem_day}/${data.data[0].tem_night}°</p>
        </div>
        <div class="bottom">
          <p class="weather">${data.data[0].wea}</p>
          <p>
            <img class="weatherIcon" src="./images/day/${data.data[0].wea_img}.png" />
          </p>
        </div>`;
        tomorrow.innerHTML = `<div class="top">
        <p class="data">明天</p>
        <p class="temp">${data.data[1].tem_day}/${data.data[1].tem_night}°</p>
      </div>
      <div class="bottom">
        <p class="weather">${data.data[1].wea}</p>
        <p>
          <img class="weatherIcon" src="./images/day/${data.data[1].wea_img}.png" />
        </p>
      </div>`;
        chart.data.datasets[0].data = dayTemp;
        chart.data.datasets[1].data = nightTemp;
        chart.update();
      });
    });

  ajaxGet(nowTempurl, localID).then((req) => {
    //当日温度 湿度 风力风向
    let data = JSON.parse(req);
    let nowTemp = document.querySelector(".nowTemp");
    let nowWeather = document.querySelector(".nowWeather");
    let wind = document.querySelector(".wind");
    console.log(wind);
    let humidity = document.querySelector(".humidity");
    nowTemp.innerHTML = data.now.temp;
    nowWeather.innerHTML = data.now.text;
    wind.innerHTML = `${data.now.windDir}${data.now.windScale}级`;
    humidity.innerHTML = `湿度${data.now.humidity}`;
  });
}
