import axios from 'axios';

export const getLocation = async () => {
  try {
    // Get user's IP address (IPv6)
    const ipResponse = await axios.get('https://api6.ipify.org?format=json');
    const userIP = ipResponse.data.ip;

    // Get location data
    let locationResponse = await axios.get(`https://ipapi.co/${userIP}/json/`);
    let location = locationResponse.data; // Get location directly from the response

    console.log(location.region); // Debugging
    console.log(location.city); // Debugging
    console.log("latitude " + location.latitude); // Debugging
    console.log("longitude " + location.longitude); // Debugging
    // console.log(location);

    return location;
  } catch (error) {
    console.error(error);
    throw error;
  }
};