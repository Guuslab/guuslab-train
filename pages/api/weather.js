import axios from 'axios';
import { fetchWeatherApi } from 'openmeteo';

export const getWeather = async () => {
  try {
    const locationResponse = await axios.get('https://ip-api.com/json');
    const location = locationResponse.data;

    const params = {
      "latitude": location.lat,
      "longitude": location.lon,
      "hourly": "temperature_2m"
    };

    console.log(params); // Debugging

    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];
    const hourly = response.hourly();
    const weatherData = {
      hourly: {
        time: hourly.time(),
        temperature2m: hourly.variables(0).valuesArray(),
      },
    };
    return weatherData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};