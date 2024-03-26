// Bestand: pages/api/closeststation.js
import axios from 'axios';

export default async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const nsRes = await axios.get(`https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations/nearest?lat=${lat}&lng=${lng}&limit=1`, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.API_KEY,
        'cache-control': 'no-store'
      }
    });

    res.json(nsRes.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};