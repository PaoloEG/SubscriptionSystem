const amqp = require('amqplib');

module.exports.RabbitClient = class {
    constructor(url) {
        this._url = url;
        this._connection;
        this._channel;
    }

    async connect() {
        if (this._connection == null) {
            await this._connectToBroker();
        }
        if (this._channel == null) {
            await this._connectToChannel();
        }
    }

    async createConsumer(queue, cb) {
        const cbFunc = async (msg) => {
            try {
                await cb(msg, this);
                this._channel.ack(msg);
                console.log('Message Acked');
            } catch (err) {
                console.log('Consumer function error. Message sent back in the queue');
                console.log(err);
            }
        }
        try {
            await this._channel.checkQueue(queue);
            return this._channel.consume(queue, cbFunc, { noAck: false });
        } catch (err) {
            await this.connect();
            await this._channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
            return this._channel.consume(queue, cbFunc, { noAck: false });
        }
    }

    deleteConsumer(consumerTag) {
        return this._channel.cancel(consumerTag);
    }

    async disconnect() {
        await this._channel.close();
        this._channel = null;
        await this._connection.close();
        this._connection = null;
    }

    async send(queue, message) {
        try {
            await this._channel.checkQueue(queue);
            this._channel.sendToQueue(queue, Buffer.from(typeof (message) === 'string' ? message : JSON.stringify(message)));
        } catch (err) {
            await this.connect();
            await this._channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
            this._channel.sendToQueue(queue, Buffer.from(typeof (message) === 'string' ? message : JSON.stringify(message)));
        }
    }

    async deleteQueue(queue) {
        await this._channel.deleteQueue(queue);
    }

    async _connectToBroker(retries = 0) {
        try {
            this._connection = await amqp.connect(this._url);
            console.log('RabbitMQ CONNECTED');
        } catch (err) {
            if (retries < 5) {
                console.log('error on connecting to RabbitMQ, trying again in 10s. retriesNo: ' + retries);
                await new Promise(r => setTimeout(r, 10000));
                return this._connectToBroker(retries += 1);
            } else {
                throw err;
            }
        }
    }

    async _connectToChannel() {
        this._channel = await this._connection.createChannel();
        console.log('RabbitMQ CHANNEL CREATED');
        this._channel.on('error', async (err) => {
            if (err.code != 404) {
                throw new Error('Channel error: ' + err);
            }
        })
        this._channel.on('blocked', (reason) => {
            throw new Error('Channel is blocked. Reason: ' + reason);
        })
        this._channel.on('close', () => {
            this._channel = null;
            this._connection = null;
            return this.connect();
        })
    }
}