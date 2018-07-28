import * as redis from 'redis';

const client = redis.createClient(parseInt(process.env.REDIS_PROT), process.env.REDIS_HOST);

export {client as redis};