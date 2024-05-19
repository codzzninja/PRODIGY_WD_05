const wrapper = document.querySelector(".wrapper"),
  inputPart = document.querySelector(".input-part"),
  infoTxt = inputPart.querySelector(".info-txt"),
  inputField = inputPart.querySelector("input"),
  locationBtn = inputPart.querySelector("button"),
  weatherPart = wrapper.querySelector(".weather-part"),
  wIcon = weatherPart.querySelector("img"),
  arrowBack = wrapper.querySelector("header i"),
  spinner = wrapper.querySelector(".spinner"), // Loading Spinner
  errorContainer = wrapper.querySelector(".error-container"), // Error Message Container
  historyList = document.querySelector(".history-list"); // Search history list

const apiKey = '6360817d4fb731dd74531695fe6859bb'; // Replace with your actual API key
let api;

inputField.addEventListener("keyup", (e) => {
  if (e.key == "Enter" && inputField.value != "") {
    requestApi(inputField.value);
    saveToLocalStorage(inputField.value); // Save search to history
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Your browser does not support geolocation api");
  }
});

function requestApi(city) {
  api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  fetchWeatherData(api);
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  fetchWeatherData(api);
}

function onError(error) {
  const errorMessage = document.createElement("div");
  errorMessage.classList.add("error-message");
  errorMessage.innerText = error.message;
  errorContainer.appendChild(errorMessage);
  setTimeout(() => {
    errorMessage.remove(); // Remove error message after a few seconds
  }, 5000);
}

function fetchWeatherData(apiUrl) {
  infoTxt.innerText = "Getting weather details...";
  infoTxt.classList.add("pending");
  spinner.classList.add("show"); // Show spinner

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      displayWeatherData(data);
      fetchForecast(data.name); // Fetch forecast data after getting weather data
      spinner.classList.remove("show"); // Hide spinner
    })
    .catch((error) => {
      infoTxt.innerText = "Something went wrong, API Error";
      infoTxt.classList.replace("pending", "error");
      spinner.classList.remove("show"); // Hide spinner
    });
}

function displayWeatherData(data) {
  if (data.cod == 200) {
    const city = data.name;
    const country = data.sys.country;
    const { description, id } = data.weather[0];
    const { temp, feels_like, humidity } = data.main;

    // Set weather icon based on weather condition ID
    wIcon.src = getWeatherIcon(id);

    weatherPart.querySelector(".temp .numb").innerText = Math.round(temp);
    weatherPart.querySelector(".weather").innerText = description;
    weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
    weatherPart.querySelector(".temp .numb-2").innerText = Math.round(feels_like);
    weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;

    infoTxt.classList.remove("pending", "error");
    infoTxt.innerText = "";
    inputField.value = "";
    wrapper.classList.add("active");
  } else {
    infoTxt.classList.replace("pending", "error");
    infoTxt.innerText = `${inputField.value} isn't a valid city name`;
  }
}

function fetchForecast(city) {
  const forecastApi = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  fetch(forecastApi)
    .then((res) => res.json())
    .then((data) => {
      displayForecast(data);
    })
    .catch((error) => {
      console.error("Error fetching forecast data:", error);
    });
}

function displayForecast(data) {
  const forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = ""; // Clear previous forecast data

  const forecastData = data.list.filter((item) => item.dt_txt.includes("12:00:00")); // Get daily forecast for 12:00:00

  forecastData.forEach((item) => {
    const forecastDate = new Date(item.dt * 1000); // Convert timestamp to date
    const day = forecastDate.toLocaleDateString("en-US", { weekday: "short" }); // Get day of the week
    const temperature = Math.round(item.main.temp); // Round temperature to nearest whole number
    const description = item.weather[0].description; // Weather description
    const icon = getWeatherIcon(item.weather[0].id); // Get weather icon

    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
    forecastItem.innerHTML = `
      <div class="day">${day}</div>
      <img class="weather-icon" src="${icon}" alt="${description}">
      <div class="temperature">${temperature}°C</div>
    `;
    forecastContainer.appendChild(forecastItem);
  });
}

function getWeatherIcon(weatherId) {
  if (weatherId == 800) {
    return "http://codingstella.com/wp-content/uploads/2024/01/download-16.png";
  } else if (weatherId >= 200 && weatherId <= 232) {
    return "http://codingstella.com/wp-content/uploads/2024/01/download-17.png";
  } else if (weatherId >= 600 && weatherId <= 622) {
    return "http://codingstella.com/wp-content/uploads/2024/01/download-18.png";
  } else if (weatherId >= 701 && weatherId <= 781) {
    return "http://codingstella.com/wp-content/uploads/2024/01/download-19.png";
  } else if (weatherId >= 801 && weatherId <= 804) {
    return "http://codingstella.com/wp-content/uploads/2024/01/download-20.png";
  } else if ((weatherId >= 500 && weatherId <= 531) || (weatherId >= 300 && weatherId <= 321)) {
    return "http://codingstella.com/wp-content/uploads/2024/01/download-21.png";
  } else {
    return ""; // Default icon
  }
}

// Function to save search history to local storage
function saveToLocalStorage(city) {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    displaySearchHistory();
  }
}

// Function to display search history from local storage
function displaySearchHistory() {
  historyList.innerHTML = "";
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searchHistory.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      requestApi(city);
    });
    historyList.appendChild(li);
  });
}

// Call displaySearchHistory on page load
displaySearchHistory();

arrowBack.addEventListener("click", () => {
  wrapper.classList.remove("active");
});

arrowBack.addEventListener("click", () => {
  wrapper.classList.remove("active");
  clearForecast(); // Add this line to clear forecast details
});

function clearForecast() {
  const forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = ""; // Clear forecast details
}

// Add event listener for the search history button
const historyBtn = document.querySelector(".history-btn");
historyBtn.addEventListener("click", toggleSearchHistory);

// Function to toggle search history display
function toggleSearchHistory() {
  const searchHistory = document.querySelector(".search-history");
  searchHistory.classList.toggle("active");
}
