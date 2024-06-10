import { createClient } from 'redis';
const redis = createClient({
    host: 'redis-redisjson',
    port: 6379
});

const connectRedis = async() => {
    redis.on('error', err => console.log('Redis Client Error', err));
    redis.on('connect', () => console.log('Redis is connected !'))
    await redis.connect();
}
export {connectRedis, redis}
