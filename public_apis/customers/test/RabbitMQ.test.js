const { expect } = require('chai');
const RabbitMQ = require('../service/RabbitMQ').RabbitClient;
const rabbitClient = new RabbitMQ(process.env.RABBIT || 'amqp://admin:securepassword@localhost:5672');

const testQueue = 'test';
let consumerTag;

describe('RabbitMQ Wrapper test', function () {
    this.timeout(0);

    afterEach(async function () {
        await rabbitClient.disconnect();
    });

    after(async function () {
        await rabbitClient._connect();
        if(consumerTag) await rabbitClient.deleteConsumer(consumerTag.consumerTag);
        await rabbitClient.deleteQueue(testQueue);
        await rabbitClient.disconnect();
    });

    it('Test internal connect function - should pass', async function () {
        try {
            await rabbitClient._connectToBroker();
            expect(true).to.be.true;
        } catch (err) {
            expect.fail(err);
        } 
    });

    it.skip('Test internal connect function with fake url - should fail', async function () {
        const fakeRabbitClient = new RabbitMQ('fakeurl');
        let error;
        try {
            await fakeRabbitClient._connectToBroker();
            error = true;
        } catch (err) {
            error = false;
        } finally {
            await fakeRabbitClient.disconnect();
        }
        expect(error).to.be.false;
     });

    it('Test internal connect to channel function - should pass', async function () {
        try {
            await rabbitClient._connectToBroker();
            await rabbitClient._connectToChannel();
            expect(true).to.be.true;
        } catch (err) {
            expect.fail(err);
        }
     });

    it('Test internal connect to channel function without connection - should fail', async function () { 
        let error;
        try {
            await rabbitClient._connectToChannel();
            error = true;
        } catch (err) {
            error = false;
        }
        expect(error).to.be.false;
    });

    it('Test internal connect to confirm channel function - should pass', async function () { 
        try {
            await rabbitClient._connectToBroker();
            await rabbitClient._connectToConfirmChannel();
            expect(true).to.be.true;
        } catch (err) {
            expect.fail(err);
        }
    });

    it('Test internal connect to confirm channel function without connection - should fail', async function () { 
        let error;
        try {
            await rabbitClient._connectToConfirmChannel();
            error = true;
        } catch (err) {
            error = false;
        }
        expect(error).to.be.false;
    });

    it('Test create queue without prior connection - should pass', async function () {
        try {
            await rabbitClient.createQueue('test');
            expect(true).to.be.true;
        } catch (err) {
            expect.fail(err);
        }
     });

    it('Test delete queue - should pass', async function () { 
        try {
            await rabbitClient._connect();
            await rabbitClient.deleteQueue('test');
            expect(true).to.be.true;
        } catch (err) {
            expect.fail();
        }
    });

    it('Test create consumer - should pass', async function () { 
        try {
            await rabbitClient.createQueue(testQueue);
            consumerTag = await rabbitClient.createConsumer(testQueue,()=>{});
            expect(true).to.be.true;
        } catch (err) {
            expect.fail(err);
        }
    });

    it('Test create consumer of non existent queue - should fail', async function () {
        let error;
        try {
            consumerTag = await rabbitClient.createConsumer('nonexistentqueue',()=>{});
            error = true;
        } catch (err) {
            error = false;
        }
        expect(error).to.be.false;
     });

});