const models = require('../models/index');
const config = require('../config');

const saveSubscriber = async (msg) => {
    if (msg !== null) {
        // console.log('new subscribe message received!');
        // console.log(msg.content.toString());
        const message = JSON.parse(msg.content.toString());
        const existingEntry = await models.subscriber.findOne({ subscription_id: message.subscription_id }).select('subscription_id').lean();
        if (existingEntry == null) {
            //new user 
            const newSub = new models.subscriber(message);
            await newSub.save();
            console.log('message saved!');
        }
        return existingEntry != null ? false : true;
    }
}

const sendEmail = (msg, queueClient) => {
    const message = JSON.parse(msg.content.toString());
    const emailObj = {
        email: message.email,
        subscription_id: message.subscription_id,
        name: message.first_name
    }
    return queueClient.send(config.CONFIRMATION_EMAIL_QUEUE, emailObj);
}

module.exports.consumeSubscriber = async (msg, queueClient) => {
    const isNew = await saveSubscriber(msg);
    if (isNew) {
        await sendEmail(msg, queueClient);
    }
};