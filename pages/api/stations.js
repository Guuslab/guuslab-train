// Bestand: pages/api/stations.js
import axios from 'axios';

export default async (req, res) => {
  try {
    const nsRes = await axios.get(`https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations?q=${req.query.q}`, {
      headers: {
        'x-caller-id': 'your-caller-id', // vervang dit door je eigen caller-id
        'Ocp-Apim-Subscription-Key': process.env.API_KEY
      }
    });
    res.json(nsRes.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};