// --- Config ---
const apiKey = "69e6d0129c9fb42f20387c5066777a73"; // keep secure in production

// --- DOM references ---
const cityInput = document.getElementById("city");
const tempDivInfo = document.getElementById("temp-div");
const weatherInfoDiv = document.getElementById("weather-info");
const weatherIcon = document.getElementById("weather-icon");
const hourlyForecastDiv = document.getElementById("hourly-forecast");
const hourlyHeading = document.getElementById("hourly-heading");
const form = document.getElementById("weather-form");

// Hide icon and heading by default
weatherIcon.style.display = "none";
hourlyHeading.style.display = "none";

// Submit handler for the form (allows Enter key)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city");
    return;
  }

  clearUI();
  setLoading(true);

  // Use Fahrenheit (imperial units)
  const currentWeatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;
  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) {
      const errData = await currentRes.json().catch(() => ({}));
      throw new Error(errData?.message || `Current weather error (${currentRes.status})`);
    }
    if (!forecastRes.ok) {
      const errData = await forecastRes.json().catch(() => ({}));
      throw new Error(errData?.message || `Forecast error (${forecastRes.status})`);
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayWeather(currentData);
    displayHourlyForecast(forecastData.list, forecastData.city?.timezone ?? 0);
  } catch (error) {
    console.error(error);
    weatherInfoDiv.innerHTML = `<p>${escapeHTML(error.message)}</p>`;
    weatherIcon.style.display = "none";
    hourlyHeading.style.display = "none";
  } finally {
    setLoading(false);
  }
}

function displayWeather(data) {
  if (String(data.cod) !== "200" && String(data.cod) !== "201") {
    weatherInfoDiv.innerHTML = `<p>${escapeHTML(data.message || "Unable to fetch weather")}</p>`;
    weatherIcon.style.display = "none";
    hourlyHeading.style.display = "none";
    return;
  }

  const cityName = data.name;
  const temperature = Math.round(data.main.temp); // already °F (imperial)
  const description = capitalizeFirst(data.weather[0].description);
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  tempDivInfo.innerHTML = `<p>${temperature}°F</p>`;
  weatherInfoDiv.innerHTML = `
    <p>${escapeHTML(cityName)}</p>
    <p>${escapeHTML(description)}</p>
  `;

  // Show icon after it loads (preload image)
  const img = new Image();
  img.onload = () => {
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherIcon.style.display = "block";
  };
  img.onerror = () => {
    weatherIcon.style.display = "none";
  };
  img.src = iconUrl;
}

function displayHourlyForecast(hourlyData, cityTzOffsetSeconds) {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    hourlyForecastDiv.innerHTML = "";
    hourlyHeading.style.display = "none";
    return;
  }

  const next24 = hourlyData.slice(0, 8);
  const html = next24
    .map((item) => {
      const localHour = formatHour(item.dt, cityTzOffsetSeconds);
      const temperature = Math.round(item.main.temp); // °F
      const iconCode = item.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
      const desc = item.weather[0].description;

      return `
        <div class="hourly-item">
          <span>${localHour}</span>
          <img src="${iconUrl}" alt="${escapeHTML(desc)} icon">
          <span>${temperature}°F</span>
        </div>
      `;
    })
    .join("");

  hourlyForecastDiv.innerHTML = html;
  hourlyHeading.style.display = "block";
}

function formatHour(unixSeconds, tzOffsetSeconds) {
  const date = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  const h = date.getUTCHours();          // 0..23 city-local hour
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${suffix}`;
}


function clearUI() {
  tempDivInfo.innerHTML = "";
  weatherInfoDiv.innerHTML = "";
  hourlyForecastDiv.innerHTML = "";
  weatherIcon.style.display = "none";
  hourlyHeading.style.display = "none";
}

function setLoading(isLoading) {
  if (isLoading) {
    weatherInfoDiv.innerHTML = `<p>Loading...</p>`;
  }
}

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

