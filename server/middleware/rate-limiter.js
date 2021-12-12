const redis = require('../db/redis-client')

// Middleware to limit the number of request in a minute
function rateLimiter({ secondsWindow, allowedHits }) {

    return async function(req, res, next) {
        // IP address to be fetched from the headers to uniqely identify a user and to restrict the number of request
        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).slice(0, 9)

        const requests = await redis.incr(ip);

        let timeToLive

        // If the number of request for an user is 1 then we have to set rxpire time to be 60
        if (requests == 1) {
            await redis.expire(ip, secondsWindow)
            timeToLive = secondsWindow
        } else {
            timeToLive = await redis.ttl(ip)
        }

        // if the number of request greater then 40 in a minute
        if (requests > allowedHits * 2) {
            return res.status(503).json({
                response: 'Please wait for Some time, Sever is busy::',
                callsInAMinute: -1,
                ttl: await redis.ttl(ip)
            })
        } else if (requests > allowedHits && requests <= allowedHits * 2) {
            //20 second delay in call if no of request is in between 20 and 40 in a minute
            // As setTimeout takes time in millisecond and 1000 ms = 1 second so 20 second = 20000 millisecond
            setTimeout(() => {
                req.requests = requests
                req.ttl = timeToLive - 20<0?0:timeToLive - 20
                next();
            }, 20000);

        } else {
            req.requests = requests
            req.ttl = await redis.ttl(ip)
            next()
        }
    }
}

module.exports = rateLimiter;