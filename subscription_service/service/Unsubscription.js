const models = require('../models/index');

module.exports.deleteSubscriber = async (msg) => {
    if (msg !== null) {
        console.log('new unsubscribe received!');
        console.log(msg.content.toString());
        const message = JSON.parse(msg.content.toString());
        return models.subscriber.deleteOne({ subscription_id: message.subscription_id })
    }
}
