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

    if (input.length <= 10) {
        return res.status(400).json({ error: 'El parámetro "input" debe tener más de 10 caracteres.' });
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

        const apiKey = process.env.GOOGLE_API_KEY;

        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`);
        const distance = response.data.routes[0].legs[0].distance.text;

        res.json({ distance });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error calculating distance.' });
    }
});

app.get('/api/geocode', async (req, res) => {
    const address = req.query.address;

    if (!address) {
        return res.status(400).json({ error: 'El parámetro "address" es requerido.' });
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            httpsAgent: agent,
            params: {
                address: address,
                key: apiKey
            }
        });

        if (response.data.status === 'OK') {
            res.json(response.data.results[0].geometry.location);
        } else {
            res.status(400).json({ error: 'No se encontraron resultados para esa dirección.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al convertir la dirección.' });
    }
});

app.get('/api/directions', async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Los parámetros "origin" y "destination" son requeridos.' });
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
            httpsAgent: agent,
            params: {
                origin: origin,
                destination: destination,
                key: apiKey,
            },
        });

        const route = response.data.routes[0];
        if (!route) {
            return res.status(404).json({ error: 'No se encontró una ruta entre los puntos dados.' });
        }

        res.json({
            polyline: route.overview_polyline.points,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al obtener la ruta.' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
