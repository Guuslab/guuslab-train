import axios from 'axios';

export const getWeather = async (location) => {
  try {
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,visibility&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,rain_sum&timezone=auto&forecast_days=14`;

    const response = await axios.get(url);
    const weatherData = response.data;

    console.log(weatherData); // Debugging

    return weatherData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};