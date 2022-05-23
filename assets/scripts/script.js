var key = "1f2cac8879443e031fb1b41ac0aa9314";
var citiesUrl = "https://raw.githubusercontent.com/manifestinteractive/openweathermap-cities/master/data/owm_city_list.json";

var forecast = $("#forecast");
var cityspan = $("#cityname");
var weathericon = $("#weathericon");
var temp = $("#temp");
var wind = $("#wind");
var humidity = $("#humidity");
var uv = $("#uv");

// object for unit system, built in for expanding to multiple unit systems
var units = {
    system: "imperial",
    speed: "MPH",
    degrees: "F"
}

function checkWeather(cityname) {
    fetch(citiesUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            checkCity(data, cityname)
            //console.log(data);
            //console.log(cityname.toUpperCase())

        });
}

function checkCity(data, cityname) {
    for (i = 0; i < data.RECORDS.length; i++) {
        if (cityname.toUpperCase() === data.RECORDS[i].owm_city_name.toUpperCase()) {
            cityspan.text(data.RECORDS[i].owm_city_name);
            getCityWeather(data);
            return;
        }
    }
}

function getCityWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.RECORDS[i].owm_latitude}&lon=${city.RECORDS[i].owm_longitude}&appid=${key}&units=${units.system}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        temp.text(`${data.current.temp} \u00B0${units.degrees}`);
        wind.text(`${data.current.wind_speed} ${units.speed}`);
        humidity.text(`${data.current.humidity}%`);
        uv.text(data.current.uvi);
        colorUv(data.current.uvi, uv);
        weathericon.attr("src", "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png");
    })
}
checkWeather("Truro");

function colorUv(uvindex, element) {
    console.log(uvindex, element)
    if(uvindex < 3) element.attr("style", "background-color: green;");
    else if (uvindex < 6) element.attr("style", "background-color: yellow;");
    else if (uvindex < 8) element.attr("style", "background-color: orange;");
    else element.attr("style", "background-color: red;");
}