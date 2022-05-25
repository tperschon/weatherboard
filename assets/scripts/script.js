// key for openweather, url for a github an open-source MIT resource I found that has all the openweather cities in a json
var key = "1f2cac8879443e031fb1b41ac0aa9314";
var citiesUrl = "https://raw.githubusercontent.com/manifestinteractive/openweathermap-cities/master/data/owm_city_list.json";

// configuration variables
var maxHistory = 10;                                                    // max number of history items to show
var daysForecast = 7;                                                   // number of days, up to 7, to get the future weather forecast
var unitSystem = "anything other than 'metric' defaults to imperial";   // the unit system to use, between imperial and metric, defaults to imperial

// DOM element assignments
var forecast = $("#forecast");
var cityspan = $("#cityname");
var weathericon = $("#weathericon");
var temp = $("#temp");
var wind = $("#wind");
var humidity = $("#humidity");
var uv = $("#uv");
var fiveday = $("#fivedayforecast");

// local storage retrieval, if (weather)history exists then set it
var storedWhistory = JSON.parse(localStorage.getItem("whistory"));
var whistory = [];
if (storedWhistory) whistory = storedWhistory;
// math to find out width each daily forecast card can take up
daysForecast = maxNum(daysForecast, 7);
var forecastWidth = (100 - daysForecast) / daysForecast;

// units variables default
var units = "imperial"
var speed = "MPH";
var degrees = "F";
// if metric is specified, change to metric
if (unitSystem === "metric") {
    units = "metric";
    speed = "M/S";
    degrees = "C";
};

// with a given city name, fetch the list of cities and feed that data and the cityname to checkCity(), if something goes wrong show an error
function getCities(cityname) {
    fetch(citiesUrl)
        .then(function (response) {
            return response.json();
        })
        .catch(function () {
            fetchError(citiesUrl)
        })
        .then(function (data) {
            checkCity(data, cityname);
        });
};

// if user gave matching city name, get the citie's weather or give an error
function checkCity(data, cityname) {
    // loop through all the cities in the list and check the name
    for (n = 0; n < data.RECORDS.length; n++) {
        // if matching name found
        if (cityname.toUpperCase() === data.RECORDS[n].owm_city_name.toUpperCase()) {
            // set text of the city span to the city's name and the current date
            cityspan.text(`${data.RECORDS[n].owm_city_name} (${new Date(Date.now()).toLocaleDateString()})`);
            // create a history item of the city
            createHistoryItem(data.RECORDS[n].owm_city_name);
            // (re)populate the history
            populateHistory();
            // run getCityWeather with the data
            getCityWeather(data.RECORDS[n]);
            // return if the city is found so we don't do the error call
            return;
        };
    };
    // if we get through the loop without a match, given an error
    searchError(cityname);
};

