import axios from 'axios';

export const getTrainInfo = async (ritnummer) => {
  try {
    const response = await axios.get(`https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/${ritnummer}`, {
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.API_KEY
          }});
    
    console.log(response.data); // Debugging
    return response.data;
    
  } catch (error) {
    console.error(error);
    throw error;
  }
};