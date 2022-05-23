var key = "1f2cac8879443e031fb1b41ac0aa9314";
//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

fetch("https://raw.githubusercontent.com/manifestinteractive/openweathermap-cities/master/data/owm_city_list.json")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data)
        city = data.RECORDS[0]
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.owm_latitude}&lon=${city.owm_longitude}&appid=${key}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data)
        })
    })

