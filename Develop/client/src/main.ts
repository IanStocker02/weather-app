import "./styles/jass.css";

// Select DOM elements
const searchForm = document.getElementById("search-form") as HTMLFormElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const todayContainer = document.querySelector("#today") as HTMLDivElement;
const forecastContainer = document.querySelector("#forecast") as HTMLDivElement;
const searchHistoryContainer = document.getElementById("history") as HTMLDivElement;
const heading = document.getElementById("search-title") as HTMLHeadingElement;
const tempEl = document.getElementById("temp") as HTMLParagraphElement;
const windEl = document.getElementById("wind") as HTMLParagraphElement;
const humidityEl = document.getElementById("humidity") as HTMLParagraphElement;

document.addEventListener("DOMContentLoaded", async () => {
  const historyList = await fetchSearchHistory().then(res => res.json());
  const lastCity = historyList.length ? historyList.at(-1)?.cityName : "Toronto";
  fetchWeather(lastCity);
});

const fetchWeather = async (cityName: string) => {
  const response = await fetch("/api/weather/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cityName }),
  });
  const weatherData = await response.json();
  renderCurrentWeather(weatherData.currentWeather);
  renderForecast(weatherData.forecast);
};

const fetchSearchHistory = () => fetch("/api/weather/history");

const deleteCityFromHistory = (id: string) =>
  fetch(`/api/weather/history/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });

function renderCurrentWeather(currentWeather: any) {
  if (!currentWeather || !currentWeather.city) {
    console.error("Weather data is missing or incomplete");
    return;
  }

  // Extract and format the date
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  heading.innerHTML = `${city} (${formattedDate}) <img id="weather-img" src="https://openweathermap.org/img/w/${icon}.png" alt="${iconDescription}" class="weather-img">`;
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  todayContainer.innerHTML = "";
  todayContainer.append(heading, tempEl, windEl, humidityEl);
}

const renderForecast = (forecast: any) => {
  forecastContainer.innerHTML = `<div class="col-12"><h4>5-Day Forecast:</h4></div>`;
  if (forecast && Array.isArray(forecast)) {
    forecast.forEach(renderForecastCard);
  } else {
    forecastContainer.innerHTML += `<p>No forecast data available.</p>`;
  }
};

const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.src = `https://openweathermap.org/img/w/${icon}.png`;
  weatherIcon.alt = iconDescription;
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
};


const renderSearchHistory = async (searchHistory: any) => {
  const historyList = await searchHistory.json();
  searchHistoryContainer.innerHTML = historyList.length
    ? historyList.reverse().map(buildHistoryListItem).join('')
    : '<p class="text-center font-weight-bold m-1">No Previous Search History</p>';
};

const createForecastCard = () => {
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  col.classList.add("col-auto");
  card.classList.add("forecast-card", "card", "text-white", "bg-primary", "h-100");
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  [tempEl, windEl, humidityEl].forEach(el => el.classList.add("card-text"));
  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.classList.add("history-btn", "btn", "btn-secondary", "col-10");
  btn.textContent = city;
  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement("button");
  delBtnEl.type = "button";
  delBtnEl.classList.add("fas", "fa-trash-alt", "delete-city", "btn", "btn-danger", "col-2");
  delBtnEl.addEventListener("click", handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement("div");
  div.classList.add("d-flex", "gap-2", "col-12", "m-1");
  return div;
};

const buildHistoryListItem = (city: any) => {
  const historyDiv = createHistoryDiv();
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv.outerHTML;
};

const handleSearchFormSubmit = (event: Event) => {
  event.preventDefault();
  const search = searchInput.value.trim();
  if (!search) throw new Error("City cannot be blank");
  fetchWeather(search).then(getAndRenderHistory);
  searchInput.value = "";
};

const handleSearchHistoryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.matches(".history-btn")) {
    fetchWeather(target.textContent || "").then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const cityID = JSON.parse((event.target as HTMLElement).dataset.city || '{}').id;
  deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

const getAndRenderHistory = () => fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer?.addEventListener("click", handleSearchHistoryClick);

getAndRenderHistory();
