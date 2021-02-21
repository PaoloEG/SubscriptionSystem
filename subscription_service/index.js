const RabbitMQ = require('./service/RabbitMQ').RabbitClient;
const mongoose = require('mongoose');
const config = require('./config');
const subClient = require('./service/Subscription');
const unsubClient = require('./service/Unsubscription');

const rabbit = new RabbitMQ(process.env.RABBIT || 'amqp://localhost');

mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/subscriptions', { useNewUrlParser: true, useUnifiedTopology: true, server: { auto_reconnect: true } });
const db = mongoose.connection;

db.on('error', (err) => {
    console.log('error on db connection, please restart the service');
    console.log(JSON.stringify(err));
    throw err;
});

db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});

db.once('open', async function () {
    console.log('MongoDB CONNECTED');
    try {
        await rabbit.connect();
        const subscribeConsumer = await rabbit.createConsumer(config.SUBSCRIBE_QUEUE, subClient.consumeSubscriber);
        const unsubscribeConsumer = await rabbit.createConsumer(config.UNSUBSCRIBE_QUEUE, unsubClient.deleteSubscriber);
    } catch (err) {
        throw new Error('error connecting to RabbitMQ. Please restart the service.');
    }
});


