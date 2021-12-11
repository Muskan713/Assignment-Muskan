const express = require('express');
const request = require('request');
const requestPromise = require("request-promise");
const path = require('path')
const rateLimiter = require('../middleware/rate-limiter')


const router = new express.Router();

// Router API to redirect the html page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'))
})

// Router API for the rateLimiter, rateLimiter as a Middleware
router.post('/api1', rateLimiter({ secondsWindow: 120, allowedHits: 20 }), async(req, res) => {

    // Darksky api for the weather forcast used afterchecking that a user can make request or not
    const url = 'https://api.darksky.net/forecast/fc0409c1187c673648ebbba14d0a1c5a/37.8267,-122.4233';

    let weather, rain;
    return requestPromise({ url: url, json: true }, (error, response) => {

        if (error || response.body.error) {
            console.log('Unable to connect to weather service or unable to find location');
            weather = 'not able to fetch weather'
            rain = 'no data found'
        } else {
            weather = `${response.body.daily.data[0].summary}  It is currently ${response.body.currently.temperature} degree out`
            rain = `There is a ${response.body.currently.precipProbability}% chance of rain`
        }

    }).then(() => {
        return res.json({
            response: 'OK',
            callsInAMinute: req.requests,
            ttl: req.ttl,
            weather,
            rain
        })
    })
})

module.exports = router;