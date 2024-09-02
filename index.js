require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const https = require('https');
const port = process.env.PORT || 3001;

const apiKey = process.env.GOOGLE_API_KEY;

app.use(cors());

const agent = new https.Agent({
    rejectUnauthorized: false,
  });

app.get('/api/place-autocomplete', async (req, res) => {
    const input = req.query.input;
    if (!input) {
        return res.status(400).json({ error: 'El parámetro "input" es requerido.' });
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
            httpsAgent: agent,
            params: {
                input: input,
                key: apiKey
            }
        });
        res.json(response.data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error fetching place suggestions.' });
    }
});

app.get('/api/distance', async (req, res) => {
    try {
        const { origin, destination } = req.query;
        console.log(origin);
        console.log(destination);
        const apiKey = process.env.GOOGLE_API_KEY;

        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`);
        const distance = response.data.routes[0].legs[0].distance.text;
        
        res.json({ distance });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error calculating distance.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
