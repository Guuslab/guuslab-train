import axios from 'axios';
import { fetchWeatherApi } from 'openmeteo';

export const getWeather = async () => {
  try {
    const locationResponse = await axios.get('https://geolocation-db.com/json/');
    const location = locationResponse.data;

    const params = {
      "latitude": location.latitude,
      "longitude": location.longitude,
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
    if (error.name === 'AxiosError' && error.message === 'Network Error') {
      throw new Error('Er is een netwerkfout opgetreden. Controleer uw netwerkverbinding en of er geen adblocker actief is.');
    } else {
      throw error;
    }
  }
};