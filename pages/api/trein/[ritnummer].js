import axios from 'axios';

export default async function handler(req, res) {
  const { ritnummer } = req.query;

  try {
    const response = await axios.get(`https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/${ritnummer}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.API_KEY
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching train info' });
  }
}