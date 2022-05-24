// key for openweather, url for a github an open-source MIT resource I found that has all the openweather cities in a json
var key = "1f2cac8879443e031fb1b41ac0aa9314";
var citiesUrl = "https://raw.githubusercontent.com/manifestinteractive/openweathermap-cities/master/data/owm_city_list.json";

// DOM element assignments
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
};

// with a given city name, fetch the list of cities and feed that data and the cityname to checkCity()
function checkWeather(cityname) {
    fetch(citiesUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            checkCity(data, cityname)
        });
};

// if user gave matching city name, get the citie's weather or give an error
function checkCity(data, cityname) {
    // loop through all the cities in the list and check the name
    for (i = 0; i < data.RECORDS.length; i++) {
        // if matching name found
        if (cityname.toUpperCase() === data.RECORDS[i].owm_city_name.toUpperCase()) {
            // set text of the city span to the city's name
            cityspan.text(data.RECORDS[i].owm_city_name);
            // run getCityWeather with the data
            getCityWeather(data.RECORDS[i], true);
            return;
        }
    }
    getCityWeather(data, false);
};

// 
function getCityWeather(city, boolean = false) {
    if (boolean) {
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.owm_latitude}&lon=${city.owm_longitude}&appid=${key}&units=${units.system}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                temp.text(`${data.current.temp} \u00B0${units.degrees}`);
                wind.text(`${data.current.wind_speed} ${units.speed}`);
                humidity.text(`${data.current.humidity}%`);
                colorUv(data.current.uvi.toFixed(2), uv);
                weathericon.attr("src", "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png");
                for (i = 1; i < 6; i++) { // starting at 1 because 0 is today
                    // create a div to put each daily forecast in
                    var forecast = $("<div>").attr("class", "bg-primary text-light rounded m-1 p-1 col-2");
                    // create and set the text of a h3 with the date in it
                    var fdate = $("<h3>").text(new Date(data.daily[i].dt * 1000).toLocaleDateString("en-US"));
                    // create and set the src of an image regarding that day's conditions
                    var fimg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png");
                    // create and set the text of a paragraph with the temperature for that day
                    var ftemp = $("<p>").text(`Temp: ${data.daily[i].temp.day} \u00B0${units.degrees}`);
                    // create and set the text of a paragraph with the wind for that day
                    var fwind = $("<p>").text(`Wind: ${data.daily[i].wind_speed} ${units.speed}`);
                    // create and set the text of a paragraph with the humidity for that day
                    var fhumidity = $("<p>").text(`Humidity: ${data.daily[i].humidity}%`);
                    // create and set the text of a span with title for uvi
                    var fuv = $("<span>").text("UV Index: ");
                    // create the uvi span
                    var findex = $("<span>");
                    // color and format the uvi span
                    colorUv(data.daily[i].uvi.toFixed(2), findex);
                    forecast.append(fdate, fimg, ftemp, fwind, fhumidity, fuv, findex)
                    $("#fivedayforecast").append(forecast)
                }
            })
    }
    else showError();
};

function showError() {
    var warning = $("<h2>");
    warning.text("Error");
    warning.attr("style", "position: absolute; top: 40%; align-self: center; background-color: yellow: color: black;");
    $("body").append(warning);
}

// takes in an element and a number
function colorUv(uvindex, element) {
    // adds the uv class to the element
    element.text(uvindex).attr("class", "uv");
    // if the index is within particular ranges, color the text and background appropriately
    if(uvindex < 3) element.attr("style", "background-color: green;").addClass("text-light");
    else if (uvindex < 6) element.attr("style", "background-color: yellow;").addClass("text-dark");
    else if (uvindex < 8) element.attr("style", "background-color: orange;").addClass("text-dark");
    else element.attr("style", "background-color: red;").addClass("text-light");
};


function createHistoryItem(city) {
    // create a button
    var item = $("<button>");
    // give the button text
    item.text(city);
    // give it a timestamp this should be done in another place
    // item.attr("created", Date.now());
    // style the button
    item.attr("class", "col-12 my-1").attr("style", "border-radius: 5px;");
    // append the button to the history section
    $("#history").append(item);
}

$("#history").click(function(event) {
    checkWeather(event.target.textContent)
});

$("form").submit(function(event) {
    event.preventDefault();
    checkWeather($("#searchcity").val());
})