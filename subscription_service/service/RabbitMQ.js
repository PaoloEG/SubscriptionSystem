const amqp = require('amqplib');
const fs = require('fs');

/**
 * Returns a RabbitMQ Client object
 * @param {string} url The url on the RabbitMQ Broker 
 */
module.exports.RabbitClient = class {
    constructor(url) {
        this._url = url;
        this._connection;
        this._channel;
        this._confirmChannel;
        this._connOpts = {
            cert: fs.readFileSync('./certs/client_certificate.pem'),
            key: fs.readFileSync('./certs/client_key.pem'),
            passphrase: 'securepassword',
            ca: [fs.readFileSync('./certs/ca_certificate.pem')]
        }
    }

    /**
     * Create a queue if it doesn't already exist
     * @param {string} queue Queue to which attach the consumer
     * @return {Promise} 
    */
    async createQueue(queue) {
        await this._connect();
        try {
            await this._channel.checkQueue(queue);
        } catch (err) {
            await this.connect();
            return this._channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
        }
    }

    /**
     * Create a conusmer and return its consumer tag
     * @param {string} queue Queue to which attach the consumer
     * @param {Function} cb Callback function. Should accept a message in input and an optional context reference
     * @param {Object} opts Consumer options. Default: { noAck: false }
     * @return {string} consumer tag
    */
    async createConsumer(queue, cb, opts = { noAck: false }) {
        await this._connect();

        const cbFunc = async (msg) => {
            try {
                //execute the callback function and then ack the received message
                await cb(msg, this);
                this._channel.ack(msg);
            } catch (err) {
                this._channel.nack(msg);
                console.log(`Consumer function error. Message sent back in the queue. ${err}`);
            }
        }
        return this._channel.consume(queue, cbFunc, opts);
    }

    /**
     * Delete a conusmer
     * @param {string} consumerTag consumer tag
     * @return {Promise} return a promise that resolves/reject with the result of the operation
    */
    deleteConsumer(consumerTag) {
        return this._channel.cancel(consumerTag);
    }

    /**
     * Send a message into the selected queue.
     * @param {string} queue Queue to which send the data
     * @param {string} message message to be sent
     * @param {boolean} confirm if true the queue confirm the receiving, if false not. Default: false
     * @return {Promise|null} promise or nothing
    */
    async send(queue, message, confirm = false) {
        const data = Buffer.from(typeof (message) === 'string' ? message : JSON.stringify(message));
        await this._connect(confirm);
        if (confirm) {
            this._confirmChannel.sendToQueue(queue, data, {}, (err, ok) => {
                if (err) throw err;
            });
        } else {
            return this._channel.sendToQueue(queue, data, {});
        }
    }

    /**
     * Delete a queue
     * @param {string} queue Queue to be deleted
     * @return {Promise} 
    */
    deleteQueue(queue) {
        return this._channel.deleteQueue(queue);
    }

    /**
     * Disconnects from all channels and from the broker
    */
    async disconnect() {
        await this._channel.close();
        this._channel = null;
        await this._confirmChannel.close();
        this._confirmChannel = null;
        await this._connection.close();
        this._connection = null;
    }

    //========================== PRIVATE METHODS ==========================//

    async _connect(confCh = false) {
        if (this._connection == null) {
            await this._connectToBroker();
        }
        if (confCh) {
            if (this._confirmChannel == null) await this._connectToConfirmChannel();
        } else {
            if (this._channel == null) await this._connectToChannel();
        }
    }

    async _connectToBroker(retries = 0) {
        try {
            this._connection = await amqp.connect(this._url, this._connOpts);
            console.log('RabbitMQ CONNECTED');
        } catch (err) {
            if (retries < 5) {
                console.log('error on connecting to RabbitMQ, trying again in 10s. retriesNo: ' + retries);
                await new Promise(r => setTimeout(r, 10000));
                return this._connectToBroker(retries += 1);
            } else {
                throw new Error('error on connecting to RabbitMQ');
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
            return this._connect(false);
        })
    }

    async _connectToConfirmChannel() {
        this._confirmChannel = await this._connection.createConfirmChannel();
        console.log('RabbitMQ CONFIRM CHANNEL CREATED');
        this._confirmChannel.on('error', async (err) => {
            if (err.code != 404) {
                throw new Error('Channel error: ' + err);
            }
        })
        this._confirmChannel.on('blocked', (reason) => {
            throw new Error('Channel is blocked. Reason: ' + reason);
        })
        this._confirmChannel.on('close', () => {
            this._confirmChannel = null;
            this._connection = null;
            return this._connect(true);
        })
    }
}