// use given object to make an openweather one call and feed that data to various functions, if something goes wrong show an error
function getCityWeather(city) {
    var cityUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${city.owm_latitude}&lon=${city.owm_longitude}&appid=${key}&units=${units}`;
    fetch(cityUrl)
        .then(function (response) {
            return response.json();
        })
        .catch(function () {
            fetchError(cityUrl)
        })
        .then(function (data) {
            showWeather(data);
            createFiveDayForecast(data);
        });
};

// set up today's weather
function showWeather(data) {
    // change visibility of the weather div
    $("#weather").addClass("visible").removeClass("invisible");
    // sets all the texts of the DOM elements for the current day's conditions
    temp.text(`${data.current.temp} \u00B0${degrees}`);
    wind.text(`${data.current.wind_speed} ${speed}`);
    humidity.text(`${data.current.humidity}%`);
    colorUv(data.current.uvi.toFixed(2), uv);
    weathericon.attr("src", "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png");
};

// creates the 5-day forecast with the given data object
function createFiveDayForecast(data) {
    // delete any existing 5-day forecast
    fiveday.children().remove();
    // loop through starting at 1 because 0 is today, create a forecast for each day
    for (i = 1; i < 1 + daysForecast; i++) {
        // create a div to put each daily forecast in
        var forecast = $("<div>").attr("class", "bg-primary text-light rounded p-1").attr("style", `width: ${forecastWidth}%;`);
        // create and set the text of a h3 with the date in it
        var fdate = $("<h3>").text(new Date(data.daily[i].dt * 1000).toLocaleDateString());
        // create and set the src of an image regarding that day's conditions
        var fimg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png");
        // create and set the text of a paragraph with the temperature for that day
        var ftemp = $("<p>").text(`Temp: ${data.daily[i].temp.day} \u00B0${degrees}`);
        // create and set the text of a paragraph with the wind for that day
        var fwind = $("<p>").text(`Wind: ${data.daily[i].wind_speed} ${speed}`);
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
        $("#fivedayforecast").append(forecast);
    };
};

// takes in an element and a number
function colorUv(uvindex, element) {
    // adds the uv class to the element
    element.text(uvindex).attr("class", "uv");
    // if the index is within particular ranges, color the text and background appropriately
    if (uvindex < 3) element.attr("style", "background-color: green;").addClass("text-light");
    else if (uvindex < 6) element.attr("style", "background-color: yellow;").addClass("text-dark");
    else if (uvindex < 8) element.attr("style", "background-color: orange;").addClass("text-dark");
    else if (uvindex < 11) element.attr("style", "background-color: red;").addClass("text-light");
    else element.attr("style", "background-color: purple;").addClass("text-light");
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
    whistory = removeDuplicates(whistory, "city");
    // set the new whistory to localstorage
    localStorage.setItem("whistory", JSON.stringify(whistory));
};

// sorts the whistory items based on a property, reused code from prior assignment
function sortByProp(objectArray, property, descending) {
    objectArray.sort(function (prop1, prop2) {
        if (prop1[property] < prop2[property]) return -1;
        else if (prop2[property] < prop1[property]) return 1;
        else return 0;
    });
    // if descending is passed, reverse the array to give descending order
    if (descending) objectArray.reverse();
};

function createHistoryButton(city) {
    // create a button
    var item = $("<button>");
    // give the button text
    item.text(city);
    // style the button
    item.attr("class", "col-12 my-1 historybutton").attr("style", "border-radius: 5px;");
    // append the button to the history section
    $("#history").append(item);
};

// repopulate the search history
function populateHistory() {
    // first remove any history that exists
    $("#history").children().remove();
    // sort the history by the created property
    sortByProp(whistory, "created", "literallyanytruthyvalue");
    // create buttons for the history, with a max lnumber of history items
    for (i = 0; i < maxNum(whistory.length, maxHistory); i++) {
        createHistoryButton(whistory[i].city);
    };
};

// remove duplicates based on given property from an object array
function removeDuplicates(objectArray, property) {
    // declare an empty array so we can use array methods
    var newArray = [];
    // iterate the length of the object array
    for (i = 0; i < objectArray.length; i++) {
        // start with a false value
        var isDuplicate = false;
        // iterate the remaining length of the object array (so we don't compare something to itself or past items)
        for (j = i + 1; j < objectArray.length; j++) {
            // compare object properties, if true set our boolean true
            if ((objectArray[i][property]).toUpperCase() === objectArray[j][property].toUpperCase()) {
                isDuplicate = true;
            };
        };
        // if the boolean stayed false, push the object to the new array
        if (!isDuplicate) newArray.push(objectArray[i]);
    };
    // return the new array after all the work is done
    return newArray;
};

// returns the lower of the number of specified maximum
function maxNum(num, max) {
    if (num > max) return max;
    else return num;
};

// if history div is clicked
$("#history").click(function (event) {
    // clear the search field
    $("#searchcity").val("");
    // if a button specifically is clicked within the #history div, pass the button's text into getCities()
    if (event.target.nodeName === "BUTTON") getCities(event.target.textContent);
});

// if form is submitted
$("form").submit(function (event) {
    // stop default submit functionality
    event.preventDefault();
    // pass the search's value into getCities()
    if ($("#searchcity").val()) getCities($("#searchcity").val().trim());
    else searchError();
    // clear the search field
    $("#searchcity").val("");
});

// show an error on the search isn't found
function searchError(cityname) {
    // remove any existing warning so they don't stack up
    $("#warning").remove();
    // if a value was passed
    if (cityname) {
        // create the warning
        var warning = $("<h6>").text(`'${cityname}' could not be found.`).attr("class", "text-danger").attr("id", "warning");
        // append the warning after the search input
        $("#searchcity").after(warning);
    };
};

// error alert used by fetches as a catch
function fetchError(url) {
    alert(`There was an error retrieving data from the server @ ${url}`);
};

// populate user's history on page load
populateHistory();