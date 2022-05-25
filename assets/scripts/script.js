// key for openweather, url for a github an open-source MIT resource I found that has all the openweather cities in a json
var key = "1f2cac8879443e031fb1b41ac0aa9314";
var citiesUrl = "https://raw.githubusercontent.com/manifestinteractive/openweathermap-cities/master/data/owm_city_list.json";

// configuration variables
var maxHistory = 10;
// DOM element assignments
// main forecast elements
var forecast = $("#forecast");
var cityspan = $("#cityname");
var weathericon = $("#weathericon");
var temp = $("#temp");
var wind = $("#wind");
var humidity = $("#humidity");
var uv = $("#uv");
// fivedayforecast div
var fiveday = $("#fivedayforecast");

var test = [];

// local storage retrieval, if (weather)history exists then set it
var storedWhistory = JSON.parse(localStorage.getItem("whistory"));
var whistory = [];
if (storedWhistory) whistory = storedWhistory;

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
            for (a = 0; a < data.length; a++) {
                var tO = {
                    city: data[a].owm_city_name,
                    lat: data[a].owm_latitude,
                    lon: data[a].owm_longitutde
                }
                test.append(tO)
            }
            console.log(test)
            console.log(data)
            checkCity(data, cityname)
        })
        .catch(citiesUrl)
};

// if user gave matching city name, get the citie's weather or give an error
function checkCity(data, cityname) {
    // loop through all the cities in the list and check the name
    for (n = 0; n < data.RECORDS.length; n++) {
        // if matching name found
        if (cityname.toUpperCase() === data.RECORDS[n].owm_city_name.toUpperCase()) {
            //
            // set text of the city span to the city's name
            cityspan.text(data.RECORDS[n].owm_city_name);
            // create a history item of the city
            createHistoryItem(data.RECORDS[n].owm_city_name);
            // (re)populate the history
            populateHistory();
            console.log(n)
            // run getCityWeather with the data
            getCityWeather(data.RECORDS[n]);
            // return if the city is found so we don't do the error call
            return;
        }
    }
    // if we get through the loop without a match, given an error
    searchError();
};

// use given object to make an openweather one call and feed that data to various functions
function getCityWeather(city) {
    console.log(city)
    console.log(city.owm_latitude)
    console.log(city.owm_longitude)
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.owm_latitude}&lon=${city.owm_longitude}&appid=${key}&units=${units.system}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            showWeather(data);
            createFiveDayForecast(data);
        })
};

// set up today's weather
function showWeather(data) {
    // 
    temp.text(`${data.current.temp} \u00B0${units.degrees}`);
    wind.text(`${data.current.wind_speed} ${units.speed}`);
    humidity.text(`${data.current.humidity}%`);
    colorUv(data.current.uvi.toFixed(2), uv);
    weathericon.attr("src", "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png");
}

// creates the 5-day forecast with the given data object
function createFiveDayForecast(data) {
    // delete any existing 5-day forecast
    fiveday.children().remove();
    // loop through starting at 1 because 0 is today, create a forecast for each day
    for (i = 1; i < 6; i++) { 
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
        // append all the other dom objects to our div
        forecast.append(fdate, fimg, ftemp, fwind, fhumidity, fuv, findex);
        // append our div to the forecast dom
        $("#fivedayforecast").append(forecast)
    }
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

// create a localstorage entry for a whistory item
function createHistoryItem(city) {
    // create our temporary object
    var tempObj = {
        city: city,
        created: Date.now()
    };
    // push the object to the array
    whistory.push(tempObj);
    // remove duplicate entries from whistory
    whistory = removeDuplicates(whistory);
    // set the new whistory to localstorage
    localStorage.setItem("whistory", JSON.stringify(whistory));
};

// sorts the whistory items based on their timestamp of when they were created, reused code from prior assignment, more recently created items show first
function sortByTime(objectArray) {
    objectArray.sort(function (time1, time2) {
        if (time1.created < time2.created) return -1;
        else if (time2.created < time1.created) return 1;
        else return 0;
    });
    objectArray.reverse();
};

function createHistoryButton(city) {
    // create a button
    var item = $("<button>");
    // give the button text
    item.text(city);
    // style the button
    item.attr("class", "col-12 my-1").attr("style", "border-radius: 5px;");
    // append the button to the history section
    $("#history").append(item);
};

// repopulate the search history
function populateHistory() {
    // first remove any history that exists
    $("#history").children().remove();
    // sort the history
    sortByTime(whistory);
    // create buttons for the history, with a max lnumber of history items
    for (i = 0; i < maxNum(whistory.length, maxHistory); i++) {
        createHistoryButton(whistory[i].city);
    };
};

// remove duplicates based on the city property from an object array
function removeDuplicates(objectArray, property) {
    var newArray = [];
    for (i = 0; i < objectArray.length; i++) {
        var isDuplicate = false;
        for (j = i + 1; j < objectArray.length; j++) {
            if(objectArray[i].city.toUpperCase() === objectArray[j].city.toUpperCase()) {
                isDuplicate = true;
            }
        }
        if (isDuplicate === false) newArray.push(objectArray[i]);
    }
    return newArray;
}

// returns the lower of the number of specified maximum
function maxNum(num, max) {
    if (num > max) return max;
    else return num;
}

$("#history").click(function(event) {
    if(event.target.nodeName === "BUTTON") checkWeather(event.target.textContent);
});

$("form").submit(function(event) {
    event.preventDefault();
    checkWeather($("#searchcity").val());
})


// show an error on the search isn't found
function searchError() {
    // remove any existing warning so they don't stack up
    $("#warning").remove();
    // create the warning
    var warning = $("<h4>").text("City could not be found.").attr("class", "text-danger").attr("id", "warning");
    // append the warning after the search input
    $("#searchcity").after(warning);
}

function fetchError(url) {
    alert(`There was an error retrieving data from the server @ ${url}`)
}

populateHistory();
