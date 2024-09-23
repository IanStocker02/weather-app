import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5/';
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }

  public async fetchLocationData(city: string): Promise<Coordinates | null> {
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`
      );
      const data = response.data[0];
      return data ? { lat: data.lat, lon: data.lon } : null;
    } catch (error) {
      console.error("Error fetching location data:", error);
      return null;
    }
  }

  private async fetchWeatherData({ lat, lon }: Coordinates): Promise<any | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }

  async getWeatherForCity(city: string): Promise<any | null> {
    const locationData = await this.fetchLocationData(city);
    if (!locationData) {
      console.error("City not found");
      return null;
    }
    const weatherData = await this.fetchWeatherData(locationData);
    if (!weatherData) {
      console.error("Weather data not available");
      return null;
    }
    return this.parseCurrentWeather(weatherData);
  }

  private parseCurrentWeather(data: any) {
    return {
      city: data.name,
      date: new Date(data.dt * 1000),
      icon: data.weather[0].icon,
      iconDescription: data.weather[0].description,
      tempF: data.main.temp,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
    };
  }
}

export default new WeatherService();
