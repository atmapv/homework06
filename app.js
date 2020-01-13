
// SELECT ELEMENTS
const iconElement = document.querySelector("#weather_icon");
const tempElement = document.querySelector("#current_temp");
const humidity = document.querySelector("#current_hum");
const windspeed = document.querySelector("#current_speed");
const uv = document.querySelector("#current_uv");
const icon_element_arr = ["first_icon", "second_icon", "third_icon", "forth_icon", "fifth_icon"];
const date_element_arr = ["first_date", "second_date", "third_date", "forth_date", "fifth_date"];
const temp_element_arr = ["first_temp", "second_temp", "third_temp", "forth_temp", "fifth_temp"];
const humidity_element_arr = ["first_hum", "second_hum", "third_hum", "forth_hum", "fifth_hum"];

// App data
const weather = {};

weather.temperature = {
    unit : "fahrenheit"
}
var city_name = "Austin";
var city_country_code = "US";
// APP CONSTS AND VARS
const KELVIN = 273;
// API KEY(no use currently)
const key = "82005d27a116c2880c8f0fcb866998a0";

// weatherbit.io key
const API_key = "6db905a52be64015a5c9fcba67040111";

$(function(){
    var date = new Date();
    var current_date = (date.getMonth() + 1) + "/" + date.getDate() + "/" +date.getFullYear();
    $("#current_date").text(current_date);
    // When page loading, Get weather data of default city(Austin)
    getCurrentWeatherByCity(city_name, city_country_code);
    getForecastByCity(city_name, city_country_code);
    // Select City Name
    $(".list-group-item").click(function(){
        $(".list-group-item").removeClass("active");
        var id = $(this).attr("id");
        city_name = $(this).attr("city_name");
        city_country_code = $(this).attr('country_code');
        $("#"+id).addClass("active");
        $("#current_city").text(city_name);
        getCurrentWeatherByCity(city_name, city_country_code);
        getForecastByCity(city_name, city_country_code);
    });


    // SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
    function showError(error){
        notificationElement.style.display = "block";
        notificationElement.innerHTML = `<p> ${error.message} </p>`;
    }

    // GET WEATHER FROM API PROVIDER
    function getCurrentWeatherByCity(city_name, country_code){
        // let api = `https://api.openweathermap.org/data/2.5/weather?q=${city_name},${country_code}&appid=${key}`;

        let weatherbit_api = `https://api.weatherbit.io/v2.0/current?city=${city_name},${country_code}&units=I&key=${API_key}`
        fetch(weatherbit_api)
            .then(function(response){
                let data = response.json();
                return data;
            })
            .then(function(data){
                console.log("current", data);
                let weather_data = data.data[0];
                weather.lat = weather_data.lat;
                weather.lon = weather_data.lon;
                // getUVIndexByCity(data.lat, data.lon);
                weather.temperature.value = Math.ceil(weather_data.temp);
                weather.description = weather_data.weather.description;
                weather.iconId = weather_data.weather.icon;
                weather.speed = weather_data.wind_spd;
                weather.city = weather_data.city_name;
                weather.country = weather_data.country_code;
                weather.humidity = weather_data.rh;
                weather.uv = weather_data.uv;
                weather.date = weather_data.ob_time.split(" ")[0];
            })
            .then(function(){
                displayWeather();
            });
    }

    //GET UV INDEX DATA OF CURRENT CITY(when use openweathermap.org api)
    function getUVIndexByCity(lat, lon){
        let api = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}`;
        
        fetch(api)
            .then(function(response){
                let data = response.json();
                return data;
            })
            .then(function(data){
                weather.uv = data.value;
            })
            .then(function(){
                displayWeather();
            });
    }

    // DISPLAY WEATHER TO UI
    function displayWeather(){
        iconElement.innerHTML =`<img class="weather_icon_img" src="https://www.weatherbit.io/static/img/icons/${weather.iconId}.png"/>`;
        tempElement.innerHTML = weather.temperature.value;
    //   descElement.innerHTML = weather.description;
        humidity.innerHTML = weather.humidity;
        windspeed.innerHTML = weather.speed;
        uv.innerHTML = weather.uv;
        $("#current_date").text(weather.date);
        if(weather.uv <= 2){
            uv.className = "bg-success p-2 text-light rounded";
        }
        else if(weather.uv > 2 && weather.uv <= 5){
            uv.className = "bg-warning p-2 text-light rounded";
        } 
        else if(weather.uv > 6 && weather.uv <= 7){
            uv.className = "bg-orange p-2 text-light rounded";
        }
        else if(weather.uv > 7 && weather.uv <= 10){
            uv.className = "bg-danger p-2 text-light rounded";
        }
        else if(weather.uv > 10){
            uv.className = "bg-purple p-2 text-light rounded";
        }
    }

    // GET WEATHER FROM API PROVIDER WITH CITY NAME
    function getForecastByCity(city_name, country_code){
        $("#add_data_label").text("Forecast");

        let api = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city_name},${country_code}&units=I&key=${API_key}`;
        
        fetch(api)
            .then(function(response){
                let data = response.json();
                return data;
            })
            .then(function(data){
                var filter_data = data.data.filter(function(forecast){
                    let forecast_date = forecast.datetime.split("-")[2];
                    return Math.abs(Number(forecast_date) - Number(date.getDate())) <= 5;
                });
                return filter_data;
            })
            .then(function(data){
                let k = 0; let i = 0;
                data.forEach(function(forecast){
                    if(i > 0){
                        $("#"+date_element_arr[k]).text(forecast.datetime);
                        $("#"+icon_element_arr[k]).html('<img class="weather_icon_img" src="https://www.weatherbit.io/static/img/icons/'+forecast.weather.icon+'.png"/>');
                        $("#"+temp_element_arr[k]).text(Math.ceil(forecast.temp));
                        $("#"+humidity_element_arr[k]).text(forecast.rh);
                        k++;
                    }
                    i++;
                });
            });
    }

    // GET HISTORICAL WEATHER FROM API PROVIDER WITH CITY NAME
    function getHistoricalWeatherByCity(city_name, country_code){
        $("#add_data_label").text("Histories");
        var forecast_arr = [];
        for(var k = 6; k > 1; k--){
            let d_1 = new Date();
            let d_2 = new Date();
            d_1.setDate(d_1.getDate() - k);
            d_2.setDate(d_2.getDate() - k + 1);
            let start_date = d_1.getFullYear() + "-" + (d_1.getMonth() + 1) + "-" + d_1.getDate();
            let end_date = d_2.getFullYear() + "-" + (d_2.getMonth() + 1) + "-" + d_2.getDate();
            let api = `https://api.weatherbit.io/v2.0/history/daily?city=${city_name},${country_code}&start_date=${start_date}&end_date=${end_date}&units=I&key=${API_key}`;
            fetch(api)
                .then(function(response){
                    let data = response.json();
                    return data;
                })
                .then(function(data){
                    let forecast = data.data[0]
                    forecast_arr.push(forecast);
                    forecast_arr.sort(function(a, b){
                        let date_1 = new Date(a.datetime)
                        var date_2 = new Date(b.datetime);
                        if(date_1.getTime() > date_2.getTime()){
                            return -1;
                        }
                        if(date_1.getTime() < date_2.getTime()){
                            return 1;
                        }
                        return 0;
                    });
                    return forecast_arr;
                })
                .then(function(data){
                    var m = 4;
                    data.forEach(function(res){
                        $("#"+date_element_arr[Number(m)]).text(res.datetime);
                        $("#"+icon_element_arr[Number(m)]).html("");
                        $("#"+temp_element_arr[Number(m)]).text(Math.ceil(res.temp));
                        $("#"+humidity_element_arr[Number(m)]).text(res.rh);
                        m--;
                    })
                });
        }
    }
    
    // ADD AUTOCOMPLETE INTO SEARCH BOX
    function autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function(e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false;}
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
              /*check if the item starts with the same letters as the text field value:*/
              if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
              }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
              /*If the arrow DOWN key is pressed,
              increase the currentFocus variable:*/
              currentFocus++;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 38) { //up
              /*If the arrow UP key is pressed,
              decrease the currentFocus variable:*/
              currentFocus--;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 13) {
              /*If the ENTER key is pressed, prevent the form from being submitted,*/
              e.preventDefault();
              if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
              }
            }
        });
        function addActive(x) {
          /*a function to classify an item as "active":*/
          if (!x) return false;
          /*start by removing the "active" class on all items:*/
          removeActive(x);
          if (currentFocus >= x.length) currentFocus = 0;
          if (currentFocus < 0) currentFocus = (x.length - 1);
          /*add class "autocomplete-active":*/
          x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
          /*a function to remove the "active" class from all autocomplete items:*/
          for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
          }
        }
        function closeAllLists(elmnt) {
          /*close all autocomplete lists in the document,
          except the one passed as an argument:*/
          var x = document.getElementsByClassName("autocomplete-items");
          for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
              x[i].parentNode.removeChild(x[i]);
            }
          }
        }
        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    var city_arr = ['Austin', 'Chicago', 'New York', 'Orlando', 'San Francisco', 'Seattle', 'Denver', 'Atlanta'];
    autocomplete(document.getElementById("city_name"), city_arr);

    // GET SEARCH RESULT
    $("#search_city_btn").click(function(){
        if($("#city_name").val() != ""){
            let city_name_history = $("#city_name").val();
            $("#current_city").text(city_name_history);

            getCurrentWeatherByCity(city_name_history, "US");
            getHistoricalWeatherByCity(city_name_history, "US");
        }
    })
});

