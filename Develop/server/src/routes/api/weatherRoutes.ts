import { Router } from "express";
const router = Router();
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

router.post("/", async (req, res) => {
  try {
    const cities = await HistoryService.getCities();
    const initialCity = cities.length > 0 ? cities[0].name : "Richmond";
    const cityName = req.body.cityName || initialCity;

    const weatherData = await WeatherService.getWeatherForCity(cityName);

    if (!weatherData) {
      return res.status(404).json({ message: "City not found" });
    }

    const currentWeather = {
      city: weatherData.city,
      date: weatherData.date,
      icon: weatherData.icon,
      iconDescription: weatherData.iconDescription,
      tempF: weatherData.tempF,
      windSpeed: weatherData.windSpeed,
      humidity: weatherData.humidity,
    };

    const forecastData = weatherData.forecast?.map((forecast: any) => ({
      date: forecast.date,
      icon: forecast.icon,
      iconDescription: forecast.iconDescription,
      tempF: forecast.tempF,
      windSpeed: forecast.windSpeed,
      humidity: forecast.humidity,
    })) || [];

    let coordinates = await WeatherService.fetchLocationData(cityName);
    if (!coordinates) {
      coordinates = { lat: 0, lon: 0 };
    }
    
    // Check if the city already exists in search history
    const cityExists = cities.some(city => city.name === cityName);
    if (!cityExists) {
      await HistoryService.addCity(cityName, coordinates.lat, coordinates.lon);
    }

    return res.status(200).json({ currentWeather, forecast: forecastData }); // Add 'return' here
  } catch (error) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({ message: "Internal Server Error" }); // Add 'return' here in the catch block
  }
});

router.get("/history", async (_, res) => {
  try {
    const cities = await HistoryService.getCities();
    if (cities.length === 0) {
      return res.status(200).json({ message: "No cities in history" });
    }
    return res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching search history:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const cityName = req.body.cityName || "Toronto";
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    if (!weatherData) {
      return res.status(404).json({ message: "City not found" });
    }

    const currentWeather = weatherData.current;
    const forecastData = weatherData.forecast;

    return res.status(200).json({ currentWeather, forecast: forecastData });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
