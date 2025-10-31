// OpenWeatherMap API key
const apiKey = "6f0791007e0e6aa6bed4c181b27818e0"; //Replace with your own api key

// Fetch weather by city name
async function getWeather(city) {
  const weatherContainer = document.getElementById("weatherContainer");
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  weatherContainer.style.display = "none";

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},ZA&appid=${apiKey}&units=metric`
    );

    if (!currentRes.ok) throw new Error("City not found");

    const data = await currentRes.json();
    displayWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    loading.style.display = "none";
    weatherContainer.style.display = "block";
    weatherContainer.innerHTML = `
      <p style='color:#ffb703; font-weight:500;'>
        City not found — please try again.
      </p>`;
  }
}

// Get weather by user's current location
async function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        getWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
      () => alert("Location access denied.")
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }
}

// Fetch weather by coordinates
async function getWeatherByLocation(lat, lon) {
  const weatherContainer = document.getElementById("weatherContainer");
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  weatherContainer.style.display = "none";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    displayWeather(data);
    getForecast(lat, lon);
  } catch {
    loading.style.display = "none";
    alert("Unable to fetch your local weather.");
  }
}

// Fetch and display 5-day forecast
async function getForecast(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    // Remove any previous forecast to avoid duplicates
    const oldForecast = document.querySelector(".forecast");
    if (oldForecast) oldForecast.remove();

    const forecastContainer = document.createElement("div");
    forecastContainer.classList.add("forecast");

    // Get midday forecast for next 5 days
    const daily = data.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 5);

    daily.forEach((day) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("en-ZA", { weekday: "short" });
      const div = document.createElement("div");
      div.classList.add("forecast-day");
      div.innerHTML = `
        <p><strong>${dayName}</strong></p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
        <p>${Math.round(day.main.temp)}°C</p>
      `;
      forecastContainer.appendChild(div);
    });

    // Append new forecast to weather container
    document.getElementById("weatherContainer").appendChild(forecastContainer);
  } catch (err) {
    console.error("Error fetching forecast:", err);
  }
}

// Display current weather details
function displayWeather(data) {
  const weatherContainer = document.getElementById("weatherContainer");
  const loading = document.getElementById("loading");

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
    "en-ZA",
    { hour: "2-digit", minute: "2-digit" }
  );
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  weatherContainer.innerHTML = `
    <h2>${data.name}, South Africa</h2>
    <p>${data.weather[0].description}</p>
    <div class="weather-icon">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
    </div>
    <div class="temp">${Math.round(data.main.temp)}°C</div>
    <div class="details">
      <div class="detail-item"><i class="fas fa-temperature-low"></i><span>Feels like: ${Math.round(data.main.feels_like)}°C</span></div>
      <div class="detail-item"><i class="fas fa-wind"></i><span>Wind: ${data.wind.speed} m/s</span></div>
      <div class="detail-item"><i class="fas fa-tint"></i><span>Humidity: ${data.main.humidity}%</span></div>
      <div class="detail-item"><i class="fas fa-gauge"></i><span>Pressure: ${data.main.pressure} hPa</span></div>
      <div class="detail-item"><i class="fas fa-sun"></i><span>Sunrise: ${sunrise}</span></div>
      <div class="detail-item"><i class="fas fa-moon"></i><span>Sunset: ${sunset}</span></div>
    </div>
  `;

  loading.style.display = "none";
  weatherContainer.style.display = "block";
  weatherContainer.classList.add("show");
}

// === Event Listeners ===

// Search button click
document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (city) getWeather(city);
});

// Press Enter in input
document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = e.target.value.trim();
    if (city) getWeather(city);
  }
});

// Get user location or fallback to Johannesburg
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) =>
      getWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
    () => getWeather("Johannesburg")
  );
} else {
  getWeather("Johannesburg");
}
