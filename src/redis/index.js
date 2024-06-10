import { createClient } from 'redis';
const redis = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

const connectRedis = async() => {
    redis.on('error', err => console.log('Redis Client Error', err));
    redis.on('connect', () => console.log('Redis is connected !'))
    await redis.connect();
}
export {connectRedis, redis}
