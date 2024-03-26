import axios from 'axios';
import { getLocation } from './location'; // Replace './location' with the path to your location.js file

export const getClosestStations = async () => {
  try {
    const location = await getLocation();

    const url = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations/nearest?lat=${location.latitude}&lng=${location.longitude}&limit=1`;
    const response = await axios.get(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.API_KEY,
        'cache-control': 'no-store'
      }
    });
    const stations = response.data;

    console.log(stations);

    return stations;
  } catch (error) {
    console.error(error);
    throw error;
  }
};